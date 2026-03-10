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
      // Skills analytics
      topSkills,
      skillLevelBreakdown,
      totalSkills,
      // Availability breakdown
      availabilityBreakdown,
      // Profile completion helpers
      noPhoneCount,
      noInterestsCount,
      noCareerGoalCount,
      noSkillsCount,
      noProjectsCount,
      // Group membership
      studentsInGroups,
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

      // Top skills (most common skill names across all students)
      prisma.skill.groupBy({
        by: ["name"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 15,
      }),

      // Skill level distribution
      prisma.skill.groupBy({
        by: ["level"],
        _count: { id: true },
      }),

      // Total unique skills
      prisma.skill.count(),

      // Availability breakdown
      prisma.student.groupBy({
        by: ["availability"],
        _count: { id: true },
      }),

      // Profile completion: students missing key fields
      prisma.student.count({ where: { phone: null } }),
      prisma.student.count({ where: { OR: [{ interests: null }, { interests: "" }] } }),
      prisma.student.count({ where: { OR: [{ careerGoal: null }, { careerGoal: "" }] } }),
      prisma.student.count({ where: { skills: { none: {} } } }),
      prisma.student.count({ where: { projects: { none: {} } } }),

      // Students in groups
      prisma.fYPGroupMember.count(),
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
            availability: availabilityBreakdown.map((a) => ({
              status: a.availability,
              count: a._count.id,
            })),
          },
          skills: {
            totalSkills,
            topSkills: topSkills.map((s) => ({
              name: s.name,
              count: s._count.id,
            })),
            levelDistribution: skillLevelBreakdown.map((l) => ({
              level: l.level,
              count: l._count.id,
            })),
          },
          profileCompletion: {
            totalStudents,
            missingPhone: noPhoneCount,
            missingInterests: noInterestsCount,
            missingCareerGoal: noCareerGoalCount,
            noSkills: noSkillsCount,
            noProjects: noProjectsCount,
          },
          groupStats: {
            totalGroups,
            studentsInGroups,
            studentsWithoutGroup: totalStudents - studentsInGroups,
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
