// app/api/messaging/mark-read/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { markMessagesAsRead } from "@/modules/messaging/messaging.service"
import logger from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(UserRole.STUDENT)

    const body = await request.json()
    const { conversationId } = body

    if (!conversationId) {
      return NextResponse.json(
        { success: false, message: "conversationId is required" },
        { status: 400 }
      )
    }

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

    const result = await markMessagesAsRead(conversationId, student.id)

    return NextResponse.json(
      { success: true, message: "Messages marked as read", data: result },
      { status: 200 }
    )
  } catch (error) {
    logger.error("Mark read error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to mark messages as read"
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    )
  }
}

