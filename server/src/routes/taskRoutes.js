import { Router } from 'express';
import { taskController } from '../controllers/taskController.js';
import { validate } from '../middleware/validate.js';
import { updateTaskSchema } from '../validations/taskValidation.js';

const router = Router();

// Task direct routes
router.get('/:id', taskController.getById);
router.put('/:id', validate(updateTaskSchema), taskController.update);
router.delete('/:id', taskController.delete);

export default router;
