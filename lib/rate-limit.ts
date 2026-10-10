/**
 * Enhanced Rate Limiter for FYPMate API Routes
 * 
 * Features:
 * - Distributed Upstash Redis support via lightweight REST API (when configured in env)
 * - Resilient, memory-safe in-memory sliding-window fallback (zero third-party dependencies required)
 * - Safe IP identification prioritizing edge-verified headers over spoofable client headers
 * - Granular limiters for Authentication, Requests, Messaging, and Profile updates
 */

import logger from "./logger";

export interface RateLimitEntry {
  count: number;
  windowStart: number;
}

export interface RateLimiterConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests allowed per window */
  maxRequests: number;
  /** Optional prefix for Redis keys */
  prefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number; // seconds until they can retry
}

export class RateLimiter {
  private cache: Map<string, RateLimitEntry> = new Map();
  private windowMs: number;
  private maxRequests: number;
  private prefix: string;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: RateLimiterConfig) {
    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;
    this.prefix = config.prefix || "ratelimit";

    // Cleanup old in-memory entries every 5 minutes to prevent memory leaks
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Synchronous in-memory rate limit check (fast, local fallback).
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const entry = this.cache.get(identifier);

    // No existing entry or window has expired
    if (!entry || now - entry.windowStart >= this.windowMs) {
      this.cache.set(identifier, {
        count: 1,
        windowStart: now,
      });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
      };
    }

    // Within current window
    if (entry.count < this.maxRequests) {
      entry.count++;
      return {
        allowed: true,
        remaining: this.maxRequests - entry.count,
      };
    }

    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.windowStart + this.windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, retryAfter),
    };
  }

  /**
   * Asynchronous rate limit check.
   * If UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set, uses Redis REST.
   * Gracefully falls back to synchronous in-memory check if Redis is unconfigured or unavailable.
   */
  async checkAsync(identifier: string): Promise<RateLimitResult> {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      return this.check(identifier);
    }

    const key = `${this.prefix}:${identifier}`;
    const windowSeconds = Math.max(1, Math.ceil(this.windowMs / 1000));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800); // 800ms timeout budget

      // Execute atomic INCR pipeline over HTTP
      const response = await fetch(`${redisUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, windowSeconds, "NX"],
          ["TTL", key],
        ]),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.warn(`Upstash Redis rate limit request failed with status ${response.status}; using local limiter fallback`);
        return this.check(identifier);
      }

      const results = await response.json();
      const currentCount = Number(results[0]?.result || 1);
      const ttl = Number(results[2]?.result || windowSeconds);

      if (currentCount <= this.maxRequests) {
        return {
          allowed: true,
          remaining: this.maxRequests - currentCount,
        };
      }

      return {
        allowed: false,
        remaining: 0,
        retryAfter: Math.max(1, ttl),
      };
    } catch (err) {
      logger.warn("Upstash Redis rate limiter error or timeout; gracefully falling back to in-memory check:", err);
      return this.check(identifier);
    }
  }

  reset(identifier: string): void {
    this.cache.delete(identifier);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.windowStart >= this.windowMs) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

/**
 * Factory to create custom RateLimiter instances
 */
export function createRateLimiter(config: RateLimiterConfig): RateLimiter {
  return new RateLimiter(config);
}

// ==========================================
// Pre-configured rate limiters
// ==========================================

/**
 * Admin Login: 5 attempts per 15 minutes per IP + email
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  prefix: "auth_admin_login",
});

export const adminLoginRateLimiter = authRateLimiter;

/**
 * Admin Signup: 5 attempts per hour
 */
export const adminSignupRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
  prefix: "auth_admin_signup",
});

/**
 * Sending Partner Requests: 10 per hour per student
 */
export const partnerRequestRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  prefix: "partner_req",
});

/**
 * Sending Message Requests: 15 per hour per student
 */
export const messageRequestRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 15,
  prefix: "msg_req",
});

/**
 * Legacy request rate limiter alias (kept for backward compatibility)
 */
export const requestRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  prefix: "req",
});

/**
 * Sending Direct Messages: 20 messages per minute per student
 */
export const messageRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,
  prefix: "msg_send",
});

export const messageSendRateLimiter = messageRateLimiter;

/**
 * Editing Messages: 10 edits per minute per student
 */
export const messageEditRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  prefix: "msg_edit",
});

/**
 * Student Profile Updates: 30 updates per minute per student
 */
export const profileUpdateRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  prefix: "profile_update",
});

/**
 * GitHub Repository Metadata Lookups: 10 per minute per student
 */
export const githubMetaRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  prefix: "github_meta",
});

/**
 * General API calls: 100 requests per minute
 */
export const generalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  prefix: "general",
});

/**
 * Extract verified client IP address from request headers.
 * Secure against client-injected X-User-Id or spoofed X-Forwarded-For headers.
 */
export function getClientIdentifier(
  headers: Headers,
  fallback: string = "anonymous"
): string {
  // 1. Edge-verified real IP (Vercel sets this reliably)
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return `ip:${realIp}`;

  // 2. Rightmost valid IP in X-Forwarded-For (least spoofable in reverse proxy chains)
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      const rightmost = parts[parts.length - 1];
      return `ip:${rightmost}`;
    }
  }

  return fallback;
}
