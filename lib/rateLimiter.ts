// lib/rateLimiter.ts
import LoginAttempt from "../models/LoginAttempt";

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MINUTES = 2;

export async function checkRateLimit(ip: string, email?: string) {
    const key = `${ip}_${email || "none"}`;
    const now = new Date();

    let attempt = await LoginAttempt.findOne({ key });

    if (attempt) {
        // if blocked
        if (attempt.blockedUntil && attempt.blockedUntil > now) {
            const remainingTime = Math.ceil(
                (attempt.blockedUntil.getTime() - now.getTime()) / 60000
            );
            return {
                blocked: true,
                message: `Too many failed attempts. Try again in ${remainingTime} minutes.`,
            };
        }

        // reset window after 10 minutes
        const windowExpired = now.getTime() - attempt.firstAttemptAt.getTime() > 10 * 60 * 1000;
        if (windowExpired) {
            attempt.count = 0;
            attempt.firstAttemptAt = now;
        }
    } else {
        attempt = new LoginAttempt({ key });
    }

    return { attempt, blocked: false };
}

export async function recordFailedAttempt(attempt: any) {
    attempt.count += 1;

    if (attempt.count >= MAX_ATTEMPTS) {
        attempt.blockedUntil = new Date(Date.now() + BLOCK_DURATION_MINUTES * 60 * 1000);
    }

    await attempt.save();

    const remaining = Math.max(0, MAX_ATTEMPTS - attempt.count);
    return {
        remaining,
        blocked: !!attempt.blockedUntil,
    };
}

export async function resetAttempts(ip: string, email?: string) {
    const key = `${ip}_${email || "none"}`;
    await LoginAttempt.deleteOne({ key });
}
