import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import logger from "@/lib/logger"
import { getPublicProfile } from "@/modules/student/student.service"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    try {
        const currentUser = await requireRole(UserRole.STUDENT)

        const { studentId } = await params

        if (!studentId) {
            return NextResponse.json(
                { success: false, message: "Student ID is required", data: null },
                { status: 400 }
            )
        }

        const profile = await getPublicProfile(studentId)

        if (!profile) {
            return NextResponse.json(
                { success: false, message: "Student not found", data: null },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { success: true, message: "Public profile fetched", data: profile },
            { status: 200 }
        )
    } catch (error) {
        logger.error("Get public profile error:", error)

        return NextResponse.json(
            { success: false, message: "Internal server error", data: null },
            { status: 500 }
        )
    }
}
