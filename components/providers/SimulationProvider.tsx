'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useSimulationControls, type SimulationState } from '@/hooks/useSimulationControls';

interface SimulationContextValue {
  controlsRef: React.RefObject<SimulationState | null>;
  triggerShockwave: () => void;
  triggerExplosion: () => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const { controlsRef, triggerShockwave, triggerExplosion } = useSimulationControls();

  return (
    <SimulationContext.Provider value={{ controlsRef, triggerShockwave, triggerExplosion }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}
