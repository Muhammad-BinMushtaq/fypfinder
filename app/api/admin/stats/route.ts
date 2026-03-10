// app/api/admin/stats/route.ts
// Get admin dashboard statistics

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole, UserStatus } from "@/lib/generated/prisma/enums"
import prisma from "@/lib/db"

export async function GET() {
  try {
    await requireRole(UserRole.ADMIN)

    const [
      totalStudents,
      activeStudents,
      suspendedStudents,
      deletionRequestedStudents,
      totalConversations,
      totalMessages,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({
        where: { user: { status: UserStatus.ACTIVE } },
      }),
      prisma.student.count({
        where: { user: { status: UserStatus.SUSPENDED } },
      }),
      prisma.student.count({
        where: { user: { status: UserStatus.DELETION_REQUESTED } },
      }),
      prisma.conversation.count(),
      prisma.message.count(),
    ])

    return NextResponse.json(
      {
        success: true,
        message: "Stats fetched",
        data: {
          totalStudents,
          activeStudents,
          suspendedStudents,
          deletionRequestedStudents,
          totalConversations,
          totalMessages,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    logger.error("Admin stats error:", error)

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      )
    }

    return NextResponse.json(
      { success: false, message: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}
