import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { getMyGroup } from "@/modules/group/group.service"

export async function GET() {
    try {
        // 🔐 Auth + role
        const user = await requireRole(UserRole.STUDENT)

        // 🧠 Business logic
        const group = await getMyGroup(user.id)
        console.log("This is group", group)
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

        console.log(error)
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Unauthorized",
            },
            { status: 401 }
        )
    }
}
