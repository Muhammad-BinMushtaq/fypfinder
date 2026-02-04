import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { updateGroupVisibility } from "@/modules/group/group.service"
import prisma from "@/lib/db"

export async function PUT(req: NextRequest) {
    try {
        // 🔐 Auth + role
        const user = await requireRole(UserRole.STUDENT)

        // 📥 Get request body
        const body = await req.json()
        const { showGroupOnProfile } = body

        if (typeof showGroupOnProfile !== "boolean") {
            return NextResponse.json(
                {
                    success: false,
                    message: "showGroupOnProfile must be a boolean value",
                },
                { status: 400 }
            )
        }

        // 🔍 Get student ID from user
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
        const result = await updateGroupVisibility(student.id, showGroupOnProfile)

        return NextResponse.json(
            {
                success: true,
                message: showGroupOnProfile
                    ? "Group is now visible on your public profile"
                    : "Group is now hidden from your public profile",
                data: result,
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error("Update group visibility error:", error)

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to update visibility",
            },
            { status: 400 }
        )
    }
}
