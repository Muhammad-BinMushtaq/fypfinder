// lib/email-templates.ts
/**
 * Email Templates
 * ---------------
 * Dynamic, personalized HTML email templates for profile completion reminders.
 * Each template adapts based on which profile sections are missing.
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

interface EmailTemplateParams {
  studentName: string
  missingSections: MissingSection[]
}

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

// Focused messages when a specific section is the primary missing item
const SECTION_MESSAGES: Record<MissingSection, string> = {
  skills:
    "Adding your skills helps potential FYP partners understand your strengths. Whether it's React, Python, Machine Learning, or UI Design — listing your skills makes it much easier for the right teammates to find you.",
  projects:
    "Showcasing your projects demonstrates what you've built and what you're capable of. Even small personal or academic projects can make a great impression on potential FYP partners.",
  internships:
    "Sharing your internship experience highlights your real-world exposure. It tells others that you have hands-on experience and are ready for meaningful collaboration.",
  hobbies:
    "Adding your hobbies helps others connect with you beyond academics. It's a great way to find teammates who share similar interests and working styles.",
  phone:
    "Adding your phone number makes it easier for teammates and admins to reach you quickly when needed.",
  interests:
    "Sharing your interests helps our matching algorithm connect you with like-minded FYP partners who share your passion areas.",
  careerGoal:
    "Defining your career goal helps you find FYP partners aligned with your long-term aspirations — whether that's AI research, startup building, or software engineering.",
  preferredTechStack:
    "Telling us your preferred tech stack helps match you with partners who complement your technical preferences for your FYP project.",
  linkedinUrl:
    "Adding your LinkedIn profile lets potential partners and mentors learn more about your professional background.",
  githubUrl:
    "Linking your GitHub profile showcases your coding activity and open-source contributions to potential FYP partners.",
}

/**
 * Build the HTML email body for a profile completion reminder.
 */
export function buildProfileReminderEmail({ studentName, missingSections }: EmailTemplateParams): {
  subject: string
  html: string
} {
  const firstName = studentName.split(" ")[0] || studentName

  // Determine the primary focus of the email
  const primarySection = missingSections[0]
  const otherSections = missingSections.slice(1)

  // Build subject line
  let subject: string
  if (missingSections.length === 1 && primarySection) {
    subject = `Complete your ${SECTION_LABELS[primarySection]} on FYP Finder`
  } else if (missingSections.length <= 3) {
    subject = `Your FYP Finder profile is almost complete!`
  } else {
    subject = `Complete your FYP Finder profile to find better partners`
  }

  // Build the primary message paragraph
  const primaryMessage = primarySection
    ? SECTION_MESSAGES[primarySection]
    : "Completing your profile helps potential FYP partners find and connect with you."

  // Build the missing sections list
  const missingListItems = missingSections
    .map(
      (s) =>
        `<li style="padding: 6px 0; color: #475569;">${SECTION_LABELS[s]}</li>`
    )
    .join("")

  // Build the additional context paragraph
  let additionalContext = ""
  if (otherSections.length > 0) {
    additionalContext = `
      <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
        We also noticed that the following sections of your profile are still incomplete:
      </p>
      <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #475569;">
        ${otherSections.map((s) => `<li style="padding: 4px 0;">${SECTION_LABELS[s]}</li>`).join("")}
      </ul>
    `
  }

  const html = `
<!DOCTYPE html>
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
                Hi ${firstName},
              </h2>
              <p style="color: #64748b; font-size: 14px; margin: 0 0 24px 0;">
                We hope you're making great progress on your academic journey!
              </p>

              <!-- Primary message -->
              <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                ${primaryMessage}
              </p>

              ${additionalContext}

              <!-- Missing sections summary box -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin: 0 0 28px 0;">
                <p style="margin: 0 0 12px 0; color: #1e293b; font-size: 14px; font-weight: 600;">
                  📋 Sections to complete:
                </p>
                <ul style="margin: 0; padding-left: 18px; list-style-type: disc;">
                  ${missingListItems}
                </ul>
              </div>

              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">
                A complete profile significantly increases your chances of being matched with the right FYP partner. Students with complete profiles receive <strong>3× more partner requests</strong> on average.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 12px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://fypfinder.com"}/dashboard/profile"
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
</html>
`.trim()

  return { subject, html }
}
