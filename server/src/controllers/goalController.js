import { goalService } from '../services/goalService.js';

/**
 * Goal Controller
 * Thin HTTP translation layer. Unpacks requests, invokes goalService,
 * and returns structured JSON responses.
 */
export const goalController = {
  /**
   * POST /api/goals
   */
  async create(req, res, next) {
    try {
      const goal = await goalService.createGoal(req.body);
      res.status(201).json({
        success: true,
        data: goal,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/goals
   */
  async list(req, res, next) {
    try {
      const goals = await goalService.listGoals();
      res.status(200).json({
        success: true,
        data: goals,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/goals/:id
   */
  async getById(req, res, next) {
    try {
      const goal = await goalService.getGoalById(req.params.id);
      res.status(200).json({
        success: true,
        data: goal,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/goals/:id
   */
  async update(req, res, next) {
    try {
      const goal = await goalService.updateGoal(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: goal,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/goals/:id
   */
  async delete(req, res, next) {
    try {
      await goalService.deleteGoal(req.params.id);
      res.status(200).json({
        success: true,
        data: { message: `Goal '${req.params.id}' and associated tasks deleted successfully` },
      });
    } catch (err) {
      next(err);
    }
  },
};
