// app/api/admin/suspend-student/route.ts
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole, UserStatus } from "@/lib/generated/prisma/enums"
import prisma from "@/lib/db"

export async function PATCH(req: Request) {
  try {
    // 🔐 Admin only
    await requireRole(UserRole.ADMIN)

    const body = await req.json()
    const { studentId, action } = body // action: "suspend" | "unsuspend"

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "Student ID is required" },
        { status: 400 }
      )
    }

    if (!action || !["suspend", "unsuspend"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Action must be 'suspend' or 'unsuspend'" },
        { status: 400 }
      )
    }

    // Get the student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    })

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      )
    }

    // Determine new status
    const newStatus = action === "suspend" ? UserStatus.SUSPENDED : UserStatus.ACTIVE

    // Update user status
    await prisma.user.update({
      where: { id: student.userId },
      data: { status: newStatus },
    })

    return NextResponse.json({
      success: true,
      message: action === "suspend" 
        ? "Student has been suspended" 
        : "Student suspension has been lifted",
      status: newStatus,
    })
  } catch (error: any) {
    console.error("Admin suspend student error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update student status",
      },
      { status: 500 }
    )
  }
}
