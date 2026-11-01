// app/api/admin/email/send/route.ts
import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { executeAdminEmailCampaign } from "@/modules/admin/admin-email.service"
import logger from "@/lib/logger"

const emailSendSchema = z.object({
  campaignType: z
    .enum([
      "ONBOARDING_INCOMPLETE",
      "PROFILE_COMPLETION",
      "ANNOUNCEMENT",
      "GENERAL_NOTIFICATION",
    ])
    .optional()
    .default("PROFILE_COMPLETION"),
  emailCategory: z.enum(["TRANSACTIONAL", "PROMOTIONAL"]).optional(),
  completionStatus: z
    .enum([
      "ALL",
      "ONBOARDING_INCOMPLETE",
      "INCOMPLETE_UNDER_50",
      "INCOMPLETE_UNDER_80",
      "MISSING_CHECKED",
    ])
    .optional(),
  noSkills: z.boolean().optional().default(false),
  noProjects: z.boolean().optional().default(false),
  noInternships: z.boolean().optional().default(false),
  noHobbies: z.boolean().optional().default(false),
  noPhone: z.boolean().optional().default(false),
  noInterests: z.boolean().optional().default(false),
  noCareerGoal: z.boolean().optional().default(false),
  noPreferredTechStack: z.boolean().optional().default(false),
  noLinkedinUrl: z.boolean().optional().default(false),
  noGithubUrl: z.boolean().optional().default(false),
  selectAll: z.boolean().optional().default(false),
  semesters: z.array(z.number().int().min(1).max(12)).optional(),
  department: z.string().max(120).optional(),
  departments: z.array(z.string().max(120)).optional(),
  availability: z.enum(["AVAILABLE", "BUSY", "AWAY", "ALL"]).optional(),
  hasGroup: z.enum(["true", "false", "ALL"]).optional(),
  seekingStatus: z
    .enum([
      "LOOKING_FOR_TEAM",
      "HAS_TEAM_LOOKING_FOR_MEMBERS",
      "NOT_LOOKING",
      "ALL",
    ])
    .optional(),
  pushFilter: z.enum(["ALL", "NO_PUSH", "HAS_PUSH"]).optional(),
  excludeRecentlyEmailed: z.boolean().optional(),
  cooldownDays: z.number().int().min(1).max(90).optional(),
  search: z.string().max(150).optional(),
  studentIds: z.array(z.string().uuid()).optional(),
  limit: z.number().int().min(1).max(2000).optional(),
  subject: z.string().max(250).optional(),
  heading: z.string().max(250).optional(),
  bodyText: z.string().max(8000).optional(),
  highlightTitle: z.string().max(200).optional(),
  highlightText: z.string().max(2000).optional(),
  ctaText: z.string().max(80).optional(),
  ctaUrl: z.string().max(500).optional(),
  testEmail: z.string().email("Please enter a valid test email address").optional(),
  transactionalPreviewKey: z
    .enum([
      "partnerRequest",
      "messageRequest",
      "requestAccepted",
      "feedbackUpdate",
      "welcomeEmail",
    ])
    .optional(),
})

export async function POST(req: Request) {
  try {
    const adminUser = await requireRole(UserRole.ADMIN)

    const body = await req.json().catch(() => ({}))
    const parsed = emailSendSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            parsed.error.issues[0]?.message || "Invalid email campaign payload",
        },
        { status: 400 }
      )
    }

    const result = await executeAdminEmailCampaign(parsed.data, adminUser.email)

    return NextResponse.json(
      {
        success: true,
        message:
          result.totalSent > 0
            ? `Successfully sent ${result.totalSent} of ${result.totalTargeted} email(s)`
            : result.errors[0] || "No emails were sent",
        data: result,
      },
      { status: 200 }
    )
  } catch (error: any) {
    logger.error("Admin email send error:", error)
    const status =
      error?.message?.includes("Forbidden") ||
      error?.message?.includes("Unauthorized")
        ? 403
        : 500
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to send emails",
      },
      { status }
    )
  }
}
