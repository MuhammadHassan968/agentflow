import React, { useState } from 'react';
import Header from './components/Header';
import HealthStatusCard from './components/HealthStatusCard';
import RoadmapPreview from './components/RoadmapPreview';
import GoalList from './features/goals/GoalList';
import GoalDetail from './features/goals/GoalDetail';

export default function App() {
  const [selectedGoalId, setSelectedGoalId] = useState(null);

  return (
    <div className="app-container">
      <Header />
      <main>
        {selectedGoalId ? (
          <GoalDetail
            goalId={selectedGoalId}
            onBack={() => setSelectedGoalId(null)}
          />
        ) : (
          <>
            <GoalList onSelectGoal={(id) => setSelectedGoalId(id)} />
            <div style={{ marginTop: '2.5rem' }}>
              <HealthStatusCard />
              <RoadmapPreview />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
