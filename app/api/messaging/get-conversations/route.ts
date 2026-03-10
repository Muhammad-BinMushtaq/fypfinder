// app/api/messaging/get-conversations/route.ts
import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { getConversationsForStudent } from "@/modules/messaging/messaging.service"

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

    const conversations = await getConversationsForStudent(student.id)

    return NextResponse.json(
      { success: true, message: "Conversations fetched", data: { conversations } },
      { status: 200 }
    )
  } catch (error) {
    logger.error("Get conversations error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to get conversations" },
      { status: 500 }
    )
  }
}
