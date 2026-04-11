import { PrismaClient } from '@prisma/client';
import { config } from './env.js';

// Extend PrismaClient with custom logging
const prisma = new PrismaClient({
  log: config.server.env === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

// Test connection
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✓ Database connected successfully');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('✓ Database disconnected');
}

export default prisma;