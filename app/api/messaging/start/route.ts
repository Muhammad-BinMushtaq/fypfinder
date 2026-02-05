// app/api/messaging/start/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { canStudentsMessage, getOrCreateConversation } from "@/modules/messaging/messaging.service"

export async function POST(request: NextRequest) {
  try {
    // 🔐 Auth
    const user = await requireRole(UserRole.STUDENT)

    const body = await request.json()
    const { targetStudentId } = body

    if (!targetStudentId) {
      return NextResponse.json(
        { error: "targetStudentId is required" },
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

    // Cannot start conversation with yourself
    if (student.id === targetStudentId) {
      return NextResponse.json(
        { error: "Cannot start a conversation with yourself" },
        { status: 400 }
      )
    }

    // Check if target student exists
    const targetStudent = await prisma.student.findUnique({
      where: { id: targetStudentId },
      select: { id: true },
    })

    if (!targetStudent) {
      return NextResponse.json({ error: "Target student not found" }, { status: 404 })
    }

    // Check if students are allowed to message each other
    const canMessage = await canStudentsMessage(student.id, targetStudentId)
    if (!canMessage) {
      return NextResponse.json(
        { error: "You are not allowed to message this student" },
        { status: 403 }
      )
    }

    // Get or create conversation
    const conversation = await getOrCreateConversation(student.id, targetStudentId)

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("Start conversation error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to start conversation"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
