import { RESOLUTION_PRESETS } from './gpu-capabilities';

export function getParticleConfig(preset: string) {
  const key = preset as keyof typeof RESOLUTION_PRESETS;
  const p = RESOLUTION_PRESETS[key] ?? RESOLUTION_PRESETS.medium;
  return { maxParticles: p.maxParticles, textureSize: p.textureSize };
}

const defaultConfig = getParticleConfig('medium');

export const MAX_PARTICLES = defaultConfig.maxParticles;
export const TEXTURE_SIZE = defaultConfig.textureSize;

export const DEFAULTS = {
  particleCount: 10000,
  lifeDecay: 0.15,

  gravity: 0.15,
  repulsion: 0.6,
  noiseScale: 1.5,
  noiseSpeed: 0.3,
  magneticStrength: 0.4,
  vortexStrength: 0.5,

  emitterSpeed: 2.0,
  emitterRadius: 1.0,

  trailLength: 3,
  bloomIntensity: 0.3,
  bloomThreshold: 0.8,

  resolutionPreset: 'medium' as const,
  simulationSpeed: 1.0,
} as const;
