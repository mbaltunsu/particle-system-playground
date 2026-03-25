'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useSimulationControls, type SimulationState } from '@/hooks/useSimulationControls';
import type { ResolutionPresetKey } from '@/lib/types';
import type { EmitterConfig } from '@/lib/emitter-config';

interface SimulationContextValue {
  controlsRef: React.RefObject<SimulationState | null>;
  triggerShockwave: () => void;
  triggerExplosion: () => void;
  levaSet: (values: Record<string, unknown>) => void;
  resolutionPreset: ResolutionPresetKey;
  colorPalette: string;
  emitters: EmitterConfig[];
  setEmitters: React.Dispatch<React.SetStateAction<EmitterConfig[]>>;
  emittersRef: React.RefObject<EmitterConfig[]>;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const { controlsRef, triggerShockwave, triggerExplosion, levaSet, resolutionPreset, colorPalette, emitters, setEmitters, emittersRef } = useSimulationControls();

  return (
    <SimulationContext.Provider value={{ controlsRef, triggerShockwave, triggerExplosion, levaSet, resolutionPreset, colorPalette, emitters, setEmitters, emittersRef }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}
