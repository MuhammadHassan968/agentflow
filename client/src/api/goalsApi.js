/**
 * Goal REST API Client
 */

export async function fetchGoals() {
  const res = await fetch('/api/goals');
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to fetch goals');
  }
  return data.data;
}

export async function fetchGoalById(id) {
  const res = await fetch(`/api/goals/${id}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `Failed to fetch goal ${id}`);
  }
  return data.data;
}

export async function createGoal(goalData) {
  const res = await fetch('/api/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goalData),
  });
  const data = await res.json();
  if (!res.ok) {
    const detail = data.error?.details ? data.error.details.map((d) => d.message).join(', ') : '';
    throw new Error(detail || data.error?.message || 'Failed to create goal');
  }
  return data.data;
}

export async function deleteGoal(id) {
  const res = await fetch(`/api/goals/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to delete goal');
  }
  return data.data;
}
