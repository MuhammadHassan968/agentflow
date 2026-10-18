import { TASK_STATUS } from '../constants/status.js';

/**
 * Directed Acyclic Graph (DAG) Utility Engine
 *
 * In AgentFlow, tasks and their prerequisite dependencies form a directed graph:
 * - Nodes: Tasks
 * - Directed Edge (A -> B): Task A depends on Task B (B must complete before A can start)
 *
 * For a project plan to be executable, the graph MUST be acyclic (no circular dependencies like A -> B -> A).
 */

/**
 * Builds an adjacency map from an array of tasks.
 * Key: taskId (string)
 * Value: array of dependency taskIds (strings)
 */
export function buildAdjacencyList(tasks) {
  const adj = new Map();
  for (const task of tasks) {
    const id = (task.id || task._id).toString();
    const deps = (task.dependencies || []).map((d) => (d.id || d._id || d).toString());
    adj.set(id, deps);
  }
  return adj;
}

/**
 * Detects if a cycle exists in the graph using Depth-First Search (DFS) 3-color marking:
 * 0 = unvisited (white)
 * 1 = visiting / currently on recursion stack (gray)
 * 2 = visited / fully processed (black)
 *
 * @param {Array} tasks - Array of task objects with id and dependencies
 * @returns {{ hasCycle: boolean, cyclePath: string[] }}
 */
export function detectCycle(tasks) {
  const adj = buildAdjacencyList(tasks);
  const state = new Map(); // taskId -> 0 | 1 | 2
  const parent = new Map(); // taskId -> parentId for reconstructing cycle path

  for (const taskId of adj.keys()) {
    state.set(taskId, 0);
  }

  let cycleFound = false;
  let cycleStart = null;
  let cycleEnd = null;

  function dfs(u) {
    state.set(u, 1); // Mark as visiting

    const neighbors = adj.get(u) || [];
    for (const v of neighbors) {
      // If neighbor is not in adjacency list (e.g. external or deleted task), skip
      if (!adj.has(v)) continue;

      if (state.get(v) === 1) {
        // Found back-edge to an active node in recursion stack -> CYCLE!
        cycleFound = true;
        cycleStart = v;
        cycleEnd = u;
        return true;
      }

      if (state.get(v) === 0) {
        parent.set(v, u);
        if (dfs(v)) return true;
      }
    }

    state.set(u, 2); // Mark as fully visited
    return false;
  }

  for (const taskId of adj.keys()) {
    if (state.get(taskId) === 0) {
      if (dfs(taskId)) break;
    }
  }

  if (!cycleFound) {
    return { hasCycle: false, cyclePath: [] };
  }

  // Reconstruct cycle path
  const path = [cycleStart];
  let curr = cycleEnd;
  while (curr !== cycleStart && curr !== undefined) {
    path.push(curr);
    curr = parent.get(curr);
  }
  path.push(cycleStart);
  path.reverse();

  return { hasCycle: true, cyclePath: path };
}

/**
 * Checks if adding dependency (taskId depends on dependencyId) would create a cycle.
 *
 * @param {Array} existingTasks - Current tasks for the goal
 * @param {string} taskId - The task being created or modified
 * @param {Array<string>} proposedDependencies - Proposed list of dependency IDs for this task
 * @returns {{ wouldCycle: boolean, reason?: string }}
 */
export function wouldCreateCycle(existingTasks, taskId, proposedDependencies) {
  const targetId = taskId ? taskId.toString() : 'NEW_TASK';

  // 1. Direct self-dependency check
  if (proposedDependencies.some((depId) => depId.toString() === targetId)) {
    return {
      wouldCycle: true,
      reason: 'A task cannot depend on itself.',
    };
  }

  // 2. Clone tasks and simulate the proposed dependencies
  const simulatedTasks = existingTasks.map((t) => {
    const id = (t.id || t._id).toString();
    if (id === targetId) {
      return {
        ...t,
        id,
        dependencies: proposedDependencies,
      };
    }
    return {
      ...t,
      id,
      dependencies: t.dependencies || [],
    };
  });

  // If this is a new task not yet in existingTasks, push it into simulation
  if (!simulatedTasks.some((t) => t.id === targetId)) {
    simulatedTasks.push({
      id: targetId,
      dependencies: proposedDependencies,
    });
  }

  const { hasCycle, cyclePath } = detectCycle(simulatedTasks);
  if (hasCycle) {
    return {
      wouldCycle: true,
      reason: `Circular dependency detected along path: ${cyclePath.join(' -> ')}`,
    };
  }

  return { wouldCycle: false };
}

/**
 * Computes topological ordering (Kahn's algorithm)
 * Returns tasks in a valid execution order where all prerequisites precede the task.
 *
 * @param {Array} tasks
 * @returns {Array} Ordered tasks
 */
export function topologicalSort(tasks) {
  const adj = buildAdjacencyList(tasks);
  const taskMap = new Map();
  for (const t of tasks) {
    taskMap.set((t.id || t._id).toString(), t);
  }

  // In-degree: how many prerequisites does this task have?
  const inDegree = new Map();
  for (const [id, deps] of adj.entries()) {
    inDegree.set(id, deps.filter((d) => adj.has(d)).length);
  }

  // Queue tasks with 0 prerequisites
  const queue = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id);
  }

  const sortedIds = [];
  // Reverse adjacency to know who depends on task `u`
  const dependents = new Map();
  for (const [id, deps] of adj.entries()) {
    for (const d of deps) {
      if (!dependents.has(d)) dependents.set(d, []);
      dependents.get(d).push(id);
    }
  }

  while (queue.length > 0) {
    const u = queue.shift();
    sortedIds.push(u);

    const children = dependents.get(u) || [];
    for (const v of children) {
      inDegree.set(v, inDegree.get(v) - 1);
      if (inDegree.get(v) === 0) {
        queue.push(v);
      }
    }
  }

  // Map IDs back to task objects
  return sortedIds.map((id) => taskMap.get(id)).filter(Boolean);
}

/**
 * Determines actionable status for tasks:
 * - If a task is 'pending':
 *     - If it has no dependencies, or all its dependencies are 'completed', its actionable status is 'ready'.
 *     - If any dependency is 'blocked', it may be considered blocked.
 *
 * @param {Object} task
 * @param {Map<string, Object>} allTasksMap
 * @returns {string} Suggested or updated status
 */
export function evaluateTaskReadiness(task, allTasksMap) {
  // If already in progress, completed, or cancelled, do not alter
  if (
    task.status === TASK_STATUS.IN_PROGRESS ||
    task.status === TASK_STATUS.COMPLETED ||
    task.status === TASK_STATUS.CANCELLED
  ) {
    return task.status;
  }

  const deps = (task.dependencies || []).map((d) => (d.id || d._id || d).toString());
  if (deps.length === 0) {
    return task.status === TASK_STATUS.PENDING ? TASK_STATUS.READY : task.status;
  }

  const depTasks = deps.map((id) => allTasksMap.get(id)).filter(Boolean);

  // If any dependency is blocked, mark as blocked
  const hasBlockedDep = depTasks.some((d) => d.status === TASK_STATUS.BLOCKED);
  if (hasBlockedDep) {
    return TASK_STATUS.BLOCKED;
  }

  // If all dependencies are completed, it is ready to be worked on
  const allCompleted = depTasks.every((d) => d.status === TASK_STATUS.COMPLETED);
  if (allCompleted) {
    return TASK_STATUS.READY;
  }

  return TASK_STATUS.PENDING;
}
