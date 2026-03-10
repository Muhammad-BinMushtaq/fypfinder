import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { addProject } from "@/modules/student/student.service"

export async function POST(req: Request) {
    try {
        const user = await requireRole(UserRole.STUDENT)

        const body = await req.json()
        const { name, description, liveLink, githubLink } = body

        if (!name) {
            return NextResponse.json(
                { success: false, message: "Project name is required" },
                { status: 400 }
            )
        }

        if (!githubLink) {
            return NextResponse.json(
                { success: false, message: "GitHub repository URL is required" },
                { status: 400 }
            )
        }

        // Validate URL format
        try {
            new URL(githubLink)
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid GitHub URL format" },
                { status: 400 }
            )
        }

        const project = await addProject(user.id, { name, description, liveLink, githubLink })

        return NextResponse.json(
            { success: true, message: "Project added successfully", data: project },
            { status: 201 }
        )
    } catch (error: any) {
        logger.error("Add project error:", error)

        const status = error.message === "Student profile not found" ? 404 : 500

        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status }
        )
    }
}
