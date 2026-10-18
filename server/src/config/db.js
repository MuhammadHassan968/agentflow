import mongoose from 'mongoose';
import { config } from './env.js';

/**
 * Connect to MongoDB using Mongoose
 * 
 * In a Node.js + Mongoose application, mongoose maintains an internal connection pool.
 * We connect once when the server boots up, and Mongoose handles queueing and executing
 * queries across all subsequent HTTP requests.
 */
export async function connectDB(uri = config.mongodbUri) {
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if server unreachable
    });

    console.log(`[Database] MongoDB connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Could not connect to MongoDB: ${error.message}`);
    console.warn(`[Database Hint] Make sure MongoDB is running locally or specify a valid MONGODB_URI in server/.env (e.g. MongoDB Atlas free tier).`);
    // In production or test with strict DB dependency, re-throw if needed
    if (config.nodeEnv === 'production') {
      throw error;
    }
    return null;
  }
}

/**
 * Disconnect from MongoDB (useful for clean test teardowns and graceful shutdown)
 */
export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[Database] MongoDB disconnected cleanly.');
  }
}
