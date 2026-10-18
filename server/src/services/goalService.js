import { goalRepository } from '../repositories/goalRepository.js';
import { taskRepository } from '../repositories/taskRepository.js';
import { TASK_STATUS } from '../constants/status.js';

/**
 * Goal Service
 * Coordinates domain business logic for Goal entities.
 * Decoupled from HTTP requests/responses and direct database models.
 */
export const goalService = {
  /**
   * Create a new project goal
   */
  async createGoal(data) {
    return goalRepository.create(data);
  },

  /**
   * Get goal by ID with task metrics summary
   */
  async getGoalById(id) {
    const goal = await goalRepository.findById(id);
    if (!goal) {
      const error = new Error(`Goal with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    const tasks = await taskRepository.findByGoalId(id);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === TASK_STATUS.COMPLETED).length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...goal.toJSON(),
      metrics: {
        totalTasks,
        completedTasks,
        progressPercent,
      },
    };
  },

  /**
   * List all goals with progress summaries
   */
  async listGoals() {
    const goals = await goalRepository.findAll();

    // Enrich each goal with quick progress statistics
    const enrichedGoals = await Promise.all(
      goals.map(async (goal) => {
        const totalTasks = await taskRepository.countByGoalId(goal._id);
        const completedTasks = await taskRepository.countByGoalId(goal._id, {
          status: TASK_STATUS.COMPLETED,
        });
        const progressPercent =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...goal.toJSON(),
          metrics: {
            totalTasks,
            completedTasks,
            progressPercent,
          },
        };
      })
    );

    return enrichedGoals;
  },

  /**
   * Update goal by ID
   */
  async updateGoal(id, updateData) {
    const existing = await goalRepository.findById(id);
    if (!existing) {
      const error = new Error(`Goal with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return goalRepository.updateById(id, updateData);
  },

  /**
   * Delete goal and cascade-delete all associated tasks
   */
  async deleteGoal(id) {
    const existing = await goalRepository.findById(id);
    if (!existing) {
      const error = new Error(`Goal with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    // Cascade delete associated tasks
    await taskRepository.deleteByGoalId(id);
    return goalRepository.deleteById(id);
  },
};
