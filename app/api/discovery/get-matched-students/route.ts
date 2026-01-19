// app/api/discovery/get-matched-students/route.ts

import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole, UserStatus, AvailabilityStatus } from "@/lib/generated/prisma/enums"
import { getMatchedStudents } from "@/modules/discovery/discovery.service"

export async function GET(req: Request) {
    try {
        // 🔐 1. Auth + role enforcement
        const user = await requireRole(UserRole.STUDENT)

        // 🔎 2. Parse query params
        const { searchParams } = new URL(req.url)

        const { items, total, offset, limit } = await getMatchedStudents(
            searchParams,
            user.id
        )

        console.log("Fetched students:", items)
        console.log("Total fetched students are", total)
        return NextResponse.json(
            {
                success: true,
                message: "Students fetched",
                data: {
                    items,
                    pagination: {
                        limit,
                        offset,
                        total,
                    },
                },
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error("Discovery error:", error)

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Internal server error",
            },
            { status: error.message?.includes("Unauthorized") ? 401 : 500 }
        )
    }
}
