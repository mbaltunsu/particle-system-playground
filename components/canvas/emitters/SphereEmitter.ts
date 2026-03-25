// Sphere emitter: spawns particles on a sphere surface with outward velocity
// Emitter type = 1 in the position simulation shader
// All logic runs on GPU — this module provides configuration only

export const SPHERE_EMITTER = {
  type: 1 as const,
  label: 'Sphere',
  description: 'Particles spawn on sphere surface, moving outward',
} as const;
