import redis from '../config/redis.js';

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    // Redis down or JSON parse error -> just behave like cache miss
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number) {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // Ignore cache set failures
  }
}

export function normalizeQuery(q: string) {
  return q.trim().toLowerCase();
}

export function safeKeyPart(s: string) {
  // avoids spaces/special chars blowing up redis keys
  return encodeURIComponent(s);
}