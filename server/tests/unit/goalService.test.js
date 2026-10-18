import { describe, it, expect, vi, beforeEach } from 'vitest';
import { goalService } from '../../src/services/goalService.js';
import { goalRepository } from '../../src/repositories/goalRepository.js';
import { taskRepository } from '../../src/repositories/taskRepository.js';
import { TASK_STATUS } from '../../src/constants/status.js';

vi.mock('../../src/repositories/goalRepository.js');
vi.mock('../../src/repositories/taskRepository.js');

describe('Goal Service (Unit Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a goal successfully', async () => {
    const payload = { title: 'Launch MVP' };
    const fakeGoal = { id: 'g1', ...payload };
    goalRepository.create.mockResolvedValue(fakeGoal);

    const result = await goalService.createGoal(payload);
    expect(goalRepository.create).toHaveBeenCalledWith(payload);
    expect(result).toEqual(fakeGoal);
  });

  it('should get a goal by ID with progress metrics', async () => {
    const fakeGoal = {
      _id: 'g1',
      title: 'Launch MVP',
      toJSON: () => ({ id: 'g1', title: 'Launch MVP' }),
    };
    const fakeTasks = [
      { id: 't1', status: TASK_STATUS.COMPLETED },
      { id: 't2', status: TASK_STATUS.PENDING },
    ];

    goalRepository.findById.mockResolvedValue(fakeGoal);
    taskRepository.findByGoalId.mockResolvedValue(fakeTasks);

    const result = await goalService.getGoalById('g1');

    expect(result.id).toBe('g1');
    expect(result.metrics.totalTasks).toBe(2);
    expect(result.metrics.completedTasks).toBe(1);
    expect(result.metrics.progressPercent).toBe(50);
  });

  it('should throw 404 when goal does not exist', async () => {
    goalRepository.findById.mockResolvedValue(null);

    await expect(goalService.getGoalById('non-existent')).rejects.toThrow(
      "Goal with ID 'non-existent' not found"
    );
  });

  it('should cascade-delete all associated tasks when a goal is deleted', async () => {
    const fakeGoal = { _id: 'g1', title: 'To Delete' };
    goalRepository.findById.mockResolvedValue(fakeGoal);
    goalRepository.deleteById.mockResolvedValue(fakeGoal);
    taskRepository.deleteByGoalId.mockResolvedValue({ deletedCount: 5 });

    await goalService.deleteGoal('g1');

    expect(taskRepository.deleteByGoalId).toHaveBeenCalledWith('g1');
    expect(goalRepository.deleteById).toHaveBeenCalledWith('g1');
  });
});
