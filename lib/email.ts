// lib/email.ts
/**
 * Email Client (Maileroo)
 * -----------------------
 * Lazy-initialized Maileroo client for the entire app.
 * Set MAILEROO_API_KEY in .env to enable email sending.
 */

import { MailerooClient } from "maileroo-sdk"

let _client: MailerooClient | null = null

/**
 * Get the Maileroo client. Throws a clear error if the API key is missing.
 * Lazy init avoids build-time crashes when the key isn't set.
 */
export function getMaileroo(): MailerooClient {
  if (!_client) {
    const apiKey = process.env.MAILEROO_API_KEY
    if (!apiKey) {
      throw new Error("MAILEROO_API_KEY environment variable is not set. Email sending is disabled.")
    }
    _client = new MailerooClient(apiKey)
  }
  return _client
}

/** Default sender email address. */
export const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "shamsimema@gmail.com"

/** Default sender display name. */
export const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "FYP Finder"
