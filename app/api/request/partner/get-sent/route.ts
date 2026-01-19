import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import prisma from "@/lib/db"
import { getSentPartnerRequests } from "@/modules/request/request.service"

export async function GET() {
    try {
        // 🔐 Auth + role check
        const user = await requireRole(UserRole.STUDENT)

        // 🔗 Get student profile
        const student = await prisma.student.findUnique({
            where: { userId: user.id },
            select: { id: true },
        })

        if (!student) {
            return NextResponse.json(
                { success: false, message: "Student profile not found" },
                { status: 404 }
            )
        }

        // 📤 Fetch sent message requests
        const requests = await getSentPartnerRequests(student.id)

        
        console.log("Fetched partner requests:", requests)
        return NextResponse.json(
            {
                success: true,
                message: "Sent partner requests fetched",
                data: requests,
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error("Get sent partner requests error:", error)

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Unauthorized",
            },
            { status: 401 }
        )
    }
}
