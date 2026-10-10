// app/api/messaging/send/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import logger from "@/lib/logger"
import { sendMessage } from "@/modules/messaging/messaging.service"
import { messageRateLimiter } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(UserRole.STUDENT)

    const rateLimit = await messageRateLimiter.checkAsync(`student:${user.id}`)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many messages sent. Please slow down.", retryAfter: rateLimit.retryAfter },
        {
          status: 429,
          headers: rateLimit.retryAfter
            ? { "Retry-After": String(rateLimit.retryAfter) }
            : undefined,
        }
      )
    }

    const body = await request.json()
    const { conversationId, content } = body

    if (!conversationId || !content) {
      return NextResponse.json(
        { success: false, message: "conversationId and content are required" },
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

    const message = await sendMessage(conversationId, student.id, content)

    return NextResponse.json(
      { success: true, message: "Message sent", data: { message } },
      { status: 200 }
    )
  } catch (error) {
    logger.error("Send message error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to send message"

    // Permission denial should return 403, not 500
    if (errorMessage === "You are not allowed to send messages to this student") {
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    )
  }
}
