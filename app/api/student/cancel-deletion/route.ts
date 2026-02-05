// app/api/student/cancel-deletion/route.ts
// Cancel account deletion request

import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole, UserStatus } from "@/lib/generated/prisma/enums"
import prisma from "@/lib/db"

export async function PATCH() {
  try {
    // 🔐 Student only
    const user = await requireRole(UserRole.STUDENT)

    // Verify user has pending deletion request
    if (user.status !== UserStatus.DELETION_REQUESTED) {
      return NextResponse.json(
        { success: false, message: "No pending deletion request" },
        { status: 400 }
      )
    }

    // Update user status back to ACTIVE
    await prisma.user.update({
      where: { id: user.id },
      data: { status: UserStatus.ACTIVE },
    })

    return NextResponse.json({
      success: true,
      message: "Deletion request cancelled. Your account is now active.",
    })
  } catch (error: any) {
    console.error("Cancel deletion error:", error)

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, message: error.message || "Failed to cancel deletion request" },
      { status: 500 }
    )
  }
}
