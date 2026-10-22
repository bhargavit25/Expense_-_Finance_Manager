const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server/.env
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Validate required environment variables
const missingVars = [];

if (!process.env.DATABASE_URL) {
  missingVars.push('DATABASE_URL');
}

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  missingVars.push('JWT_SECRET');
}

if (missingVars.length > 0) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      `[FATAL CONFIG ERROR] Missing required production environment variables: ${missingVars.join(
        ', '
      )}. Please configure them in server/.env or your deployment dashboard.`
    );
  } else {
    console.warn(
      `⚠️ [CONFIG WARNING] Missing environment variable(s): ${missingVars.join(
        ', '
      )}. Please set them in server/.env for database operations.`
    );
  }
}

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/expense_db?schema=public',
  jwtSecret:
    process.env.JWT_SECRET ||
    'dev_jwt_secret_super_secure_key_change_in_production_12345!',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  cronSchedule: process.env.CRON_SCHEDULE || '0 0 * * *', // Daily at midnight
};

module.exports = config;
