'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useControls, folder } from 'leva';
import { DEFAULTS } from '@/lib/constants';
import { EmitterType } from '@/lib/types';

export interface SimulationState {
  gravity: number;
  repulsion: number;
  noiseScale: number;
  noiseSpeed: number;
  magneticStrength: number;
  vortexStrength: number;
  lifeDecay: number;
  emitterType: number;
  emitterSpeed: number;
  emitterRadius: number;
  shockwaveActive: number;
  shockwaveRadius: number;
  shockwaveStrength: number;
  explosionActive: number;
  explosionStrength: number;
}

const EMITTER_MAP: Record<EmitterType, number> = {
  point: 0,
  sphere: 1,
  directional: 2,
};

export function useSimulationControls() {
  const stateRef = useRef<SimulationState>({
    gravity: DEFAULTS.gravity,
    repulsion: DEFAULTS.repulsion,
    noiseScale: DEFAULTS.noiseScale,
    noiseSpeed: DEFAULTS.noiseSpeed,
    magneticStrength: DEFAULTS.magneticStrength,
    vortexStrength: DEFAULTS.vortexStrength,
    lifeDecay: DEFAULTS.lifeDecay,
    emitterType: 0,
    emitterSpeed: DEFAULTS.emitterSpeed,
    emitterRadius: DEFAULTS.emitterRadius,
    shockwaveActive: 0,
    shockwaveRadius: 0,
    shockwaveStrength: 0,
    explosionActive: 0,
    explosionStrength: 0,
  });

  const shockwaveTimerRef = useRef<number | null>(null);
  const explosionTimerRef = useRef<number | null>(null);

  const controls = useControls({
    Forces: folder({
      gravity: { value: DEFAULTS.gravity, min: -3, max: 3, step: 0.01 },
      repulsion: { value: DEFAULTS.repulsion, min: 0, max: 3, step: 0.01 },
      noiseScale: { value: DEFAULTS.noiseScale, min: 0, max: 5, step: 0.01 },
      noiseSpeed: { value: DEFAULTS.noiseSpeed, min: 0, max: 2, step: 0.01 },
      magneticStrength: { value: DEFAULTS.magneticStrength, min: 0, max: 3, step: 0.01 },
      vortexStrength: { value: DEFAULTS.vortexStrength, min: 0, max: 3, step: 0.01 },
    }),
    Particles: folder({
      lifeDecay: { value: DEFAULTS.lifeDecay, min: 0.01, max: 1, step: 0.01 },
    }),
    Emitter: folder({
      emitterType: { value: 'point' as EmitterType, options: ['point', 'sphere', 'directional'] },
      emitterSpeed: { value: DEFAULTS.emitterSpeed, min: 0.1, max: 10, step: 0.1 },
      emitterRadius: { value: DEFAULTS.emitterRadius, min: 0.1, max: 5, step: 0.1 },
    }),
  });

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
    s.emitterType = EMITTER_MAP[controls.emitterType as EmitterType] ?? 0;
    s.emitterSpeed = controls.emitterSpeed;
    s.emitterRadius = controls.emitterRadius;
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
  };
}
