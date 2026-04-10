import prisma from '../config/db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Dashboard summary
export const getDashboardSummary = async (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [user, todayUsage, totalKeys] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        planType: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.apiLog.count({
      where: {
        userId,
        createdAt: { gte: today },
      },
    }),
    prisma.apiKey.count({
      where: {
        userId,
        status: 'ACTIVE',
      },
    }),
  ]);

  return {
    plan: user?.planType,
    status: user?.status,
    requestsToday: todayUsage,
    activeKeys: totalKeys,
    memberSince: user?.createdAt,
  };
};

// Get user's API keys
export const getUserApiKeys = async (userId: string) => {
  return prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      key: true,
      status: true,
      expiresAt: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// Create API key
export const createApiKey = async (userId: string, name: string) => {
  // Check if user already has 5 keys
  const existingKeys = await prisma.apiKey.count({
    where: {
      userId,
      status: 'ACTIVE',
    },
  });

  if (existingKeys >= 5) {
    throw new Error('MAX_KEYS_REACHED');
  }

  // Generate key and secret
  const apiKey = `ak_${crypto.randomBytes(16).toString('hex')}`;
  const apiSecret = `as_${crypto.randomBytes(16).toString('hex')}`;
  const secretHash = await bcrypt.hash(apiSecret, 12);

  const key = await prisma.apiKey.create({
    data: {
      userId,
      name,
      key: apiKey,
      secretHash,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      key: true,
      createdAt: true,
    },
  });

  return {
    ...key,
    secret: apiSecret, // Only shown once
  };
};

// Revoke API key
export const revokeApiKey = async (userId: string, keyId: string) => {
  await prisma.apiKey.updateMany({
    where: {
      id: keyId,
      userId, // Ensure user owns this key
    },
    data: {
      status: 'REVOKED',
    },
  });
};

// Get usage stats
// Get usage stats
export const getUsageStats = async (userId: string, days: number) => {
  const safeDays = Math.max(1, Math.min(days || 30, 90)); // clamp 1..90

  // UTC midnight range start (includes today)
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - (safeDays - 1));
  startDate.setUTCHours(0, 0, 0, 0);

  // 1) Try UsageDaily first (fast path)
  const usageRows = await prisma.usageDaily.findMany({
    where: {
      userId,
      date: { gte: startDate },
    },
    select: {
      date: true,
      totalRequests: true,
      successRequests: true,
      failedRequests: true,
      avgResponseTimeMs: true,
    },
    orderBy: { date: 'asc' },
  });

  // If UsageDaily is empty (likely before your aggregation job runs), fallback to ApiLog aggregation
  if (usageRows.length === 0) {
    const raw = await prisma.$queryRaw<
      { date: string; requests: number; success: number; failed: number; avgResponseTimeMs: number }[]
    >`
      SELECT
        to_char(date("createdAt"), 'YYYY-MM-DD') as "date",
        COUNT(*)::int as "requests",
        COUNT(*) FILTER (WHERE "statusCode" BETWEEN 200 AND 299)::int as "success",
        COUNT(*) FILTER (WHERE "statusCode" >= 400)::int as "failed",
        COALESCE(AVG("responseTimeMs"), 0)::int as "avgResponseTimeMs"
      FROM "api_logs"
      WHERE "userId" = ${userId}
        AND "createdAt" >= ${startDate}
      GROUP BY date("createdAt")
      ORDER BY date("createdAt") ASC;
    `;

    const map = new Map(raw.map((r) => [r.date, r]));

    const daily = [];
    let totalRequests = 0;
    let successRequests = 0;
    let failedRequests = 0;

    for (let i = 0; i < safeDays; i++) {
      const d = new Date(startDate);
      d.setUTCDate(d.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10);

      const row = map.get(key);
      const requests = row?.requests ?? 0;

      daily.push({ date: key, requests });

      totalRequests += requests;
      successRequests += row?.success ?? 0;
      failedRequests += row?.failed ?? 0;
    }

    const successRate = totalRequests > 0 ? (successRequests / totalRequests) * 100 : 0;

    return {
      totalRequests,
      successRate,
      failedRequests,
      daily, // <-- matches frontend Usage.tsx
      source: 'api_logs',
    };
  }

  // 2) If UsageDaily exists, build series + also include TODAY from ApiLog (since daily aggregation may not include today yet)
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const [todayTotal, todaySuccess, todayFailed] = await Promise.all([
    prisma.apiLog.count({
      where: { userId, createdAt: { gte: todayStart } },
    }),
    prisma.apiLog.count({
      where: { userId, createdAt: { gte: todayStart }, statusCode: { gte: 200, lt: 300 } },
    }),
    prisma.apiLog.count({
      where: { userId, createdAt: { gte: todayStart }, statusCode: { gte: 400 } },
    }),
  ]);

  const usageMap = new Map(
    usageRows.map((r) => [r.date.toISOString().slice(0, 10), r])
  );

  const daily: { date: string; requests: number }[] = [];

  let totalRequests = 0;
  let successRequests = 0;
  let failedRequests = 0;

  for (let i = 0; i < safeDays; i++) {
    const d = new Date(startDate);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);

    // If key is today, use live ApiLog counts
    const isToday = key === new Date().toISOString().slice(0, 10);

    const requests = isToday ? todayTotal : (usageMap.get(key)?.totalRequests ?? 0);

    daily.push({ date: key, requests });

    totalRequests += requests;

    if (isToday) {
      successRequests += todaySuccess;
      failedRequests += todayFailed;
    } else {
      successRequests += usageMap.get(key)?.successRequests ?? 0;
      failedRequests += usageMap.get(key)?.failedRequests ?? 0;
    }
  }

  const successRate = totalRequests > 0 ? (successRequests / totalRequests) * 100 : 0;

  return {
    totalRequests,
    successRate,
    failedRequests,
    daily, // <-- matches frontend Usage.tsx
    source: 'usage_daily+today_api_logs',
  };
};

// Update profile
export const updateProfile = async (
  userId: string,
  data: {
    businessName?: string;
    phone?: string;
    gstNumber?: string;
  }
) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      businessName: true,
      phone: true,
      gstNumber: true,
    },
  });
};