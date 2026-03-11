// lib/email-templates.ts
/**
 * Email Templates
 * ---------------
 * Single HTML template with {{placeholders}} for Maileroo bulk sending.
 * Dynamic data is provided per-student via template_data.
 *
 * Placeholders used:
 *   {{name}}          – student's first name
 *   {{missing_count}} – number of missing sections
 *   {{missing_list}}  – HTML <li> items for each missing section
 */

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

// Human-readable labels for each section
const SECTION_LABELS: Record<MissingSection, string> = {
  skills: "Skills",
  projects: "Projects",
  internships: "Internships",
  hobbies: "Hobbies",
  phone: "Phone Number",
  interests: "Interests",
  careerGoal: "Career Goal",
  preferredTechStack: "Preferred Tech Stack",
  linkedinUrl: "LinkedIn Profile",
  githubUrl: "GitHub Profile",
}

/**
 * Returns the static email subject and HTML template (with {{placeholders}}).
 * Called ONCE per batch — not per student.
 */
export function getProfileReminderTemplate(): { subject: string; html: string } {
  const profileUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile`
    : "https://fypfinder.com/dashboard/profile"

  const subject = "Complete Your FYP Finder Profile"

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                FYP Finder
              </h1>
              <p style="margin: 8px 0 0; color: #c7d2fe; font-size: 14px;">
                Find your perfect FYP partner
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 8px 0; color: #1e293b; font-size: 20px; font-weight: 600;">
                Hi {{name}},
              </h2>
              <p style="color: #64748b; font-size: 14px; margin: 0 0 24px 0;">
                We hope you're making great progress on your academic journey!
              </p>

              <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                We noticed that <strong>{{missing_count}}</strong> section(s) of your FYP Finder profile are still incomplete.
                Completing your profile helps potential FYP partners find and connect with you more easily.
              </p>

              <!-- Missing sections box -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin: 0 0 28px 0;">
                <p style="margin: 0 0 12px 0; color: #1e293b; font-size: 14px; font-weight: 600;">
                  📋 Sections to complete:
                </p>
                <ul style="margin: 0; padding-left: 18px; list-style-type: disc;">
                  {{missing_list}}
                </ul>
              </div>

              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">
                A complete profile significantly increases your chances of being matched with the right FYP partner.
                Students with complete profiles receive <strong>3× more partner requests</strong> on average.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 12px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);">
                    <a href="${profileUrl}"
                       style="display: inline-block; padding: 14px 36px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 12px;">
                      Complete My Profile →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 4px; color: #94a3b8; font-size: 12px; text-align: center;">
                This email was sent by FYP Finder because your profile is not yet complete.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                If you believe this was sent in error, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html }
}

/**
 * Build Maileroo template_data for a single student.
 * Called once per student in the batch.
 */
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
