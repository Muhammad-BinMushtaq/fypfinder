import { requireRole } from "@/lib/auth"
import prisma from "@/lib/db"
import { UserRole } from "@/lib/generated/prisma/enums"
import { NextResponse } from "next/server"

export async function DELETE(req: Request) {
    try {
        // 🔐 Auth
        const user = await requireRole(UserRole.STUDENT)

        // Get projectId from query parameters
        const { searchParams } = new URL(req.url)
        const projectId = searchParams.get("projectId")

        if (!projectId) {
            return NextResponse.json(
                { success: false, message: "Project ID is required" },
                { status: 400 }
            )
        }

        // ✅ Optimized: Single query with joined ownership check
        // Instead of 4 separate queries, use 1 query with relation filter
        const deletedProject = await prisma.project.deleteMany({
            where: {
                id: projectId,
                student: {
                    userId: user.id,  // ✅ Join check ensures ownership
                },
            },
        })

        if (deletedProject.count === 0) {
            return NextResponse.json(
                { success: false, message: "Project not found or unauthorized" },
                { status: 404 }
            )
        }

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
