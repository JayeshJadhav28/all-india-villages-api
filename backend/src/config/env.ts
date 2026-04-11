import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// Required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'NODE_ENV',
  'PORT',
  'FRONTEND_URL',
];

// Validate all required vars exist
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Export validated config
export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  redis: {
    url: process.env.REDIS_URL!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: '24h',
  },
  server: {
    port: parseInt(process.env.PORT!, 10) || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  cors: {
    origin: process.env.FRONTEND_URL!,
    credentials: true,
  },
  admin: {
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
  },
} as const;