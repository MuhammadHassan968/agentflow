import { z } from 'zod';
import { GOAL_STATUS, HEALTH_STATUS } from '../constants/status.js';

/**
 * Zod Validation Schemas for Goal Endpoints
 * Zod parses and sanitizes incoming HTTP request payloads at runtime.
 */

export const createGoalSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Goal title is required' })
      .trim()
      .min(1, 'Goal title cannot be empty')
      .max(200, 'Goal title cannot exceed 200 characters'),
    description: z
      .string()
      .trim()
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional()
      .default(''),
    targetDeadline: z
      .string()
      .datetime({ message: 'Target deadline must be a valid ISO-8601 date string' })
      .optional()
      .nullable(),
    metadata: z.record(z.any()).optional().default({}),
  }),
});

export const updateGoalSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    targetDeadline: z.string().datetime().optional().nullable(),
    status: z.enum(Object.values(GOAL_STATUS)).optional(),
    healthScore: z.number().min(0).max(100).optional(),
    healthStatus: z.enum(Object.values(HEALTH_STATUS)).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});
