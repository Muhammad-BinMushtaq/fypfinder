/**
 * Simple in-memory rate limiter for API routes
 * 
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 10 })
 *   
 *   // In your route handler:
 *   const rateLimitResult = limiter.check(userId)
 *   if (!rateLimitResult.allowed) {
 *     return NextResponse.json(
 *       { error: "Rate limit exceeded", retryAfter: rateLimitResult.retryAfter },
 *       { status: 429 }
 *     )
 *   }
 * 
 * Note: This is an in-memory implementation suitable for single-instance deployments.
 * For production with multiple instances, consider using Redis or a similar distributed cache.
 */

interface RateLimitEntry {
  count: number
  windowStart: number
}

interface RateLimiterConfig {
  /** Time window in milliseconds */
  windowMs: number
  /** Maximum requests allowed per window */
  maxRequests: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfter?: number // seconds until they can retry
}

class RateLimiter {
  private cache: Map<string, RateLimitEntry> = new Map()
  private windowMs: number
  private maxRequests: number
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(config: RateLimiterConfig) {
    this.windowMs = config.windowMs
    this.maxRequests = config.maxRequests
    
    // Cleanup old entries every 5 minutes to prevent memory leaks
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  check(identifier: string): RateLimitResult {
    const now = Date.now()
    const entry = this.cache.get(identifier)

    // No existing entry or window has expired
    if (!entry || now - entry.windowStart >= this.windowMs) {
      this.cache.set(identifier, {
        count: 1,
        windowStart: now,
      })
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
      }
    }

    // Within current window
    if (entry.count < this.maxRequests) {
      entry.count++
      return {
        allowed: true,
        remaining: this.maxRequests - entry.count,
      }
    }

    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.windowStart + this.windowMs - now) / 1000)
    return {
      allowed: false,
      remaining: 0,
      retryAfter,
    }
  }

  reset(identifier: string): void {
    this.cache.delete(identifier)
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.windowStart >= this.windowMs) {
        this.cache.delete(key)
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}

/**
 * Create a new rate limiter instance
 */
export function createRateLimiter(config: RateLimiterConfig): RateLimiter {
  return new RateLimiter(config)
}

// Pre-configured rate limiters for common use cases

/**
 * Rate limiter for authentication endpoints (stricter)
 * 5 attempts per minute
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
})

/**
 * Rate limiter for sending requests (partner/message)
 * 10 requests per minute
 */
export const requestRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
})

/**
 * Rate limiter for general API calls
 * 100 requests per minute
 */
export const generalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
})

/**
 * Rate limiter for messaging (more lenient)
 * 60 messages per minute
 */
export const messageRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
})

/**
 * Helper to get a client identifier from request headers
 * Falls back to a default if no identifier found
 */
export function getClientIdentifier(
  headers: Headers,
  fallback: string = "anonymous"
): string {
  // Prefer user ID if available (passed by middleware)
  const userId = headers.get("x-user-id")
  if (userId) return `user:${userId}`

  // Fall back to IP address
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) {
    const ip = forwarded.split(",")[0].trim()
    return `ip:${ip}`
  }

  const realIp = headers.get("x-real-ip")
  if (realIp) return `ip:${realIp}`

  return fallback
}
