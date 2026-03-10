import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole, AvailabilityStatus } from "@/lib/generated/prisma/enums"
import { updateMyProfile } from "@/modules/student/student.service"

export async function PATCH(req: Request) {
    try {
        const user = await requireRole(UserRole.STUDENT)

        const body = await req.json()

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
        } = body

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
