import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { lockGroup } from "@/modules/group/group.service"
import prisma from "@/lib/db"

export async function POST() {
  try {
    //  Auth + role
    const user = await requireRole(UserRole.STUDENT)

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

    //  Lock group
    const result = await lockGroup(student.id)

    return NextResponse.json(
      {
        success: true,
        message: "Group locked successfully",
        data: result,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Lock group error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 400 }
    )
  }
}
