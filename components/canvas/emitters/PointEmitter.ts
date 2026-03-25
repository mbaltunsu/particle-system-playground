// Point emitter: spawns particles at a single point with random outward velocity
// Emitter type = 0 in the position simulation shader
// All logic runs on GPU — this module provides configuration only

export const POINT_EMITTER = {
  type: 0 as const,
  label: 'Point',
  description: 'Omnidirectional burst from a single point',
} as const;
