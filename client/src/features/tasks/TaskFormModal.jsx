import React, { useState } from 'react';

export default function TaskFormModal({ existingTasks, onTaskCreated, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [isMilestone, setIsMilestone] = useState(false);
  const [selectedDeps, setSelectedDeps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleDependency = (taskId) => {
    setSelectedDeps((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onTaskCreated({
        title: title.trim(),
        description: description.trim(),
        estimatedHours: Number(estimatedHours) || 1,
        isMilestone,
        dependencies: selectedDeps,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="card-title">
          <span>Add Task to Project</span>
          <button className="btn-secondary" onClick={onClose} type="button">
            ✕
          </button>
        </div>
        <p className="card-desc">
          Add an actionable step and designate any prerequisite dependencies.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Set up authentication and JWT tokens"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="What needs to be implemented or delivered?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Estimated Hours</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                max="100"
                className="form-input"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isMilestone}
                  onChange={(e) => setIsMilestone(e.target.checked)}
                  disabled={loading}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Major Milestone</span>
              </label>
            </div>
          </div>

          {existingTasks.length > 0 && (
            <div className="form-group">
              <label className="form-label">
                Prerequisites / Dependencies (DAG Check Enforced)
              </label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Select any tasks that MUST complete before this task can start:
              </p>
              <div className="deps-selector-box">
                {existingTasks.map((t) => {
                  const id = t.id || t._id;
                  const isChecked = selectedDeps.includes(id);
                  return (
                    <label key={id} className={`dep-select-label ${isChecked ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDependency(id)}
                        disabled={loading}
                      />
                      <span>{t.title}</span>
                      <span className="dep-order">#{t.orderIndex + 1}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Adding Task...' : '+ Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
