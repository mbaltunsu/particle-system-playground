// Disc emitter: spawns particles on a flat disc surface
// Emitter type = 7 in the position simulation shader
// All logic runs on GPU — this module provides configuration only

export const DISC_EMITTER = {
  type: 7 as const,
  label: 'Disc',
  description: 'Particles spawn on a flat circular disc',
} as const;
