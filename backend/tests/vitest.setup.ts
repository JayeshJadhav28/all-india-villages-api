import dotenv from 'dotenv';
import { beforeAll, beforeEach, afterAll, vi } from 'vitest';
import bcrypt from 'bcrypt';

// 1) Prefer .env.test (recommended). Fallback to .env.
dotenv.config({ path: '.env.test' });
dotenv.config();

// 2) Ensure required env vars exist for src/config/env.ts validation
process.env.NODE_ENV ||= 'test';
process.env.PORT ||= '3001';
process.env.FRONTEND_URL ||= 'http://localhost:5173';
process.env.JWT_SECRET ||= 'test_jwt_secret';
process.env.DATABASE_URL ||= 'postgresql://USER:PASS@localhost:5432/aiv_test'; // set your real test DB
process.env.REDIS_URL ||= 'redis://localhost:6379'; // not used due to mock

process.env.ADMIN_EMAIL ||= '';
process.env.ADMIN_PASSWORD ||= '';

// 3) Mock ioredis globally -> your config/redis.ts becomes in-memory
vi.mock('ioredis', async () => {
  const mod = await import('ioredis-mock');
  return { default: mod.default };
});

let prisma: any;

beforeAll(async () => {
  // dynamic import after env is ready + redis mocked
  prisma = (await import('../src/config/db.js')).default;

  await prisma.$connect();

  // Ensure admin exists (so we can login as admin in tests)
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 12);
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL! },
    update: {
      role: 'ADMIN',
      status: 'ACTIVE',
      planType: 'UNLIMITED',
    },
    create: {
      email: process.env.ADMIN_EMAIL!,
      businessName: 'Platform Admin',
      phone: '+910000000000',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      planType: 'UNLIMITED',
      approvedAt: new Date(),
    },
  });
});

beforeEach(async () => {
  // wipe data that tests create; keep admin
  await prisma.apiLog.deleteMany();
  await prisma.usageDaily.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.userStateAccess.deleteMany();
  await prisma.user.deleteMany({ where: { role: 'CLIENT' } });
});

afterAll(async () => {
  if (prisma) await prisma.$disconnect();
});