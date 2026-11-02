// lib/email-templates.ts
/**
 * FYPMate Minimalist Email Templates
 * ----------------------------------
 * Clean, plain-spoken, institutional HTML email builders that always use
 * the student's full name and avoid promotional/marketing styling.
 */

import type { TransactionalTriggerKey } from "./email"

export type MissingSection =
  | "skills"
  | "projects"
  | "internships"
  | "hobbies"
  | "phone"
  | "interests"
  | "careerGoal"
  | "preferredTechStack"
  | "linkedinUrl"
  | "githubUrl"

export type EmailCampaignType =
  | "ONBOARDING_INCOMPLETE"
  | "PROFILE_COMPLETION"
  | "ANNOUNCEMENT"
  | "GENERAL_NOTIFICATION"

export const SECTION_LABELS: Record<MissingSection, string> = {
  skills: "Technical Skills",
  projects: "Projects",
  internships: "Internships",
  hobbies: "Hobbies",
  phone: "Phone / WhatsApp Number",
  interests: "Bio & Academic Interests",
  careerGoal: "Career Goal",
  preferredTechStack: "Preferred Tech Stack",
  linkedinUrl: "LinkedIn URL",
  githubUrl: "GitHub URL",
}

export function getAppBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://fypmate.com").replace(
    /\/+$/,
    ""
  )
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Replaces personalization tokens ({{name}}, {{first_name}}, {{department}}, {{semester}}).
 * Always uses the complete student name.
 */
export function interpolatePersonalization(
  text: string,
  vars: {
    name: string
    department?: string
    semester?: number | string
  }
): string {
  const fullName = vars.name.trim()
  return text
    .replace(/\{\{\s*name\s*\}\}/gi, fullName)
    .replace(/\{\{\s*first_name\s*\}\}/gi, fullName)
    .replace(/\{\{\s*department\s*\}\}/gi, vars.department || "PAF-IAST")
    .replace(
      /\{\{\s*semester\s*\}\}/gi,
      vars.semester !== undefined ? String(vars.semester) : ""
    )
}

/**
 * Minimalist, clean layout shell for all FYPMate emails.
 */
function wrapEmailLayout(options: {
  bodyHtml: string
  footerNote?: string
}): string {
  const appUrl = getAppBaseUrl()
  const footerNote =
    options.footerNote ||
    "Sent by FYPMate for your PAF-IAST student account."

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FYPMate</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 28px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <!-- Minimal Header -->
          <tr>
            <td style="padding: 20px 28px; border-bottom: 1px solid #f1f5f9;">
              <span style="font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.2px;">FYPMate</span>
              <span style="font-size: 12px; color: #64748b; margin-left: 8px;">PAF-IAST</span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 28px;">
              ${options.bodyHtml}
            </td>
          </tr>

          <!-- Minimal Footer -->
          <tr>
            <td style="padding: 16px 28px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                ${escapeHtml(footerNote)}
                <a href="${appUrl}/dashboard/profile" style="color: #0f172a; text-decoration: underline; margin-left: 6px;">Dashboard</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildCtaButton(text: string, url: string): string {
  return `<div style="margin: 22px 0 4px 0;">
    <a href="${escapeHtml(url)}"
       target="_blank"
       rel="noopener noreferrer"
       style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 10px 18px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 6px;">
      ${escapeHtml(text)}
    </a>
  </div>`
}

// ============================================================================
// 1. ADMIN TEMPLATES
// ============================================================================

export function buildOnboardingReminderEmail(params: {
  studentName: string
  department?: string
  semester?: number
  customSubject?: string
  customIntro?: string
}): { subject: string; html: string } {
  const appUrl = getAppBaseUrl()
  const fullName = params.studentName.trim()

  const subject = params.customSubject?.trim()
    ? interpolatePersonalization(params.customSubject.trim(), {
        name: fullName,
        department: params.department,
        semester: params.semester,
      })
    : `${fullName} — Complete your FYPMate account setup`

  const introHtml = params.customIntro?.trim()
    ? `<p style="margin: 0 0 16px 0; color: #334155; font-size: 14px; line-height: 1.6;">${escapeHtml(
        interpolatePersonalization(params.customIntro.trim(), {
          name: fullName,
          department: params.department,
          semester: params.semester,
        })
      ).replace(/\n/g, "<br/>")}</p>`
    : `<p style="margin: 0 0 16px 0; color: #334155; font-size: 14px; line-height: 1.6;">
        You signed in to FYPMate with your PAF-IAST account, but your initial profile setup is still incomplete. Please select your FYP status, skills, and preferred role so classmates in your department can find you.
      </p>`

  const bodyHtml = `
    <p style="margin: 0 0 14px 0; color: #0f172a; font-size: 15px; font-weight: 600;">
      Hi ${escapeHtml(fullName)},
    </p>
    ${introHtml}
    ${buildCtaButton("Complete Account Setup", `${appUrl}/dashboard/discovery`)}
  `

  return {
    subject,
    html: wrapEmailLayout({ bodyHtml }),
  }
}

export function buildProfileReminderEmail(params: {
  studentName: string
  department?: string
  semester?: number
  missingSections: MissingSection[]
  completenessPercent?: number
  customSubject?: string
  customIntro?: string
}): { subject: string; html: string } {
  const appUrl = getAppBaseUrl()
  const fullName = params.studentName.trim()
  const missingSections =
    params.missingSections.length > 0
      ? params.missingSections
      : (["skills", "projects", "interests"] as MissingSection[])

  const subject = params.customSubject?.trim()
    ? interpolatePersonalization(params.customSubject.trim(), {
        name: fullName,
        department: params.department,
        semester: params.semester,
      })
    : `${fullName} — Please complete your FYPMate profile`

  const missingListHtml = missingSections
    .map(
      (sec) =>
        `<li style="padding: 2px 0; color: #334155; font-size: 13px;">${escapeHtml(
          SECTION_LABELS[sec] || sec
        )}</li>`
    )
    .join("")

  const introParagraph = params.customIntro?.trim()
    ? `<p style="margin: 0 0 14px 0; color: #334155; font-size: 14px; line-height: 1.6;">${escapeHtml(
        interpolatePersonalization(params.customIntro.trim(), {
          name: fullName,
          department: params.department,
          semester: params.semester,
        })
      ).replace(/\n/g, "<br/>")}</p>`
    : `<p style="margin: 0 0 14px 0; color: #334155; font-size: 14px; line-height: 1.6;">
        Your FYPMate profile is missing the following information${
          params.completenessPercent !== undefined
            ? ` (${params.completenessPercent}% complete)`
            : ""
        }. Updating these fields helps classmates in your department review your background before sending partner requests:
      </p>`

  const bodyHtml = `
    <p style="margin: 0 0 14px 0; color: #0f172a; font-size: 15px; font-weight: 600;">
      Hi ${escapeHtml(fullName)},
    </p>
    ${introParagraph}
    <ul style="margin: 0 0 16px 0; padding-left: 18px;">
      ${missingListHtml}
    </ul>
    <p style="margin: 0 0 16px 0; color: #64748b; font-size: 13px; line-height: 1.5;">
      If you have already formed your FYP group offline, you can also update your status to &ldquo;Not Looking&rdquo; on your profile page.
    </p>
    ${buildCtaButton("Update Profile", `${appUrl}/dashboard/profile`)}
  `

  return {
    subject,
    html: wrapEmailLayout({ bodyHtml }),
  }
}

export function buildAnnouncementEmail(params: {
  recipientName: string
  department?: string
  semester?: number
  subject: string
  heading: string
  bodyText: string
  highlightTitle?: string
  highlightText?: string
  ctaText?: string
  ctaUrl?: string
}): { subject: string; html: string } {
  const appUrl = getAppBaseUrl()
  const fullName = params.recipientName.trim()
  const vars = {
    name: fullName,
    department: params.department,
    semester: params.semester,
  }

  const subject = interpolatePersonalization(params.subject.trim(), vars)
  const heading = interpolatePersonalization(params.heading.trim(), vars)
  const interpolatedBody = interpolatePersonalization(
    params.bodyText.trim(),
    vars
  )

  const paragraphsHtml = interpolatedBody
    .split(/\n\s*\n/)
    .map(
      (para) =>
        `<p style="margin: 0 0 14px 0; color: #334155; font-size: 14px; line-height: 1.6;">${escapeHtml(
          para.trim()
        ).replace(/\n/g, "<br/>")}</p>`
    )
    .join("")

  const resolvedCtaUrl = params.ctaUrl?.trim()
    ? params.ctaUrl.trim().startsWith("http")
      ? params.ctaUrl.trim()
      : `${appUrl}${params.ctaUrl.trim().startsWith("/") ? "" : "/"}${params.ctaUrl.trim()}`
    : `${appUrl}/dashboard/discovery`

  const bodyHtml = `
    <p style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px; font-weight: 600;">
      Hi ${escapeHtml(fullName)},
    </p>
    ${
      heading
        ? `<p style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px; font-weight: 600;">${escapeHtml(
            heading
          )}</p>`
        : ""
    }
    ${paragraphsHtml}
    ${buildCtaButton(params.ctaText?.trim() || "Open FYPMate", resolvedCtaUrl)}
  `

  return {
    subject,
    html: wrapEmailLayout({ bodyHtml }),
  }
}

export function buildGeneralNotificationEmail(params: {
  recipientName: string
  department?: string
  semester?: number
  subject: string
  heading: string
  bodyText: string
  ctaText?: string
  ctaUrl?: string
}): { subject: string; html: string } {
  const appUrl = getAppBaseUrl()
  const fullName = params.recipientName.trim()
  const vars = {
    name: fullName,
    department: params.department,
    semester: params.semester,
  }

  const subject = interpolatePersonalization(params.subject.trim(), vars)
  const heading = interpolatePersonalization(params.heading.trim(), vars)
  const interpolatedBody = interpolatePersonalization(
    params.bodyText.trim(),
    vars
  )

  const paragraphsHtml = interpolatedBody
    .split(/\n\s*\n/)
    .map(
      (para) =>
        `<p style="margin: 0 0 14px 0; color: #334155; font-size: 14px; line-height: 1.6;">${escapeHtml(
          para.trim()
        ).replace(/\n/g, "<br/>")}</p>`
    )
    .join("")

  const resolvedCtaUrl = params.ctaUrl?.trim()
    ? params.ctaUrl.trim().startsWith("http")
      ? params.ctaUrl.trim()
      : `${appUrl}${params.ctaUrl.trim().startsWith("/") ? "" : "/"}${params.ctaUrl.trim()}`
    : `${appUrl}/dashboard/profile`

  const bodyHtml = `
    <p style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px; font-weight: 600;">
      Hi ${escapeHtml(fullName)},
    </p>
    ${
      heading
        ? `<p style="margin: 0 0 12px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${escapeHtml(
            heading
          )}</p>`
        : ""
    }
    ${paragraphsHtml}
    ${buildCtaButton(params.ctaText?.trim() || "Open Dashboard", resolvedCtaUrl)}
  `

  return {
    subject,
    html: wrapEmailLayout({ bodyHtml }),
  }
}

// ============================================================================
// 2. AUTOMATIC TRANSACTIONAL TEMPLATES
// ============================================================================

export function buildPartnerRequestEmail(params: {
  toName: string
  fromName: string
  fromDepartment?: string
  fromSemester?: number
  reason?: string
}): { subject: string; html: string } {
  const appUrl = getAppBaseUrl()
  const toFullName = params.toName.trim()
  const fromFullName = params.fromName.trim()

  const subject = `New FYP partner request from ${fromFullName}`

  const reasonHtml = params.reason?.trim()
    ? `<p style="margin: 0 0 14px 0; padding: 12px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; color: #334155; font-size: 13px; line-height: 1.5;">
        &ldquo;${escapeHtml(params.reason.trim())}&rdquo;
      </p>`
    : ""

  const bodyHtml = `
    <p style="margin: 0 0 14px 0; color: #0f172a; font-size: 15px; font-weight: 600;">
      Hi ${escapeHtml(toFullName)},
    </p>
    <p style="margin: 0 0 14px 0; color: #334155; font-size: 14px; line-height: 1.6;">
      <strong>${escapeHtml(fromFullName)}</strong>${
    params.fromDepartment
      ? ` (${escapeHtml(params.fromDepartment)}${
          params.fromSemester ? `, Semester ${params.fromSemester}` : ""
        })`
      : ""
  } sent you an FYP partner request on FYPMate.
    </p>
    ${reasonHtml}
    ${buildCtaButton("View Request", `${appUrl}/dashboard/requests/received`)}
  `

  return {
    subject,
    html: wrapEmailLayout({ bodyHtml }),
  }
}

export function buildMessageRequestEmail(params: {
  toName: string
  fromName: string
  reason: string
}): { subject: string; html: string } {
  const appUrl = getAppBaseUrl()
  const toFullName = params.toName.trim()
  const fromFullName = params.fromName.trim()

  const subject = `New message request from ${fromFullName}`

  const bodyHtml = `
    <p style="margin: 0 0 14px 0; color: #0f172a; font-size: 15px; font-weight: 600;">
      Hi ${escapeHtml(toFullName)},
    </p>
    <p style="margin: 0 0 14px 0; color: #334155; font-size: 14px; line-height: 1.6;">
      <strong>${escapeHtml(fromFullName)}</strong> sent you a message request on FYPMate:
    </p>
    <p style="margin: 0 0 16px 0; padding: 12px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; color: #334155; font-size: 13px; line-height: 1.5;">
      &ldquo;${escapeHtml(params.reason.trim())}&rdquo;
    </p>
    ${buildCtaButton("View Message Request", `${appUrl}/dashboard/requests/received`)}
  `

  return {
    subject,
    html: wrapEmailLayout({ bodyHtml }),
  }
}

export function buildRequestAcceptedEmail(params: {
  toName: string
  accepterName: string
  requestType: "MESSAGE" | "PARTNER"
}): { subject: string; html: string } {
  const appUrl = getAppBaseUrl()
  const toFullName = params.toName.trim()
  const accepterFullName = params.accepterName.trim()
  const isPartner = params.requestType === "PARTNER"

  const subject = isPartner
    ? `${accepterFullName} accepted your partner request`
    : `${accepterFullName} accepted your message request`

  const bodyHtml = `
    <p style="margin: 0 0 14px 0; color: #0f172a; font-size: 15px; font-weight: 600;">
      Hi ${escapeHtml(toFullName)},
    </p>
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 14px; line-height: 1.6;">
      <strong>${escapeHtml(accepterFullName)}</strong> accepted your ${
    isPartner ? "FYP partner request" : "message request"
  } on FYPMate.
    </p>
    ${buildCtaButton(
      isPartner ? "Open FYP Group" : "Open Messages",
      isPartner ? `${appUrl}/dashboard/fyp` : `${appUrl}/dashboard/messages`
    )}
  `

  return {
    subject,
    html: wrapEmailLayout({ bodyHtml }),
  }
}

export function buildFeedbackUpdateEmail(params: {
  toName: string
  status: string
  adminResponse?: string | null
}): { subject: string; html: string } {
  const appUrl = getAppBaseUrl()
  const toFullName = params.toName.trim()
  const formattedStatus = params.status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const subject = `Feedback status updated: ${formattedStatus}`

  const responseBox = params.adminResponse?.trim()
    ? `<p style="margin: 0 0 16px 0; padding: 12px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; color: #334155; font-size: 13px; line-height: 1.5;">
        ${escapeHtml(params.adminResponse.trim()).replace(/\n/g, "<br/>")}
      </p>`
    : ""

  const bodyHtml = `
    <p style="margin: 0 0 14px 0; color: #0f172a; font-size: 15px; font-weight: 600;">
      Hi ${escapeHtml(toFullName)},
    </p>
    <p style="margin: 0 0 14px 0; color: #334155; font-size: 14px; line-height: 1.6;">
      Your feedback submission on FYPMate has been updated to <strong>${escapeHtml(
        formattedStatus
      )}</strong>.
    </p>
    ${responseBox}
    ${buildCtaButton("View Feedback", `${appUrl}/dashboard/feedback`)}
  `

  return {
    subject,
    html: wrapEmailLayout({ bodyHtml }),
  }
}

export function buildWelcomeEmail(params: {
  studentName: string
  department: string
  semester: number
}): { subject: string; html: string } {
  const appUrl = getAppBaseUrl()
  const fullName = params.studentName.trim()

  const subject = `Welcome to FYPMate, ${fullName}`

  const bodyHtml = `
    <p style="margin: 0 0 14px 0; color: #0f172a; font-size: 15px; font-weight: 600;">
      Hi ${escapeHtml(fullName)},
    </p>
    <p style="margin: 0 0 14px 0; color: #334155; font-size: 14px; line-height: 1.6;">
      Your PAF-IAST account on FYPMate (${escapeHtml(
        params.department
      )}, Semester ${params.semester}) is ready. Complete your skills and project profile to connect with classmates for your Final Year Project.
    </p>
    ${buildCtaButton("Open Dashboard", `${appUrl}/dashboard/profile`)}
  `

  return {
    subject,
    html: wrapEmailLayout({ bodyHtml }),
  }
}

export function buildTaskAssignedEmail(params: {
  toName: string
  assignedByName: string
  projectName: string
  taskTitle: string
  taskDescription?: string | null
  dueDate?: string | null
  priority?: string | null
}): { subject: string; html: string } {
  const appUrl = getAppBaseUrl()
  const toFullName = params.toName.trim()
  const assignerFullName = params.assignedByName.trim()

  const subject = `New FYP task assigned: ${params.taskTitle.trim()}`

  const dueStr = params.dueDate
    ? new Date(params.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No due date set"

  const bodyHtml = `
    <p style="margin: 0 0 14px 0; color: #0f172a; font-size: 15px; font-weight: 600;">
      Hi ${escapeHtml(toFullName)},
    </p>
    <p style="margin: 0 0 14px 0; color: #334155; font-size: 14px; line-height: 1.6;">
      <strong>${escapeHtml(assignerFullName)}</strong> assigned a task to you in your FYP group (<strong>${escapeHtml(
        params.projectName || "FYP Project"
      )}</strong>):
    </p>
    <div style="margin: 0 0 16px 0; padding: 14px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
      <p style="margin: 0 0 6px 0; color: #0f172a; font-size: 14px; font-weight: 600;">
        ${escapeHtml(params.taskTitle.trim())}
      </p>
      ${
        params.taskDescription?.trim()
          ? `<p style="margin: 0 0 8px 0; color: #475569; font-size: 13px; line-height: 1.5;">${escapeHtml(
              params.taskDescription.trim()
            )}</p>`
          : ""
      }
      <p style="margin: 0; color: #64748b; font-size: 12px;">
        Due: <strong>${escapeHtml(dueStr)}</strong>${
    params.priority ? ` &middot; Priority: <strong>${escapeHtml(params.priority)}</strong>` : ""
  }
      </p>
    </div>
    ${buildCtaButton("View Task in Workspace", `${appUrl}/dashboard/fyp`)}
  `

  return {
    subject,
    html: wrapEmailLayout({ bodyHtml }),
  }
}

export function buildCollaboratorInviteEmail(params: {
  toName: string
  inviterName: string
  inviterDepartment?: string
  inviterSemester?: number
  projectName?: string | null
  note?: string | null
}): { subject: string; html: string } {
  const appUrl = getAppBaseUrl()
  const toFullName = params.toName.trim()
  const inviterFullName = params.inviterName.trim()
  const projectTitle = params.projectName?.trim() || "FYP Project Team"

  const subject = `${inviterFullName} invited you to join "${projectTitle}" on FYPMate`

  const noteHtml = params.note?.trim()
    ? `<p style="margin: 0 0 16px 0; padding: 12px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; color: #334155; font-size: 13px; line-height: 1.5;">
        &ldquo;${escapeHtml(params.note.trim())}&rdquo;
      </p>`
    : ""

  const bodyHtml = `
    <p style="margin: 0 0 14px 0; color: #0f172a; font-size: 15px; font-weight: 600;">
      Hi ${escapeHtml(toFullName)},
    </p>
    <p style="margin: 0 0 14px 0; color: #334155; font-size: 14px; line-height: 1.6;">
      <strong>${escapeHtml(inviterFullName)}</strong>${
    params.inviterDepartment
      ? ` (${escapeHtml(params.inviterDepartment)}${
          params.inviterSemester ? `, Semester ${params.inviterSemester}` : ""
        })`
      : ""
  } has invited you as a collaborator to join their Final Year Project group on FYPMate:
    </p>
    <div style="margin: 0 0 14px 0; padding: 12px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
      <p style="margin: 0; color: #0f172a; font-size: 14px; font-weight: 600;">
        Project: ${escapeHtml(projectTitle)}
      </p>
    </div>
    ${noteHtml}
    <p style="margin: 0 0 14px 0; color: #64748b; font-size: 13px; line-height: 1.5;">
      You can accept or decline this team invitation from your received requests page.
    </p>
    ${buildCtaButton("Review & Accept Invitation", `${appUrl}/dashboard/requests/received`)}
  `

  return {
    subject,
    html: wrapEmailLayout({ bodyHtml }),
  }
}

export function buildTransactionalPreviewByKey(
  key: TransactionalTriggerKey
): { subject: string; html: string } {
  switch (key) {
    case "partnerRequest":
      return buildPartnerRequestEmail({
        toName: "Ali Khan",
        fromName: "Hamza Tariq",
        fromDepartment: "Computer Science",
        fromSemester: 6,
        reason:
          "We are building an AI + IoT project and looking for a backend developer for our FYP group.",
      })
    case "messageRequest":
      return buildMessageRequestEmail({
        toName: "Ali Khan",
        fromName: "Sara Ahmed",
        reason:
          "Saw your React and Python projects on your profile and wanted to discuss teaming up.",
      })
    case "requestAccepted":
      return buildRequestAcceptedEmail({
        toName: "Ali Khan",
        accepterName: "Hamza Tariq",
        requestType: "PARTNER",
      })
    case "feedbackUpdate":
      return buildFeedbackUpdateEmail({
        toName: "Ali Khan",
        status: "IMPLEMENTED",
        adminResponse:
          "Thank you for your feedback. We have updated this feature in the dashboard.",
      })
    case "welcomeEmail":
      return buildWelcomeEmail({
        studentName: "Ali Khan",
        department: "Computer Science",
        semester: 6,
      })
  }
}

export function getProfileReminderTemplate(): { subject: string; html: string } {
  return buildProfileReminderEmail({
    studentName: "{{name}}",
    missingSections: ["skills", "projects"],
  })
}

export function buildTemplateData(
  studentName: string,
  missingSections: MissingSection[]
): Record<string, string> {
  const fullName = studentName.trim()
  const labels = missingSections.map((s) => SECTION_LABELS[s])

  return {
    name: fullName,
    missing_count: String(missingSections.length),
    missing_list: labels
      .map((l) => `<li style="padding: 4px 0; color: #334155;">${l}</li>`)
      .join(""),
  }
}
