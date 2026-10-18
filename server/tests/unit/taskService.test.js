import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskService } from '../../src/services/taskService.js';
import { taskRepository } from '../../src/repositories/taskRepository.js';
import { goalRepository } from '../../src/repositories/goalRepository.js';
import { TASK_STATUS } from '../../src/constants/status.js';

vi.mock('../../src/repositories/taskRepository.js');
vi.mock('../../src/repositories/goalRepository.js');

describe('Task Service (Unit Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTask', () => {
    it('should throw 404 if parent goal is not found', async () => {
      goalRepository.findById.mockResolvedValue(null);

      await expect(
        taskService.createTask('g_missing', { title: 'New Task' })
      ).rejects.toThrow("Goal with ID 'g_missing' not found");
    });

    it('should throw 400 if dependency does not exist in the same goal', async () => {
      goalRepository.findById.mockResolvedValue({ _id: 'g1' });
      taskRepository.findByGoalId.mockResolvedValue([
        { _id: 't1', title: 'Task 1' },
      ]);

      await expect(
        taskService.createTask('g1', {
          title: 'Task 2',
          dependencies: ['t_foreign'],
        })
      ).rejects.toThrow("Dependency task 't_foreign' does not exist in Goal 'g1'");
    });

    it('should create task and promote to READY if no dependencies exist', async () => {
      goalRepository.findById.mockResolvedValue({ _id: 'g1' });
      taskRepository.findByGoalId.mockResolvedValue([]);
      taskRepository.create.mockImplementation((data) => Promise.resolve({ id: 't1', ...data }));

      const created = await taskService.createTask('g1', { title: 'First Task' });

      expect(created.status).toBe(TASK_STATUS.READY);
      expect(created.orderIndex).toBe(0);
      expect(taskRepository.create).toHaveBeenCalled();
    });
  });

  describe('updateTask & Cycle Detection', () => {
    it('should reject updating dependencies if it introduces a circular dependency', async () => {
      const taskA = { _id: 'A', id: 'A', goalId: 'g1', dependencies: [] };
      const taskB = { _id: 'B', id: 'B', goalId: 'g1', dependencies: ['A'] };

      taskRepository.findById.mockResolvedValue(taskA);
      taskRepository.findByGoalId.mockResolvedValue([taskA, taskB]);

      // Attempting to make A depend on B (creating A -> B -> A)
      await expect(
        taskService.updateTask('A', { dependencies: ['B'] })
      ).rejects.toThrow(/Circular dependency detected/);
    });

    it('should promote downstream tasks to READY when a prerequisite task completes', async () => {
      const task1 = { _id: '1', id: '1', goalId: 'g1', status: TASK_STATUS.IN_PROGRESS };
      const task2 = {
        _id: '2',
        id: '2',
        goalId: 'g1',
        status: TASK_STATUS.PENDING,
        dependencies: [{ _id: '1', id: '1' }],
      };

      taskRepository.findById.mockResolvedValue(task1);
      taskRepository.findByGoalId
        .mockResolvedValueOnce([task1, task2]) // initial check
        .mockResolvedValueOnce([
          { ...task1, status: TASK_STATUS.COMPLETED },
          task2,
        ]); // refreshed after update

      taskRepository.updateById.mockResolvedValue({
        ...task1,
        status: TASK_STATUS.COMPLETED,
      });

      await taskService.updateTask('1', { status: TASK_STATUS.COMPLETED });

      // task2 should be promoted to READY
      expect(taskRepository.updateById).toHaveBeenCalledWith('2', {
        status: TASK_STATUS.READY,
      });
    });
  });

  describe('deleteTask', () => {
    it('should clean up dependency references in other tasks when a task is deleted', async () => {
      const task = { _id: 't1', goalId: 'g1' };
      taskRepository.findById.mockResolvedValue(task);
      taskRepository.deleteById.mockResolvedValue(task);

      await taskService.deleteTask('t1');

      expect(taskRepository.removeDependencyReferences).toHaveBeenCalledWith('g1', 't1');
      expect(taskRepository.deleteById).toHaveBeenCalledWith('t1');
    });
  });
});
