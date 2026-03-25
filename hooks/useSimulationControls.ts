'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useControls, folder } from 'leva';
import { DEFAULTS } from '@/lib/constants';
import { ResolutionPresetKey } from '@/lib/types';
import { BUILT_IN_PRESETS } from '@/lib/presets';
import { type EmitterConfig, createDefaultEmitter } from '@/lib/emitter-config';

const EMITTER_TYPE_MAP: Record<string, number> = {
  point: 0, sphere: 1, directional: 2, box: 3, cylinder: 4,
  cone: 5, torus: 6, disc: 7, line: 8, grid: 9,
};

export interface SimulationState {
  gravity: number;
  repulsion: number;
  noiseScale: number;
  noiseSpeed: number;
  magneticStrength: number;
  vortexStrength: number;
  lifeDecay: number;
  simulationSpeed: number;
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
  shockwaveActive: number;
  shockwaveRadius: number;
  shockwaveStrength: number;
  explosionActive: number;
  explosionStrength: number;
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
  simulationMode: number;
  boidSeparation: number;
  boidAlignment: number;
  boidCohesion: number;
  boidRadius: number;
  boidSampleCount: number;
  nBodyStrength: number;
  nBodySoftening: number;
  nBodySampleCount: number;
}

const PRESET_NAMES = Object.keys(BUILT_IN_PRESETS);

export function useSimulationControls() {
  const stateRef = useRef<SimulationState>({
    gravity: DEFAULTS.gravity,
    repulsion: DEFAULTS.repulsion,
    noiseScale: DEFAULTS.noiseScale,
    noiseSpeed: DEFAULTS.noiseSpeed,
    magneticStrength: DEFAULTS.magneticStrength,
    vortexStrength: DEFAULTS.vortexStrength,
    lifeDecay: DEFAULTS.lifeDecay,
    simulationSpeed: DEFAULTS.simulationSpeed,
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
    shockwaveActive: 0,
    shockwaveRadius: 0,
    shockwaveStrength: 0,
    explosionActive: 0,
    explosionStrength: 0,
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
    simulationMode: 0,
    boidSeparation: 2.0,
    boidAlignment: 1.0,
    boidCohesion: 1.0,
    boidRadius: 3.0,
    boidSampleCount: 128,
    nBodyStrength: 0.5,
    nBodySoftening: 0.5,
    nBodySampleCount: 128,
  });

  // Emitter array state
  const [emitters, setEmitters] = useState<EmitterConfig[]>([createDefaultEmitter(0)]);
  const emittersRef = useRef<EmitterConfig[]>(emitters);
  useEffect(() => { emittersRef.current = emitters; }, [emitters]);

  const shockwaveTimerRef = useRef<number | null>(null);
  const explosionTimerRef = useRef<number | null>(null);

  const [controls, set] = useControls(() => ({
    Mode: folder({
      simulationMode: { value: 0, options: { Particles: 0, Boids: 1, 'N-Body': 2, Cloth: 3 } },
    }),
    Presets: folder({
      preset: {
        value: 'Default',
        options: Object.fromEntries(PRESET_NAMES.map(n => [n, n])),
      },
    }),
    Simulation: folder({
      simulationSpeed: { value: DEFAULTS.simulationSpeed, min: 0.1, max: 3, step: 0.1 },
      resolution: {
        value: DEFAULTS.resolutionPreset as string,
        options: { Low: 'low', Medium: 'medium', High: 'high', Ultra: 'ultra' },
      },
    }),
    Forces: folder({
      gravity: { value: DEFAULTS.gravity, min: -3, max: 3, step: 0.01 },
      repulsion: { value: DEFAULTS.repulsion, min: 0, max: 3, step: 0.01 },
      noiseScale: { value: DEFAULTS.noiseScale, min: 0, max: 5, step: 0.01 },
      noiseSpeed: { value: DEFAULTS.noiseSpeed, min: 0, max: 2, step: 0.01 },
      magneticStrength: { value: DEFAULTS.magneticStrength, min: 0, max: 3, step: 0.01 },
      vortexStrength: { value: DEFAULTS.vortexStrength, min: 0, max: 3, step: 0.01 },
      drag: { value: 1.0, min: 0, max: 5, step: 0.01 },
      windStrength: { value: 0, min: 0, max: 3, step: 0.01 },
      windDirectionX: { value: 1, min: -1, max: 1, step: 0.1 },
      windDirectionY: { value: 0, min: -1, max: 1, step: 0.1 },
      windDirectionZ: { value: 0, min: -1, max: 1, step: 0.1 },
      attractorStrength: { value: 0, min: 0, max: 3, step: 0.01 },
      attractorX: { value: 3, min: -10, max: 10, step: 0.1 },
      attractorY: { value: 0, min: -10, max: 10, step: 0.1 },
      attractorZ: { value: 0, min: -10, max: 10, step: 0.1 },
      turbulenceOctaves: { value: 0, min: 0, max: 4, step: 1 },
      turbulenceStrength: { value: 0.5, min: 0, max: 3, step: 0.01 },
    }),
    Boids: folder({
      boidSeparation: { value: 2.0, min: 0, max: 5, step: 0.1 },
      boidAlignment: { value: 1.0, min: 0, max: 3, step: 0.1 },
      boidCohesion: { value: 1.0, min: 0, max: 3, step: 0.1 },
      boidRadius: { value: 3.0, min: 0.5, max: 10, step: 0.1 },
      boidSampleCount: { value: 128, options: { '64': 64, '128': 128, '256': 256, '512': 512 } },
    }),
    'N-Body': folder({
      nBodyStrength: { value: 0.5, min: 0, max: 3, step: 0.01 },
      nBodySoftening: { value: 0.5, min: 0.01, max: 2, step: 0.01 },
      nBodySampleCount: { value: 128, options: { '64': 64, '128': 128, '256': 256, '512': 512 } },
    }),
    Particles: folder({
      lifeDecay: { value: DEFAULTS.lifeDecay, min: 0.01, max: 1, step: 0.01 },
    }),
    Collision: folder({
      collider0Type: { value: 0, options: { None: 0, 'Ground Plane': 3, Sphere: 1, Box: 2 } },
      collider0PositionY: { value: -3, min: -10, max: 10, step: 0.1 },
      collider0Size: { value: 1, min: 0.1, max: 5, step: 0.1 },
      collider0Restitution: { value: 0.5, min: 0, max: 1, step: 0.01 },
      collider1Type: { value: 0, options: { None: 0, Sphere: 1, Box: 2, Cylinder: 4, Torus: 5 } },
      collider1PositionX: { value: 0, min: -10, max: 10, step: 0.1 },
      collider1PositionY: { value: 0, min: -10, max: 10, step: 0.1 },
      collider1PositionZ: { value: 0, min: -10, max: 10, step: 0.1 },
      collider1Size: { value: 1, min: 0.1, max: 5, step: 0.1 },
      collider1Restitution: { value: 0.5, min: 0, max: 1, step: 0.01 },
    }),
    Rendering: folder({
      colorPalette: { value: 'plasma', options: { Plasma: 'plasma', Ice: 'ice', Fire: 'fire', Neon: 'neon', Monochrome: 'monochrome', Ocean: 'ocean', Aurora: 'aurora' } },
    }),
  }));

  // Track previous preset to detect changes
  const prevPresetRef = useRef<string>(controls.preset as string);

  // Load preset values when preset dropdown changes
  useEffect(() => {
    const currentPreset = controls.preset as string;
    if (currentPreset !== prevPresetRef.current) {
      prevPresetRef.current = currentPreset;
      const presetData = BUILT_IN_PRESETS[currentPreset];
      if (presetData) {
        const v = presetData.values;
        set({
          simulationMode: v.simulationMode,
          gravity: v.gravity,
          repulsion: v.repulsion,
          noiseScale: v.noiseScale,
          noiseSpeed: v.noiseSpeed,
          magneticStrength: v.magneticStrength,
          vortexStrength: v.vortexStrength,
          drag: v.drag,
          windStrength: v.windStrength,
          windDirectionX: v.windDirectionX,
          windDirectionY: v.windDirectionY,
          windDirectionZ: v.windDirectionZ,
          attractorStrength: v.attractorStrength,
          attractorX: v.attractorX,
          attractorY: v.attractorY,
          attractorZ: v.attractorZ,
          turbulenceOctaves: v.turbulenceOctaves,
          turbulenceStrength: v.turbulenceStrength,
          lifeDecay: v.lifeDecay,
          simulationSpeed: v.simulationSpeed,
          collider0Type: v.collider0Type,
          collider0PositionY: v.collider0PositionY,
          collider0Size: v.collider0Size,
          collider0Restitution: v.collider0Restitution,
          collider1Type: v.collider1Type,
          collider1PositionX: v.collider1PositionX,
          collider1PositionY: v.collider1PositionY,
          collider1PositionZ: v.collider1PositionZ,
          collider1Size: v.collider1Size,
          collider1Restitution: v.collider1Restitution,
          boidSeparation: v.boidSeparation,
          boidAlignment: v.boidAlignment,
          boidCohesion: v.boidCohesion,
          boidRadius: v.boidRadius,
          boidSampleCount: v.boidSampleCount,
          nBodyStrength: v.nBodyStrength,
          nBodySoftening: v.nBodySoftening,
          nBodySampleCount: v.nBodySampleCount,
          colorPalette: v.colorPalette,
        });

        // Convert preset emitter values to EmitterConfig
        const emitterTypeNum = EMITTER_TYPE_MAP[v.emitterType] ?? 0;
        const presetEmitter = createDefaultEmitter(emitterTypeNum);
        presetEmitter.speed = v.emitterSpeed;
        presetEmitter.radius = v.emitterRadius;
        presetEmitter.height = v.emitterHeight;
        presetEmitter.angle = v.emitterAngle;
        presetEmitter.majorRadius = v.emitterMajorRadius;
        presetEmitter.minorRadius = v.emitterMinorRadius;
        setEmitters([presetEmitter]);
      }
    }
  }, [controls.preset, set]);

  // Sync Leva controls to mutable ref (no re-renders in R3F)
  useEffect(() => {
    const s = stateRef.current;
    s.gravity = controls.gravity;
    s.repulsion = controls.repulsion;
    s.noiseScale = controls.noiseScale;
    s.noiseSpeed = controls.noiseSpeed;
    s.magneticStrength = controls.magneticStrength;
    s.vortexStrength = controls.vortexStrength;
    s.lifeDecay = controls.lifeDecay;
    s.simulationSpeed = controls.simulationSpeed;
    s.drag = controls.drag;
    s.windStrength = controls.windStrength;
    s.windDirectionX = controls.windDirectionX;
    s.windDirectionY = controls.windDirectionY;
    s.windDirectionZ = controls.windDirectionZ;
    s.attractorStrength = controls.attractorStrength;
    s.attractorX = controls.attractorX;
    s.attractorY = controls.attractorY;
    s.attractorZ = controls.attractorZ;
    s.turbulenceOctaves = controls.turbulenceOctaves;
    s.turbulenceStrength = controls.turbulenceStrength;
    s.collider0Type = controls.collider0Type;
    s.collider0PositionY = controls.collider0PositionY;
    s.collider0Size = controls.collider0Size;
    s.collider0Restitution = controls.collider0Restitution;
    s.collider1Type = controls.collider1Type;
    s.collider1PositionX = controls.collider1PositionX;
    s.collider1PositionY = controls.collider1PositionY;
    s.collider1PositionZ = controls.collider1PositionZ;
    s.collider1Size = controls.collider1Size;
    s.collider1Restitution = controls.collider1Restitution;
    s.simulationMode = controls.simulationMode;
    s.boidSeparation = controls.boidSeparation;
    s.boidAlignment = controls.boidAlignment;
    s.boidCohesion = controls.boidCohesion;
    s.boidRadius = controls.boidRadius;
    s.boidSampleCount = controls.boidSampleCount;
    s.nBodyStrength = controls.nBodyStrength;
    s.nBodySoftening = controls.nBodySoftening;
    s.nBodySampleCount = controls.nBodySampleCount;
  });

  const triggerShockwave = useCallback(() => {
    const s = stateRef.current;
    s.shockwaveActive = 1;
    s.shockwaveRadius = 0;
    s.shockwaveStrength = 8;

    if (shockwaveTimerRef.current) cancelAnimationFrame(shockwaveTimerRef.current);

    let frame = 0;
    const animate = () => {
      frame++;
      s.shockwaveRadius += 0.15;
      s.shockwaveStrength *= 0.94;
      if (frame > 80) {
        s.shockwaveActive = 0;
        s.shockwaveRadius = 0;
        s.shockwaveStrength = 0;
        return;
      }
      shockwaveTimerRef.current = requestAnimationFrame(animate);
    };
    animate();
  }, []);

  const triggerExplosion = useCallback(() => {
    const s = stateRef.current;
    s.explosionActive = 1;
    s.explosionStrength = 15;

    if (explosionTimerRef.current) cancelAnimationFrame(explosionTimerRef.current);

    let frame = 0;
    const animate = () => {
      frame++;
      s.explosionStrength *= 0.92;
      if (frame > 60) {
        s.explosionActive = 0;
        s.explosionStrength = 0;
        return;
      }
      explosionTimerRef.current = requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return {
    controlsRef: stateRef,
    triggerShockwave,
    triggerExplosion,
    controls,
    resolutionPreset: (controls.resolution as ResolutionPresetKey) ?? 'medium',
    colorPalette: (controls.colorPalette as string) ?? 'plasma',
    emitters,
    setEmitters,
    emittersRef,
  };
}
