// modules/admin/admin-email.service.ts
import prisma from "@/lib/db"
import { UserStatus } from "@/lib/generated/prisma/enums"
import { getDepartmentLabel } from "@/lib/departments"
import {
  type MissingSection,
  type EmailCampaignType,
  buildOnboardingReminderEmail,
  buildProfileReminderEmail,
  buildAnnouncementEmail,
  buildGeneralNotificationEmail,
  buildTransactionalPreviewByKey,
} from "@/lib/email-templates"
import {
  isEmailConfigured,
  getFormattedSender,
  sendSingleEmail,
  sendBatchEmails,
  getEmailQuotaStats,
  getEmailTriggerConfig,
  updateEmailTriggerConfig,
  getRecentlyEmailedStudentIds,
  type BatchEmailResult,
  type EmailCategory,
  type EmailQuotaStats,
  type EmailTriggerConfig,
  type TransactionalTriggerKey,
} from "@/lib/email"
import logger from "@/lib/logger"

export type CompletionStatusFilter =
  | "ALL"
  | "ONBOARDING_INCOMPLETE"
  | "INCOMPLETE_UNDER_50"
  | "INCOMPLETE_UNDER_80"
  | "MISSING_CHECKED"

export type PushSubscriptionFilter = "ALL" | "NO_PUSH" | "HAS_PUSH"

export interface AdminEmailQueryFilters {
  campaignType?: EmailCampaignType
  emailCategory?: EmailCategory
  completionStatus?: CompletionStatusFilter

  // Specific missing section checkboxes
  noSkills?: boolean
  noProjects?: boolean
  noInternships?: boolean
  noHobbies?: boolean
  noPhone?: boolean
  noInterests?: boolean
  noCareerGoal?: boolean
  noPreferredTechStack?: boolean
  noLinkedinUrl?: boolean
  noGithubUrl?: boolean
  selectAll?: boolean

  // Audience segmentation filters
  semesters?: number[]
  department?: string
  departments?: string[]
  availability?: "AVAILABLE" | "BUSY" | "AWAY" | "ALL"
  hasGroup?: "true" | "false" | "ALL"
  seekingStatus?:
    | "LOOKING_FOR_TEAM"
    | "HAS_TEAM_LOOKING_FOR_MEMBERS"
    | "NOT_LOOKING"
    | "ALL"
  pushFilter?: PushSubscriptionFilter
  excludeRecentlyEmailed?: boolean
  cooldownDays?: number
  search?: string

  // Explicit recipient selection & free-tier batch cap
  studentIds?: string[]
  limit?: number

  // Custom email content
  subject?: string
  heading?: string
  bodyText?: string
  highlightTitle?: string
  highlightText?: string
  ctaText?: string
  ctaUrl?: string

  // Optional single test email recipient or transactional template preview
  testEmail?: string
  transactionalPreviewKey?: TransactionalTriggerKey
  triggerConfigUpdate?: Partial<EmailTriggerConfig>
}

export interface EmailRecipientStudent {
  id: string
  name: string
  email: string
  department: string
  currentSemester: number
  availability: string
  seekingStatus: string
  hasGroup: boolean
  onboardingCompleted: boolean
  completenessPercent: number
  hasPushEnabled: boolean
  recentlyEmailed: boolean
  missingSections: MissingSection[]
}

/**
 * Evaluate which profile sections are missing and calculate 0-100% completeness.
 */
function evaluateProfileState(student: {
  hobbies: string | null
  phone: string | null
  interests: string | null
  careerGoal: string | null
  preferredTechStack: string | null
  linkedinUrl: string | null
  githubUrl: string | null
  _count: {
    skills: number
    projects: number
    internships: number
  }
}): { missing: MissingSection[]; completenessPercent: number } {
  const missing: MissingSection[] = []

  if (student._count.skills === 0) missing.push("skills")
  if (student._count.projects === 0) missing.push("projects")
  if (student._count.internships === 0) missing.push("internships")
  if (!student.interests || student.interests.trim().length === 0)
    missing.push("interests")
  if (!student.careerGoal || student.careerGoal.trim().length === 0)
    missing.push("careerGoal")
  if (
    !student.preferredTechStack ||
    student.preferredTechStack.trim().length === 0
  )
    missing.push("preferredTechStack")
  if (!student.phone || student.phone.trim().length === 0)
    missing.push("phone")
  if (!student.linkedinUrl || student.linkedinUrl.trim().length === 0)
    missing.push("linkedinUrl")
  if (!student.githubUrl || student.githubUrl.trim().length === 0)
    missing.push("githubUrl")
  if (!student.hobbies || student.hobbies.trim().length === 0)
    missing.push("hobbies")

  const totalSections = 10
  const completedCount = totalSections - missing.length
  const completenessPercent = Math.round((completedCount / totalSections) * 100)

  return { missing, completenessPercent }
}

/**
 * Build personalized subject & HTML for a student based on the campaign configuration.
 */
export function buildCampaignEmailForStudent(
  student: {
    name: string
    department: string
    currentSemester: number
    missingSections: MissingSection[]
    completenessPercent?: number
  },
  filters: AdminEmailQueryFilters
): { subject: string; html: string; category: EmailCategory } {
  // If previewing one of the 5 automatic transactional templates
  if (filters.transactionalPreviewKey) {
    const preview = buildTransactionalPreviewByKey(
      filters.transactionalPreviewKey
    )
    return { ...preview, category: "TRANSACTIONAL" }
  }

  const campaignType: EmailCampaignType =
    filters.campaignType || "PROFILE_COMPLETION"

  if (campaignType === "ONBOARDING_INCOMPLETE") {
    const res = buildOnboardingReminderEmail({
      studentName: student.name,
      department: student.department,
      semester: student.currentSemester,
      customSubject: filters.subject,
      customIntro: filters.bodyText,
    })
    return {
      ...res,
      category: filters.emailCategory || "TRANSACTIONAL",
    }
  }

  if (campaignType === "ANNOUNCEMENT") {
    const res = buildAnnouncementEmail({
      recipientName: student.name,
      department: student.department,
      semester: student.currentSemester,
      subject:
        filters.subject?.trim() ||
        "New Update on FYPMate — Check Out the Latest Tools",
      heading:
        filters.heading?.trim() ||
        "Make Your Final Year Project Journey Easier on FYPMate",
      bodyText:
        filters.bodyText?.trim() ||
        "We have added new tools on FYPMate to help you discover compatible teammates, benchmark your FYP idea against past PAF-IAST projects, and prepare for your proposal defense.",
      highlightTitle: filters.highlightTitle,
      highlightText: filters.highlightText,
      ctaText: filters.ctaText || "Explore FYPMate Now",
      ctaUrl: filters.ctaUrl || "/dashboard/discovery",
    })
    return {
      ...res,
      category: filters.emailCategory || "TRANSACTIONAL",
    }
  }

  if (campaignType === "GENERAL_NOTIFICATION") {
    const res = buildGeneralNotificationEmail({
      recipientName: student.name,
      department: student.department,
      semester: student.currentSemester,
      subject:
        filters.subject?.trim() ||
        "Important Update Regarding Your FYPMate Account",
      heading:
        filters.heading?.trim() ||
        "Please Review & Update Your FYP Availability Status",
      bodyText:
        filters.bodyText?.trim() ||
        "Please take a moment to verify your current FYP group status on FYPMate. If you have already formed your FYP group offline in Semester {{semester}}, please switch your status to 'Not Looking' on your profile so classmates looking for partners only contact available students.",
      ctaText: filters.ctaText || "Update My Status",
      ctaUrl: filters.ctaUrl || "/dashboard/profile",
    })
    return {
      ...res,
      category: filters.emailCategory || "TRANSACTIONAL",
    }
  }

  // Default: PROFILE_COMPLETION
  const res = buildProfileReminderEmail({
    studentName: student.name,
    department: student.department,
    semester: student.currentSemester,
    missingSections: student.missingSections,
    completenessPercent: student.completenessPercent,
    customSubject: filters.subject,
    customIntro: filters.bodyText,
  })
  return {
    ...res,
    category: filters.emailCategory || "TRANSACTIONAL",
  }
}

/**
 * Fetch matching active students in a single indexed Prisma query and compute department/completion stats.
 */
export async function queryTargetedEmailStudents(
  filters: AdminEmailQueryFilters
): Promise<{
  students: EmailRecipientStudent[]
  departmentBreakdown: Array<{ department: string; count: number }>
  summaryCounts: {
    totalActive: number
    onboardingIncompleteCount: number
    incompleteUnder50Count: number
    noPushCount: number
    recentlyEmailedCount?: number
  }
}> {
  const where: any = {
    user: {
      status: UserStatus.ACTIVE,
    },
  }

  if (filters.studentIds && filters.studentIds.length > 0) {
    where.id = { in: filters.studentIds }
  }

  if (filters.semesters && filters.semesters.length > 0) {
    where.currentSemester = { in: filters.semesters }
  }

  // Support both single `department` and multi-select `departments`
  const selectedDepts: string[] = []
  if (filters.departments && filters.departments.length > 0) {
    selectedDepts.push(...filters.departments)
  } else if (
    filters.department &&
    filters.department.trim() !== "" &&
    filters.department !== "ALL"
  ) {
    selectedDepts.push(filters.department.trim())
  }

  if (selectedDepts.length > 0) {
    const deptOrConditions: any[] = []
    for (const d of selectedDepts) {
      const code = d.trim()
      const label = getDepartmentLabel(code)
      deptOrConditions.push({
        department: { equals: code, mode: "insensitive" },
      })
      if (label !== code) {
        deptOrConditions.push({
          department: { equals: label, mode: "insensitive" },
        })
      }
    }
    where.AND = [...(where.AND || []), { OR: deptOrConditions }]
  }

  if (filters.availability && filters.availability !== "ALL") {
    where.availability = filters.availability
  }

  if (filters.seekingStatus && filters.seekingStatus !== "ALL") {
    where.seekingStatus = filters.seekingStatus
  }

  if (filters.hasGroup === "true") {
    where.groupMember = { isNot: null }
  } else if (filters.hasGroup === "false") {
    where.groupMember = null
  }

  if (filters.search && filters.search.trim().length > 0) {
    const q = filters.search.trim()
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { user: { email: { contains: q, mode: "insensitive" } } },
          { department: { contains: q, mode: "insensitive" } },
        ],
      },
    ]
  }

  // Single database query + recently emailed lookup in parallel
  const [rows, allDeptGroups, recentlyEmailedSet] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        department: true,
        currentSemester: true,
        availability: true,
        seekingStatus: true,
        onboardingCompleted: true,
        hobbies: true,
        phone: true,
        interests: true,
        careerGoal: true,
        preferredTechStack: true,
        linkedinUrl: true,
        githubUrl: true,
        groupMember: {
          select: { id: true },
        },
        user: {
          select: {
            email: true,
            _count: {
              select: {
                pushSubscriptions: true,
              },
            },
          },
        },
        _count: {
          select: {
            skills: true,
            projects: true,
            internships: true,
          },
        },
      },
    }),
    prisma.student.groupBy({
      by: ["department"],
      where: { user: { status: UserStatus.ACTIVE } },
      _count: { id: true },
    }),
    getRecentlyEmailedStudentIds(filters.cooldownDays || 7),
  ])

  const departmentBreakdown = allDeptGroups
    .map((g) => ({
      department: g.department || "Unspecified",
      count: g._count.id,
    }))
    .sort((a, b) => b.count - a.count)

  // Check if any specific missing-field checkboxes are active
  const requiredMissingChecks: MissingSection[] = []
  if (filters.noSkills) requiredMissingChecks.push("skills")
  if (filters.noProjects) requiredMissingChecks.push("projects")
  if (filters.noInternships) requiredMissingChecks.push("internships")
  if (filters.noInterests) requiredMissingChecks.push("interests")
  if (filters.noCareerGoal) requiredMissingChecks.push("careerGoal")
  if (filters.noPreferredTechStack)
    requiredMissingChecks.push("preferredTechStack")
  if (filters.noPhone) requiredMissingChecks.push("phone")
  if (filters.noLinkedinUrl) requiredMissingChecks.push("linkedinUrl")
  if (filters.noGithubUrl) requiredMissingChecks.push("githubUrl")
  if (filters.noHobbies) requiredMissingChecks.push("hobbies")

  const campaignType = filters.campaignType || "PROFILE_COMPLETION"
  const completionStatus = filters.completionStatus || "ALL"

  let onboardingIncompleteCount = 0
  let incompleteUnder50Count = 0
  let noPushCount = 0
  let recentlyEmailedCount = 0

  const mapped: EmailRecipientStudent[] = []

  for (const row of rows) {
    if (!row.user?.email) continue

    const { missing: allMissing, completenessPercent } =
      evaluateProfileState(row)
    const hasPushEnabled = (row.user._count?.pushSubscriptions || 0) > 0
    const recentlyEmailed = recentlyEmailedSet.has(row.id)

    if (!row.onboardingCompleted) onboardingIncompleteCount++
    if (completenessPercent < 50) incompleteUnder50Count++
    if (!hasPushEnabled) noPushCount++
    if (recentlyEmailed) recentlyEmailedCount++

    // 1. Push notification filter (Quota saver)
    if (filters.pushFilter === "NO_PUSH" && hasPushEnabled) continue
    if (filters.pushFilter === "HAS_PUSH" && !hasPushEnabled) continue

    // 2. Cooldown filter (Exclude students already emailed within last N days)
    if (filters.excludeRecentlyEmailed && recentlyEmailed) continue

    // 3. Explicit completion status filter
    if (completionStatus === "ONBOARDING_INCOMPLETE") {
      if (row.onboardingCompleted) continue
    } else if (completionStatus === "INCOMPLETE_UNDER_50") {
      if (completenessPercent >= 50) continue
    } else if (completionStatus === "INCOMPLETE_UNDER_80") {
      if (completenessPercent >= 80) continue
    } else if (completionStatus === "MISSING_CHECKED") {
      if (requiredMissingChecks.length > 0) {
        const hasAnyCheckedMissing = allMissing.some((m) =>
          requiredMissingChecks.includes(m)
        )
        if (!hasAnyCheckedMissing) continue
      } else if (allMissing.length === 0) {
        continue
      }
    }

    // 4. Specific missing section checkboxes (if checked regardless of completionStatus)
    if (requiredMissingChecks.length > 0) {
      const matchedMissing = allMissing.filter((m) =>
        requiredMissingChecks.includes(m)
      )
      if (matchedMissing.length === 0) continue

      mapped.push({
        id: row.id,
        name: row.name,
        email: row.user.email,
        department: row.department,
        currentSemester: row.currentSemester,
        availability: row.availability,
        seekingStatus: row.seekingStatus,
        hasGroup: Boolean(row.groupMember),
        onboardingCompleted: row.onboardingCompleted,
        completenessPercent,
        hasPushEnabled,
        recentlyEmailed,
        missingSections: matchedMissing,
      })
      continue
    }

    mapped.push({
      id: row.id,
      name: row.name,
      email: row.user.email,
      department: row.department,
      currentSemester: row.currentSemester,
      availability: row.availability,
      seekingStatus: row.seekingStatus,
      hasGroup: Boolean(row.groupMember),
      onboardingCompleted: row.onboardingCompleted,
      completenessPercent,
      hasPushEnabled,
      recentlyEmailed,
      missingSections: allMissing,
    })
  }

  const finalStudents =
    filters.limit && filters.limit > 0
      ? mapped.slice(0, filters.limit)
      : mapped

  return {
    students: finalStudents,
    departmentBreakdown,
    summaryCounts: {
      totalActive: rows.length,
      onboardingIncompleteCount,
      incompleteUnder50Count,
      noPushCount,
      recentlyEmailedCount,
    },
  }
}

/**
 * Preview matching recipients, quota stats, trigger config, and rendered HTML preview.
 */
export async function previewAdminEmailCampaign(
  filters: AdminEmailQueryFilters
): Promise<{
  total: number
  students: EmailRecipientStudent[]
  sampleSubject: string
  sampleHtml: string
  sampleCategory: EmailCategory
  isResendConfigured: boolean
  senderAddress: string
  quotaStats: EmailQuotaStats
  triggerConfig: EmailTriggerConfig
  departmentBreakdown: Array<{ department: string; count: number }>
  summaryCounts: {
    totalActive: number
    onboardingIncompleteCount: number
    incompleteUnder50Count: number
    noPushCount: number
    recentlyEmailedCount?: number
  }
}> {
  if (filters.triggerConfigUpdate) {
    await updateEmailTriggerConfig(filters.triggerConfigUpdate)
  }

  const [queryRes, quotaStats, triggerConfig] = await Promise.all([
    queryTargetedEmailStudents(filters),
    getEmailQuotaStats(),
    getEmailTriggerConfig(),
  ])

  const sampleTarget = queryRes.students[0] || {
    name: "Ali Khan",
    department: "Computer Science",
    currentSemester: 6,
    completenessPercent: 40,
    missingSections: [
      "skills",
      "projects",
      "interests",
      "preferredTechStack",
    ] as MissingSection[],
  }

  const {
    subject: sampleSubject,
    html: sampleHtml,
    category: sampleCategory,
  } = buildCampaignEmailForStudent(sampleTarget, filters)

  return {
    total: queryRes.students.length,
    students: queryRes.students,
    sampleSubject,
    sampleHtml,
    sampleCategory,
    isResendConfigured: isEmailConfigured(),
    senderAddress: getFormattedSender(),
    quotaStats,
    triggerConfig,
    departmentBreakdown: queryRes.departmentBreakdown,
    summaryCounts: queryRes.summaryCounts,
  }
}

/**
 * Execute an Admin email campaign (or send a single test email) with Free-Tier safety guards.
 */
export async function executeAdminEmailCampaign(
  filters: AdminEmailQueryFilters,
  adminEmail?: string
): Promise<BatchEmailResult> {
  // 1. Handle Single Test Email mode (for either manual campaign or transactional preview)
  if (filters.testEmail && filters.testEmail.trim().length > 0) {
    const targetEmail = filters.testEmail.trim()
    const sampleStudent = {
      name: "Test Student (Admin Preview)",
      department: "Computer Science",
      currentSemester: 6,
      completenessPercent: 40,
      missingSections: [
        "skills",
        "projects",
        "interests",
        "preferredTechStack",
      ] as MissingSection[],
    }

    const { subject, html, category } = buildCampaignEmailForStudent(
      sampleStudent,
      filters
    )
    const res = await sendSingleEmail({
      to: targetEmail,
      subject: `[TEST] ${subject}`,
      html,
      category,
      templateKey:
        filters.transactionalPreviewKey ||
        filters.campaignType ||
        "test_preview",
    })

    logger.info(
      `[AUDIT LOG] Admin ${
        adminEmail || "unknown"
      } sent test email to ${targetEmail} (success: ${res.success})`
    )

    const stats = await getEmailQuotaStats()

    return {
      totalTargeted: 1,
      totalSent: res.success ? 1 : 0,
      totalFailed: res.success ? 0 : 1,
      errors: res.error ? [res.error] : [],
      quotaRemainingToday: stats.remainingToday,
    }
  }

  // 2. Check Daily Resend Free-Tier Quota before launching batch
  const [quotaStats, queryRes] = await Promise.all([
    getEmailQuotaStats(),
    queryTargetedEmailStudents(filters),
  ])

  const students = queryRes.students

  if (students.length === 0) {
    return {
      totalTargeted: 0,
      totalSent: 0,
      totalFailed: 0,
      errors: ["No matching active students found for the selected filters."],
      quotaRemainingToday: quotaStats.remainingToday,
    }
  }

  if (quotaStats.remainingToday <= 0) {
    return {
      totalTargeted: students.length,
      totalSent: 0,
      totalFailed: students.length,
      errors: [
        `Resend Free Tier daily limit (${quotaStats.dailyLimit}/day) has been reached for today (${quotaStats.sentTodayTotal} sent). Please resume tomorrow or enable 'Exclude Recently Emailed' for multi-day sending.`,
      ],
      quotaRemainingToday: 0,
    }
  }

  // Slice to remaining daily quota if user selected more than what remains today
  const sendableStudents =
    students.length > quotaStats.remainingToday
      ? students.slice(0, quotaStats.remainingToday)
      : students

  const skippedDueToDailyCap = students.length - sendableStudents.length

  // 3. Build personalized email payload for each targeted student
  const emailPayloads = sendableStudents.map((student) => {
    const { subject, html, category } = buildCampaignEmailForStudent(
      student,
      filters
    )
    return {
      to: student.email,
      subject,
      html,
      studentId: student.id,
      category,
      templateKey: filters.campaignType || "PROFILE_COMPLETION",
    }
  })

  // 4. Dispatch in rate-limit-paced batches via Resend Batch API
  const result = await sendBatchEmails(emailPayloads)

  if (skippedDueToDailyCap > 0) {
    result.errors.push(
      `Sent ${result.totalSent} emails up to Resend's 100/day Free Tier limit. ${skippedDueToDailyCap} remaining student(s) were paused—use the 'Exclude Recently Emailed (7d)' filter tomorrow to send to the rest.`
    )
  }

  logger.info(
    `[AUDIT LOG] Administrator ${adminEmail || "unknown"} executed ${
      filters.campaignType || "PROFILE_COMPLETION"
    } email campaign: targeted=${result.totalTargeted}, sent=${
      result.totalSent
    }, failed=${result.totalFailed}`
  )

  return result
}
