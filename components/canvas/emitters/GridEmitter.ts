// Grid emitter: spawns particles on a flat grid pattern
// Emitter type = 9 in the position simulation shader
// All logic runs on GPU — this module provides configuration only

export const GRID_EMITTER = {
  type: 9 as const,
  label: 'Grid',
  description: 'Particles spawn at regular grid positions on a plane',
} as const;
