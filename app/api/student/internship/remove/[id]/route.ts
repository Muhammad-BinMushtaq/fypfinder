// app/api/student/internship/remove/[id]/route.ts
// Remove an internship from student profile

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { removeInternship } from "@/modules/student/student.service"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireRole(UserRole.STUDENT)

        const { id } = await params

        await removeInternship(user.id, id)

        return NextResponse.json(
            { success: true, message: "Internship deleted successfully" },
            { status: 200 }
        )
    } catch (error: any) {
        logger.error("Delete internship error:", error)

        const status = error.message === "Student profile not found" ? 404
            : error.message === "Internship not found" ? 404
            : error.message === "You can only delete your own internships" ? 403
            : 500

        return NextResponse.json(
            { success: false, message: error.message || "Failed to delete internship" },
            { status }
        )
    }
}
