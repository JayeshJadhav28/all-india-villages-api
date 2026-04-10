import prisma from '../config/db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

async function createTestUser() {
  console.log('Creating test user...');

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      businessName: 'Test Company',
      phone: '+919999999999',
      passwordHash: await bcrypt.hash('Test@123456', 12),
      role: 'CLIENT',
      status: 'ACTIVE',
      planType: 'FREE',
      approvedAt: new Date(),
    },
  });

  console.log('✓ User created:', user.email);

  // Generate API key
  const apiKey = `ak_${crypto.randomBytes(16).toString('hex')}`;
  const apiSecret = `as_${crypto.randomBytes(16).toString('hex')}`;
  const secretHash = await bcrypt.hash(apiSecret, 12);

  const key = await prisma.apiKey.create({
    data: {
      userId: user.id,
      name: 'Test Key',
      key: apiKey,
      secretHash: secretHash,
      status: 'ACTIVE',
    },
  });

  console.log('\n✅ Test API Key Created:');
  console.log('========================');
  console.log('API Key:   ', apiKey);
  console.log('API Secret:', apiSecret);
  console.log('========================');
  console.log('\nUse these in your API requests:');
  console.log('X-API-Key:', apiKey);
  console.log('X-API-Secret:', apiSecret);

  await prisma.$disconnect();
}

createTestUser().catch((e) => {
  console.error(e);
  process.exit(1);
});