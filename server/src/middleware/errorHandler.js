import { config } from '../config/env.js';

/**
 * Centralized Error Handling Middleware
 * In Express, defining an error middleware requires exactly four arguments: (err, req, res, next).
 * Whenever a controller or middleware calls next(err) or throws an unhandled error,
 * Express skips all remaining routes and transfers execution directly to this handler.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error details for server-side debugging
  console.error(`[Error] ${req.method} ${req.url} - Status ${statusCode}: ${message}`);
  if (err.stack && config.nodeEnv === 'development') {
    console.error(err.stack);
  }

  // Send consistent, sanitized JSON error response to client
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      // Only expose call stack in development mode to prevent leaking internals in production
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    },
  });
};
