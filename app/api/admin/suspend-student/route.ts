// app/api/admin/suspend-student/route.ts
import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole, UserStatus } from "@/lib/generated/prisma/enums"
import prisma from "@/lib/db"

import { createSupabaseAdminClient } from "@/lib/supabase"

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

    // Update user status in database
    await prisma.user.update({
      where: { id: student.userId },
      data: { status: newStatus },
    })

    // Sync with Supabase Auth (invalidate active tokens)
    try {
      const supabaseAdmin = createSupabaseAdminClient()
      if (supabaseAdmin) {
        await supabaseAdmin.auth.admin.updateUserById(student.userId, {
          ban_duration: action === "suspend" ? "876000h" : "none",
        })
      }
    } catch (authErr) {
      logger.warn("Could not sync ban status with Supabase Auth:", authErr)
    }

    return NextResponse.json({
      success: true,
      message: action === "suspend" 
        ? "Student has been suspended" 
        : "Student suspension has been lifted",
      status: newStatus,
    })
  } catch (error: any) {
    logger.error("Admin suspend student error:", error)

    const isUnauthorized = error?.message?.includes("Unauthorized")
    return NextResponse.json(
      {
        success: false,
        message: isUnauthorized ? "Unauthorized" : (error.message || "Failed to update student status"),
      },
      { status: isUnauthorized ? 403 : 500 }
    )
  }
}
