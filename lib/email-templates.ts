// lib/email-templates.ts
/**
 * FYPMate Email Templates (Resend)
 * --------------------------------
 * Responsive, Outlook/Gmail-compatible HTML email builders for:
 *  1. Admin Manual / Promotional & Reminder Campaigns:
 *     - ONBOARDING_INCOMPLETE (Account setup not finished)
 *     - PROFILE_COMPLETION (Missing profile sections + completeness score)
 *     - ANNOUNCEMENT (Promotional feature spotlight)
 *     - GENERAL_NOTIFICATION (Department/Semester notices & 7th-Sem group status check)
 *  2. Automatic Event-Driven Transactional Emails:
 *     - Partner Request Received
 *     - Message Request Received
 *     - Request Accepted
 *     - Admin Feedback Update
 *     - New Student Welcome Email
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

// Human-readable labels for each profile section
export const SECTION_LABELS: Record<MissingSection, string> = {
  skills: "Technical Skills",
  projects: "Portfolio Projects",
  internships: "Internship Experience",
  hobbies: "Hobbies & Interests",
  phone: "Phone / WhatsApp Number",
  interests: "Bio & Academic Interests",
  careerGoal: "Career Goal",
  preferredTechStack: "Preferred Tech Stack",
  linkedinUrl: "LinkedIn Profile URL",
  githubUrl: "GitHub Profile URL",
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
 * Replaces personalization tokens like {{name}}, {{first_name}}, {{department}}, {{semester}}
 */
export function interpolatePersonalization(
  text: string,
  vars: {
    name: string
    department?: string
    semester?: number | string
  }
): string {
  const firstName = vars.name.trim().split(/\s+/)[0] || vars.name
  return text
    .replace(/\{\{\s*name\s*\}\}/gi, vars.name)
    .replace(/\{\{\s*first_name\s*\}\}/gi, firstName)
    .replace(/\{\{\s*department\s*\}\}/gi, vars.department || "PAF-IAST")
    .replace(
      /\{\{\s*semester\s*\}\}/gi,
      vars.semester !== undefined ? String(vars.semester) : ""
    )
}

/**
 * Shared outer shell for all FYPMate emails (Outlook mobile/desktop & Gmail safe)
 */
function wrapEmailLayout(options: {
  badgeText?: string
  headerTitle?: string
  headerSubtitle?: string
  bodyHtml: string
  footerNote?: string
  isPromotional?: boolean
}): string {
  const appUrl = getAppBaseUrl()
  const badgeHtml = options.badgeText
    ? `<div style="display: inline-block; background-color: rgba(255,255,255,0.16); color: #e0e7ff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 12px; border-radius: 999px; margin-bottom: 10px;">${escapeHtml(
        options.badgeText
      )}</div>`
    : ""

  const headerTitle = options.headerTitle || "FYPMate"
  const headerSubtitle =
    options.headerSubtitle ||
    "PAF-IAST Final Year Project Collaboration Platform"
  const footerNote =
    options.footerNote ||
    (options.isPromotional
      ? "You received this campus announcement because you have an institutional student account on FYPMate (PAF-IAST)."
      : "This is an automated transactional notification for your PAF-IAST student account on FYPMate.")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(headerTitle)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #312e81 100%); padding: 28px 36px; text-align: center;">
              ${badgeHtml}
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                ${escapeHtml(headerTitle)}
              </h1>
              <p style="margin: 6px 0 0; color: #cbd5e1; font-size: 13px; font-weight: 500;">
                ${escapeHtml(headerSubtitle)}
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px;">
              ${options.bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 22px 36px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px; color: #64748b; font-size: 12px; line-height: 1.5;">
                ${escapeHtml(footerNote)}
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                <a href="${appUrl}/dashboard/discovery" style="color: #4f46e5; text-decoration: none; font-weight: 600;">Open Dashboard</a>
                &nbsp;&bull;&nbsp;
                <a href="${appUrl}/dashboard/profile" style="color: #4f46e5; text-decoration: none; font-weight: 600;">My Profile</a>
                &nbsp;&bull;&nbsp;
                <a href="${appUrl}/dashboard/fyp-ideas" style="color: #4f46e5; text-decoration: none; font-weight: 600;">FYP Idea Validator</a>
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
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px auto 8px auto;">
    <tr>
      <td style="border-radius: 12px; background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);">
        <a href="${escapeHtml(url)}"
           target="_blank"
           rel="noopener noreferrer"
           style="display: inline-block; padding: 13px 32px; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 12px; letter-spacing: 0.1px;">
          ${escapeHtml(text)} &rarr;
        </a>
      </td>
    </tr>
  </table>`
}

// ============================================================================
// 1. ADMIN CAMPAIGN TEMPLATES (MANUAL / PROMOTIONAL & REMINDERS)
// ============================================================================

/**
 * Template 1A: Onboarding / Account Setup Not Completed Reminder
 */
export function buildOnboardingReminderEmail(params: {
  studentName: string
  department?: string
  semester?: number
  customSubject?: string
  customIntro?: string
}): { subject: string; html: string } {
  const appUrl = getAppBaseUrl()
  const firstName =
    params.studentName.trim().split(/\s+/)[0] || params.studentName

  const subject = params.customSubject?.trim()
    ? interpolatePersonalization(params.customSubject.trim(), {
        name: params.studentName,
        department: params.department,
        semester: params.semester,
      })
    : `⚡ ${firstName}, finish setting up your FYPMate account (takes 30 seconds)`

  const introHtml = params.customIntro?.trim()
    ? `<p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">${escapeHtml(
        interpolatePersonalization(params.customIntro.trim(), {
          name: params.studentName,
          department: params.department,
          semester: params.semester,
        })
      ).replace(/\n/g, "<br/>")}</p>`
    : `<p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
        You signed in to <strong>FYPMate</strong> with your PAF-IAST account${
          params.department ? ` (${escapeHtml(params.department)})` : ""
        }, but your initial 3-step profile setup is still unfinished.
      </p>`

  const bodyHtml = `
    <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
      Salam ${escapeHtml(firstName)},
    </h2>
    <p style="color: #64748b; font-size: 13px; margin: 0 0 22px 0;">
      Account Status: <strong style="color: #d97706;">Setup Incomplete</strong>${
        params.department
          ? ` &bull; ${escapeHtml(params.department)}${
              params.semester ? ` (Sem ${params.semester})` : ""
            }`
          : ""
      }
    </p>

    ${introHtml}

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #f59e0b; border-radius: 12px; padding: 18px 22px; margin: 0 0 24px 0;">
      <p style="margin: 0 0 10px 0; color: #0f172a; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;">
        3 Quick Steps to Activate Your Profile:
      </p>
      <ol style="margin: 0; padding-left: 18px; color: #334155; font-size: 14px; line-height: 1.7;">
        <li>Select whether you are <strong>Looking for a Team</strong> or <strong>Already Have a Group</strong>.</li>
        <li>Pick your top technical skills (React, Python, AI/ML, Flutter, IoT, etc.).</li>
        <li>Choose up to 2 primary team roles so classmates in Semester ${
          params.semester || "6/7"
        } know how to collaborate with you.</li>
      </ol>
    </div>

    ${buildCtaButton("Finish Account Setup (30s)", `${appUrl}/dashboard/discovery`)}
  `

  return {
    subject,
    html: wrapEmailLayout({
      badgeText: "Action Required",
      headerTitle: "FYPMate — PAF-IAST",
      headerSubtitle: "Complete your 3-step student onboarding",
      bodyHtml,
      isPromotional: false,
    }),
  }
}

/**
 * Template 1B: Profile Completion Reminder (lists exact missing sections + completeness %)
 */
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
  const firstName =
    params.studentName.trim().split(/\s+/)[0] || params.studentName
  const missingSections =
    params.missingSections.length > 0
      ? params.missingSections
      : (["skills", "projects", "interests"] as MissingSection[])

  const subject = params.customSubject?.trim()
    ? interpolatePersonalization(params.customSubject.trim(), {
        name: params.studentName,
        department: params.department,
        semester: params.semester,
      })
    : `${firstName}, complete your FYPMate profile to get matched faster`

  const missingListHtml = missingSections
    .map(
      (sec) =>
        `<li style="padding: 5px 0; color: #334155; font-size: 14px; font-weight: 500;">${escapeHtml(
          SECTION_LABELS[sec] || sec
        )}</li>`
    )
    .join("")

  const introParagraph = params.customIntro?.trim()
    ? `<p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">${escapeHtml(
        interpolatePersonalization(params.customIntro.trim(), {
          name: params.studentName,
          department: params.department,
          semester: params.semester,
        })
      ).replace(/\n/g, "<br/>")}</p>`
    : `<p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
        We noticed that <strong>${missingSections.length} section(s)</strong> of your FYPMate profile are still incomplete${
          params.completenessPercent !== undefined
            ? ` (currently <strong>${params.completenessPercent}% complete</strong>)`
            : ""
        }. Classmates in your semester rely on skills, project links, and role preferences on your profile to find compatible FYP partners.
      </p>`

  const bodyHtml = `
    <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
      Salam ${escapeHtml(firstName)},
    </h2>
    <p style="color: #64748b; font-size: 13px; margin: 0 0 22px 0;">
      ${
        params.department
          ? `${escapeHtml(params.department)}${
              params.semester ? ` &bull; Semester ${params.semester}` : ""
            }`
          : "PAF-IAST Student Profile Update"
      }
    </p>

    ${introParagraph}

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #4f46e5; border-radius: 12px; padding: 18px 22px; margin: 0 0 24px 0;">
      <p style="margin: 0 0 10px 0; color: #0f172a; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;">
        Missing on your profile (${missingSections.length}):
      </p>
      <ul style="margin: 0; padding-left: 18px;">
        ${missingListHtml}
      </ul>
    </div>

    <div style="background-color: #eef2ff; border-radius: 12px; padding: 14px 18px; margin: 0 0 24px 0;">
      <p style="margin: 0; color: #3730a3; font-size: 13px; line-height: 1.6;">
        <strong>💡 Already formed your group offline?</strong> You can switch your status to <strong>&ldquo;Not Looking (Team Formed)&rdquo;</strong> on your profile in 1 click so you don&rsquo;t receive extra partner requests.
      </p>
    </div>

    ${buildCtaButton("Update My Profile Now", `${appUrl}/dashboard/profile`)}
  `

  return {
    subject,
    html: wrapEmailLayout({
      badgeText: "Profile Reminder",
      headerTitle: "FYPMate",
      headerSubtitle: "Complete your academic portfolio & availability status",
      bodyHtml,
      isPromotional: true,
    }),
  }
}

/**
 * Template 1C: Promotional / Platform Feature Announcement
 */
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
  const vars = {
    name: params.recipientName,
    department: params.department,
    semester: params.semester,
  }
  const firstName =
    params.recipientName.trim().split(/\s+/)[0] || params.recipientName

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
        `<p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 18px 0;">${escapeHtml(
          para.trim()
        ).replace(/\n/g, "<br/>")}</p>`
    )
    .join("")

  const highlightHtml =
    params.highlightTitle?.trim() || params.highlightText?.trim()
      ? `<div style="background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%); border: 1px solid #c7d2fe; border-radius: 12px; padding: 20px 22px; margin: 22px 0;">
          ${
            params.highlightTitle?.trim()
              ? `<p style="margin: 0 0 6px 0; color: #312e81; font-size: 14px; font-weight: 700;">${escapeHtml(
                  interpolatePersonalization(params.highlightTitle.trim(), vars)
                )}</p>`
              : ""
          }
          ${
            params.highlightText?.trim()
              ? `<p style="margin: 0; color: #4338ca; font-size: 13px; line-height: 1.6;">${escapeHtml(
                  interpolatePersonalization(params.highlightText.trim(), vars)
                ).replace(/\n/g, "<br/>")}</p>`
              : ""
          }
        </div>`
      : ""

  const resolvedCtaUrl = params.ctaUrl?.trim()
    ? params.ctaUrl.trim().startsWith("http")
      ? params.ctaUrl.trim()
      : `${appUrl}${params.ctaUrl.trim().startsWith("/") ? "" : "/"}${params.ctaUrl.trim()}`
    : `${appUrl}/dashboard/discovery`

  const ctaHtml = buildCtaButton(
    params.ctaText?.trim() || "Explore on FYPMate",
    resolvedCtaUrl
  )

  const bodyHtml = `
    <p style="margin: 0 0 6px 0; color: #4f46e5; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;">
      Hi ${escapeHtml(firstName)},
    </p>
    <h2 style="margin: 0 0 20px 0; color: #0f172a; font-size: 22px; font-weight: 800; line-height: 1.3;">
      ${escapeHtml(heading)}
    </h2>

    ${paragraphsHtml}
    ${highlightHtml}
    ${ctaHtml}
  `

  return {
    subject,
    html: wrapEmailLayout({
      badgeText: "Platform Update",
      headerTitle: "FYPMate",
      headerSubtitle: "New tools & updates for PAF-IAST students",
      bodyHtml,
      isPromotional: true,
    }),
  }
}

/**
 * Template 1D: General Notification / Department or Semester Notice
 */
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
  const vars = {
    name: params.recipientName,
    department: params.department,
    semester: params.semester,
  }
  const firstName =
    params.recipientName.trim().split(/\s+/)[0] || params.recipientName

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
        `<p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 18px 0;">${escapeHtml(
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
    <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
      ${escapeHtml(heading)}
    </h2>
    <p style="color: #64748b; font-size: 13px; margin: 0 0 22px 0;">
      For ${escapeHtml(firstName)}${
    params.department ? ` &bull; ${escapeHtml(params.department)}` : ""
  }${params.semester ? ` (Semester ${params.semester})` : ""}
    </p>

    ${paragraphsHtml}

    ${buildCtaButton(
      params.ctaText?.trim() || "Open FYPMate Dashboard",
      resolvedCtaUrl
    )}
  `

  return {
    subject,
    html: wrapEmailLayout({
      badgeText: "Student Notice",
      headerTitle: "FYPMate Notification",
      headerSubtitle: "Important notice for your FYP account",
      bodyHtml,
      isPromotional: true,
    }),
  }
}

// ============================================================================
// 2. AUTOMATIC TRANSACTIONAL EMAIL TEMPLATES (EVENT-DRIVEN)
// ============================================================================

/**
 * Auto-Email 1: Sent when a student receives an FYP Partner Request
 */
export function buildPartnerRequestEmail(params: {
  toName: string
  fromName: string
  fromDepartment?: string
  fromSemester?: number
  reason?: string
}): { subject: string; html: string } {
  const appUrl = getAppBaseUrl()
  const toFirstName = params.toName.trim().split(/\s+/)[0] || params.toName

  const subject = `🎓 ${params.fromName} sent you an FYP Partner Request on FYPMate`

  const reasonHtml = params.reason?.trim()
    ? `<div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 10px; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
          Note from ${escapeHtml(params.fromName)}:
        </p>
        <p style="margin: 0; color: #1e293b; font-size: 14px; font-style: italic; line-height: 1.6;">
          &ldquo;${escapeHtml(params.reason.trim())}&rdquo;
        </p>
      </div>`
    : ""

  const bodyHtml = `
    <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
      Hi ${escapeHtml(toFirstName)},
    </h2>
    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
      <strong>${escapeHtml(params.fromName)}</strong>${
    params.fromDepartment
      ? ` (${escapeHtml(params.fromDepartment)}${
          params.fromSemester ? `, Sem ${params.fromSemester}` : ""
        })`
      : ""
  } has invited you to team up for your Final Year Project on <strong>FYPMate</strong>.
    </p>

    ${reasonHtml}

    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
      You can review their full profile, skills, and project portfolio and either accept or decline this partner request from your dashboard.
    </p>

    ${buildCtaButton("Review Partner Request", `${appUrl}/dashboard/requests/received`)}

    <p style="margin: 20px 0 0 0; color: #64748b; font-size: 12px; text-align: center;">
      Already formed your FYP group offline? <a href="${appUrl}/dashboard/profile" style="color: #4f46e5; font-weight: 600; text-decoration: underline;">Update your availability status</a> so classmates know your team is complete.
    </p>
  `

  return {
    subject,
    html: wrapEmailLayout({
      badgeText: "Transactional • Partner Request",
      headerTitle: "FYPMate",
      headerSubtitle: "A classmate wants to form an FYP team with you",
      bodyHtml,
      isPromotional: false,
    }),
  }
}

/**
 * Auto-Email 2: Sent when a student receives a 1-on-1 Message Request
 */
export function buildMessageRequestEmail(params: {
  toName: string
  fromName: string
  reason: string
}): { subject: string; html: string } {
  const appUrl = getAppBaseUrl()
  const toFirstName = params.toName.trim().split(/\s+/)[0] || params.toName

  const subject = `💬 ${params.fromName} wants to connect with you on FYPMate`

  const bodyHtml = `
    <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
      Hi ${escapeHtml(toFirstName)},
    </h2>
    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
      <strong>${escapeHtml(params.fromName)}</strong> sent you a Message Request on <strong>FYPMate</strong> to discuss potential FYP collaboration.
    </p>

    <div style="background-color: #f8fafc; border-left: 4px solid #0ea5e9; border-radius: 10px; padding: 16px 20px; margin: 20px 0;">
      <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
        Message from ${escapeHtml(params.fromName)}:
      </p>
      <p style="margin: 0; color: #1e293b; font-size: 14px; font-style: italic; line-height: 1.6;">
        &ldquo;${escapeHtml(params.reason.trim())}&rdquo;
      </p>
    </div>

    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
      Accepting this message request opens a 1-on-1 chat thread without committing you to an FYP group yet.
    </p>

    ${buildCtaButton("View Message Request", `${appUrl}/dashboard/requests/received`)}
  `

  return {
    subject,
    html: wrapEmailLayout({
      badgeText: "Transactional • Message Request",
      headerTitle: "FYPMate",
      headerSubtitle: "New connection request from a PAF-IAST peer",
      bodyHtml,
      isPromotional: false,
    }),
  }
}

/**
 * Auto-Email 3: Sent when a student's Partner or Message Request is accepted
 */
export function buildRequestAcceptedEmail(params: {
  toName: string
  accepterName: string
  requestType: "MESSAGE" | "PARTNER"
}): { subject: string; html: string } {
  const appUrl = getAppBaseUrl()
  const toFirstName = params.toName.trim().split(/\s+/)[0] || params.toName
  const isPartner = params.requestType === "PARTNER"

  const subject = isPartner
    ? `🎉 ${params.accepterName} accepted your FYP Partner Request!`
    : `✅ ${params.accepterName} accepted your Message Request on FYPMate`

  const bodyHtml = isPartner
    ? `
      <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
        Great news, ${escapeHtml(toFirstName)}!
      </h2>
      <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 18px 0;">
        <strong>${escapeHtml(params.accepterName)}</strong> has accepted your FYP Partner Request. You are now officially teamed up in an FYP Group on FYPMate!
      </p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 22px 0;">
        Head over to your <strong>FYP Group &amp; Workspace</strong> to set your project title, validate your idea with AI, and start organizing tasks.
      </p>
      ${buildCtaButton("Open My FYP Group", `${appUrl}/dashboard/fyp`)}
    `
    : `
      <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
        Hi ${escapeHtml(toFirstName)},
      </h2>
      <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 18px 0;">
        <strong>${escapeHtml(params.accepterName)}</strong> accepted your Message Request. Your 1-on-1 chat conversation is now unlocked!
      </p>
      ${buildCtaButton("Start Chatting Now", `${appUrl}/dashboard/messages`)}
    `

  return {
    subject,
    html: wrapEmailLayout({
      badgeText: isPartner
        ? "Transactional • Team Formed"
        : "Transactional • Connection Accepted",
      headerTitle: "FYPMate",
      headerSubtitle: isPartner
        ? "Your FYP team has been updated"
        : "You can now message your classmate directly",
      bodyHtml,
      isPromotional: false,
    }),
  }
}

/**
 * Auto-Email 4: Sent when an Admin updates or responds to a student's Feedback ticket
 */
export function buildFeedbackUpdateEmail(params: {
  toName: string
  status: string
  adminResponse?: string | null
}): { subject: string; html: string } {
  const appUrl = getAppBaseUrl()
  const toFirstName = params.toName.trim().split(/\s+/)[0] || params.toName
  const formattedStatus = params.status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const subject = `📋 Update on your FYPMate Feedback (${formattedStatus})`

  const responseBox = params.adminResponse?.trim()
    ? `<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; border-radius: 10px; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; color: #047857; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
          Admin Response:
        </p>
        <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
          ${escapeHtml(params.adminResponse.trim()).replace(/\n/g, "<br/>")}
        </p>
      </div>`
    : ""

  const bodyHtml = `
    <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
      Hi ${escapeHtml(toFirstName)},
    </h2>
    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
      Your feedback ticket on FYPMate has been updated to <strong>${escapeHtml(
        formattedStatus
      )}</strong>.
    </p>
    ${responseBox}
    ${buildCtaButton("View Feedback Details", `${appUrl}/dashboard/feedback`)}
  `

  return {
    subject,
    html: wrapEmailLayout({
      badgeText: "Transactional • Support Update",
      headerTitle: "FYPMate Support",
      headerSubtitle: `Ticket Status: ${formattedStatus}`,
      bodyHtml,
      isPromotional: false,
    }),
  }
}

/**
 * Auto-Email 5: Sent once when a new PAF-IAST student registers on FYPMate
 */
export function buildWelcomeEmail(params: {
  studentName: string
  department: string
  semester: number
}): { subject: string; html: string } {
  const appUrl = getAppBaseUrl()
  const firstName =
    params.studentName.trim().split(/\s+/)[0] || params.studentName

  const subject = `Welcome to FYPMate, ${firstName}! 🎓`

  const bodyHtml = `
    <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 22px; font-weight: 800;">
      Welcome aboard, ${escapeHtml(firstName)}!
    </h2>
    <p style="color: #64748b; font-size: 13px; margin: 0 0 20px 0;">
      Verified Academic Profile: <strong>${escapeHtml(
        params.department
      )} &bull; Semester ${params.semester}</strong>
    </p>

    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
      Your institutional PAF-IAST account on <strong>FYPMate</strong> is ready. Here are 3 things you can do right now to get ahead on your Final Year Project:
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 22px; margin: 0 0 24px 0;">
      <p style="margin: 0 0 10px 0; color: #1e293b; font-size: 14px; line-height: 1.5;">
        <strong>1. Complete Your Skills &amp; Role Profile:</strong> Add your top skills, GitHub projects, and whether you are looking for a team.
      </p>
      <p style="margin: 0 0 10px 0; color: #1e293b; font-size: 14px; line-height: 1.5;">
        <strong>2. Validate Your FYP Idea with AI:</strong> Benchmark your idea against past PAF-IAST F21 &amp; F22 projects and generate a 100-point rubric report + defense questions.
      </p>
      <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.5;">
        <strong>3. Discover Teammates in Semester ${params.semester}:</strong> Connect with peers whose skills complement yours.
      </p>
    </div>

    ${buildCtaButton("Complete My Profile", `${appUrl}/dashboard/profile`)}
  `

  return {
    subject,
    html: wrapEmailLayout({
      badgeText: "Transactional • Welcome",
      headerTitle: "FYPMate — PAF-IAST",
      headerSubtitle: "Find your team. Validate your idea. Ace your defense.",
      bodyHtml,
      isPromotional: false,
    }),
  }
}

/**
 * Helper to generate a sample preview of any of the 5 Automatic Transactional Templates
 * so the Admin can inspect and test-send them in the Admin Portal.
 */
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
          "Salam Ali! We have an AI + IoT Smart Agriculture idea validated at 88/100 and need a Backend/FastAPI lead for our group.",
      })
    case "messageRequest":
      return buildMessageRequestEmail({
        toName: "Ali Khan",
        fromName: "Sara Ahmed",
        reason:
          "Hi Ali, saw your React & Next.js projects on your profile—would love to discuss teaming up for FYP-I.",
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
          "Thank you for your suggestion! We have enabled PDF proposal extraction in the AI Idea Validator.",
      })
    case "welcomeEmail":
      return buildWelcomeEmail({
        studentName: "Ali Khan",
        department: "Computer Science",
        semester: 6,
      })
  }
}

// ============================================================================
// 3. BACKWARD-COMPATIBILITY EXPORTS
// ============================================================================

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
  const firstName = studentName.split(" ")[0] || studentName
  const labels = missingSections.map((s) => SECTION_LABELS[s])

  return {
    name: firstName,
    missing_count: String(missingSections.length),
    missing_list: labels
      .map((l) => `<li style="padding: 6px 0; color: #475569;">${l}</li>`)
      .join(""),
  }
}
