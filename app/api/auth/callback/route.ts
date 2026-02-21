import { NextResponse } from "next/server"
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase"
import prisma from "@/lib/db"
import { validateStudentID } from "@/modules/auth/auth.service"
import { UserRole, UserStatus } from "@/lib/generated/prisma/enums"
import logger from "@/lib/logger"

function getRedirectOrigin(req: Request) {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL
    if (envUrl) {
        try {
            return new URL(envUrl).origin
        } catch {
            // Fall through to request origin
        }
    }
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

        // Exchange code for session
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

        if (sessionError || !sessionData.user) {
            logger.error("OAuth session error:", sessionError)
            return NextResponse.redirect(`${origin}/login?error=Authentication%20failed`)
        }

        const user = sessionData.user
        const email = user.email?.toLowerCase()

        if (!email) {
            return deleteUserAndRedirect(supabase, user.id, origin, "No email provided by Microsoft")
        }

        // Validate university email domain
        const allowedDomains = [
            "paf-iast.edu.pk",
            "fecid.paf-iast.edu.pk"
        ]

        const emailDomain = email.split("@")[1]

        if (!allowedDomains.includes(emailDomain)) {
            return deleteUserAndRedirect(
                supabase,
                user.id,
                origin,
                "Only PAF-IAST university emails are allowed"
            )
        }

        // Extract registration number from email
        const regNo = email.split("@")[0]

        // Validate student ID for registration eligibility (needed for both new and existing users)
        const validation = validateStudentID(regNo)

        if (!validation.valid) {
            return deleteUserAndRedirect(supabase, user.id, origin, validation.error)
        }

        const { currentSemester, department } = validation

        // Check if user already exists in Prisma (by email - the unique field)
        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true, status: true }
        })

        if (existingUser) {
            // Existing user - check if suspended
            if (existingUser.status === UserStatus.SUSPENDED) {
                await supabase.auth.signOut()
                return NextResponse.redirect(`${origin}/login?error=Your%20account%20has%20been%20suspended.%20Contact%20administration.`)
            }

            // If Prisma user.id doesn't match Supabase user.id, update it
            if (existingUser.id !== user.id) {
                await prisma.user.update({
                    where: { email },
                    data: { id: user.id }
                })
                // Also update student record's userId if it exists
                await prisma.student.updateMany({
                    where: { userId: existingUser.id },
                    data: { userId: user.id }
                })
            }

            // Check if student record exists, create if missing
            const existingStudent = await prisma.student.findUnique({
                where: { userId: user.id },
                select: { id: true }
            })

            if (!existingStudent) {
                // Student record missing - create it
                await prisma.student.create({
                    data: {
                        userId: user.id,
                        name: user.user_metadata?.full_name || user.user_metadata?.name || "Not defined yet",
                        department: department,
                        currentSemester: currentSemester,
                    },
                })
            }

            // User exists and is active - redirect to dashboard
            return NextResponse.redirect(`${origin}/dashboard/profile`)
        }

        // New user - create user and student in a transaction
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
                    name: user.user_metadata?.full_name || user.user_metadata?.name || "Not defined yet",
                    department: department,
                    currentSemester: currentSemester,
                },
            })
        })

        // Redirect to dashboard
        return NextResponse.redirect(`${origin}/dashboard/profile`)

    } catch (err) {
        logger.error("OAuth callback error:", err)
        const errorMessage = encodeURIComponent(err instanceof Error ? err.message : "Authentication failed")
        return NextResponse.redirect(`${new URL(req.url).origin}/login?error=${errorMessage}`)
    }
}
