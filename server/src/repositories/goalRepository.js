import { Goal } from '../models/Goal.js';

/**
 * Goal Repository
 * Encapsulates all direct database queries for Goal entities.
 * The Service layer interacts only through this interface.
 */
export const goalRepository = {
  /**
   * Create and persist a new goal
   */
  async create(data) {
    const goal = new Goal(data);
    return goal.save();
  },

  /**
   * Find a single goal by its ObjectId
   */
  async findById(id) {
    return Goal.findById(id);
  },

  /**
   * Find all goals, sorted by creation date descending
   */
  async findAll(filter = {}) {
    return Goal.find(filter).sort({ createdAt: -1 });
  },

  /**
   * Update a goal by its ObjectId
   */
  async updateById(id, updateData) {
    return Goal.findByIdAndUpdate(id, updateData, {
      new: true, // Return updated document
      runValidators: true, // Run Mongoose schema validators on update
    });
  },

  /**
   * Delete a goal by its ObjectId
   */
  async deleteById(id) {
    return Goal.findByIdAndDelete(id);
  },

  /**
   * Count goals matching filter
   */
  async count(filter = {}) {
    return Goal.countDocuments(filter);
  },
};
