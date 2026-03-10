// app/api/messaging/unread-count/route.ts
import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { getTotalUnreadCount } from "@/modules/messaging/messaging.service"

export async function GET() {
  try {
    const user = await requireRole(UserRole.STUDENT)

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student profile not found" },
        { status: 404 }
      )
    }

    const unreadCount = await getTotalUnreadCount(student.id)

    return NextResponse.json(
      { success: true, message: "Unread count fetched", data: { unreadCount } },
      { status: 200 }
    )
  } catch (error) {
    logger.error("Get unread count error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to get unread count" },
      { status: 500 }
    )
  }
}
