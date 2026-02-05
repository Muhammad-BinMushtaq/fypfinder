// app/api/messaging/unread-count/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { getTotalUnreadCount } from "@/modules/messaging/messaging.service"

export async function GET() {
  try {
    // 🔐 Auth
    const user = await requireRole(UserRole.STUDENT)

    // Get student ID from user ID
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    const unreadCount = await getTotalUnreadCount(student.id)

    return NextResponse.json({ unreadCount })
  } catch (error) {
    console.error("Get unread count error:", error)
    return NextResponse.json(
      { error: "Failed to get unread count" },
      { status: 500 }
    )
  }
}
