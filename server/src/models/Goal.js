import mongoose from 'mongoose';
import { GOAL_STATUS, HEALTH_STATUS } from '../constants/status.js';

/**
 * Goal Mongoose Schema
 * Represents a high-level project goal entered by a user (e.g. "Build and deploy an e-commerce website in 7 days").
 */
const GoalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [200, 'Goal title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    targetDeadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(GOAL_STATUS),
      default: GOAL_STATUS.DRAFT,
      index: true,
    },
    healthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    healthStatus: {
      type: String,
      enum: Object.values(HEALTH_STATUS),
      default: HEALTH_STATUS.HEALTHY,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Virtual for id string representation
GoalSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

GoalSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

export const Goal = mongoose.model('Goal', GoalSchema);
