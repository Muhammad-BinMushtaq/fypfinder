// app/api/student/cancel-deletion/route.ts
// Cancel account deletion request

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { cancelDeletion } from "@/modules/student/student.service"

export async function PATCH() {
  try {
    const user = await requireRole(UserRole.STUDENT)

    await cancelDeletion(user.id, user.status)

    return NextResponse.json(
      { success: true, message: "Deletion request cancelled. Your account is now active." },
      { status: 200 }
    )
  } catch (error: any) {
    logger.error("Cancel deletion error:", error)

    if (error.message === "No pending deletion request") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: error.message || "Failed to cancel deletion request" },
      { status: 500 }
    )
  }
}
