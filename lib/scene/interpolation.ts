import type { SimulationState } from '@/hooks/useSimulationControls';
import type { EmitterConfig } from '@/lib/emitter-config';
import type { Keyframe, Scene } from './types';

// Categorical fields that should snap, not interpolate
const CATEGORICAL_FIELDS = new Set([
  'simulationMode', 'collider0Type', 'collider1Type', 'boidSampleCount', 'nBodySampleCount'
]);

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function applyEasing(t: number, easing: Keyframe['easing']): number {
  switch (easing) {
    case 'ease-in': return t * t;
    case 'ease-out': return t * (2 - t);
    case 'ease-in-out': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    default: return t;
  }
}

export function interpolateState(
  a: Partial<SimulationState>,
  b: Partial<SimulationState>,
  t: number
): Partial<SimulationState> {
  const result: Record<string, number> = {};
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const key of allKeys) {
    const va = (a as Record<string, number>)[key];
    const vb = (b as Record<string, number>)[key];
    if (va === undefined && vb === undefined) continue;
    if (va === undefined) { result[key] = vb; continue; }
    if (vb === undefined) { result[key] = va; continue; }

    if (CATEGORICAL_FIELDS.has(key)) {
      result[key] = t < 0.5 ? va : vb;
    } else {
      result[key] = lerp(va, vb, t);
    }
  }

  return result as Partial<SimulationState>;
}

export function interpolateEmitters(
  a: EmitterConfig[] | undefined,
  b: EmitterConfig[] | undefined,
  t: number
): EmitterConfig[] | undefined {
  if (!a && !b) return undefined;
  if (!a) return b;
  if (!b) return a;
  // If different lengths, snap to nearest
  if (a.length !== b.length) return t < 0.5 ? a : b;
  // Same length: lerp numeric fields per emitter
  return a.map((ea, i) => {
    const eb = b[i];
    return {
      ...ea,
      type: t < 0.5 ? ea.type : eb.type,
      position: [
        lerp(ea.position[0], eb.position[0], t),
        lerp(ea.position[1], eb.position[1], t),
        lerp(ea.position[2], eb.position[2], t),
      ] as [number, number, number],
      direction: [
        lerp(ea.direction[0], eb.direction[0], t),
        lerp(ea.direction[1], eb.direction[1], t),
        lerp(ea.direction[2], eb.direction[2], t),
      ] as [number, number, number],
      speed: lerp(ea.speed, eb.speed, t),
      radius: lerp(ea.radius, eb.radius, t),
      height: lerp(ea.height, eb.height, t),
      angle: lerp(ea.angle, eb.angle, t),
      majorRadius: lerp(ea.majorRadius, eb.majorRadius, t),
      minorRadius: lerp(ea.minorRadius, eb.minorRadius, t),
    };
  });
}

export function interpolateAtTime(scene: Scene, currentTime: number): {
  state: Partial<SimulationState>;
  emitters?: EmitterConfig[];
  colorPalette?: string;
} {
  const { keyframes } = scene;
  if (keyframes.length === 0) return { state: {} };
  if (keyframes.length === 1) return {
    state: keyframes[0].state,
    emitters: keyframes[0].emitters,
    colorPalette: keyframes[0].colorPalette,
  };

  const time = Math.max(0, Math.min(currentTime, scene.duration));

  // Find surrounding keyframes
  let before = keyframes[0];
  let after = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (time >= keyframes[i].timestamp && time <= keyframes[i + 1].timestamp) {
      before = keyframes[i];
      after = keyframes[i + 1];
      break;
    }
  }

  if (before === after || before.timestamp === after.timestamp) {
    return {
      state: before.state,
      emitters: before.emitters,
      colorPalette: before.colorPalette,
    };
  }

  const rawT = (time - before.timestamp) / (after.timestamp - before.timestamp);
  const t = applyEasing(Math.max(0, Math.min(1, rawT)), after.easing);

  return {
    state: interpolateState(before.state, after.state, t),
    emitters: interpolateEmitters(before.emitters, after.emitters, t),
    colorPalette: t < 0.5 ? before.colorPalette : after.colorPalette,
  };
}
