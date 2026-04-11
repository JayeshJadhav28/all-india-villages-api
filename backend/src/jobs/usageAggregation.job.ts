import prisma from '../config/db.js';

type UsageRow = {
  userId: string;
  apiKeyId: string;
  date: string; // YYYY-MM-DD
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  avgResponseTimeMs: number;
};

export async function aggregateUsageDaily(dateYYYYMMDD: string) {
  const start = new Date(`${dateYYYYMMDD}T00:00:00.000Z`);
  const end = new Date(`${dateYYYYMMDD}T00:00:00.000Z`);
  end.setUTCDate(end.getUTCDate() + 1);

  const rows = await prisma.$queryRaw<UsageRow[]>`
    SELECT
      "userId" as "userId",
      "apiKeyId" as "apiKeyId",
      to_char(date("createdAt"), 'YYYY-MM-DD') as "date",
      COUNT(*)::int as "totalRequests",
      COUNT(*) FILTER (WHERE "statusCode" BETWEEN 200 AND 299)::int as "successRequests",
      COUNT(*) FILTER (WHERE "statusCode" >= 400)::int as "failedRequests",
      COALESCE(AVG("responseTimeMs"), 0)::int as "avgResponseTimeMs"
    FROM "api_logs"
    WHERE "createdAt" >= ${start} AND "createdAt" < ${end}
    GROUP BY "userId", "apiKeyId", date("createdAt");
  `;

  const dateObj = new Date(`${dateYYYYMMDD}T00:00:00.000Z`);

  for (const r of rows) {
    await prisma.usageDaily.upsert({
      where: {
        userId_apiKeyId_date: {
          userId: r.userId,
          apiKeyId: r.apiKeyId,
          date: dateObj,
        },
      },
      create: {
        userId: r.userId,
        apiKeyId: r.apiKeyId,
        date: dateObj,
        totalRequests: r.totalRequests,
        successRequests: r.successRequests,
        failedRequests: r.failedRequests,
        avgResponseTimeMs: r.avgResponseTimeMs,
      },
      update: {
        totalRequests: r.totalRequests,
        successRequests: r.successRequests,
        failedRequests: r.failedRequests,
        avgResponseTimeMs: r.avgResponseTimeMs,
      },
    });
  }

  return { date: dateYYYYMMDD, groups: rows.length };
}