// app/api/messaging/get-messages/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import logger from "@/lib/logger"
import { getMessages, markMessagesAsRead } from "@/modules/messaging/messaging.service"

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(UserRole.STUDENT)

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")
    const cursor = searchParams.get("cursor") || undefined
    const limit = parseInt(searchParams.get("limit") || "50", 10)

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

    const messages = await getMessages(conversationId, student.id, { cursor, limit })

    // Mark messages as read when fetching
    await markMessagesAsRead(conversationId, student.id)

    return NextResponse.json(
      { success: true, message: "Messages fetched", data: { messages } },
      { status: 200 }
    )
  } catch (error) {
    logger.error("Get messages error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to get messages"
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    )
  }
}
