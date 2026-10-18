/**
 * Task REST API Client
 */

export async function fetchTasksForGoal(goalId) {
  const res = await fetch(`/api/goals/${goalId}/tasks`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to fetch tasks');
  }
  return data.data;
}

export async function createTask(goalId, taskData) {
  const res = await fetch(`/api/goals/${goalId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  const data = await res.json();
  if (!res.ok) {
    const detail = data.error?.details ? data.error.details.map((d) => d.message).join(', ') : '';
    throw new Error(detail || data.error?.message || 'Failed to create task');
  }
  return data.data;
}

export async function updateTask(taskId, updateData) {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  const data = await res.json();
  if (!res.ok) {
    const detail = data.error?.details ? data.error.details.map((d) => d.message).join(', ') : '';
    throw new Error(detail || data.error?.message || 'Failed to update task');
  }
  return data.data;
}

export async function deleteTask(taskId) {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to delete task');
  }
  return data.data;
}
