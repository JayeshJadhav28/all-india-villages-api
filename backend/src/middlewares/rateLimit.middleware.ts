import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis.js';

const PLAN_LIMITS = {
  FREE: 5000,
  PREMIUM: 50000,
  PRO: 300000,
  UNLIMITED: 1000000,
} as const;

const BURST_LIMITS = {
  FREE: 100,
  PREMIUM: 500,
  PRO: 2000,
  UNLIMITED: 5000,
} as const;

function getSecondsUntilMidnight(now: Date) {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return Math.max(1, Math.floor((tomorrow.getTime() - now.getTime()) / 1000));
}

function getMidnightEpochSeconds(now: Date) {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return Math.floor(tomorrow.getTime() / 1000);
}

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next();

    const userId = req.user.id;
    const planType = (req.user.planType || 'FREE') as keyof typeof PLAN_LIMITS;

    const dailyLimit = PLAN_LIMITS[planType] ?? PLAN_LIMITS.FREE;
    const burstLimit = BURST_LIMITS[planType] ?? BURST_LIMITS.FREE;

    const now = new Date();
    const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const minuteBucket = `${today}:${now.getHours()}:${now.getMinutes()}`;

    // Burst per minute
    const burstKey = `rate:burst:${userId}:${minuteBucket}`;
    const burstCount = await redis.incr(burstKey);
    if (burstCount === 1) await redis.expire(burstKey, 60);

    if (burstCount > burstLimit) {
      return res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Too many requests per minute' },
      });
    }

    // Daily
    const dailyKey = `rate:daily:${userId}:${today}`;
    const dailyCount = await redis.incr(dailyKey);
    if (dailyCount === 1) {
      await redis.expire(dailyKey, getSecondsUntilMidnight(now));
    }

    if (dailyCount > dailyLimit) {
      return res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Daily request limit exceeded' },
      });
    }

    // Headers (spec expects reset as epoch seconds)
    res.setHeader('X-RateLimit-Limit', String(dailyLimit));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, dailyLimit - dailyCount)));
    res.setHeader('X-RateLimit-Reset', String(getMidnightEpochSeconds(now)));

    next();
  } catch (error) {
    console.error('Rate Limit Error:', error);
    // Don’t block traffic if Redis fails
    next();
  }
};