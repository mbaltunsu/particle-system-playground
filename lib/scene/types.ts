import type { SimulationState } from '@/hooks/useSimulationControls';
import type { EmitterConfig } from '@/lib/emitter-config';

export interface Keyframe {
  id: string;
  timestamp: number; // seconds from scene start
  state: Partial<SimulationState>;
  emitters?: EmitterConfig[];
  colorPalette?: string;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface Scene {
  id: string;
  name: string;
  duration: number; // total duration in seconds
  keyframes: Keyframe[]; // sorted by timestamp
}
