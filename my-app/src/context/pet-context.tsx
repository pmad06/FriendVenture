import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

import { useAuth } from '@/context/auth-context';

const API = 'http://localhost:5000';

//Types

export type TaskType = 'challenge' | 'assignment' | 'exam' | 'hobby';

export interface PetStats {
  health: number;
  hunger: number;
  happiness: number;
}

export interface Appearance {
  name: string;
  accessory: 'none' | 'bow' | 'tophat' | 'crown' | 'headphones';
  shirt: 'none' | 'stripes' | 'hearts' | 'stars' | 'plaid';
  color: 'classic' | 'pink' | 'blue' | 'lavender' | 'mint';
}

interface PetContextValue {
  stats: PetStats;
  appearance: Appearance;
  setAppearance: (patch: Partial<Appearance>) => void;
  onComplete: (type: TaskType) => void;
  onMissed: (type: TaskType) => void;
}

//Weights

const REWARDS: Record<TaskType, PetStats> = {
  challenge:       { health: 8,  hunger: 5,  happiness: 10 },
  assignment: { health: 13, hunger: 8,  happiness: 15 },
  exam:       { health: 18, hunger: 12, happiness: 20 },
  hobby:        { health: 5,  hunger: 3,  happiness: 12 },
};

const PENALTIES: Record<TaskType, PetStats> = {
  challenge:       { health: -12, hunger: -8,  happiness: -15 },
  assignment: { health: -18, hunger: -12, happiness: -20 },
  exam:       { health: -25, hunger: -18, happiness: -28 },
  hobby:        { health: -5,  hunger: -3,  happiness: -12 },
};

//Helpers

const clamp = (val: number) => Math.min(100, Math.max(0, val));

const applyDelta = (prev: PetStats, delta: PetStats): PetStats => ({
  health:    clamp(prev.health    + delta.health),
  hunger:    clamp(prev.hunger    + delta.hunger),
  happiness: clamp(prev.happiness + delta.happiness),
});

const DEFAULT_STATS: PetStats = { health: 85, hunger: 60, happiness: 72 };
const DEFAULT_APPEARANCE: Appearance = { name: 'Pandy', accessory: 'none', shirt: 'none', color: 'classic' };

//Context

const PetContext = createContext<PetContextValue | null>(null);

export function PetProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [stats, setStats] = useState<PetStats>(DEFAULT_STATS);
  const [appearance, setAppearanceState] = useState<Appearance>(DEFAULT_APPEARANCE);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);

  // Load from backend on login
  useEffect(() => {
    if (!token) { loaded.current = false; return; }
    fetch(`${API}/api/pet`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.health !== undefined) {
          setStats({ health: data.health, hunger: data.hunger, happiness: data.happiness });
          setAppearanceState({ name: data.name, color: data.color, accessory: data.accessory, shirt: data.shirt });
          loaded.current = true;
        }
      })
      .catch(() => {});
  }, [token]);

  // Save to backend on change (debounced 800ms)
  useEffect(() => {
    if (!token || !loaded.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`${API}/api/pet`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...stats, ...appearance }),
      }).catch(() => {});
    }, 800);
  }, [stats, appearance, token]);

  const setAppearance = (patch: Partial<Appearance>) =>
    setAppearanceState(prev => ({ ...prev, ...patch }));

  const onComplete = (type: TaskType) => {
    setStats(prev => applyDelta(prev, REWARDS[type]));
  };

  const onMissed = (type: TaskType) => {
    setStats(prev => applyDelta(prev, PENALTIES[type]));
  };

  return (
    <PetContext.Provider value={{ stats, appearance, setAppearance, onComplete, onMissed }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error('usePet must be used inside <PetProvider>');
  return ctx;
}
