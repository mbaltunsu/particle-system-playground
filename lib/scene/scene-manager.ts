import type { Scene, Keyframe } from './types';
import type { SimulationState } from '@/hooks/useSimulationControls';
import type { EmitterConfig } from '@/lib/emitter-config';

const STORAGE_KEY = 'particle-playground-scenes';

let nextKeyframeId = 1;

export function generateKeyframeId(): string {
  return `kf-${nextKeyframeId++}-${Date.now()}`;
}

export function generateSceneId(): string {
  return `scene-${Date.now()}`;
}

export function captureKeyframe(
  state: SimulationState,
  emitters: EmitterConfig[],
  colorPalette: string,
  timestamp: number,
  easing: Keyframe['easing'] = 'linear'
): Keyframe {
  return {
    id: generateKeyframeId(),
    timestamp,
    state: { ...state },
    emitters: emitters.map(e => ({ ...e })),
    colorPalette,
    easing,
  };
}

export function createEmptyScene(name = 'Untitled Scene'): Scene {
  return {
    id: generateSceneId(),
    name,
    duration: 10,
    keyframes: [],
  };
}

export function saveScene(scene: Scene): void {
  const scenes = loadAllScenes();
  const idx = scenes.findIndex(s => s.id === scene.id);
  if (idx >= 0) {
    scenes[idx] = scene;
  } else {
    scenes.push(scene);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes));
}

export function loadAllScenes(): Scene[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function loadScene(id: string): Scene | null {
  return loadAllScenes().find(s => s.id === id) ?? null;
}

export function deleteScene(id: string): void {
  const scenes = loadAllScenes().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes));
}

export function listScenes(): { id: string; name: string }[] {
  return loadAllScenes().map(s => ({ id: s.id, name: s.name }));
}
