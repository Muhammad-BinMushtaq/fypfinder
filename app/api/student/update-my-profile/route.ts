import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import prisma from "@/lib/db"
import { UserRole } from "@/lib/generated/prisma/enums"

export async function PATCH(req: Request) {
    try {
        //  Authenticate + role check
        const user = await requireRole(UserRole.STUDENT)


        const body = await req.json()

        // Note: name and department are intentionally excluded - they cannot be changed
        const {
            currentSemester,
            profilePicture,
            interests,
            phone,
            linkedinUrl,
            githubUrl,
            availability,
        } = body

        //  Update only provided fields (excluding name and department)
        const student = await prisma.student.update({
            where: {
                userId: user.id,
            },
            data: {
                ...(currentSemester !== undefined && { currentSemester }),
                ...(profilePicture !== undefined && { profilePicture }),
                ...(interests !== undefined && { interests }),
                ...(phone !== undefined && { phone }),
                ...(linkedinUrl !== undefined && { linkedinUrl }),
                ...(githubUrl !== undefined && { githubUrl }),
                ...(availability !== undefined && { availability }),
            },

        })

        //  Return updated profile
        return NextResponse.json(
            {
                success: true,
                message: "Profile updated successfully",
                data: student,
            },
            { status: 200 }
        )
    } catch (error: any) {
        logger.error("Update profile error:", error)

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Unauthorized",
            },
            { status: 401 }
        )
    }
}
