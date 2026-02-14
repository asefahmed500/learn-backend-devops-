import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  // Server
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'changeme',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // Pagination defaults
  defaultPage: 1,
  defaultLimit: 10,
  maxLimit: 100,

  // Bcrypt
  saltRounds: 10,

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
} as const;

export type Config = typeof config;
