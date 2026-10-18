import mongoose from 'mongoose';
import { TASK_STATUS } from '../constants/status.js';

/**
 * Task Mongoose Schema
 * Represents an individual actionable unit of work belonging to a Goal.
 * Tasks can have dependencies on other tasks within the same Goal, forming a Directed Acyclic Graph (DAG).
 */
const TaskSchema = new mongoose.Schema(
  {
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: [true, 'Task must belong to a Goal'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.PENDING,
      index: true,
    },
    // Array of Task ObjectIds that MUST be completed before this task can start
    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    estimatedHours: {
      type: Number,
      min: [0.1, 'Estimated hours must be at least 0.1'],
      max: [1000, 'Estimated hours cannot exceed 1000'],
      default: 1,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    orderIndex: {
      type: Number,
      default: 0,
      index: true,
    },
    isMilestone: {
      type: Boolean,
      default: false,
    },
    blockers: [
      {
        reason: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual for id string representation
TaskSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

TaskSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

export const Task = mongoose.model('Task', TaskSchema);
