// Box emitter: spawns particles within an axis-aligned box volume
// Emitter type = 3 in the position simulation shader
// All logic runs on GPU — this module provides configuration only

export const BOX_EMITTER = {
  type: 3 as const,
  label: 'Box',
  description: 'Particles spawn randomly within a box volume',
} as const;
