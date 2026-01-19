import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { canStudentsMessage } from "@/modules/messaging/messaging.service"
import prisma from "@/lib/db"
export async function GET(req: Request) {
  try {
    // 🔐 Auth
    const user = await requireRole(UserRole.STUDENT)

    const { searchParams } = new URL(req.url)
    const targetStudentId = searchParams.get("targetStudentId")

    if (!targetStudentId) {
      return NextResponse.json(
        {
          success: false,
          message: "targetStudentId is required",
        },
        { status: 400 }
      )
    }

    const student = await prisma.student.findUnique({
      where: { userId: user.id }
    })

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Student profile not found. Please complete your profile first.",
        },
        { status: 404 }
      )
    }
    const allowed = await canStudentsMessage(student.id, targetStudentId)
    console.log("This is current User", student)
    return NextResponse.json(
      {
        success: true,
        data: {
          allowed,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Messaging permission error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 401 }
    )
  }
}
