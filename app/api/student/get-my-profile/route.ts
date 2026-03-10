import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { getMyProfile } from "@/modules/student/student.service"

export async function GET() {
    try {
        const currentUser = await requireRole(UserRole.STUDENT)

        const profile = await getMyProfile(currentUser.id)

        if (!profile) {
            return NextResponse.json(
                { success: false, message: "Student profile not found", data: null },
                { status: 404 }
            )
        }

        const response = NextResponse.json(
            { success: true, message: "Profile fetched", data: profile },
            { status: 200 }
        )

        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
        return response
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Unauthorized: not logged in", data: null },
            { status: 401 }
        )
    }
}
