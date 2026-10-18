import React from 'react';

const STATUS_COLORS = {
  pending: { bg: 'rgba(100, 116, 139, 0.2)', text: '#94a3b8', border: '#475569' },
  ready: { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa', border: '#2563eb' },
  in_progress: { bg: 'rgba(245, 158, 11, 0.2)', text: '#fbbf24', border: '#d97706' },
  blocked: { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171', border: '#dc2626' },
  completed: { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399', border: '#059669' },
  cancelled: { bg: 'rgba(71, 85, 105, 0.2)', text: '#64748b', border: '#334155' },
};

export default function TaskItem({ task, onStatusChange, onDelete }) {
  const statusStyle = STATUS_COLORS[task.status] || STATUS_COLORS.pending;

  return (
    <div className="task-item">
      <div className="task-main">
        <div className="task-header-row">
          <span className="task-title">{task.title}</span>
          <span
            className="badge"
            style={{
              backgroundColor: statusStyle.bg,
              color: statusStyle.text,
              border: `1px solid ${statusStyle.border}`,
            }}
          >
            ● {task.status.replace('_', ' ')}
          </span>
        </div>

        {task.description && (
          <p className="task-desc">{task.description}</p>
        )}

        <div className="task-meta-row">
          <span className="task-meta-item">⏱ {task.estimatedHours || 1}h estimate</span>
          {task.isMilestone && <span className="task-meta-milestone">★ Milestone</span>}

          {task.dependencies && task.dependencies.length > 0 && (
            <div className="task-deps-container">
              <span className="deps-label">Prerequisites:</span>
              {task.dependencies.map((dep) => (
                <span key={dep.id || dep._id} className="dep-pill">
                  {dep.title || 'Task'}
                  {dep.status === 'completed' ? ' ✓' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="task-actions">
        <select
          className="status-select"
          value={task.status}
          onChange={(e) => onStatusChange(task.id || task._id, e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="ready">Ready</option>
          <option value="in_progress">In Progress</option>
          <option value="blocked">Blocked</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          className="btn-danger-icon"
          onClick={() => onDelete(task.id || task._id)}
          title="Delete Task"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
