// app/api/admin/reports/route.ts
// Weekly/Monthly student reports - performance-focused parallel queries

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole, UserStatus } from "@/lib/generated/prisma/enums"
import prisma from "@/lib/db"

function getDateRange(period: "week" | "month"): { start: Date; end: Date; prevStart: Date } {
  const now = new Date()
  const end = now

  if (period === "week") {
    const start = new Date(now)
    start.setDate(start.getDate() - 7)

    const prevStart = new Date(start)
    prevStart.setDate(prevStart.getDate() - 7)

    return { start, end, prevStart }
  }

  // month
  const start = new Date(now)
  start.setDate(start.getDate() - 30)

  const prevStart = new Date(start)
  prevStart.setDate(prevStart.getDate() - 30)

  return { start, end, prevStart }
}

export async function GET(req: Request) {
  try {
    await requireRole(UserRole.ADMIN)

    const { searchParams } = new URL(req.url)
    const period = (searchParams.get("period") as "week" | "month") || "week"

    if (!["week", "month"].includes(period)) {
      return NextResponse.json(
        { success: false, message: "Period must be 'week' or 'month'" },
        { status: 400 }
      )
    }

    const { start, end, prevStart } = getDateRange(period)

    // All queries run in parallel - no sequential DB calls
    const [
      // Current period counts
      newStudents,
      newMessages,
      newConversations,
      newRequests,
      acceptedRequests,
      newGroups,
      // Previous period counts (for trend comparison)
      prevNewStudents,
      prevNewMessages,
      prevNewConversations,
      prevNewRequests,
      // Current totals
      totalStudents,
      activeStudents,
      suspendedStudents,
      totalGroups,
      // Breakdown queries
      departmentBreakdown,
      semesterBreakdown,
      statusBreakdown,
    ] = await Promise.all([
      // Current period
      prisma.student.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      prisma.message.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      prisma.conversation.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      prisma.request.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      prisma.request.count({
        where: { createdAt: { gte: start, lte: end }, status: "ACCEPTED" },
      }),
      prisma.fYPGroup.count({
        where: { createdAt: { gte: start, lte: end } },
      }),

      // Previous period (for trend %)
      prisma.student.count({
        where: { createdAt: { gte: prevStart, lt: start } },
      }),
      prisma.message.count({
        where: { createdAt: { gte: prevStart, lt: start } },
      }),
      prisma.conversation.count({
        where: { createdAt: { gte: prevStart, lt: start } },
      }),
      prisma.request.count({
        where: { createdAt: { gte: prevStart, lt: start } },
      }),

      // Totals
      prisma.student.count(),
      prisma.student.count({ where: { user: { status: UserStatus.ACTIVE } } }),
      prisma.student.count({ where: { user: { status: UserStatus.SUSPENDED } } }),
      prisma.fYPGroup.count(),

      // Department breakdown - groupBy
      prisma.student.groupBy({
        by: ["department"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),

      // Semester breakdown - groupBy
      prisma.student.groupBy({
        by: ["currentSemester"],
        _count: { id: true },
        orderBy: { currentSemester: "asc" },
      }),

      // Status breakdown
      prisma.user.groupBy({
        by: ["status"],
        where: { role: UserRole.STUDENT },
        _count: { id: true },
      }),
    ])

    // Calculate trend percentages
    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    return NextResponse.json(
      {
        success: true,
        message: "Reports fetched",
        data: {
          period,
          dateRange: {
            start: start.toISOString(),
            end: end.toISOString(),
          },
          overview: {
            totalStudents,
            activeStudents,
            suspendedStudents,
            totalGroups,
          },
          currentPeriod: {
            newStudents,
            newMessages,
            newConversations,
            newRequests,
            acceptedRequests,
            newGroups,
          },
          trends: {
            students: calcTrend(newStudents, prevNewStudents),
            messages: calcTrend(newMessages, prevNewMessages),
            conversations: calcTrend(newConversations, prevNewConversations),
            requests: calcTrend(newRequests, prevNewRequests),
          },
          breakdown: {
            departments: departmentBreakdown.map((d) => ({
              department: d.department,
              count: d._count.id,
            })),
            semesters: semesterBreakdown.map((s) => ({
              semester: s.currentSemester,
              count: s._count.id,
            })),
            statuses: statusBreakdown.map((s) => ({
              status: s.status,
              count: s._count.id,
            })),
          },
        },
      },
      { status: 200 }
    )
  } catch (err: any) {
    if (process.env.NODE_ENV === "development") {
      logger.error("Admin reports error:", err)
    }

    const isUnauthorized = err.message?.includes("Unauthorized")
    return NextResponse.json(
      { success: false, message: isUnauthorized ? "Unauthorized" : "Failed to generate reports" },
      { status: isUnauthorized ? 403 : 500 }
    )
  }
}
