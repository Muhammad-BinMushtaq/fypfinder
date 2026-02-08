import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import prisma from "@/lib/db"
import { getRecievedMessageRequests } from "@/modules/request/request.service"

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
        const requests = await getRecievedMessageRequests(student.id)

        return NextResponse.json(
            {
                success: true,
                message: "Recieved message requests fetched",
                data: requests,
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error("Get recieved message requests error:", error)

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Unauthorized",
            },
            { status: 401 }
        )
    }
}
