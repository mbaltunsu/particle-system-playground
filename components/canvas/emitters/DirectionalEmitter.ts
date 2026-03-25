// Directional emitter: spawns particles on a disk, projected along a direction
// Emitter type = 2 in the position simulation shader
// All logic runs on GPU — this module provides configuration only

export const DIRECTIONAL_EMITTER = {
  type: 2 as const,
  label: 'Directional',
  description: 'Particles emitted in a cone along a direction',
} as const;
