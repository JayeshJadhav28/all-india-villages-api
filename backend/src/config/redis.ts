import Redis from 'ioredis';
import { config } from './env.js';

// Create Redis client
const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

// Connection event handlers
redis.on('connect', () => {
  console.log('✓ Redis connected successfully');
});

redis.on('error', (error) => {
  console.error('✗ Redis connection error:', error);
});

redis.on('close', () => {
  console.log('✓ Redis connection closed');
});

// Test connection
export async function connectRedis() {
  try {
    await redis.connect();
    await redis.ping();
    console.log('✓ Redis ping successful');
  } catch (error) {
    console.error('✗ Redis connection failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
export async function disconnectRedis() {
  await redis.quit();
  console.log('✓ Redis disconnected');
}

export default redis;