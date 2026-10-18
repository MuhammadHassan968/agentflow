# AgentFlow ⚡

> **From Intention to Execution**  
> An AI-augmented project planning, dependency orchestration, and execution management system.

---

## 📖 Overview

AgentFlow bridges high-level user intentions (e.g., *"Build and deploy an e-commerce website in 7 days"*) and actionable execution. It helps teams and individuals:
- Turn goals into structured project plans.
- Manage task dependencies (Directed Acyclic Graph / DAG).
- Identify bottlenecks and blockers early.
- Track project health with deterministic metrics.
- Adapt and replan safely with human-in-the-loop approvals.

---

## 🏗️ Architecture (Modular Monolith)

AgentFlow is organized as a clean monorepo with distinct frontend and backend workspaces:

```text
agentflow/
├── client/          # Frontend: React 19 + Vite SPA
│   ├── src/
│   │   ├── api/     # API client functions (REST)
│   │   ├── components/ # Reusable UI components
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js # Proxies /api requests to backend (port 5000)
├── server/          # Backend: Node.js + Express REST API
│   ├── src/
│   │   ├── config/  # Environment & server configuration
│   │   ├── middleware/ # Error handling & 404 middlewares
│   │   ├── routes/  # Express REST routes (e.g. /api/health)
│   │   ├── app.js   # Express pipeline configuration
│   │   └── server.js# HTTP server bootstrapper & process management
│   ├── .env.example # Example environment variables
│   └── .env         # Local environment configuration
├── package.json     # Root npm workspaces configuration
└── README.md
```

### Key Engineering Principles
1. **Isolated AI Layer**: The LLM engine never accesses the database directly.
2. **Untrusted LLM Output**: All AI output is treated as untrusted user input and strictly validated before persistence.
3. **Deterministic Core**: Schedule calculations, dependency graphs, and health scores are evaluated by deterministic code, not LLM guesses.
4. **Simple & Deployable**: No microservices, Kafka, Redis, or Kubernetes. Simple, maintainable modern MERN.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ or v20+ (Node v24 supported)
- npm v9+

### 1. Install Dependencies

You can install all dependencies for both `server` and `client` with a single command from the root directory:

```bash
npm install
```

*(Alternatively, you can `cd server && npm install` and `cd ../client && npm install`)*.

---

### 2. Configure Environment

The server requires a `.env` file (one is pre-configured with defaults during Phase 0):

```bash
# In server/.env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

---

### 3. Run the Backend Server

In a terminal:

```bash
# From the project root:
npm run server

# Or directly from the server folder:
cd server
npm run dev
```

The Express API will start on: **`http://localhost:5000`**  
Health Check endpoint: **`http://localhost:5000/api/health`**

---

### 4. Run the Frontend Client

In a second terminal:

```bash
# From the project root:
npm run client

# Or directly from the client folder:
cd client
npm run dev
```

Open your browser to: **`http://localhost:5173`**

The React app will automatically communicate with the Express API via Vite's local `/api` proxy and display the backend health status.

---

## 🧪 Running Tests

AgentFlow uses **Vitest** for fast, deterministic unit and API integration testing:

```bash
# Run all tests from root
npm test

# Or within the server workspace:
cd server
npm test
```

Test coverage includes:
- **DAG Utility Engine**: Cycle detection (direct, indirect, self-dependencies), Kahn's topological sort, task readiness determination.
- **Service Layers**: Goal & Task business logic, cascade deletion, downstream status promotion.
- **REST API Routes**: Request validation via Zod schemas, status code handling, error payloads.

---

## 🗺️ Development Roadmap

- [x] **Phase 0: Foundation & Tooling Setup**
- [x] **Phase 1: Domain Core & CRUD (Without AI)** (Completed)
- [ ] **Phase 2: AI Planning Engine (Intention $\rightarrow$ Plan)**
- [ ] **Phase 3: Execution Tracking, Dependencies & Blockers**
- [ ] **Phase 4: Health Metrics & Risk Detection**
- [ ] **Phase 5: Human-in-the-Loop & Adaptive Replanning**
- [ ] **Phase 6: Execution History & Retrospectives**
- [ ] **Phase 7: Hardening, Polish & Production Readiness**
