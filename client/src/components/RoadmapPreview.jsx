import React from 'react';

const PHASES = [
  {
    phase: 'Phase 0',
    title: 'Foundation & Tooling',
    desc: 'Monorepo skeleton, Express server, React shell, REST health probe.',
    status: 'Active (Current)',
    active: true,
  },
  {
    phase: 'Phase 1',
    title: 'Domain Core & Tasks (No AI)',
    desc: 'Goal & Task MongoDB schemas, DAG cycle check, manual task board.',
    status: 'Upcoming',
    active: false,
  },
  {
    phase: 'Phase 2',
    title: 'AI Planning Engine',
    desc: 'Intention to structured plan breakdown with strict Zod validation.',
    status: 'Upcoming',
    active: false,
  },
  {
    phase: 'Phase 3',
    title: 'Dependencies & Blockers',
    desc: 'DAG resolution, next actionable tasks, automated blocker detection.',
    status: 'Upcoming',
    active: false,
  },
  {
    phase: 'Phase 4',
    title: 'Project Health & Risks',
    desc: 'Deterministic health scoring, schedule drift, risk alerts.',
    status: 'Upcoming',
    active: false,
  },
  {
    phase: 'Phase 5',
    title: 'Human-in-the-Loop & Replanning',
    desc: 'Approval queue, adaptive plan revisions, visual plan diffs.',
    status: 'Upcoming',
    active: false,
  },
];

export default function RoadmapPreview() {
  return (
    <section className="card">
      <div className="card-title">
        <span>Development Roadmap</span>
        <span className="badge badge-healthy">Incremental Delivery</span>
      </div>
      <p className="card-desc">
        AgentFlow is built step-by-step according to our modular monolith architecture.
      </p>

      <div className="roadmap-grid">
        {PHASES.map((item) => (
          <div
            key={item.phase}
            className={`roadmap-card ${item.active ? 'roadmap-active' : ''}`}
          >
            <div className="roadmap-phase">{item.phase}</div>
            <div className="roadmap-title">{item.title}</div>
            <div className="roadmap-desc">{item.desc}</div>
            <div className="roadmap-status">● {item.status}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
