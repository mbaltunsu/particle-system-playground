// Torus emitter: spawns particles on or within a torus shape
// Emitter type = 6 in the position simulation shader
// All logic runs on GPU — this module provides configuration only

export const TORUS_EMITTER = {
  type: 6 as const,
  label: 'Torus',
  description: 'Particles spawn on a torus defined by major and minor radii',
} as const;
