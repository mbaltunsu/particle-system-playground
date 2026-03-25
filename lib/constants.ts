export const MAX_PARTICLES = 16384;
export const TEXTURE_SIZE = 128; // sqrt(16384)

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
} as const;
