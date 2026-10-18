import { z } from 'zod';
import { TASK_STATUS } from '../constants/status.js';

// Regex to validate standard 24-hex-character MongoDB ObjectIds
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const objectIdSchema = z
  .string()
  .regex(objectIdRegex, 'Must be a valid 24-character hex MongoDB ObjectId');

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Task title is required' })
      .trim()
      .min(1, 'Task title cannot be empty')
      .max(200, 'Task title cannot exceed 200 characters'),
    description: z
      .string()
      .trim()
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional()
      .default(''),
    dependencies: z
      .array(objectIdSchema, { invalid_type_error: 'Dependencies must be an array of valid Task IDs' })
      .optional()
      .default([]),
    estimatedHours: z
      .number()
      .min(0.1, 'Estimated hours must be at least 0.1')
      .max(1000, 'Estimated hours cannot exceed 1000')
      .optional()
      .default(1),
    dueDate: z.string().datetime().optional().nullable(),
    orderIndex: z.number().int().optional().default(0),
    isMilestone: z.boolean().optional().default(false),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    status: z.enum(Object.values(TASK_STATUS)).optional(),
    dependencies: z.array(objectIdSchema).optional(),
    estimatedHours: z.number().min(0.1).max(1000).optional(),
    dueDate: z.string().datetime().optional().nullable(),
    orderIndex: z.number().int().optional(),
    isMilestone: z.boolean().optional(),
  }),
});
