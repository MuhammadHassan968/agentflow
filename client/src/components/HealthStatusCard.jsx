import React, { useState, useEffect } from 'react';
import { getBackendHealth } from '../api/client';

export default function HealthStatusCard() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getBackendHealth();
      setHealthData(result.data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || 'Unable to connect to the backend server.');
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <section className="card">
      <div className="card-title">
        <span>Backend Health & Connectivity</span>
        {loading && (
          <span className="badge badge-loading">
            <span className="status-dot"></span> Checking
          </span>
        )}
        {!loading && healthData && (
          <span className="badge badge-healthy">
            <span className="status-dot"></span> Connected
          </span>
        )}
        {!loading && error && (
          <span className="badge badge-error">
            <span className="status-dot"></span> Disconnected
          </span>
        )}
      </div>

      <p className="card-desc">
        Verifies REST communication between the React client and the Express API server (<code>GET /api/health</code>).
      </p>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          color: '#fca5a5'
        }}>
          <strong>Connection Failed:</strong> {error}
          <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#94a3b8' }}>
            Tip: Make sure the Express server is running on port 5000 (<code>npm run server</code>).
          </div>
        </div>
      )}

      {healthData && (
        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">Service Name</div>
            <div className="info-value">{healthData.service}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Health Status</div>
            <div className="info-value" style={{ color: '#10b981' }}>{healthData.status}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Server Uptime</div>
            <div className="info-value">{healthData.uptimeSeconds}s</div>
          </div>
          <div className="info-item">
            <div className="info-label">Environment</div>
            <div className="info-value">{healthData.environment}</div>
          </div>
        </div>
      )}

      {healthData && (
        <div>
          <div className="info-label" style={{ marginTop: '0.5rem' }}>Raw Backend Response</div>
          <pre className="raw-output">
            {JSON.stringify(healthData, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          className="btn"
          onClick={checkHealth}
          disabled={loading}
        >
          {loading ? 'Testing Connection...' : '↻ Re-test Connection'}
        </button>

        {lastChecked && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Last verified: {lastChecked}
          </span>
        )}
      </div>
    </section>
  );
}
