import dotenv from 'dotenv';

// Load environment variables from .env file into process.env
dotenv.config();

/**
 * Centralized Configuration Object
 * Having a single source of truth for config prevents scattered process.env calls
 * and makes it easy to set defaults or validate variables.
 */
export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/agentflow',
};
