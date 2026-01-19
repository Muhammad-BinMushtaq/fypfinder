// app/api/student/skill/update/route.ts

import { requireRole } from "@/lib/auth"
import prisma from "@/lib/db"
import { ExperienceLevel, UserRole } from "@/lib/generated/prisma/enums"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
    try {
        // 🔐 1. Auth + Role
        const user = await requireRole(UserRole.STUDENT)

        // 📥 2. Parse body
        const body = await req.json()
        const { skillId, name, description, level } = body

        // 🧪 3. Basic validation
        if (!skillId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "skillId is required",
                },
                { status: 400 }
            )
        }

        if (level && !Object.values(ExperienceLevel).includes(level)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid experience level",
                },
                { status: 400 }
            )
        }

        // 🔗 4. Fetch student
        const student = await prisma.student.findUnique({
            where: { userId: user.id },
        })

        if (!student) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Student profile not found",
                },
                { status: 404 }
            )
        }

        // 🔒 5. Ownership check
        const existingSkill = await prisma.skill.findFirst({
            where: {
                id: skillId,
                studentId: student.id,
            },
        })

        if (!existingSkill) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Skill not found or unauthorized",
                },
                { status: 404 }
            )
        }

        // ✏️ 6. Update skill
        const updatedSkill = await prisma.skill.update({
            where: { id: skillId },
            data: {
                ...(name !== undefined && { name: name.trim() }),
                ...(description !== undefined && { description }),
                ...(level !== undefined && { level }),
            },
        })

        console.log("Updated skill:", updatedSkill)
        // ✅ 7. Response
        return NextResponse.json(
            {
                success: true,
                message: "Skill updated successfully",
                data: updatedSkill,
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error("Update skill error:", error)

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Internal server error",
            },
            { status: 500 }
        )
    }
}
