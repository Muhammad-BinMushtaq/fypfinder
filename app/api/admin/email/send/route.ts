// app/api/admin/email/send/route.ts
// Send personalized profile-completion emails to filtered students.
// Two-step flow: client calls /preview first, then /send with the same filters.

import logger from "@/lib/logger"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import {
  getStudentsForEmail,
  sendProfileEmails,
  type EmailFilters,
} from "@/modules/admin/email.service"

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

    // Validate
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

    // Fetch matching students (single query)
    const students = await getStudentsForEmail(filters, clampedLimit)

    if (students.length === 0) {
      return NextResponse.json(
        { success: false, message: "No students match the selected filters" },
        { status: 404 }
      )
    }

    // Send emails in batches
    const result = await sendProfileEmails(students)

    return NextResponse.json({
      success: true,
      message: `Emails sent: ${result.totalSent} of ${result.totalTargeted}`,
      data: result,
    })
  } catch (err: any) {
    if (process.env.NODE_ENV === "development") {
      logger.error("Email send error:", err)
    }

    const isUnauthorized = err.message?.includes("Unauthorized")
    return NextResponse.json(
      { success: false, message: isUnauthorized ? "Unauthorized" : "Failed to send emails" },
      { status: isUnauthorized ? 403 : 500 }
    )
  }
}
