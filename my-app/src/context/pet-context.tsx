import React, { createContext, useContext, useState, ReactNode } from 'react';

//Types

export type TaskType = 'task' | 'assignment' | 'exam';

export interface PetStats {
  health: number;
  hunger: number;
  happiness: number;
}

interface PetContextValue {
  stats: PetStats;
  onComplete: (type: TaskType) => void;
  onMissed: (type: TaskType) => void;
}

//Weights

const REWARDS: Record<TaskType, PetStats> = {
  task:       { health: 8,  hunger: 5,  happiness: 10 },
  assignment: { health: 13, hunger: 8,  happiness: 15 },
  exam:       { health: 18, hunger: 12, happiness: 20 },
};

const PENALTIES: Record<TaskType, PetStats> = {
  task:       { health: -12, hunger: -8,  happiness: -15 },
  assignment: { health: -18, hunger: -12, happiness: -20 },
  exam:       { health: -25, hunger: -18, happiness: -28 },
};

//Helpers 

const clamp = (val: number) => Math.min(100, Math.max(0, val));

const applyDelta = (prev: PetStats, delta: PetStats): PetStats => ({
  health:    clamp(prev.health    + delta.health),
  hunger:    clamp(prev.hunger    + delta.hunger),
  happiness: clamp(prev.happiness + delta.happiness),
});

//Context 

const PetContext = createContext<PetContextValue | null>(null);

export function PetProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<PetStats>({
    health: 85,
    hunger: 60,
    happiness: 72,
  });

  const onComplete = (type: TaskType) => {
    setStats(prev => applyDelta(prev, REWARDS[type]));
  };

  const onMissed = (type: TaskType) => {
    setStats(prev => applyDelta(prev, PENALTIES[type]));
  };

  return (
    <PetContext.Provider value={{ stats, onComplete, onMissed }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error('usePet must be used inside <PetProvider>');
  return ctx;
}
