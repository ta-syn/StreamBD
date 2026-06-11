import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiter using Upstash Redis (Vercel serverless compatible).
 * Falls back gracefully when env vars are not configured (local dev).
 */

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  try {
    const redis = new Redis({ url, token });
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 h"),
    });
    return ratelimit;
  } catch {
    return null;
  }
}

export async function rateLimit(
  ip: string
): Promise<{ success: boolean; remaining: number }> {
  const limiter = getRatelimit();

  if (!limiter) {
    return { success: true, remaining: 100 };
  }

  try {
    const { success, remaining } = await limiter.limit(ip);
    return {
      success,
      remaining: Math.max(0, remaining),
    };
  } catch {
    // Rate limiter failure should not block requests
    console.warn("Rate limiter error, allowing request");
    return { success: true, remaining: 100 };
  }
}
