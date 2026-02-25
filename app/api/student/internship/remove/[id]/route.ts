// app/api/student/internship/remove/[id]/route.ts
// Remove an internship from student profile

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 🔐 Auth + Role
        const user = await requireRole(UserRole.STUDENT)

        const { id } = await params

        // Get student
        const student = await prisma.student.findUnique({
            where: { userId: user.id },
        })

        if (!student) {
            return NextResponse.json(
                { success: false, message: "Student profile not found" },
                { status: 404 }
            )
        }

        // Check if internship exists and belongs to student
        const existingInternship = await prisma.internship.findUnique({
            where: { id },
        })

        if (!existingInternship) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Internship not found",
                },
                { status: 404 }
            )
        }

        if (existingInternship.studentId !== student.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You can only delete your own internships",
                },
                { status: 403 }
            )
        }

        // Delete internship
        await prisma.internship.delete({
            where: { id },
        })

        return NextResponse.json(
            {
                success: true,
                message: "Internship deleted successfully",
            },
            { status: 200 }
        )
    } catch (error: any) {
        logger.error("Delete internship error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete internship",
            },
            { status: 500 }
        )
    }
}
