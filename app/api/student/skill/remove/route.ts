import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { removeSkill } from "@/modules/student/student.service"

export async function DELETE(req: Request) {
    try {
        const user = await requireRole(UserRole.STUDENT)

        const { searchParams } = new URL(req.url)
        const skillId = searchParams.get("skillId")

        if (!skillId) {
            return NextResponse.json(
                { success: false, message: "Skill ID is required" },
                { status: 400 }
            )
        }

        await removeSkill(user.id, skillId)

        return NextResponse.json(
            { success: true, message: "Skill deleted successfully" },
            { status: 200 }
        )
    } catch (error: any) {
        logger.error("Delete skill error:", error)

        const status = error.message === "Skill not found or unauthorized" ? 404 : 500

        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status }
        )
    }
}
