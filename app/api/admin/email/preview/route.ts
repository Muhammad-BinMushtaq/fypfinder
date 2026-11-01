// app/api/admin/email/preview/route.ts
import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import { previewAdminEmailCampaign } from "@/modules/admin/admin-email.service"
import logger from "@/lib/logger"

const emailPreviewSchema = z.object({
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
  transactionalPreviewKey: z
    .enum([
      "partnerRequest",
      "messageRequest",
      "requestAccepted",
      "feedbackUpdate",
      "welcomeEmail",
    ])
    .optional(),
  triggerConfigUpdate: z
    .object({
      deliveryMode: z.enum(["SMART_FALLBACK", "ALWAYS_SEND"]).optional(),
      partnerRequest: z.boolean().optional(),
      messageRequest: z.boolean().optional(),
      requestAccepted: z.boolean().optional(),
      feedbackUpdate: z.boolean().optional(),
      welcomeEmail: z.boolean().optional(),
      dailyTransactionalReserve: z.number().int().min(0).max(90).optional(),
    })
    .optional(),
})

export async function POST(req: Request) {
  try {
    await requireRole(UserRole.ADMIN)

    const body = await req.json().catch(() => ({}))
    const parsed = emailPreviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            parsed.error.issues[0]?.message || "Invalid filter parameters",
        },
        { status: 400 }
      )
    }

    const data = await previewAdminEmailCampaign(parsed.data)

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    )
  } catch (error: any) {
    logger.error("Admin email preview error:", error)
    const status =
      error?.message?.includes("Forbidden") ||
      error?.message?.includes("Unauthorized")
        ? 403
        : 500
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to preview email recipients",
      },
      { status }
    )
  }
}
