// Line emitter: spawns particles along a line segment
// Emitter type = 8 in the position simulation shader
// All logic runs on GPU — this module provides configuration only

export const LINE_EMITTER = {
  type: 8 as const,
  label: 'Line',
  description: 'Particles spawn along a line between two points',
} as const;
