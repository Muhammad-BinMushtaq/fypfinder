// modules/admin/email.service.ts
/**
 * Admin Email Service
 * --------------------
 * Server-side logic for querying students by profile completeness
 * and sending batch emails via Resend. Single optimized query per operation.
 */

import prisma from "@/lib/db"
import { getResend, EMAIL_FROM } from "@/lib/email"
import {
  buildProfileReminderEmail,
  type MissingSection,
} from "@/lib/email-templates"

// ============ TYPES ============

export interface EmailFilters {
  noSkills: boolean
  noProjects: boolean
  noInternships: boolean
  noHobbies: boolean
  noPhone: boolean
  noInterests: boolean
  noCareerGoal: boolean
  noPreferredTechStack: boolean
  noLinkedinUrl: boolean
  noGithubUrl: boolean
  selectAll: boolean
  studentIds?: string[] // specific student IDs (manual selection)
}

export interface EmailPreviewStudent {
  id: string
  name: string
  email: string
  missingSections: MissingSection[]
}

export interface SendEmailResult {
  totalTargeted: number
  totalSent: number
  totalFailed: number
  errors: string[]
}

// ============ QUERY ============

/**
 * Get students matching the given profile-completeness filters.
 * Single optimized query — selects only the fields needed to determine
 * which sections are missing, plus email for sending.
 */
export async function getStudentsForEmail(
  filters: EmailFilters,
  limit: number = 500
): Promise<EmailPreviewStudent[]> {
  // If selecting specific students by ID, just fetch those
  if (filters.studentIds && filters.studentIds.length > 0) {
    const students = await prisma.student.findMany({
      where: { id: { in: filters.studentIds } },
      take: limit,
      select: {
        id: true,
        name: true,
        phone: true,
        interests: true,
        careerGoal: true,
        hobbies: true,
        preferredTechStack: true,
        linkedinUrl: true,
        githubUrl: true,
        user: { select: { email: true } },
        skills: { select: { id: true }, take: 1 },
        projects: { select: { id: true }, take: 1 },
        internships: { select: { id: true }, take: 1 },
      },
    })

    return students.map(toPreviewStudent)
  }

  // If selectAll, get everyone
  if (filters.selectAll) {
    const students = await prisma.student.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        interests: true,
        careerGoal: true,
        hobbies: true,
        preferredTechStack: true,
        linkedinUrl: true,
        githubUrl: true,
        user: { select: { email: true } },
        skills: { select: { id: true }, take: 1 },
        projects: { select: { id: true }, take: 1 },
        internships: { select: { id: true }, take: 1 },
      },
    })

    return students.map(toPreviewStudent)
  }

  // Build OR conditions from checkbox filters
  const orConditions: any[] = []

  if (filters.noSkills) orConditions.push({ skills: { none: {} } })
  if (filters.noProjects) orConditions.push({ projects: { none: {} } })
  if (filters.noInternships) orConditions.push({ internships: { none: {} } })
  if (filters.noHobbies) orConditions.push({ OR: [{ hobbies: null }, { hobbies: "" }] })
  if (filters.noPhone) orConditions.push({ phone: null })
  if (filters.noInterests) orConditions.push({ OR: [{ interests: null }, { interests: "" }] })
  if (filters.noCareerGoal) orConditions.push({ OR: [{ careerGoal: null }, { careerGoal: "" }] })
  if (filters.noPreferredTechStack)
    orConditions.push({ OR: [{ preferredTechStack: null }, { preferredTechStack: "" }] })
  if (filters.noLinkedinUrl) orConditions.push({ OR: [{ linkedinUrl: null }, { linkedinUrl: "" }] })
  if (filters.noGithubUrl) orConditions.push({ OR: [{ githubUrl: null }, { githubUrl: "" }] })

  if (orConditions.length === 0) {
    return []
  }

  const students = await prisma.student.findMany({
    where: { OR: orConditions },
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      interests: true,
      careerGoal: true,
      hobbies: true,
      preferredTechStack: true,
      linkedinUrl: true,
      githubUrl: true,
      user: { select: { email: true } },
      skills: { select: { id: true }, take: 1 },
      projects: { select: { id: true }, take: 1 },
      internships: { select: { id: true }, take: 1 },
    },
  })

  return students.map(toPreviewStudent)
}

// ============ SEND ============

/**
 * Send personalized profile-completion emails to targeted students.
 * Sends in batches of 50 to stay within Resend rate limits.
 */
export async function sendProfileEmails(
  students: EmailPreviewStudent[]
): Promise<SendEmailResult> {
  const result: SendEmailResult = {
    totalTargeted: students.length,
    totalSent: 0,
    totalFailed: 0,
    errors: [],
  }

  if (students.length === 0) return result

  // Process in batches of 50
  const BATCH_SIZE = 50
  for (let i = 0; i < students.length; i += BATCH_SIZE) {
    const batch = students.slice(i, i + BATCH_SIZE)

    const emails = batch.map((student) => {
      const { subject, html } = buildProfileReminderEmail({
        studentName: student.name,
        missingSections: student.missingSections,
      })

      return {
        from: EMAIL_FROM,
        to: student.email,
        subject,
        html,
      }
    })

    try {
      const response = await getResend().batch.send(emails)

      if (response.error) {
        result.totalFailed += batch.length
        result.errors.push(response.error.message || "Batch send failed")
      } else {
        result.totalSent += batch.length
      }
    } catch (err: any) {
      result.totalFailed += batch.length
      result.errors.push(err.message || "Unknown batch send error")
    }

    // Rate-limit pause between batches (1 second)
    if (i + BATCH_SIZE < students.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return result
}

// ============ HELPERS ============

function toPreviewStudent(student: {
  id: string
  name: string
  phone: string | null
  interests: string | null
  careerGoal: string | null
  hobbies: string | null
  preferredTechStack: string | null
  linkedinUrl: string | null
  githubUrl: string | null
  user: { email: string }
  skills: { id: string }[]
  projects: { id: string }[]
  internships: { id: string }[]
}): EmailPreviewStudent {
  const missing: MissingSection[] = []

  if (student.skills.length === 0) missing.push("skills")
  if (student.projects.length === 0) missing.push("projects")
  if (student.internships.length === 0) missing.push("internships")
  if (!student.hobbies) missing.push("hobbies")
  if (!student.phone) missing.push("phone")
  if (!student.interests) missing.push("interests")
  if (!student.careerGoal) missing.push("careerGoal")
  if (!student.preferredTechStack) missing.push("preferredTechStack")
  if (!student.linkedinUrl) missing.push("linkedinUrl")
  if (!student.githubUrl) missing.push("githubUrl")

  return {
    id: student.id,
    name: student.name,
    email: student.user.email,
    missingSections: missing,
  }
}
