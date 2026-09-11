import dotenv from 'dotenv';
import path from 'path';

// Load .env searching root and server dirs
[
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env')
].forEach((envPath) => dotenv.config({ path: envPath }));

const rawMongoUri = (process.env.MONGODB_URI || 'mongodb://localhost:27017/coop_marketplace').trim().replace(/^["']|["']$/g, '').trim();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: rawMongoUri,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key_coop_2026_dev',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_coop_2026_dev',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_coop_key',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_coop_secret',
  },
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
