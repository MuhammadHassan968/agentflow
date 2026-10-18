import React, { useState, useEffect } from 'react';
import { fetchGoals, createGoal, deleteGoal } from '../../api/goalsApi';
import GoalForm from './GoalForm';

export default function GoalList({ onSelectGoal }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGoals();
      setGoals(data);
    } catch (err) {
      setError(err.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreate = async (goalData) => {
    await createGoal(goalData);
    setShowCreateForm(false);
    await loadGoals();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this goal and all of its tasks?')) return;
    try {
      await deleteGoal(id);
      await loadGoals();
    } catch (err) {
      alert(err.message || 'Failed to delete goal');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Active Goals & Projects</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Select a project goal to manage its execution and task dependencies.
          </p>
        </div>
        {!showCreateForm && (
          <button className="btn" onClick={() => setShowCreateForm(true)}>
            + New Goal
          </button>
        )}
      </div>

      {showCreateForm && (
        <GoalForm onGoalCreated={handleCreate} onCancel={() => setShowCreateForm(false)} />
      )}

      {error && (
        <div className="card">
          <div className="alert alert-error">
            <strong>Database Notice:</strong> {error}
            <div style={{ fontSize: '0.85rem', marginTop: '0.4rem', color: '#cbd5e1' }}>
              Ensure MongoDB is running or configure your <code>MONGODB_URI</code> in <code>server/.env</code>.
            </div>
          </div>
        </div>
      )}

      {loading && !error && (
        <div className="card">
          <p>Loading projects...</p>
        </div>
      )}

      {!loading && !error && goals.length === 0 && !showCreateForm && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No goals defined yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            Start by entering a goal. In Phase 2, the AI Planning Engine will turn your goal into a structured, dependency-aware execution plan.
          </p>
          <button className="btn" onClick={() => setShowCreateForm(true)}>
            + Create First Goal
          </button>
        </div>
      )}

      <div className="goals-grid">
        {goals.map((goal) => {
          const id = goal.id || goal._id;
          const progress = goal.metrics?.progressPercent || 0;
          const totalTasks = goal.metrics?.totalTasks || 0;
          const completedTasks = goal.metrics?.completedTasks || 0;

          return (
            <div
              key={id}
              className="goal-card"
              onClick={() => onSelectGoal(id)}
            >
              <div className="goal-card-header">
                <span className="goal-card-title">{goal.title}</span>
                <button
                  className="btn-danger-icon"
                  onClick={(e) => handleDelete(e, id)}
                  title="Delete Goal"
                >
                  ✕
                </button>
              </div>

              {goal.description && (
                <p className="goal-card-desc">{goal.description}</p>
              )}

              {/* Mini progress bar */}
              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                  <span>Tasks: {completedTasks}/{totalTasks}</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{progress}%</span>
                </div>
                <div className="progress-bar-bg" style={{ height: '6px' }}>
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.8rem' }}>
                <span className="badge badge-healthy">
                  ● {goal.status.toUpperCase()}
                </span>
                <span style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>
                  View Tasks →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
