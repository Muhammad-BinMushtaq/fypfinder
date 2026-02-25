// app/api/industry/get-all/route.ts
// Public endpoint to get all industries for selection

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET() {
    try {
        const industries = await prisma.industry.findMany({
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
            },
        })

        return NextResponse.json(
            {
                success: true,
                data: industries,
            },
            { status: 200 }
        )
    } catch (error: any) {
        logger.error("Get industries error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch industries",
            },
            { status: 500 }
        )
    }
}
