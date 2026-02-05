// app/api/admin/stats/route.ts
// Get admin dashboard statistics

import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole, UserStatus } from "@/lib/generated/prisma/enums"
import prisma from "@/lib/db"

export async function GET() {
  try {
    // 🔐 Admin only
    await requireRole(UserRole.ADMIN)

    // Get all stats in parallel
    const [
      totalStudents,
      activeStudents,
      suspendedStudents,
      deletionRequestedStudents,
      totalConversations,
      totalMessages,
    ] = await Promise.all([
      // Total students
      prisma.student.count(),
      
      // Active students
      prisma.student.count({
        where: {
          user: { status: UserStatus.ACTIVE },
        },
      }),
      
      // Suspended students
      prisma.student.count({
        where: {
          user: { status: UserStatus.SUSPENDED },
        },
      }),
      
      // Deletion requested students
      prisma.student.count({
        where: {
          user: { status: UserStatus.DELETION_REQUESTED },
        },
      }),
      
      // Total conversations
      prisma.conversation.count(),
      
      // Total messages
      prisma.message.count(),
    ])

    return NextResponse.json({
      totalStudents,
      activeStudents,
      suspendedStudents,
      deletionRequestedStudents,
      totalConversations,
      totalMessages,
    })
  } catch (error: any) {
    console.error("Admin stats error:", error)

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}
