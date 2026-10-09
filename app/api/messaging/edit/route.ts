// app/api/messaging/edit/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import logger from "@/lib/logger"
import { editMessage } from "@/modules/messaging/messaging.service"
import { messageRateLimiter } from "@/lib/rate-limit"

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole(UserRole.STUDENT)

    const rateLimit = messageRateLimiter.check(`student:${user.id}`)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many edit requests. Please slow down.", retryAfter: rateLimit.retryAfter },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { messageId, content } = body

    if (!messageId || !content) {
      return NextResponse.json(
        { success: false, message: "messageId and content are required" },
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

    const message = await editMessage(messageId, student.id, content)

    return NextResponse.json(
      { success: true, message: "Message updated", data: { message } },
      { status: 200 }
    )
  } catch (error) {
    logger.error("Edit message error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to edit message"
    const status = errorMessage.includes("15 minutes") || errorMessage.includes("only edit") ? 403 : 500
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status }
    )
  }
}
