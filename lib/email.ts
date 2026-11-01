// lib/email.ts
/**
 * Email Service & Resend Free-Tier Quota Manager
 * ----------------------------------------------
 * Handles both Transactional (event-driven) and Promotional/Reminder (admin-driven)
 * emails via Resend with:
 *  - Free-tier rate-limit pacing (max 2 requests/sec -> 650ms spacing + 429 retry)
 *  - Daily (100/day) and Monthly (3,000/month) quota tracking
 *  - Transactional vs Promotional categorization & headers
 *  - Automatic trigger settings (Smart Web-Push Fallback vs Always Send)
 *  - Recently-emailed student cooldown tracking (to split >100 student sends across days)
 */

import { Resend } from "resend"
import prisma from "./db"
import logger from "./logger"

let _resend: Resend | null = null

/** Resend Free Tier Constants */
export const RESEND_FREE_DAILY_LIMIT = 100
export const RESEND_FREE_MONTHLY_LIMIT = 3000
export const RESEND_RATE_LIMIT_DELAY_MS = 650 // ~1.5 req/sec (safely below 2 req/sec limit)

/** Default verified domain for FYPMate sender identities. */
export const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || "fypmate.com"

/** Default fallback sender email address (noreply@fypmate.com has highest Outlook inbox delivery). */
export const EMAIL_FROM_ADDRESS =
  process.env.EMAIL_FROM_ADDRESS || `noreply@${EMAIL_DOMAIN}`

/** Default sender display name. */
export const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "FYPMate"

export type EmailCategory = "TRANSACTIONAL" | "PROMOTIONAL"

export type TransactionalTriggerKey =
  | "partnerRequest"
  | "messageRequest"
  | "requestAccepted"
  | "feedbackUpdate"
  | "welcomeEmail"

export interface EmailTriggerConfig {
  deliveryMode: "SMART_FALLBACK" | "ALWAYS_SEND"
  partnerRequest: boolean
  messageRequest: boolean
  requestAccepted: boolean
  feedbackUpdate: boolean
  welcomeEmail: boolean
  dailyTransactionalReserve: number
}

export interface EmailLogEntry {
  id: string
  recipientEmail: string
  studentId: string | null
  category: EmailCategory
  templateKey: string
  subject: string
  status: "SENT" | "FAILED"
  errorMessage: string | null
  createdAt: string
}

export interface EmailQuotaStats {
  dailyLimit: number
  monthlyLimit: number
  sentTodayTotal: number
  sentTodayTransactional: number
  sentTodayPromotional: number
  remainingToday: number
  sentMonthTotal: number
  sentMonthTransactional: number
  sentMonthPromotional: number
  remainingMonth: number
  recentLogs: EmailLogEntry[]
}

/**
 * Returns the RFC 5322 From header string using noreply@fypmate.com for reliable Outlook/University inbox delivery.
 */
export function getFormattedSender(
  category: EmailCategory = "TRANSACTIONAL",
  _templateKey: string = "transactional"
): string {
  if (category === "TRANSACTIONAL" && process.env.EMAIL_FROM_TRANSACTIONAL) {
    return process.env.EMAIL_FROM_TRANSACTIONAL
  }
  if (category === "PROMOTIONAL" && process.env.EMAIL_FROM_PROMOTIONAL) {
    return process.env.EMAIL_FROM_PROMOTIONAL
  }
  if (process.env.EMAIL_FROM) {
    return process.env.EMAIL_FROM
  }
  return `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`
}

/**
 * Check whether Resend is configured with an API key.
 */
export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 0
  )
}

/**
 * Get the singleton Resend client.
 */
export function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY?.trim()
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY environment variable is not set. Email sending is disabled."
      )
    }
    _resend = new Resend(apiKey)
  }
  return _resend
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ============================================================================
// PERSISTENT + IN-MEMORY QUOTA & TRIGGER CONFIG STORE
// ============================================================================

const DEFAULT_TRIGGER_CONFIG: EmailTriggerConfig = {
  deliveryMode: "SMART_FALLBACK",
  partnerRequest: true,
  messageRequest: true,
  requestAccepted: true,
  feedbackUpdate: true,
  welcomeEmail: true,
  dailyTransactionalReserve: 15,
}

let _tablesInitialized = false
let _cachedTriggerConfig: EmailTriggerConfig | null = null
const _memoryLogs: EmailLogEntry[] = []

/**
 * Lazily ensures the lightweight tracking tables exist in PostgreSQL.
 * Never throws or blocks if the database forbids DDL; falls back to memory.
 */
async function ensureEmailTables(): Promise<boolean> {
  if (_tablesInitialized) return true
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EmailSendLog" (
        "id" TEXT PRIMARY KEY,
        "recipientEmail" TEXT NOT NULL,
        "studentId" TEXT,
        "category" TEXT NOT NULL,
        "templateKey" TEXT NOT NULL,
        "subject" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "errorMessage" TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "EmailSendLog_createdAt_idx" ON "EmailSendLog"("createdAt");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "EmailSendLog_studentId_idx" ON "EmailSendLog"("studentId");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EmailTriggerConfig" (
        "id" TEXT PRIMARY KEY,
        "config" JSONB NOT NULL,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
    _tablesInitialized = true
    return true
  } catch (err) {
    logger.warn(
      "[Email Tables] Could not auto-create tracking tables, using in-memory fallback:",
      err
    )
    return false
  }
}

/**
 * Record an email dispatch in both memory and PostgreSQL.
 */
async function recordEmailLog(entry: {
  recipientEmail: string
  studentId?: string | null
  category: EmailCategory
  templateKey: string
  subject: string
  status: "SENT" | "FAILED"
  errorMessage?: string | null
}): Promise<void> {
  const logItem: EmailLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    recipientEmail: entry.recipientEmail,
    studentId: entry.studentId || null,
    category: entry.category,
    templateKey: entry.templateKey,
    subject: entry.subject,
    status: entry.status,
    errorMessage: entry.errorMessage || null,
    createdAt: new Date().toISOString(),
  }

  _memoryLogs.unshift(logItem)
  if (_memoryLogs.length > 500) {
    _memoryLogs.length = 500
  }

  try {
    const ok = await ensureEmailTables()
    if (!ok) return

    await prisma.$executeRaw`
      INSERT INTO "EmailSendLog" ("id", "recipientEmail", "studentId", "category", "templateKey", "subject", "status", "errorMessage", "createdAt")
      VALUES (${logItem.id}, ${logItem.recipientEmail}, ${logItem.studentId}, ${logItem.category}, ${logItem.templateKey}, ${logItem.subject}, ${logItem.status}, ${logItem.errorMessage}, NOW())
    `
  } catch (err) {
    logger.warn("[EmailSendLog] Failed to persist log entry:", err)
  }
}

/**
 * Get the current Automatic Transactional Email configuration.
 */
export async function getEmailTriggerConfig(): Promise<EmailTriggerConfig> {
  if (_cachedTriggerConfig) {
    return _cachedTriggerConfig
  }

  try {
    const ok = await ensureEmailTables()
    if (ok) {
      const rows = await prisma.$queryRaw<Array<{ config: any }>>`
        SELECT "config" FROM "EmailTriggerConfig" WHERE "id" = 'default' LIMIT 1
      `
      if (rows.length > 0 && rows[0]?.config) {
        _cachedTriggerConfig = {
          ...DEFAULT_TRIGGER_CONFIG,
          ...(typeof rows[0].config === "string"
            ? JSON.parse(rows[0].config)
            : rows[0].config),
        }
        return _cachedTriggerConfig!
      }
    }
  } catch (err) {
    logger.warn("[EmailTriggerConfig] Read fallback to defaults:", err)
  }

  _cachedTriggerConfig = { ...DEFAULT_TRIGGER_CONFIG }
  return _cachedTriggerConfig
}

/**
 * Update the Automatic Transactional Email configuration.
 */
export async function updateEmailTriggerConfig(
  partial: Partial<EmailTriggerConfig>
): Promise<EmailTriggerConfig> {
  const current = await getEmailTriggerConfig()
  const updated: EmailTriggerConfig = {
    ...current,
    ...partial,
  }
  _cachedTriggerConfig = updated

  try {
    const ok = await ensureEmailTables()
    if (ok) {
      const jsonStr = JSON.stringify(updated)
      await prisma.$executeRaw`
        INSERT INTO "EmailTriggerConfig" ("id", "config", "updatedAt")
        VALUES ('default', ${jsonStr}::jsonb, NOW())
        ON CONFLICT ("id") DO UPDATE SET "config" = ${jsonStr}::jsonb, "updatedAt" = NOW()
      `
    }
  } catch (err) {
    logger.warn("[EmailTriggerConfig] Failed to persist config to DB:", err)
  }

  return updated
}

/**
 * Fetch real-time Resend Free-Tier quota usage (Today / 100 and This Month / 3,000)
 * plus the most recent 25 email dispatch logs.
 */
export async function getEmailQuotaStats(): Promise<EmailQuotaStats> {
  const now = new Date()
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  )

  try {
    const ok = await ensureEmailTables()
    if (ok) {
      const [dayCounts, monthCounts, recentRows] = await Promise.all([
        prisma.$queryRaw<Array<{ category: string; cnt: bigint }>>`
          SELECT "category", COUNT(*)::bigint AS cnt
          FROM "EmailSendLog"
          WHERE "status" = 'SENT' AND "createdAt" >= ${startOfDay}
          GROUP BY "category"
        `,
        prisma.$queryRaw<Array<{ category: string; cnt: bigint }>>`
          SELECT "category", COUNT(*)::bigint AS cnt
          FROM "EmailSendLog"
          WHERE "status" = 'SENT' AND "createdAt" >= ${startOfMonth}
          GROUP BY "category"
        `,
        prisma.$queryRaw<
          Array<{
            id: string
            recipientEmail: string
            studentId: string | null
            category: string
            templateKey: string
            subject: string
            status: string
            errorMessage: string | null
            createdAt: Date
          }>
        >`
          SELECT "id", "recipientEmail", "studentId", "category", "templateKey", "subject", "status", "errorMessage", "createdAt"
          FROM "EmailSendLog"
          ORDER BY "createdAt" DESC
          LIMIT 25
        `,
      ])

      let sentTodayTransactional = 0
      let sentTodayPromotional = 0
      for (const r of dayCounts) {
        if (r.category === "TRANSACTIONAL")
          sentTodayTransactional += Number(r.cnt)
        else sentTodayPromotional += Number(r.cnt)
      }

      let sentMonthTransactional = 0
      let sentMonthPromotional = 0
      for (const r of monthCounts) {
        if (r.category === "TRANSACTIONAL")
          sentMonthTransactional += Number(r.cnt)
        else sentMonthPromotional += Number(r.cnt)
      }

      const sentTodayTotal = sentTodayTransactional + sentTodayPromotional
      const sentMonthTotal = sentMonthTransactional + sentMonthPromotional

      return {
        dailyLimit: RESEND_FREE_DAILY_LIMIT,
        monthlyLimit: RESEND_FREE_MONTHLY_LIMIT,
        sentTodayTotal,
        sentTodayTransactional,
        sentTodayPromotional,
        remainingToday: Math.max(0, RESEND_FREE_DAILY_LIMIT - sentTodayTotal),
        sentMonthTotal,
        sentMonthTransactional,
        sentMonthPromotional,
        remainingMonth: Math.max(
          0,
          RESEND_FREE_MONTHLY_LIMIT - sentMonthTotal
        ),
        recentLogs: recentRows.map((r) => ({
          id: r.id,
          recipientEmail: r.recipientEmail,
          studentId: r.studentId,
          category: (r.category as EmailCategory) || "TRANSACTIONAL",
          templateKey: r.templateKey,
          subject: r.subject,
          status: (r.status as "SENT" | "FAILED") || "SENT",
          errorMessage: r.errorMessage,
          createdAt:
            r.createdAt instanceof Date
              ? r.createdAt.toISOString()
              : String(r.createdAt),
        })),
      }
    }
  } catch (err) {
    logger.warn("[EmailQuotaStats] Falling back to in-memory stats:", err)
  }

  // Fallback to in-memory calculation
  const dayIso = startOfDay.toISOString()
  const monthIso = startOfMonth.toISOString()
  const sentLogs = _memoryLogs.filter((l) => l.status === "SENT")

  const todayLogs = sentLogs.filter((l) => l.createdAt >= dayIso)
  const monthLogs = sentLogs.filter((l) => l.createdAt >= monthIso)

  const sentTodayTransactional = todayLogs.filter(
    (l) => l.category === "TRANSACTIONAL"
  ).length
  const sentTodayPromotional = todayLogs.filter(
    (l) => l.category === "PROMOTIONAL"
  ).length
  const sentTodayTotal = sentTodayTransactional + sentTodayPromotional

  const sentMonthTransactional = monthLogs.filter(
    (l) => l.category === "TRANSACTIONAL"
  ).length
  const sentMonthPromotional = monthLogs.filter(
    (l) => l.category === "PROMOTIONAL"
  ).length
  const sentMonthTotal = sentMonthTransactional + sentMonthPromotional

  return {
    dailyLimit: RESEND_FREE_DAILY_LIMIT,
    monthlyLimit: RESEND_FREE_MONTHLY_LIMIT,
    sentTodayTotal,
    sentTodayTransactional,
    sentTodayPromotional,
    remainingToday: Math.max(0, RESEND_FREE_DAILY_LIMIT - sentTodayTotal),
    sentMonthTotal,
    sentMonthTransactional,
    sentMonthPromotional,
    remainingMonth: Math.max(0, RESEND_FREE_MONTHLY_LIMIT - sentMonthTotal),
    recentLogs: _memoryLogs.slice(0, 25),
  }
}

/**
 * Return the set of studentIds who have already been sent a promotional/reminder email
 * within the last `days` days (used to avoid re-emailing the same students across multi-day batches).
 */
export async function getRecentlyEmailedStudentIds(
  days: number = 7
): Promise<Set<string>> {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const ids = new Set<string>()

  try {
    const ok = await ensureEmailTables()
    if (ok) {
      const rows = await prisma.$queryRaw<Array<{ studentId: string | null }>>`
        SELECT DISTINCT "studentId"
        FROM "EmailSendLog"
        WHERE "status" = 'SENT'
          AND "studentId" IS NOT NULL
          AND "createdAt" >= ${cutoff}
      `
      for (const r of rows) {
        if (r.studentId) ids.add(r.studentId)
      }
      return ids
    }
  } catch (err) {
    logger.warn("[RecentlyEmailed] Fallback to memory:", err)
  }

  const cutoffIso = cutoff.toISOString()
  for (const item of _memoryLogs) {
    if (
      item.status === "SENT" &&
      item.studentId &&
      item.createdAt >= cutoffIso
    ) {
      ids.add(item.studentId)
    }
  }
  return ids
}

// ============================================================================
// SINGLE & BATCH SENDING FUNCTIONS (WITH RATE-LIMIT PACING & RETRY)
// ============================================================================

export interface SingleEmailPayload {
  to: string
  subject: string
  html: string
  replyTo?: string
  studentId?: string | null
  category?: EmailCategory
  templateKey?: string
}

export interface BatchEmailResult {
  totalTargeted: number
  totalSent: number
  totalFailed: number
  errors: string[]
  quotaRemainingToday?: number
}

/**
 * Safely send a single email via Resend with automatic 429 retry and quota logging.
 * Never throws unhandled exceptions into caller business flows.
 */
export async function sendSingleEmail(
  payload: SingleEmailPayload
): Promise<{ success: boolean; id?: string; error?: string }> {
  const category: EmailCategory = payload.category || "TRANSACTIONAL"
  const templateKey = payload.templateKey || "transactional"

  if (!isEmailConfigured()) {
    logger.info(
      `[Email Skipped] RESEND_API_KEY not configured. Would have sent "${payload.subject}" to ${payload.to}`
    )
    return { success: false, error: "RESEND_API_KEY is not configured" }
  }

  try {
    const resend = getResend()
    const sendOptions: any = {
      from: getFormattedSender(category, templateKey),
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      tags: [
        { name: "category", value: category.toLowerCase() },
        { name: "template", value: templateKey.replace(/[^a-zA-Z0-9_-]/g, "_") },
      ],
      ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
    }

    let { data, error } = await resend.emails.send(sendOptions)

    // Retry once if rate limited (2 req/sec on Resend Free Tier)
    if (
      error &&
      (error.name === "rate_limit_exceeded" ||
        error.message?.toLowerCase().includes("rate limit") ||
        error.message?.includes("429"))
    ) {
      await sleep(1100)
      const retryRes = await resend.emails.send(sendOptions)
      data = retryRes.data
      error = retryRes.error
    }

    if (error) {
      logger.error(`[Resend Error] Failed sending to ${payload.to}:`, error)
      await recordEmailLog({
        recipientEmail: payload.to,
        studentId: payload.studentId,
        category,
        templateKey,
        subject: payload.subject,
        status: "FAILED",
        errorMessage: error.message || "Resend API error",
      })
      return { success: false, error: error.message || "Resend API error" }
    }

    logger.info(
      `[Resend] Sent ${category} email "${payload.subject}" to ${payload.to} (id: ${data?.id})`
    )
    await recordEmailLog({
      recipientEmail: payload.to,
      studentId: payload.studentId,
      category,
      templateKey,
      subject: payload.subject,
      status: "SENT",
    })

    return { success: true, id: data?.id }
  } catch (err: any) {
    logger.error(`[Resend Exception] Error sending to ${payload.to}:`, err)
    await recordEmailLog({
      recipientEmail: payload.to,
      studentId: payload.studentId,
      category,
      templateKey,
      subject: payload.subject,
      status: "FAILED",
      errorMessage: err?.message || "Unexpected email sending error",
    })
    return {
      success: false,
      error: err?.message || "Unexpected email sending error",
    }
  }
}

/**
 * Send personalized emails to multiple recipients using Resend's native batch API.
 * Paces requests with a 650ms delay between batches of 100 to respect Resend's 2 req/sec Free Tier limit.
 */
export async function sendBatchEmails(
  emails: SingleEmailPayload[]
): Promise<BatchEmailResult> {
  const totalTargeted = emails.length
  if (totalTargeted === 0) {
    return { totalTargeted: 0, totalSent: 0, totalFailed: 0, errors: [] }
  }

  if (!isEmailConfigured()) {
    return {
      totalTargeted,
      totalSent: 0,
      totalFailed: totalTargeted,
      errors: [
        "RESEND_API_KEY environment variable is not set on the server. Add RESEND_API_KEY to your .env file.",
      ],
    }
  }

  const resend = getResend()
  const BATCH_SIZE = 100

  let totalSent = 0
  let totalFailed = 0
  const errors: string[] = []

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    // Pace consecutive batch API requests to never exceed Resend's 2 req/sec rate limit
    if (i > 0) {
      await sleep(RESEND_RATE_LIMIT_DELAY_MS)
    }

    const chunk = emails.slice(i, i + BATCH_SIZE)
    const batchIndex = Math.floor(i / BATCH_SIZE) + 1

    try {
      const payload = chunk.map((item) => {
        const category = item.category || "PROMOTIONAL"
        const templateKey = (item.templateKey || "campaign").replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        )
        return {
          from: getFormattedSender(category, templateKey),
          to: [item.to],
          subject: item.subject,
          html: item.html,
          tags: [
            { name: "category", value: category.toLowerCase() },
            { name: "template", value: templateKey },
          ],
          ...(item.replyTo ? { replyTo: item.replyTo } : {}),
        }
      })

      let { data, error } = await resend.batch.send(payload)

      // Automatic backoff retry if rate-limited
      if (
        error &&
        (error.name === "rate_limit_exceeded" ||
          error.message?.toLowerCase().includes("rate limit") ||
          error.message?.includes("429"))
      ) {
        await sleep(1200)
        const retryBatch = await resend.batch.send(payload)
        data = retryBatch.data
        error = retryBatch.error
      }

      if (error) {
        totalFailed += chunk.length
        const msg = `Batch ${batchIndex} failed (${chunk.length} recipients): ${error.message}`
        errors.push(msg)
        logger.error(`[Resend Batch Error] ${msg}`, error)

        for (const item of chunk) {
          await recordEmailLog({
            recipientEmail: item.to,
            studentId: item.studentId,
            category: item.category || "PROMOTIONAL",
            templateKey: item.templateKey || "campaign",
            subject: item.subject,
            status: "FAILED",
            errorMessage: error.message,
          })
        }
      } else {
        const sentCount = Array.isArray(data?.data)
          ? data.data.length
          : chunk.length
        totalSent += sentCount
        if (sentCount < chunk.length) {
          totalFailed += chunk.length - sentCount
        }
        logger.info(
          `[Resend Batch] Batch ${batchIndex} sent ${sentCount}/${chunk.length} emails successfully`
        )

        for (const item of chunk) {
          await recordEmailLog({
            recipientEmail: item.to,
            studentId: item.studentId,
            category: item.category || "PROMOTIONAL",
            templateKey: item.templateKey || "campaign",
            subject: item.subject,
            status: "SENT",
          })
        }
      }
    } catch (err: any) {
      totalFailed += chunk.length
      const msg = `Batch ${batchIndex} exception (${chunk.length} recipients): ${
        err?.message || "Unknown error"
      }`
      errors.push(msg)
      logger.error(`[Resend Batch Exception] ${msg}`, err)
    }
  }

  const stats = await getEmailQuotaStats()

  return {
    totalTargeted,
    totalSent,
    totalFailed,
    errors,
    quotaRemainingToday: stats.remainingToday,
  }
}
