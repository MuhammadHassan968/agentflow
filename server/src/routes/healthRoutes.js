import { Router } from 'express';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Liveness & readiness probe to verify the backend server is running
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'agentflow-backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

export default router;
