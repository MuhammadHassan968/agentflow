import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { goalService } from '../../src/services/goalService.js';
import { taskService } from '../../src/services/taskService.js';

vi.mock('../../src/services/goalService.js');
vi.mock('../../src/services/taskService.js');

describe('REST API Routes & Validation (API Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/goals', () => {
    it('should reject with 400 when title is missing or empty (Zod validation)', async () => {
      const res = await request(app).post('/api/goals').send({
        description: 'No title provided',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Validation failed');
      expect(res.body.error.details.some((d) => d.field === 'title')).toBe(true);
    });

    it('should return 201 with created goal on valid payload', async () => {
      const payload = { title: 'Launch Website', description: 'MVP launch' };
      const createdGoal = { id: 'g1', ...payload };
      goalService.createGoal.mockResolvedValue(createdGoal);

      const res = await request(app).post('/api/goals').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(createdGoal);
    });
  });

  describe('GET /api/goals', () => {
    it('should return 200 with list of goals', async () => {
      const fakeGoals = [
        { id: 'g1', title: 'Goal 1', metrics: { totalTasks: 2, completedTasks: 1, progressPercent: 50 } },
      ];
      goalService.listGoals.mockResolvedValue(fakeGoals);

      const res = await request(app).get('/api/goals');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(fakeGoals);
    });
  });

  describe('POST /api/goals/:goalId/tasks', () => {
    it('should reject invalid 24-hex-character dependency ObjectIds with 400', async () => {
      const res = await request(app)
        .post('/api/goals/507f1f77bcf86cd799439011/tasks')
        .send({
          title: 'Implement Auth',
          dependencies: ['not-a-valid-24-hex-id'],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Validation failed');
      expect(res.body.error.details.some((d) => d.field.includes('dependencies'))).toBe(true);
    });

    it('should return 201 on valid task creation payload', async () => {
      const validDepId = '507f1f77bcf86cd799439012';
      const createdTask = { id: 't1', title: 'Implement Auth', dependencies: [validDepId] };
      taskService.createTask.mockResolvedValue(createdTask);

      const res = await request(app)
        .post('/api/goals/507f1f77bcf86cd799439011/tasks')
        .send({
          title: 'Implement Auth',
          dependencies: [validDepId],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(createdTask);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should reject invalid status enum with 400', async () => {
      const res = await request(app)
        .put('/api/tasks/507f1f77bcf86cd799439011')
        .send({
          status: 'invalid_status_value',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Validation failed');
    });

    it('should return 200 on valid status update', async () => {
      const updated = { id: 't1', status: 'completed' };
      taskService.updateTask.mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/tasks/507f1f77bcf86cd799439011')
        .send({
          status: 'completed',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
    });
  });
});
