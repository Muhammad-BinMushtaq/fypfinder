import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole, UserStatus } from "@/lib/generated/prisma/enums"
import { getAllStudents } from "@/modules/admin/admin.service"

export async function GET(req: Request) {
    try {
        // 🔐 Admin-only access
        await requireRole(UserRole.ADMIN)

        const { searchParams } = new URL(req.url)

        const limit = Math.min(Number(searchParams.get("limit")) || 10, 50)
        const offset = Number(searchParams.get("offset")) || 0

        const studentId = searchParams.get("studentId") || undefined
        const name = searchParams.get("name") || undefined
        const department = searchParams.get("department") || undefined

        const semester = searchParams.get("semester")
            ? Number(searchParams.get("semester"))
            : undefined

        const status = searchParams.get("status") as UserStatus | undefined

        const result = await getAllStudents({
            limit,
            offset,
            studentId,
            name,
            department,
            semester,
            status,
        })

        if (!result || !result.pagination) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to fetch students",
                    data: null,
                },
                { status: 404 }
            )
        }

        // ✅ Handle empty result explicitly (for clarity)
        if (result.pagination.total === 0) {
            return NextResponse.json({
                success: true,
                message: "No students found",
                data: result,
            })
        }

        return NextResponse.json({
            success: true,
            message: "Students fetched successfully",
            data: result,
        })
    } catch (error: any) {
        console.error("Admin get-all-students error:", error)

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Unauthorized",
            },
            { status: 401 }
        )
    }
}
