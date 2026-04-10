import app from './app.js';
import { config } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { startUsageSchedulers } from './jobs/usageScheduler.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDatabase();

    await connectRedis();

    // Start cron jobs AFTER Redis connects
    startUsageSchedulers();

    app.listen(PORT, () => {
      console.log(`
        ╔════════════════════════════════════════╗
        ║  AllIndia Villages API Server          ║
        ╠════════════════════════════════════════╣
        ║  Environment: ${config.server.env.padEnd(25)} ║
        ║  Port:        ${PORT.toString().padEnd(25)} ║
        ║  Database:    Connected ✓              ║
        ║  Redis:       Connected ✓              ║
        ║  Status:      Running ✓                ║
        ╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await disconnectDatabase();
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await disconnectDatabase();
  await disconnectRedis();
  process.exit(0);
});

startServer();