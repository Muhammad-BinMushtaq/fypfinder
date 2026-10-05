import { NextResponse } from "next/server"
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase"
import prisma from "@/lib/db"
import { validateStudentID } from "@/modules/auth/auth.service"
import { UserRole, UserStatus } from "@/lib/generated/prisma/enums"
import logger from "@/lib/logger"
import { getAuthenticatedRedirectPath } from "@/lib/auth"

function getRedirectOrigin(req: Request) {
    // 1. In local development, always use the request URL origin
    if (process.env.NODE_ENV === "development") {
        return new URL(req.url).origin
    }

    // 2. On Vercel and reverse proxies, inspect x-forwarded-host and x-forwarded-proto
    const forwardedHost = req.headers.get("x-forwarded-host")
    const forwardedProto = req.headers.get("x-forwarded-proto") || "https"
    if (forwardedHost) {
        return `${forwardedProto}://${forwardedHost}`
    }

    // 3. Fall back to NEXT_PUBLIC_APP_URL if defined
    const envUrl = process.env.NEXT_PUBLIC_APP_URL
    if (envUrl) {
        try {
            return new URL(envUrl).origin
        } catch {
            // Fall through to request origin
        }
    }

    // 4. Default to incoming request origin
    return new URL(req.url).origin
}

/**
 * Helper function to delete user from Supabase Auth and redirect with error
 * Uses admin client to completely remove the user, not just sign out
 */
async function deleteUserAndRedirect(
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
    userId: string,
    origin: string,
    errorMessage: string
) {
    try {
        // Sign out first
        await supabase.auth.signOut()

        // Delete user from Supabase Auth using admin client
        const adminClient = createSupabaseAdminClient()
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

        if (deleteError) {
            logger.error("Failed to delete user from Supabase Auth:", deleteError)
        } else {
            logger.info(`Deleted unauthorized user ${userId} from Supabase Auth`)
        }
    } catch (err) {
        logger.error("Error during user cleanup:", err)
    }

    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`)
}

async function redirectExistingSessionIfValid(
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
    origin: string
) {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) return null

        const appUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, status: true },
        })

        const redirectPath = getAuthenticatedRedirectPath(appUser)
        return redirectPath ? NextResponse.redirect(`${origin}${redirectPath}`) : null
    } catch (err) {
        logger.error("Unable to recover existing session after OAuth exchange failure:", err)
        return null
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const errorParam = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    // Get origin for redirects
    const origin = getRedirectOrigin(req)

    // Handle OAuth errors
    if (errorParam) {
        const errorMessage = encodeURIComponent(errorDescription || errorParam)
        return NextResponse.redirect(`${origin}/login?error=${errorMessage}`)
    }

    if (!code) {
        return NextResponse.redirect(`${origin}/login?error=Missing%20authorization%20code`)
    }

    try {
        const supabase = await createSupabaseServerClient()

        // Exchange code for session (always exchange the incoming code for the newly selected account)
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

        if (sessionError || !sessionData?.user) {
            logger.error("OAuth session error:", sessionError)
            const fallbackRedirect = await redirectExistingSessionIfValid(supabase, origin)
            if (fallbackRedirect) {
                return fallbackRedirect
            }
            return NextResponse.redirect(`${origin}/login?error=Authentication%20failed`)
        }

        const user = sessionData.user
        const email = user.email?.toLowerCase().trim()

        if (!email) {
            return deleteUserAndRedirect(supabase, user.id, origin, "No email provided by Microsoft")
        }

        // Validate university email domain (*.paf-iast.edu.pk or paf-iast.edu.pk)
        const emailDomain = email.split("@")[1] || ""
        const isPafIastDomain = emailDomain === "paf-iast.edu.pk" || emailDomain.endsWith(".paf-iast.edu.pk")

        if (!isPafIastDomain) {
            return deleteUserAndRedirect(
                supabase,
                user.id,
                origin,
                "Only PAF-IAST university emails are allowed"
            )
        }

        // Extract registration number from email
        const regNo = email.split("@")[0]

        // Check if user already exists in Prisma (by email - the unique field)
        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true, role: true, status: true }
        })

        if (existingUser) {
            // Existing user - check if suspended
            if (existingUser.status === UserStatus.SUSPENDED) {
                await supabase.auth.signOut()
                return NextResponse.redirect(`${origin}/login?error=Your%20account%20has%20been%20suspended.%20Contact%20administration.`)
            }

            if (existingUser.role !== UserRole.STUDENT) {
                const redirectPath = getAuthenticatedRedirectPath(existingUser)
                return NextResponse.redirect(`${origin}${redirectPath || "/login"}`)
            }

            // If Prisma user.id doesn't match Supabase user.id, sync both records
            // atomically to avoid a PostgreSQL FK constraint violation
            if (existingUser.id !== user.id) {
                await prisma.$transaction(async (tx) => {
                    // 1️⃣ Update User primary key (PostgreSQL CASCADE updates child tables)
                    await tx.user.update({
                        where: { email },
                        data: { id: user.id }
                    })
                    // 2️⃣ Update Student foreign key in case CASCADE was not triggered
                    await tx.student.updateMany({
                        where: { userId: existingUser.id },
                        data: { userId: user.id }
                    })
                })
            }

            // Check if student record exists, create if missing
            const existingStudent = await prisma.student.findUnique({
                where: { userId: user.id },
                select: { id: true }
            })

            if (!existingStudent) {
                const validation = validateStudentID(regNo)
                const department = validation.valid ? validation.department : "Unknown"
                const currentSemester = validation.valid ? validation.currentSemester : 5

                await prisma.student.create({
                    data: {
                        userId: user.id,
                        name: user.user_metadata?.full_name || user.user_metadata?.name || "Student",
                        department: department,
                        currentSemester: currentSemester,
                    },
                })
            }

            // User exists and is active - redirect to discovery
            return NextResponse.redirect(`${origin}/dashboard/discovery`)
        }

        // --- NEW USER REGISTRATION ---
        // Validate student ID for registration eligibility only for new accounts
        const validation = validateStudentID(regNo)

        if (!validation.valid) {
            return deleteUserAndRedirect(supabase, user.id, origin, validation.error)
        }

        const { currentSemester, department } = validation

        // Create user and student in a transaction
        await prisma.$transaction(async (tx) => {
            // Create user in Prisma (synced with Supabase ID)
            await tx.user.create({
                data: {
                    id: user.id,
                    email,
                    role: UserRole.STUDENT,
                },
            })

            // Create student profile
            await tx.student.create({
                data: {
                    userId: user.id,
                    name: user.user_metadata?.full_name || user.user_metadata?.name || "Student",
                    department: department,
                    currentSemester: currentSemester,
                },
            })
        })

        // Redirect to dashboard profile
        return NextResponse.redirect(`${origin}/dashboard/profile`)

    } catch (err) {
        logger.error("OAuth callback error:", err)
        console.log("error in callback route", err)
        console.log("error description", errorDescription)
        const errorMessage = encodeURIComponent(err instanceof Error ? err.message : "Authentication failed")
        return NextResponse.redirect(`${origin}/login?error=${errorMessage}`)
    }
}
