// app/api/admin/delete-student/route.ts
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { deleteStudentService } from "@/modules/admin/admin.service"

export async function DELETE(req: Request) {
  try {
    // 🔐 Admin only
    await requireRole(UserRole.ADMIN)

    const body = await req.json()
    const { studentId } = body

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "Student ID is required" },
        { status: 400 }
      )
    }

    await deleteStudentService( studentId )

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully",
    })
  } catch (error: any) {
    console.error("Admin delete student error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 400 }
    )
  }
}
