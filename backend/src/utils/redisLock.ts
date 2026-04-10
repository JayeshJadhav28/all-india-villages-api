import redis from '../config/redis.js';

const UNLOCK_LUA = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

export async function withRedisLock<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<{ ok: true; result: T } | { ok: false; reason: 'LOCKED' }> {
  const lockValue = `${process.pid}:${Date.now()}`;

  // SET key value NX EX ttl
  const acquired = await redis.set(key, lockValue, 'NX', 'EX', ttlSeconds);
  if (acquired !== 'OK') return { ok: false, reason: 'LOCKED' };

  try {
    const result = await fn();
    return { ok: true, result };
  } finally {
    try {
      await redis.eval(UNLOCK_LUA, 1, key, lockValue);
    } catch {
      // ignore unlock errors
    }
  }
}