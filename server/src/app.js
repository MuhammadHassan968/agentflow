import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import healthRoutes from './routes/healthRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

/**
 * Express Application Setup
 * Modular Monolith routing pipeline
 */
const app = express();

// 1. Request logging (skip in test environment to keep test output clean)
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// 2. CORS middleware
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
);

// 3. Built-in JSON body parser
app.use(express.json());

// 4. API Routes
app.use('/api/health', healthRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/tasks', taskRoutes);

// 5. Catch-all for undefined routes
app.use(notFoundHandler);

// 6. Centralized Error Handler (must be the last middleware mounted)
app.use(errorHandler);

export default app;
