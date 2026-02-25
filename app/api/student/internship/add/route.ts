// app/api/student/internship/add/route.ts
// Add a new internship to student profile

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"

export async function POST(req: Request) {
    try {
        // 🔐 Auth + Role
        const user = await requireRole(UserRole.STUDENT)

        const body = await req.json()
        const { companyName, position, duration, description, certificateLink } = body

        // Validation
        if (!companyName || typeof companyName !== "string" || companyName.trim().length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Company name is required",
                },
                { status: 400 }
            )
        }

        if (!position || typeof position !== "string" || position.trim().length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Position is required",
                },
                { status: 400 }
            )
        }

        if (!duration || typeof duration !== "string" || duration.trim().length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Duration is required",
                },
                { status: 400 }
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

        // Limit internships (max 10)
        const internshipCount = await prisma.internship.count({
            where: { studentId: student.id },
        })

        if (internshipCount >= 10) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Maximum 10 internships allowed",
                },
                { status: 400 }
            )
        }

        // Create internship
        const internship = await prisma.internship.create({
            data: {
                studentId: student.id,
                companyName: companyName.trim(),
                position: position.trim(),
                duration: duration.trim(),
                description: description?.trim() || null,
                certificateLink: certificateLink?.trim() || null,
            },
        })

        return NextResponse.json(
            {
                success: true,
                message: "Internship added successfully",
                data: internship,
            },
            { status: 201 }
        )
    } catch (error: any) {
        logger.error("Add internship error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Failed to add internship",
            },
            { status: 500 }
        )
    }
}
