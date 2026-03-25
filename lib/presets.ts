export interface Preset {
  label: string;
  description: string;
  values: {
    // Simulation mode
    simulationMode: number;
    // Forces
    gravity: number;
    repulsion: number;
    noiseScale: number;
    noiseSpeed: number;
    magneticStrength: number;
    vortexStrength: number;
    drag: number;
    windStrength: number;
    windDirectionX: number;
    windDirectionY: number;
    windDirectionZ: number;
    attractorStrength: number;
    attractorX: number;
    attractorY: number;
    attractorZ: number;
    turbulenceOctaves: number;
    turbulenceStrength: number;
    // Particles
    lifeDecay: number;
    // Emitter
    emitterType: string;
    emitterSpeed: number;
    emitterRadius: number;
    emitterHeight: number;
    emitterAngle: number;
    emitterMajorRadius: number;
    emitterMinorRadius: number;
    // Simulation
    simulationSpeed: number;
    // Collision
    collider0Type: number;
    collider0PositionY: number;
    collider0Size: number;
    collider0Restitution: number;
    collider1Type: number;
    collider1PositionX: number;
    collider1PositionY: number;
    collider1PositionZ: number;
    collider1Size: number;
    collider1Restitution: number;
    // Boids
    boidSeparation: number;
    boidAlignment: number;
    boidCohesion: number;
    boidRadius: number;
    boidSampleCount: number;
    // N-Body
    nBodyStrength: number;
    nBodySoftening: number;
    nBodySampleCount: number;
    // Rendering
    colorPalette: string;
  };
}

/** Sensible defaults for all new fields — used as a base for every preset */
const BASE_VALUES: Preset['values'] = {
  simulationMode: 0,
  gravity: 0.15,
  repulsion: 0.6,
  noiseScale: 1.5,
  noiseSpeed: 0.3,
  magneticStrength: 0.4,
  vortexStrength: 0.5,
  drag: 1.0,
  windStrength: 0,
  windDirectionX: 1,
  windDirectionY: 0,
  windDirectionZ: 0,
  attractorStrength: 0,
  attractorX: 3,
  attractorY: 0,
  attractorZ: 0,
  turbulenceOctaves: 0,
  turbulenceStrength: 0.5,
  lifeDecay: 0.15,
  emitterType: 'point',
  emitterSpeed: 2.0,
  emitterRadius: 1.0,
  emitterHeight: 2.0,
  emitterAngle: 0.8,
  emitterMajorRadius: 2.0,
  emitterMinorRadius: 0.5,
  simulationSpeed: 1.0,
  collider0Type: 0,
  collider0PositionY: -3,
  collider0Size: 1,
  collider0Restitution: 0.5,
  collider1Type: 0,
  collider1PositionX: 0,
  collider1PositionY: 0,
  collider1PositionZ: 0,
  collider1Size: 1,
  collider1Restitution: 0.5,
  boidSeparation: 2.0,
  boidAlignment: 1.0,
  boidCohesion: 1.0,
  boidRadius: 3.0,
  boidSampleCount: 128,
  nBodyStrength: 0.5,
  nBodySoftening: 0.5,
  nBodySampleCount: 128,
  colorPalette: 'plasma',
};

function preset(
  label: string,
  description: string,
  overrides: Partial<Preset['values']>,
): Preset {
  return { label, description, values: { ...BASE_VALUES, ...overrides } };
}

export const BUILT_IN_PRESETS: Record<string, Preset> = {
  Default: preset('Default', 'Balanced defaults with gentle forces', {}),

  Galaxy: preset('Galaxy', 'Slow-spinning galactic spiral with N-Body gravity', {
    simulationMode: 2,
    gravity: 0.05,
    repulsion: 0.3,
    noiseScale: 0.8,
    noiseSpeed: 0.1,
    magneticStrength: 0.5,
    vortexStrength: 2.5,
    lifeDecay: 0.08,
    emitterType: 'disc',
    emitterSpeed: 1.0,
    emitterRadius: 3.0,
    simulationSpeed: 0.7,
    nBodyStrength: 0.3,
    nBodySoftening: 0.3,
    nBodySampleCount: 128,
    colorPalette: 'plasma',
  }),

  Fire: preset('Fire', 'Upward flames with turbulent noise', {
    gravity: -1.5,
    repulsion: 0.4,
    noiseScale: 3.0,
    noiseSpeed: 1.2,
    magneticStrength: 0.0,
    vortexStrength: 0.3,
    lifeDecay: 0.5,
    emitterType: 'cone',
    emitterAngle: 0.5,
    emitterHeight: 3,
    emitterSpeed: 4.0,
    emitterRadius: 0.8,
    simulationSpeed: 1.2,
    windDirectionY: 1,
    windStrength: 0.5,
    colorPalette: 'fire',
  }),

  Rain: preset('Rain', 'Heavy downpour with ground splash', {
    gravity: -2,
    repulsion: 0.0,
    noiseScale: 0.3,
    noiseSpeed: 0.1,
    magneticStrength: 0.0,
    vortexStrength: 0.0,
    drag: 2,
    lifeDecay: 0.8,
    emitterType: 'line',
    emitterSpeed: 6.0,
    emitterRadius: 4.0,
    simulationSpeed: 1.0,
    collider0Type: 3,
    collider0PositionY: -5,
    collider0Restitution: 0.2,
    colorPalette: 'ocean',
  }),

  Snow: preset('Snow', 'Gentle snowfall drifting in turbulence', {
    gravity: -0.3,
    repulsion: 0.0,
    noiseScale: 1.0,
    noiseSpeed: 0.1,
    magneticStrength: 0.0,
    vortexStrength: 0.0,
    lifeDecay: 0.06,
    emitterType: 'disc',
    emitterSpeed: 0.5,
    emitterRadius: 4.0,
    simulationSpeed: 0.6,
    turbulenceOctaves: 2,
    turbulenceStrength: 0.3,
    colorPalette: 'ice',
  }),

  Aurora: preset('Aurora', 'Ethereal curtains of light drifting slowly', {
    gravity: 0.0,
    repulsion: 0.1,
    noiseScale: 2.0,
    noiseSpeed: 0.15,
    magneticStrength: 2.5,
    vortexStrength: 0.2,
    lifeDecay: 0.1,
    emitterType: 'line',
    emitterSpeed: 0.5,
    emitterRadius: 2.5,
    simulationSpeed: 0.5,
    colorPalette: 'aurora',
  }),

  'Magnetic Field': preset('Magnetic Field', 'Strong magnetic lines pulling particles into paths', {
    gravity: 0.0,
    repulsion: 0.2,
    noiseScale: 0.5,
    noiseSpeed: 0.2,
    magneticStrength: 2.8,
    vortexStrength: 1.5,
    lifeDecay: 0.12,
    emitterType: 'point',
    emitterSpeed: 3.0,
    emitterRadius: 1.0,
    colorPalette: 'neon',
  }),

  'Vortex Storm': preset('Vortex Storm', 'Chaotic spinning maelstrom of particles', {
    gravity: 0.1,
    repulsion: 0.0,
    noiseScale: 2.5,
    noiseSpeed: 0.8,
    magneticStrength: 0.5,
    vortexStrength: 3.0,
    lifeDecay: 0.12,
    emitterType: 'sphere',
    emitterSpeed: 3.0,
    emitterRadius: 2.0,
    colorPalette: 'plasma',
  }),

  Calm: preset('Calm', 'Gentle, minimal motion for a serene feel', {
    gravity: 0.05,
    repulsion: 0.2,
    noiseScale: 0.0,
    noiseSpeed: 0.0,
    magneticStrength: 0.0,
    vortexStrength: 0.0,
    lifeDecay: 0.08,
    emitterType: 'point',
    emitterSpeed: 1.0,
    emitterRadius: 0.5,
    simulationSpeed: 0.5,
    colorPalette: 'monochrome',
  }),

  Chaos: preset('Chaos', 'Maximum everything — pure particle mayhem', {
    gravity: 1.5,
    repulsion: 1.5,
    noiseScale: 4.0,
    noiseSpeed: 1.5,
    magneticStrength: 2.0,
    vortexStrength: 2.0,
    lifeDecay: 0.3,
    emitterType: 'sphere',
    emitterSpeed: 8.0,
    emitterRadius: 2.0,
    simulationSpeed: 1.5,
    colorPalette: 'plasma',
  }),

  Flock: preset('Flock', 'Boids flocking simulation with emergent behavior', {
    simulationMode: 1,
    gravity: 0.0,
    repulsion: 0.0,
    noiseScale: 0.5,
    noiseSpeed: 0.1,
    magneticStrength: 0.0,
    vortexStrength: 0.0,
    lifeDecay: 0.05,
    emitterType: 'sphere',
    emitterSpeed: 1.5,
    emitterRadius: 2.0,
    simulationSpeed: 1.0,
    boidSeparation: 2,
    boidAlignment: 1.5,
    boidCohesion: 1,
    boidRadius: 4,
    colorPalette: 'neon',
  }),

  Electromagnetic: preset('Electromagnetic', 'Charged particles around a sphere collider', {
    gravity: 0.0,
    repulsion: 0.0,
    noiseScale: 0.3,
    noiseSpeed: 0.1,
    magneticStrength: 2.5,
    vortexStrength: 1.5,
    lifeDecay: 0.1,
    emitterType: 'point',
    emitterSpeed: 3.0,
    emitterRadius: 1.0,
    attractorStrength: 1.5,
    collider1Type: 1,
    collider1Size: 1,
    colorPalette: 'neon',
  }),
};
