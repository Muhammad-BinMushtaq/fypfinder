// app/api/student/skill/update/route.ts

import { requireRole } from "@/lib/auth"
import { ExperienceLevel, UserRole } from "@/lib/generated/prisma/enums"
import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { updateSkill } from "@/modules/student/student.service"

export async function PATCH(req: Request) {
    try {
        const user = await requireRole(UserRole.STUDENT)

        const body = await req.json()
        const { skillId, name, description, level } = body

        if (!skillId) {
            return NextResponse.json(
                { success: false, message: "skillId is required" },
                { status: 400 }
            )
        }

        if (level && !Object.values(ExperienceLevel).includes(level)) {
            return NextResponse.json(
                { success: false, message: "Invalid experience level" },
                { status: 400 }
            )
        }

        const updatedSkill = await updateSkill(user.id, skillId, { name, description, level })

        return NextResponse.json(
            { success: true, message: "Skill updated successfully", data: updatedSkill },
            { status: 200 }
        )
    } catch (error: any) {
        logger.error("Update skill error:", error)

        const status = error.message === "Student profile not found" ? 404
            : error.message === "Skill not found or unauthorized" ? 404
            : 500

        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status }
        )
    }
}
