import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { removeGroupMember } from "@/modules/group/group.service"
import prisma from "@/lib/db"

export async function POST(req: Request) {
  try {
    // 🔐 Auth + role
    const user = await requireRole(UserRole.STUDENT)

    const body = await req.json().catch(() => ({}))
    const { targetStudentId } = body || {}
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

    // If targetStudentId is omitted or "self", default to self-removal (leaving group)
    const targetId = (!targetStudentId || targetStudentId === "self") ? student.id : targetStudentId

    const result = await removeGroupMember(student.id, targetId)

    return NextResponse.json(
      {
        success: true,
        message: "Member removed successfully",
        data: result,
      },
      { status: 200 }
    )
  } catch (error: any) {
    logger.error("Remove member error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 400 }
    )
  }
}
