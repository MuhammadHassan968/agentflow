import React, { useState } from 'react';

export default function GoalForm({ onGoalCreated, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDeadline, setTargetDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Goal title is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        targetDeadline: targetDeadline ? new Date(targetDeadline).toISOString() : null,
      };
      await onGoalCreated(payload);
      setTitle('');
      setDescription('');
      setTargetDeadline('');
    } catch (err) {
      setError(err.message || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ border: '1px solid var(--accent-blue)' }}>
      <div className="card-title">
        <span>Define New Project Goal</span>
        {onCancel && (
          <button className="btn-secondary" onClick={onCancel} type="button">
            ✕ Close
          </button>
        )}
      </div>
      <p className="card-desc">
        Enter the high-level objective you want to execute. In Phase 2, this will be decomposed into plans by the AI agent.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Goal Title *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Build and deploy an e-commerce website in 7 days"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description / Scope Details (Optional)</label>
          <textarea
            className="form-textarea"
            rows="3"
            placeholder="Key constraints, tech stack preferences, target deliverables..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Target Deadline (Optional)</label>
          <input
            type="date"
            className="form-input"
            value={targetDeadline}
            onChange={(e) => setTargetDeadline(e.target.value)}
            disabled={loading}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating Goal...' : '✓ Save Goal'}
          </button>
          {onCancel && (
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
