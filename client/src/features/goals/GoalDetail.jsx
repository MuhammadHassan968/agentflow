import React, { useState, useEffect } from 'react';
import { fetchGoalById } from '../../api/goalsApi';
import { fetchTasksForGoal, createTask, updateTask, deleteTask } from '../../api/tasksApi';
import TaskItem from '../tasks/TaskItem';
import TaskFormModal from '../tasks/TaskFormModal';

export default function GoalDetail({ goalId, onBack }) {
  const [goal, setGoal] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [goalData, taskData] = await Promise.all([
        fetchGoalById(goalId),
        fetchTasksForGoal(goalId),
      ]);
      setGoal(goalData);
      setTasks(taskData);
    } catch (err) {
      setError(err.message || 'Failed to load goal details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [goalId]);

  const handleCreateTask = async (taskPayload) => {
    await createTask(goalId, taskPayload);
    await loadData();
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      await loadData();
    } catch (err) {
      alert(`Status update error: ${err.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      await loadData();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  if (loading && !goal) {
    return (
      <div className="card">
        <p>Loading project goal and task dependencies...</p>
      </div>
    );
  }

  if (error && !goal) {
    return (
      <div className="card">
        <div className="alert alert-error">{error}</div>
        <button className="btn-secondary" onClick={onBack}>
          ← Back to Goals
        </button>
      </div>
    );
  }

  const progress = goal?.metrics?.progressPercent || 0;

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <button className="btn-secondary" onClick={onBack}>
          ← Back to Goals List
        </button>
      </div>

      {/* Goal Header Card */}
      <section className="card">
        <div className="card-title">
          <span>{goal.title}</span>
          <span className="badge badge-healthy">● {goal.status.toUpperCase()}</span>
        </div>

        {goal.description && <p className="card-desc">{goal.description}</p>}

        {/* Progress Bar */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Execution Progress</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{progress}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="info-grid" style={{ marginTop: '1.25rem' }}>
          <div className="info-item">
            <div className="info-label">Total Tasks</div>
            <div className="info-value">{tasks.length}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Completed</div>
            <div className="info-value" style={{ color: '#10b981' }}>
              {tasks.filter((t) => t.status === 'completed').length}
            </div>
          </div>
          <div className="info-item">
            <div className="info-label">Actionable / Ready</div>
            <div className="info-value" style={{ color: '#38bdf8' }}>
              {tasks.filter((t) => t.status === 'ready').length}
            </div>
          </div>
          <div className="info-item">
            <div className="info-label">Health Score</div>
            <div className="info-value">{goal.healthScore || 100}%</div>
          </div>
        </div>
      </section>

      {/* Tasks Section */}
      <section className="card">
        <div className="card-title">
          <span>Task Dependency Graph (DAG)</span>
          <button className="btn" onClick={() => setShowTaskModal(true)}>
            + Add Task
          </button>
        </div>
        <p className="card-desc">
          Tasks evaluate prerequisites automatically. When prerequisite tasks are marked completed, dependent tasks unlock into the <code>READY</code> state.
        </p>

        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '1rem' }}>No tasks created for this goal yet.</p>
            <button className="btn" onClick={() => setShowTaskModal(true)}>
              + Add First Task
            </button>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <TaskItem
                key={task.id || task._id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </section>

      {showTaskModal && (
        <TaskFormModal
          existingTasks={tasks}
          onTaskCreated={handleCreateTask}
          onClose={() => setShowTaskModal(false)}
        />
      )}
    </div>
  );
}
