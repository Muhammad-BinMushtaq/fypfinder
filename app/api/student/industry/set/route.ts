// app/api/student/industry/set/route.ts
// Set student's industry preferences (replaces existing)

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
        const { industryIds } = body

        // Validation
        if (!industryIds || !Array.isArray(industryIds)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "industryIds must be an array",
                },
                { status: 400 }
            )
        }

        // Limit to reasonable number
        if (industryIds.length > 5) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Maximum 5 industries allowed",
                },
                { status: 400 }
            )
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

        // Verify all industry IDs exist
        if (industryIds.length > 0) {
            const existingIndustries = await prisma.industry.findMany({
                where: { id: { in: industryIds } },
                select: { id: true },
            })

            if (existingIndustries.length !== industryIds.length) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "One or more invalid industry IDs",
                    },
                    { status: 400 }
                )
            }
        }

        // Transaction: Delete existing and add new
        await prisma.$transaction(async (tx) => {
            // Remove existing preferences
            await tx.studentIndustry.deleteMany({
                where: { studentId: student.id },
            })

            // Add new preferences
            if (industryIds.length > 0) {
                await tx.studentIndustry.createMany({
                    data: industryIds.map((industryId: string) => ({
                        studentId: student.id,
                        industryId,
                    })),
                })
            }
        })

        // Fetch updated preferences
        const updatedPreferences = await prisma.studentIndustry.findMany({
            where: { studentId: student.id },
            include: {
                industry: {
                    select: { id: true, name: true },
                },
            },
        })

        return NextResponse.json(
            {
                success: true,
                message: "Industry preferences updated",
                data: updatedPreferences.map((p) => p.industry),
            },
            { status: 200 }
        )
    } catch (error: any) {
        logger.error("Set industry preferences error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update industry preferences",
            },
            { status: 500 }
        )
    }
}
