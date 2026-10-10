import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole, AvailabilityStatus } from "@/lib/generated/prisma/enums"
import { updateMyProfile } from "@/modules/student/student.service"
import { profileUpdateSchema, firstIssue } from "@/lib/validation/profile"
import { profileUpdateRateLimiter } from "@/lib/rate-limit"
import prisma from "@/lib/db"

export async function PATCH(req: Request) {
    try {
        const user = await requireRole(UserRole.STUDENT)

        const rateLimit = await profileUpdateRateLimiter.checkAsync(`student:${user.id}`)
        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Too many profile updates. Please try again in ${rateLimit.retryAfter || 60} seconds.`,
                },
                {
                    status: 429,
                    headers: rateLimit.retryAfter
                        ? { "Retry-After": String(rateLimit.retryAfter) }
                        : undefined,
                }
            )
        }

        const body = await req.json()

        const parsed = profileUpdateSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, message: firstIssue(parsed.error) },
                { status: 400 }
            )
        }

        const {
            currentSemester,
            profilePicture,
            interests,
            phone,
            linkedinUrl,
            githubUrl,
            availability,
            careerGoal,
            hobbies,
            preferredTechStack,
            fypIndustry,
            primaryRoles,
            seekingStatus,
            onboardingCompleted,
        } = parsed.data

        // 🔒 Semester is derived from the roll number at sign-up and may only be
        // confirmed once during onboarding. After that, only admins can change it
        // (it drives partner-request eligibility).
        if (currentSemester !== undefined) {
            const student = await prisma.student.findUnique({
                where: { userId: user.id },
                select: { onboardingCompleted: true, currentSemester: true },
            })
            if (student?.onboardingCompleted && student.currentSemester !== currentSemester) {
                return NextResponse.json(
                    { success: false, message: "Semester can only be changed by an admin" },
                    { status: 403 }
                )
            }
        }

        const student = await updateMyProfile(user.id, {
            currentSemester,
            profilePicture,
            interests,
            phone,
            linkedinUrl,
            githubUrl,
            availability: availability as AvailabilityStatus | undefined,
            careerGoal,
            hobbies,
            preferredTechStack,
            fypIndustry,
            primaryRoles,
            seekingStatus,
            onboardingCompleted,
        })

        return NextResponse.json(
            { success: true, message: "Profile updated successfully", data: student },
            { status: 200 }
        )
    } catch (error: any) {
        logger.error("Update profile error:", error)

        return NextResponse.json(
            { success: false, message: error.message || "Failed to update profile" },
            { status: 500 }
        )
    }
}
