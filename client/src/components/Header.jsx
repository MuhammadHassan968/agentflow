import React from 'react';

export default function Header() {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="brand-icon">⚡</div>
        <h1 className="brand-title">AgentFlow</h1>
      </div>
      <p className="header-tagline">From Intention to Execution</p>
      <p className="header-desc">
        AI-augmented project planning, dependency orchestration, and execution management.
      </p>
    </header>
  );
}
