// app/api/admin/industry/add/route.ts
// Admin endpoint to add a new industry

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"

export async function POST(req: Request) {
    try {
        // 🔐 Admin only
        await requireRole(UserRole.ADMIN)

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

        // Check for duplicate
        const existing = await prisma.industry.findUnique({
            where: { name: normalizedName },
        })

        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Industry already exists",
                },
                { status: 409 }
            )
        }

        // Create industry
        const industry = await prisma.industry.create({
            data: { name: normalizedName },
        })

        return NextResponse.json(
            {
                success: true,
                message: "Industry created successfully",
                data: industry,
            },
            { status: 201 }
        )
    } catch (error: any) {
        logger.error("Add industry error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create industry",
            },
            { status: 500 }
        )
    }
}
