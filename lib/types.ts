export type EmitterType = 'point' | 'sphere' | 'directional' | 'box' | 'cylinder' | 'cone' | 'torus' | 'disc' | 'line' | 'grid';

export type ResolutionPresetKey = 'low' | 'medium' | 'high' | 'ultra' | 'ultraplus';

export interface ForceParams {
  gravity: number;
  repulsion: number;
  noiseScale: number;
  noiseSpeed: number;
  magneticStrength: number;
  vortexStrength: number;
}

export interface EmitterParams {
  type: EmitterType;
  speed: number;
  radius: number;
}

export interface SimulationControls extends ForceParams {
  particleCount: number;
  lifeDecay: number;
  emitterSpeed: number;
  emitterRadius: number;
  emitterType: EmitterType;
  simulationSpeed: number;
  resolutionPreset: ResolutionPresetKey;
}

export interface EffectTrigger {
  shockwave: boolean;
  explosion: boolean;
  shockwaveOrigin: [number, number, number];
  explosionOrigin: [number, number, number];
}
