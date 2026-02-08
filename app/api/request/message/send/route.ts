import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"

import prisma from "@/lib/db"
import { sendMessageRequest } from "@/modules/request/request.service"

export async function POST(req: Request) {
  try {
    //  Auth + role
    const user = await requireRole(UserRole.STUDENT)

    const body = await req.json()
    const { toStudentId ,reason} = body

    if (!toStudentId) {
      return NextResponse.json(
        { success: false, message: "Target student ID is required" },
        { status: 400 }
      )
    }

    // 🔗 Get sender's student profile
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

    // 📩 Call service
    const request = await sendMessageRequest(
      student.id,
      toStudentId,
      reason
    )

    
    return NextResponse.json(
      {
        success: true,
        message: "Message request sent",
        data: request,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Send message request error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 400 }
    )
  }
}
