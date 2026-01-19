import { requireRole } from "@/lib/auth"
import prisma from "@/lib/db"
import { UserRole } from "@/lib/generated/prisma/enums"
import { NextResponse } from "next/server"

export async function DELETE(req: Request) {
    try {
        // 🔐 Auth
        const user = await requireRole(UserRole.STUDENT)

        const body = await req.json()
        const { projectId } = body

        if (!projectId) {
            return NextResponse.json(
                { success: false, message: "Project ID is required" },
                { status: 400 }
            )
        }

        //  Get student
        const student = await prisma.student.findUnique({
            where: { userId: user.id },
        })

        if (!student) {
            return NextResponse.json(
                { success: false, message: "Student profile not found" },
                { status: 404 }
            )
        }

        //  Ownership check
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                studentId: student.id,
            },
        })

        if (!project) {
            return NextResponse.json(
                { success: false, message: "Project not found or unauthorized" },
                { status: 404 }
            )
        }

        // 🗑 Delete project
        await prisma.project.delete({
            where: { id: projectId },
        })

        return NextResponse.json(
            {
                success: true,
                message: "Project deleted successfully",
            },
            { status: 200 }
        )

          
    } catch (error: any) {
        console.error("Delete project error:", error)

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Internal server error",
            },
            { status: 500 }
        )
    }
}
