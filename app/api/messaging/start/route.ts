// app/api/messaging/start/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import logger from "@/lib/logger"
import { canStudentsMessage, getOrCreateConversation } from "@/modules/messaging/messaging.service"

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(UserRole.STUDENT)

    const body = await request.json()
    const { targetStudentId } = body

    if (!targetStudentId) {
      return NextResponse.json(
        { success: false, message: "targetStudentId is required" },
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

    if (student.id === targetStudentId) {
      return NextResponse.json(
        { success: false, message: "Cannot start a conversation with yourself" },
        { status: 400 }
      )
    }

    const targetStudent = await prisma.student.findUnique({
      where: { id: targetStudentId },
      select: { id: true },
    })

    if (!targetStudent) {
      return NextResponse.json(
        { success: false, message: "Target student not found" },
        { status: 404 }
      )
    }

    const canMessage = await canStudentsMessage(student.id, targetStudentId)
    if (!canMessage) {
      return NextResponse.json(
        { success: false, message: "You are not allowed to message this student" },
        { status: 403 }
      )
    }

    const conversation = await getOrCreateConversation(student.id, targetStudentId)

    return NextResponse.json(
      { success: true, message: "Conversation started", data: { conversation } },
      { status: 200 }
    )
  } catch (error) {
    logger.error("Start conversation error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to start conversation"
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    )
  }
}
