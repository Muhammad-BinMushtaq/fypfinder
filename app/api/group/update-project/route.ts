import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { updateGroupProject } from "@/modules/group/group.service"
import prisma from "@/lib/db"
import logger from "@/lib/logger"

export async function PUT(req: NextRequest) {
    try {
        // 🔐 Auth + role
        const user = await requireRole(UserRole.STUDENT)

        // 📥 Get request body
        const body = await req.json()
        const { projectName, description } = body

        if (!projectName) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project name is required",
                },
                { status: 400 }
            )
        }

        // 🔍 Get student ID from user
        const student = await prisma.student.findUnique({
            where: { userId: user.id },
            select: { id: true },
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

        // 🧠 Business logic
        const result = await updateGroupProject(student.id, projectName, description)

        return NextResponse.json(
            {
                success: true,
                message: "Project details updated successfully",
                data: result,
            },
            { status: 200 }
        )
    } catch (error: any) {
        logger.error("Update group project error:", error)

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to update project",
            },
            { status: 400 }
        )
    }
}
