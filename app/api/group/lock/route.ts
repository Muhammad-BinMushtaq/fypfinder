import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { lockGroup } from "@/modules/group/group.service"

export async function POST() {
  try {
    //  Auth + role
    const user = await requireRole(UserRole.STUDENT)

    //  Lock group
    const result = await lockGroup(user.id)

    return NextResponse.json(
      {
        success: true,
        message: "Group locked successfully",
        data: result,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Lock group error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 400 }
    )
  }
}
