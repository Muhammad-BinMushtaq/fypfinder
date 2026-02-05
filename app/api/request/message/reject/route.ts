import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import prisma from "@/lib/db"
import { acceptMessageRequest, rejectMessageRequest } from "@/modules/request/request.service"

export async function POST(req: Request) {
    try {
        // 🔐 Auth + role
        const user = await requireRole(UserRole.STUDENT)

        const body = await req.json()
        const { requestId } = body

        if (!requestId) {
            return NextResponse.json(
                { success: false, message: "Request ID is required" },
                { status: 400 }
            )
        }

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

        // ✅ Accept request
        const rejectedRequest = await rejectMessageRequest(
            requestId,
            student.id
        )

        console.log("Rejected message request:", rejectedRequest)
        return NextResponse.json(
            {
                success: true,
                message: "Message request Rejected",
                data: rejectedRequest,
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error("rejected Request message request error:", error)

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Unauthorized",
            },
            { status: 401 }
        )
    }
}
