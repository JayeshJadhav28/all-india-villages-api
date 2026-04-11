import cron from 'node-cron';
import { aggregateUsageDaily } from './usageAggregation.job.js';
import { withRedisLock } from '../utils/redisLock.js';

function yyyymmddUTC(d: Date) {
  return d.toISOString().slice(0, 10);
}

function getYesterdayUTC() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return yyyymmddUTC(d);
}

function getTodayUTC() {
  return yyyymmddUTC(new Date());
}

export function startUsageSchedulers() {
  const enabled = (process.env.USAGE_AGG_ENABLED ?? 'true') === 'true';
  if (!enabled) {
    console.log('[usage-agg] disabled (USAGE_AGG_ENABLED=false)');
    return;
  }

  // Daily aggregation for yesterday (recommended)
  const dailyCron = process.env.USAGE_AGG_DAILY_CRON ?? '10 0 * * *'; // 00:10 UTC
  cron.schedule(
    dailyCron,
    async () => {
      const date = getYesterdayUTC();
      const lockKey = `lock:usageAgg:${date}`;

      console.log(`[usage-agg] daily start date=${date}`);
      const locked = await withRedisLock(lockKey, 60 * 30, () => aggregateUsageDaily(date));

      if (!locked.ok) {
        console.log(`[usage-agg] daily skipped (locked) date=${date}`);
        return;
      }

      console.log('[usage-agg] daily done', locked.result);
    },
    { timezone: process.env.TZ || 'UTC' }
  );

  // Optional: refresh "today" periodically (nice for dev)
  const todayCron = process.env.USAGE_AGG_TODAY_CRON ?? ''; // e.g. "0 * * * *" hourly
  if (todayCron) {
    cron.schedule(
      todayCron,
      async () => {
        const date = getTodayUTC();
        const lockKey = `lock:usageAgg:${date}:today`;

        console.log(`[usage-agg] today refresh start date=${date}`);
        const locked = await withRedisLock(lockKey, 60 * 10, () => aggregateUsageDaily(date));

        if (!locked.ok) {
          console.log(`[usage-agg] today refresh skipped (locked) date=${date}`);
          return;
        }

        console.log('[usage-agg] today refresh done', locked.result);
      },
      { timezone: process.env.TZ || 'UTC' }
    );
  }

  // Optional: run once on boot (useful in dev)
  const runOnBoot = (process.env.USAGE_AGG_RUN_ON_BOOT ?? 'false') === 'true';
  if (runOnBoot) {
    const date = getYesterdayUTC();
    const lockKey = `lock:usageAgg:${date}:boot`;
    withRedisLock(lockKey, 60 * 10, () => aggregateUsageDaily(date))
      .then((r) => r.ok && console.log('[usage-agg] boot run done', r.result))
      .catch((e) => console.error('[usage-agg] boot run error', e));
  }

  console.log('[usage-agg] scheduler started', { dailyCron, todayCron, tz: process.env.TZ || 'UTC' });
}