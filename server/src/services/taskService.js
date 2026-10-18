import { taskRepository } from '../repositories/taskRepository.js';
import { goalRepository } from '../repositories/goalRepository.js';
import { TASK_STATUS } from '../constants/status.js';
import { wouldCreateCycle, evaluateTaskReadiness } from '../utils/dag.js';

/**
 * Task Service
 * Coordinates business logic for tasks, including DAG dependency validation,
 * cycle prevention, and status cascading.
 */
export const taskService = {
  /**
   * Create a new task under a goal with DAG cycle prevention
   */
  async createTask(goalId, data) {
    const goal = await goalRepository.findById(goalId);
    if (!goal) {
      const error = new Error(`Goal with ID '${goalId}' not found`);
      error.statusCode = 404;
      throw error;
    }

    const existingTasks = await taskRepository.findByGoalId(goalId);

    // Validate dependencies if provided
    const proposedDependencies = data.dependencies || [];
    if (proposedDependencies.length > 0) {
      // 1. Verify dependencies belong to the same goal
      const existingIds = new Set(existingTasks.map((t) => t._id.toString()));
      for (const depId of proposedDependencies) {
        if (!existingIds.has(depId.toString())) {
          const error = new Error(
            `Dependency task '${depId}' does not exist in Goal '${goalId}'`
          );
          error.statusCode = 400;
          throw error;
        }
      }

      // 2. Check that adding these dependencies does not create a cycle
      const cycleCheck = wouldCreateCycle(existingTasks, null, proposedDependencies);
      if (cycleCheck.wouldCycle) {
        const error = new Error(`Cannot add dependencies: ${cycleCheck.reason}`);
        error.statusCode = 400;
        throw error;
      }
    }

    // Determine default orderIndex (at the end of existing tasks)
    const orderIndex =
      data.orderIndex !== undefined ? data.orderIndex : existingTasks.length;

    // Evaluate initial readiness
    let initialStatus = data.status || TASK_STATUS.PENDING;
    if (initialStatus === TASK_STATUS.PENDING) {
      const taskMap = new Map(existingTasks.map((t) => [t._id.toString(), t]));
      initialStatus = evaluateTaskReadiness(
        { status: initialStatus, dependencies: proposedDependencies },
        taskMap
      );
    }

    return taskRepository.create({
      ...data,
      goalId,
      orderIndex,
      status: initialStatus,
    });
  },

  /**
   * Get all tasks for a specific goal
   */
  async getTasksByGoal(goalId) {
    const goal = await goalRepository.findById(goalId);
    if (!goal) {
      const error = new Error(`Goal with ID '${goalId}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return taskRepository.findByGoalId(goalId);
  },

  /**
   * Get a single task by ID
   */
  async getTaskById(id) {
    const task = await taskRepository.findById(id);
    if (!task) {
      const error = new Error(`Task with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }
    return task;
  },

  /**
   * Update task with DAG cycle checking and automatic downstream cascading
   */
  async updateTask(id, updateData) {
    const task = await taskRepository.findById(id);
    if (!task) {
      const error = new Error(`Task with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    const goalId = task.goalId;
    const existingTasks = await taskRepository.findByGoalId(goalId);

    // If updating dependencies, run cycle validation
    if (updateData.dependencies) {
      const existingIds = new Set(
        existingTasks.map((t) => t._id.toString()).filter((tId) => tId !== id.toString())
      );

      for (const depId of updateData.dependencies) {
        if (!existingIds.has(depId.toString())) {
          const error = new Error(
            `Dependency task '${depId}' does not exist or is invalid in this goal`
          );
          error.statusCode = 400;
          throw error;
        }
      }

      const cycleCheck = wouldCreateCycle(existingTasks, id, updateData.dependencies);
      if (cycleCheck.wouldCycle) {
        const error = new Error(`Cannot update dependencies: ${cycleCheck.reason}`);
        error.statusCode = 400;
        throw error;
      }
    }

    // Update the task document
    const updatedTask = await taskRepository.updateById(id, updateData);

    // If status became COMPLETED, cascade check downstream tasks to promote 'pending' to 'ready'
    if (updateData.status === TASK_STATUS.COMPLETED) {
      const refreshedTasks = await taskRepository.findByGoalId(goalId);
      const taskMap = new Map(refreshedTasks.map((t) => [t._id.toString(), t]));

      for (const t of refreshedTasks) {
        if (t.status === TASK_STATUS.PENDING) {
          const newStatus = evaluateTaskReadiness(t, taskMap);
          if (newStatus === TASK_STATUS.READY) {
            await taskRepository.updateById(t._id, { status: TASK_STATUS.READY });
          }
        }
      }
    }

    return updatedTask;
  },

  /**
   * Delete task and clean up dependency references
   */
  async deleteTask(id) {
    const task = await taskRepository.findById(id);
    if (!task) {
      const error = new Error(`Task with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    // Clean up references to this task in other tasks' dependencies
    await taskRepository.removeDependencyReferences(task.goalId, task._id);

    return taskRepository.deleteById(id);
  },
};
