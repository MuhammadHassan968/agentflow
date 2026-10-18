import app from './app.js';
import { config } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

/**
 * Server Bootstrapper
 * Connects to MongoDB, then binds the Express app to the network port.
 */
async function startServer() {
  // Connect to MongoDB
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`===============================================`);
    console.log(` AgentFlow Backend Service Started             `);
    console.log(` Local URL:    http://localhost:${config.port}         `);
    console.log(` Health Probe: http://localhost:${config.port}/api/health `);
    console.log(` Goals API:    http://localhost:${config.port}/api/goals  `);
    console.log(` Environment:  ${config.nodeEnv}                 `);
    console.log(` Client CORS:  ${config.clientOrigin}     `);
    console.log(`===============================================`);
  });

  // Graceful shutdown handling for OS signals (SIGINT, SIGTERM)
  const shutdown = async (signal) => {
    console.log(`\n[AgentFlow] Received ${signal}. Closing server gracefully...`);
    server.close(async () => {
      console.log('[AgentFlow] HTTP server closed cleanly.');
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((err) => {
  console.error('[Fatal Error] Failed to start server:', err);
  process.exit(1);
});
