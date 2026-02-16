import { requireRole } from "@/lib/auth"
import prisma from "@/lib/db"
import { UserRole } from "@/lib/generated/prisma/enums"
import logger from "@/lib/logger"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        // 🔐 Auth
        const user = await requireRole(UserRole.STUDENT)

        const body = await req.json()
        const { name, description, liveLink, githubLink } = body

        if (!name) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project name is required"
                },
                { status: 400 }
            )
        }



        // 🔗 Get student using userId
        const student = await prisma.student.findUnique({
            where: { userId: user.id },
        })

        // console.log('This is student', student)
        // console.log('This is userID', user.id)

        if (!student) {
            return NextResponse.json(
                { success: false, message: "Student profile not found" },
                { status: 404 }
            )
        }

        // 📦 Create project
        const project = await prisma.project.create({
            data: {
                studentId: student.id,
                name,
                description,
                liveLink,
                githubLink,
            },
        })

        return NextResponse.json(
            {
                success: true,
                message: "Project added successfully",
                data: project,
            },
            { status: 201 }
        )
    } catch (error: any) {
        logger.error("Add project error:", error)

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Internal server error",
            },
            { status: 500 }
        )
    }
}
