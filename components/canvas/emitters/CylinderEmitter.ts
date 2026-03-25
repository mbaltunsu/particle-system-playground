// Cylinder emitter: spawns particles on or within a cylinder
// Emitter type = 4 in the position simulation shader
// All logic runs on GPU — this module provides configuration only

export const CYLINDER_EMITTER = {
  type: 4 as const,
  label: 'Cylinder',
  description: 'Particles spawn within a cylindrical volume',
} as const;
