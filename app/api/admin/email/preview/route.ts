// app/api/admin/email/preview/route.ts
// Preview which students will receive emails based on filters.
// Returns the list of matched students + their missing sections.

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { getStudentsForEmail, type EmailFilters } from "@/modules/admin/email.service"

export async function POST(req: Request) {
  try {
    await requireRole(UserRole.ADMIN)

    const body = await req.json()
    const {
      noSkills = false,
      noProjects = false,
      noInternships = false,
      noHobbies = false,
      noPhone = false,
      noInterests = false,
      noCareerGoal = false,
      noPreferredTechStack = false,
      noLinkedinUrl = false,
      noGithubUrl = false,
      selectAll = false,
      studentIds,
      limit = 500,
    } = body

    // Validate: at least one filter or selectAll or studentIds must be set
    const hasFilter =
      noSkills || noProjects || noInternships || noHobbies || noPhone ||
      noInterests || noCareerGoal || noPreferredTechStack || noLinkedinUrl || noGithubUrl

    if (!hasFilter && !selectAll && (!studentIds || studentIds.length === 0)) {
      return NextResponse.json(
        { success: false, message: "At least one filter, 'selectAll', or specific student IDs must be provided" },
        { status: 400 }
      )
    }

    const clampedLimit = Math.min(Math.max(Number(limit) || 500, 1), 1000)

    const filters: EmailFilters = {
      noSkills,
      noProjects,
      noInternships,
      noHobbies,
      noPhone,
      noInterests,
      noCareerGoal,
      noPreferredTechStack,
      noLinkedinUrl,
      noGithubUrl,
      selectAll,
      studentIds: Array.isArray(studentIds) ? studentIds : undefined,
    }

    const students = await getStudentsForEmail(filters, clampedLimit)

    return NextResponse.json({
      success: true,
      message: `Found ${students.length} student(s) matching filters`,
      data: {
        total: students.length,
        students,
      },
    })
  } catch (err: any) {
    if (process.env.NODE_ENV === "development") {
      logger.error("Email preview error:", err)
    }

    const isUnauthorized = err.message?.includes("Unauthorized")
    return NextResponse.json(
      { success: false, message: isUnauthorized ? "Unauthorized" : "Failed to preview email recipients" },
      { status: isUnauthorized ? 403 : 500 }
    )
  }
}
