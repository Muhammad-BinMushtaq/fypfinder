// lib/email.ts
/**
 * Email Client (Resend)
 * ---------------------
 * Lazy-initialized Resend instance for the entire app.
 * Set RESEND_API_KEY in .env to enable email sending.
 */

import { Resend } from "resend"

let _resend: Resend | null = null

/**
 * Get the Resend client. Throws a clear error if the API key is missing.
 * Lazy init avoids build-time crashes when the key isn't set.
 */
export function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set. Email sending is disabled.")
    }
    _resend = new Resend(apiKey)
  }
  return _resend
}

/**
 * The default "from" address for all outgoing emails.
 * Update domain after verifying it in Resend dashboard.
 */
export const EMAIL_FROM = process.env.EMAIL_FROM || "FYP Finder <onboarding@resend.dev>"
