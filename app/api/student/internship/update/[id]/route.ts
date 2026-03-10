// app/api/student/internship/update/[id]/route.ts
// Update an existing internship

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { updateInternship } from "@/modules/student/student.service"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireRole(UserRole.STUDENT)

        const { id } = await params
        const body = await req.json()
        const { companyName, position, duration, description, certificateLink } = body

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

        const internship = await updateInternship(user.id, id, {
            companyName,
            position,
            duration,
            description: description !== undefined ? description : undefined,
            certificateLink: certificateLink !== undefined ? certificateLink : undefined,
        })

        return NextResponse.json(
            { success: true, message: "Internship updated successfully", data: internship },
            { status: 200 }
        )
    } catch (error: any) {
        logger.error("Update internship error:", error)

        const status = error.message === "Student profile not found" ? 404
            : error.message === "Internship not found" ? 404
            : error.message === "You can only update your own internships" ? 403
            : 500

        return NextResponse.json(
            { success: false, message: error.message || "Failed to update internship" },
            { status }
        )
    }
}
