// lib/client-logger.ts
/**
 * Client-side Production-safe Logger
 * -----------------------------------
 * Only logs in development mode on the client side.
 */

const isDev = process.env.NODE_ENV === "development"

export const clientLogger = {
  error: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.error(`[ERROR] ${message}`, ...args)
    }
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

export default clientLogger
