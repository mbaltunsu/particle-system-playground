// Cone emitter: spawns particles within a cone shape
// Emitter type = 5 in the position simulation shader
// All logic runs on GPU — this module provides configuration only

export const CONE_EMITTER = {
  type: 5 as const,
  label: 'Cone',
  description: 'Particles spawn within a conical volume',
} as const;
