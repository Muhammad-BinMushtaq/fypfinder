// app/api/student/internship/update/[id]/route.ts
// Update an existing internship

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 🔐 Auth + Role
        const user = await requireRole(UserRole.STUDENT)

        const { id } = await params
        const body = await req.json()
        const { companyName, position, duration, description, certificateLink } = body

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
                    message: "You can only update your own internships",
                },
                { status: 403 }
            )
        }

        // Validate certificate URL if provided
        if (certificateLink) {
            try {
                new URL(certificateLink)
            } catch {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid certificate URL format",
                    },
                    { status: 400 }
                )
            }
        }

        // Update internship
        const internship = await prisma.internship.update({
            where: { id },
            data: {
                ...(companyName !== undefined && { companyName: companyName.trim() }),
                ...(position !== undefined && { position: position.trim() }),
                ...(duration !== undefined && { duration: duration.trim() }),
                ...(description !== undefined && { description: description?.trim() || null }),
                ...(certificateLink !== undefined && { certificateLink: certificateLink?.trim() || null }),
            },
        })

        return NextResponse.json(
            {
                success: true,
                message: "Internship updated successfully",
                data: internship,
            },
            { status: 200 }
        )
    } catch (error: any) {
        logger.error("Update internship error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update internship",
            },
            { status: 500 }
        )
    }
}
