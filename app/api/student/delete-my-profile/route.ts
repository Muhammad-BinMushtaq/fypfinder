import { requireRole } from "@/lib/auth"
import prisma from "@/lib/db"
import { UserRole, UserStatus } from "@/lib/generated/prisma/enums"
import { NextResponse } from "next/server"

export async function PATCH() {
  try {
    const user = await requireRole(UserRole.STUDENT)

    if (user.status !== UserStatus.ACTIVE) {
      return NextResponse.json(
        { message: "Account already in process" },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { status: UserStatus.DELETION_REQUESTED },
    })

    return NextResponse.json({
      success: true,
      message: "Deletion request sent for admin approval",
    },
      { status: 200 })

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 401 }
    )
  }
}
