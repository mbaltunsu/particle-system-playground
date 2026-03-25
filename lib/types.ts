export type EmitterType = 'point' | 'sphere' | 'directional';

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
}

export interface EffectTrigger {
  shockwave: boolean;
  explosion: boolean;
  shockwaveOrigin: [number, number, number];
  explosionOrigin: [number, number, number];
}
