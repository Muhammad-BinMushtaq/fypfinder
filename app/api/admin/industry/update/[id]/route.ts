// app/api/admin/industry/update/[id]/route.ts
// Admin endpoint to update an industry

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
        // 🔐 Admin only
        await requireRole(UserRole.ADMIN)

        const { id } = await params
        const body = await req.json()
        const { name } = body

        // Validation
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Industry name is required",
                },
                { status: 400 }
            )
        }

        const normalizedName = name.trim()

        // Check if industry exists
        const existing = await prisma.industry.findUnique({
            where: { id },
        })

        if (!existing) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Industry not found",
                },
                { status: 404 }
            )
        }

        // Check for duplicate name (excluding current)
        const duplicate = await prisma.industry.findFirst({
            where: {
                name: normalizedName,
                id: { not: id },
            },
        })

        if (duplicate) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Industry name already exists",
                },
                { status: 409 }
            )
        }

        // Update industry
        const industry = await prisma.industry.update({
            where: { id },
            data: { name: normalizedName },
        })

        return NextResponse.json(
            {
                success: true,
                message: "Industry updated successfully",
                data: industry,
            },
            { status: 200 }
        )
    } catch (error: any) {
        logger.error("Update industry error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update industry",
            },
            { status: 500 }
        )
    }
}
