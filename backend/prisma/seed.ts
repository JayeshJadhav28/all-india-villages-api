import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create India
  const india = await prisma.country.upsert({
    where: { code: 'IN' },
    update: {},
    create: {
      code: 'IN',
      name: 'India',
    },
  });

  console.log('✓ Created country: India');

  // 2. Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || '';
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      businessName: 'Platform Admin',
      phone: '+910000000000',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      planType: 'UNLIMITED',
      approvedAt: new Date(),
    },
  });

  console.log('✓ Created admin user:', adminEmail);
  console.log('  Password:', adminPassword);

  console.log('\n✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });