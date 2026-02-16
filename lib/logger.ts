// lib/logger.ts
/**
 * Production-safe Logger
 * ----------------------
 * Only logs in development mode to prevent information leakage.
 * In production, errors should be sent to a monitoring service (e.g., Sentry).
 */

const isDev = process.env.NODE_ENV === "development"

export const logger = {
  error: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.error(`[ERROR] ${message}`, ...args)
    }
    // TODO: In production, send to monitoring service (Sentry, LogRocket, etc.)
  },

  warn: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  },

  info: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.log(`[INFO] ${message}`, ...args)
    }
  },

  debug: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  },
}

export default logger
