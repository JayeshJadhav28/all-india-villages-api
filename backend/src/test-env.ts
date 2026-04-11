import { config } from './config/env.js';

console.log('Environment Configuration:');
console.log('========================');
console.log('Database URL:', config.database.url.substring(0, 30) + '...');
console.log('Redis URL:', config.redis.url.substring(0, 30) + '...');
console.log('JWT Secret:', config.jwt.secret.substring(0, 10) + '...');
console.log('Port:', config.server.port);
console.log('Environment:', config.server.env);
console.log('CORS Origin:', config.cors.origin);