import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { requestDeletion } from "@/modules/student/student.service"

export async function PATCH() {
  try {
    const user = await requireRole(UserRole.STUDENT)

    await requestDeletion(user.id, user.status)

    return NextResponse.json(
      { success: true, message: "Deletion request sent for admin approval" },
      { status: 200 }
    )
  } catch (error: any) {
    logger.error("Delete profile request error:", error)

    if (error.message === "Account already in process") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: error.message || "Failed to request deletion" },
      { status: 500 }
    )
  }
}
