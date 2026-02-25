// app/api/admin/industry/remove/[id]/route.ts
// Admin endpoint to delete an industry

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
        // 🔐 Admin only
        await requireRole(UserRole.ADMIN)

        const { id } = await params

        // Check if industry exists
        const existing = await prisma.industry.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { students: true },
                },
            },
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

        // Delete industry (cascade will remove StudentIndustry entries)
        await prisma.industry.delete({
            where: { id },
        })

        return NextResponse.json(
            {
                success: true,
                message: "Industry deleted successfully",
                data: {
                    removedFrom: existing._count.students,
                },
            },
            { status: 200 }
        )
    } catch (error: any) {
        logger.error("Delete industry error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete industry",
            },
            { status: 500 }
        )
    }
}
