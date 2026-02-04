import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { getMyGroup } from "@/modules/group/group.service"
import prisma from "@/lib/db"

export async function GET() {
    try {
        // 🔐 Auth + role
        const user = await requireRole(UserRole.STUDENT)

        // 🔍 Get student ID from user ID
        const student = await prisma.student.findUnique({
            where: { userId: user.id },
            select: { id: true },
        })

        if (!student) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Student profile not found",
                },
                { status: 404 }
            )
        }

        // 🧠 Business logic
        const group = await getMyGroup(student.id)
        
        return NextResponse.json(
            {
                success: true,
                message: group ? "Group fetched" : "No group found",
                data: group,
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error("Get my group error:", error)

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Unauthorized",
            },
            { status: 401 }
        )
    }
}
