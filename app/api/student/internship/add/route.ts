// app/api/student/internship/add/route.ts
// Add a new internship to student profile

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { addInternship } from "@/modules/student/student.service"

export async function POST(req: Request) {
    try {
        const user = await requireRole(UserRole.STUDENT)

        const body = await req.json()
        const { companyName, position, duration, description, certificateLink } = body

        // Validation
        if (!companyName || typeof companyName !== "string" || companyName.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: "Company name is required" },
                { status: 400 }
            )
        }

        if (!position || typeof position !== "string" || position.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: "Position is required" },
                { status: 400 }
            )
        }

        if (!duration || typeof duration !== "string" || duration.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: "Duration is required" },
                { status: 400 }
            )
        }

        // Validate certificate URL if provided
        if (certificateLink) {
            try {
                new URL(certificateLink)
            } catch {
                return NextResponse.json(
                    { success: false, message: "Invalid certificate URL format" },
                    { status: 400 }
                )
            }
        }

        const internship = await addInternship(user.id, {
            companyName,
            position,
            duration,
            description: description || null,
            certificateLink: certificateLink || null,
        })

        return NextResponse.json(
            { success: true, message: "Internship added successfully", data: internship },
            { status: 201 }
        )
    } catch (error: any) {
        logger.error("Add internship error:", error)

        if (error.message === "Student profile not found") {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 404 }
            )
        }

        if (error.message === "Maximum 10 internships allowed") {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { success: false, message: "Failed to add internship" },
            { status: 500 }
        )
    }
}
