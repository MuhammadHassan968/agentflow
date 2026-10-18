import { Router } from 'express';
import { goalController } from '../controllers/goalController.js';
import { taskController } from '../controllers/taskController.js';
import { validate } from '../middleware/validate.js';
import { createGoalSchema, updateGoalSchema } from '../validations/goalValidation.js';
import { createTaskSchema } from '../validations/taskValidation.js';

const router = Router();

// Goal CRUD routes
router.post('/', validate(createGoalSchema), goalController.create);
router.get('/', goalController.list);
router.get('/:id', goalController.getById);
router.put('/:id', validate(updateGoalSchema), goalController.update);
router.delete('/:id', goalController.delete);

// Nested task routes under a goal: /api/goals/:goalId/tasks
router.post('/:goalId/tasks', validate(createTaskSchema), taskController.create);
router.get('/:goalId/tasks', taskController.listByGoal);

export default router;
