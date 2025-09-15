// src/config/config.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  mongoUri: process.env.MONGO_URI || '',
  mongoDbName: process.env.MONGO_DB_NAME || 'insights_db',
  loggly: {
    enabled: process.env.LOGGLY_ENABLED,
    token: process.env.LOGGLY_TOKEN || '',
    subdomain: process.env.LOGGLY_SUBDOMAIN || '',
    tags: process.env.LOGGLY_TAGS || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: process.env.JWT_EXPIRATION || '1d',
    issuer: 'Aryabytes',
  },
  llm: {
    apiUrl: process.env.LLM_API_URL || '',
    apiKey: process.env.LLM_API_KEY || '',
  },
};
