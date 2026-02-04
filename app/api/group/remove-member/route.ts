import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { removeGroupMember } from "@/modules/group/group.service"
import prisma from "@/lib/db"

export async function POST(req: Request) {
  try {
    // 🔐 Auth + role
    const user = await requireRole(UserRole.STUDENT)

    const body = await req.json()
    const { targetStudentId } = body

    if (!targetStudentId) {
      return NextResponse.json(
        {
          success: false,
          message: "targetStudentId is required",
        },
        { status: 400 }
      )
    }

    // 🔍 Get student ID from user ID
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Student profile not found",
        },
        { status: 404 }
      )
    }

    const result = await removeGroupMember(student.id, targetStudentId)

    return NextResponse.json(
      {
        success: true,
        message: "Member removed successfully",
        data: result,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Remove member error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 400 }
    )
  }
}
