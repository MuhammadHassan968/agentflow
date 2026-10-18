import { taskService } from '../services/taskService.js';

/**
 * Task Controller
 * Thin HTTP translation layer for Task endpoints.
 */
export const taskController = {
  /**
   * POST /api/goals/:goalId/tasks
   */
  async create(req, res, next) {
    try {
      const task = await taskService.createTask(req.params.goalId, req.body);
      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/goals/:goalId/tasks
   */
  async listByGoal(req, res, next) {
    try {
      const tasks = await taskService.getTasksByGoal(req.params.goalId);
      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/tasks/:id
   */
  async getById(req, res, next) {
    try {
      const task = await taskService.getTaskById(req.params.id);
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/tasks/:id
   */
  async update(req, res, next) {
    try {
      const task = await taskService.updateTask(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/tasks/:id
   */
  async delete(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id);
      res.status(200).json({
        success: true,
        data: { message: `Task '${req.params.id}' deleted successfully` },
      });
    } catch (err) {
      next(err);
    }
  },
};
