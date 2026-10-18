import { describe, it, expect } from 'vitest';
import {
  detectCycle,
  wouldCreateCycle,
  topologicalSort,
  evaluateTaskReadiness,
} from '../../src/utils/dag.js';
import { TASK_STATUS } from '../../src/constants/status.js';

describe('DAG Utility Engine (Unit Tests)', () => {
  describe('detectCycle', () => {
    it('should detect no cycles in an empty task set', () => {
      const result = detectCycle([]);
      expect(result.hasCycle).toBe(false);
      expect(result.cyclePath).toEqual([]);
    });

    it('should detect no cycles in a linear sequence (A -> B -> C)', () => {
      const tasks = [
        { id: '1', title: 'Task A', dependencies: [] },
        { id: '2', title: 'Task B', dependencies: ['1'] },
        { id: '3', title: 'Task C', dependencies: ['2'] },
      ];
      const result = detectCycle(tasks);
      expect(result.hasCycle).toBe(false);
    });

    it('should detect no cycles in a diamond/fork-join DAG', () => {
      // 1 (A)
      // / \
      // 2 (B) 3 (C)
      // \ /
      // 4 (D)
      const tasks = [
        { id: '1', title: 'A', dependencies: [] },
        { id: '2', title: 'B', dependencies: ['1'] },
        { id: '3', title: 'C', dependencies: ['1'] },
        { id: '4', title: 'D', dependencies: ['2', '3'] },
      ];
      const result = detectCycle(tasks);
      expect(result.hasCycle).toBe(false);
    });

    it('should detect a direct circular dependency (1 -> 2 -> 1)', () => {
      const tasks = [
        { id: '1', title: 'Task 1', dependencies: ['2'] },
        { id: '2', title: 'Task 2', dependencies: ['1'] },
      ];
      const result = detectCycle(tasks);
      expect(result.hasCycle).toBe(true);
      expect(result.cyclePath.length).toBeGreaterThan(0);
    });

    it('should detect an indirect cycle (1 -> 2 -> 3 -> 1)', () => {
      const tasks = [
        { id: '1', title: 'Task 1', dependencies: ['2'] },
        { id: '2', title: 'Task 2', dependencies: ['3'] },
        { id: '3', title: 'Task 3', dependencies: ['1'] },
      ];
      const result = detectCycle(tasks);
      expect(result.hasCycle).toBe(true);
    });
  });

  describe('wouldCreateCycle', () => {
    it('should prevent self-dependency', () => {
      const existing = [{ id: '1', title: 'A', dependencies: [] }];
      const check = wouldCreateCycle(existing, '1', ['1']);
      expect(check.wouldCycle).toBe(true);
      expect(check.reason).toContain('cannot depend on itself');
    });

    it('should allow valid dependency addition', () => {
      const existing = [
        { id: '1', title: 'Design', dependencies: [] },
        { id: '2', title: 'Develop', dependencies: [] },
      ];
      // Making 2 depend on 1 is valid
      const check = wouldCreateCycle(existing, '2', ['1']);
      expect(check.wouldCycle).toBe(false);
    });

    it('should reject adding a reverse dependency that creates a loop', () => {
      const existing = [
        { id: '1', title: 'Design', dependencies: [] },
        { id: '2', title: 'Develop', dependencies: ['1'] },
      ];
      // Making 1 depend on 2 would create 1 -> 2 -> 1
      const check = wouldCreateCycle(existing, '1', ['2']);
      expect(check.wouldCycle).toBe(true);
    });
  });

  describe('topologicalSort', () => {
    it('should order tasks so that prerequisites always appear before dependents', () => {
      const tasks = [
        { id: '3', title: 'Deploy', dependencies: ['2'] },
        { id: '1', title: 'Design', dependencies: [] },
        { id: '2', title: 'Code', dependencies: ['1'] },
      ];

      const sorted = topologicalSort(tasks);
      const sortedIds = sorted.map((t) => t.id);

      expect(sortedIds.indexOf('1')).toBeLessThan(sortedIds.indexOf('2'));
      expect(sortedIds.indexOf('2')).toBeLessThan(sortedIds.indexOf('3'));
    });
  });

  describe('evaluateTaskReadiness', () => {
    it('should mark a pending task with no dependencies as READY', () => {
      const task = { id: '1', status: TASK_STATUS.PENDING, dependencies: [] };
      const taskMap = new Map([['1', task]]);
      const readiness = evaluateTaskReadiness(task, taskMap);
      expect(readiness).toBe(TASK_STATUS.READY);
    });

    it('should keep a pending task as PENDING if prerequisites are not completed', () => {
      const dep = { id: '1', status: TASK_STATUS.IN_PROGRESS, dependencies: [] };
      const task = { id: '2', status: TASK_STATUS.PENDING, dependencies: ['1'] };
      const taskMap = new Map([
        ['1', dep],
        ['2', task],
      ]);

      const readiness = evaluateTaskReadiness(task, taskMap);
      expect(readiness).toBe(TASK_STATUS.PENDING);
    });

    it('should promote a pending task to READY once all prerequisites are completed', () => {
      const dep = { id: '1', status: TASK_STATUS.COMPLETED, dependencies: [] };
      const task = { id: '2', status: TASK_STATUS.PENDING, dependencies: ['1'] };
      const taskMap = new Map([
        ['1', dep],
        ['2', task],
      ]);

      const readiness = evaluateTaskReadiness(task, taskMap);
      expect(readiness).toBe(TASK_STATUS.READY);
    });

    it('should mark a task as BLOCKED if any prerequisite is blocked', () => {
      const dep = { id: '1', status: TASK_STATUS.BLOCKED, dependencies: [] };
      const task = { id: '2', status: TASK_STATUS.PENDING, dependencies: ['1'] };
      const taskMap = new Map([
        ['1', dep],
        ['2', task],
      ]);

      const readiness = evaluateTaskReadiness(task, taskMap);
      expect(readiness).toBe(TASK_STATUS.BLOCKED);
    });
  });
});
