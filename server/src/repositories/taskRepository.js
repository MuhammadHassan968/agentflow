import { Task } from '../models/Task.js';

/**
 * Task Repository
 * Encapsulates all direct database queries for Task entities.
 */
export const taskRepository = {
  /**
   * Create and persist a new task
   */
  async create(data) {
    const task = new Task(data);
    return task.save();
  },

  /**
   * Find a single task by its ObjectId
   */
  async findById(id) {
    return Task.findById(id).populate('dependencies', 'title status orderIndex');
  },

  /**
   * Find all tasks belonging to a goal, ordered by orderIndex
   */
  async findByGoalId(goalId) {
    return Task.find({ goalId })
      .sort({ orderIndex: 1, createdAt: 1 })
      .populate('dependencies', 'title status orderIndex');
  },

  /**
   * Update a task by its ObjectId
   */
  async updateById(id, updateData) {
    return Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('dependencies', 'title status orderIndex');
  },

  /**
   * Delete a task by its ObjectId
   */
  async deleteById(id) {
    return Task.findByIdAndDelete(id);
  },

  /**
   * Delete all tasks belonging to a goal (used when cascading goal deletion)
   */
  async deleteByGoalId(goalId) {
    return Task.deleteMany({ goalId });
  },

  /**
   * Remove a deleted task ID from all other tasks' dependency lists
   */
  async removeDependencyReferences(goalId, deletedTaskId) {
    return Task.updateMany(
      { goalId, dependencies: deletedTaskId },
      { $pull: { dependencies: deletedTaskId } }
    );
  },

  /**
   * Count tasks matching filter
   */
  async countByGoalId(goalId, filter = {}) {
    return Task.countDocuments({ goalId, ...filter });
  },
};
