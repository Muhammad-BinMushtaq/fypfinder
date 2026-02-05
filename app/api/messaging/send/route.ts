// app/api/messaging/send/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { sendMessage } from "@/modules/messaging/messaging.service"

export async function POST(request: NextRequest) {
  try {
    // 🔐 Auth
    const user = await requireRole(UserRole.STUDENT)

    const body = await request.json()
    const { conversationId, content } = body

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: "conversationId and content are required" },
        { status: 400 }
      )
    }

    // Get student ID from user ID
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    const message = await sendMessage(conversationId, student.id, content)

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Send message error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to send message"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
