import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { removeProject } from "@/modules/student/student.service"

export async function DELETE(req: Request) {
    try {
        const user = await requireRole(UserRole.STUDENT)

        const { searchParams } = new URL(req.url)
        const projectId = searchParams.get("projectId")

        if (!projectId) {
            return NextResponse.json(
                { success: false, message: "Project ID is required" },
                { status: 400 }
            )
        }

        await removeProject(user.id, projectId)

        return NextResponse.json(
            { success: true, message: "Project deleted successfully" },
            { status: 200 }
        )
    } catch (error: any) {
        logger.error("Delete project error:", error)

        const status = error.message === "Project not found or unauthorized" ? 404 : 500

        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status }
        )
    }
}
