'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { SimulationState } from '@/hooks/useSimulationControls';
import type { EmitterConfig } from '@/lib/emitter-config';
import type { Scene } from '@/lib/scene/types';
import { interpolateAtTime } from '@/lib/scene/interpolation';
import { captureKeyframe, createEmptyScene, saveScene } from '@/lib/scene/scene-manager';

const LEVA_KEYS = new Set([
  'gravity', 'repulsion', 'noiseScale', 'noiseSpeed', 'magneticStrength',
  'vortexStrength', 'drag', 'windStrength', 'windDirectionX', 'windDirectionY',
  'windDirectionZ', 'attractorStrength', 'attractorX', 'attractorY', 'attractorZ',
  'turbulenceOctaves', 'turbulenceStrength', 'lifeDecay', 'simulationSpeed',
  'simulationMode', 'collider0Type', 'collider0PositionY', 'collider0Size',
  'collider0Restitution', 'collider1Type', 'collider1PositionX', 'collider1PositionY',
  'collider1PositionZ', 'collider1Size', 'collider1Restitution',
  'boidSeparation', 'boidAlignment', 'boidCohesion', 'boidRadius', 'boidSampleCount',
  'nBodyStrength', 'nBodySoftening', 'nBodySampleCount', 'colorPalette', 'resolution',
]);

function safeLevaSet(levaSet: (values: Record<string, unknown>) => void, values: Record<string, unknown>) {
  try {
    const filtered = Object.fromEntries(
      Object.entries(values).filter(([k]) => LEVA_KEYS.has(k))
    );
    if (Object.keys(filtered).length > 0) {
      levaSet(filtered);
    }
  } catch (e) {
    // Silently ignore Leva set errors during playback
  }
}

export interface SceneTimelineAPI {
  scene: Scene | null;
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  playStart: number;
  playEnd: number;
  setPlayStart: (t: number) => void;
  setPlayEnd: (t: number) => void;
  setScene: (scene: Scene | null) => void;
  newScene: (name?: string) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  addKeyframe: () => void;
  removeKeyframe: (id: string) => void;
  updateKeyframeTimestamp: (id: string, timestamp: number) => void;
  save: () => void;
}

export function useSceneTimeline(
  controlsRef: React.RefObject<SimulationState | null>,
  emittersRef: React.RefObject<EmitterConfig[]>,
  colorPalette: string,
  setEmitters: (emitters: EmitterConfig[]) => void,
  levaSet: (values: Record<string, unknown>) => void,
): SceneTimelineAPI {
  const [scene, setSceneState] = useState<Scene | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [playStart, setPlayStart] = useState(0);
  const [playEnd, setPlayEnd] = useState(10);
  const lastLevaUpdateRef = useRef(0);
  const timeRef = useRef(0);

  const setScene = useCallback((s: Scene | null) => {
    setSceneState(s);
    setCurrentTime(0);
    timeRef.current = 0;
    setIsPlaying(false);
    setPlayStart(0);
    setPlayEnd(s?.duration ?? 10);
  }, []);

  const newScene = useCallback((name = 'Untitled Scene') => {
    setScene(createEmptyScene(name));
  }, [setScene]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);
  const seek = useCallback((time: number) => {
    timeRef.current = time;
    setCurrentTime(time);
  }, []);

  const addKeyframe = useCallback(() => {
    if (!scene || !controlsRef.current) return;
    const kf = captureKeyframe(
      controlsRef.current,
      emittersRef.current ?? [],
      colorPalette,
      timeRef.current,
    );
    const updated = {
      ...scene,
      keyframes: [...scene.keyframes, kf].sort((a, b) => a.timestamp - b.timestamp),
    };
    setSceneState(updated);
  }, [scene, controlsRef, emittersRef, colorPalette]);

  const removeKeyframe = useCallback((id: string) => {
    if (!scene) return;
    setSceneState({
      ...scene,
      keyframes: scene.keyframes.filter(kf => kf.id !== id),
    });
  }, [scene]);

  const updateKeyframeTimestamp = useCallback((id: string, timestamp: number) => {
    if (!scene) return;
    setSceneState({
      ...scene,
      keyframes: scene.keyframes
        .map(kf => kf.id === id ? { ...kf, timestamp: Math.max(0, Math.min(timestamp, scene.duration)) } : kf)
        .sort((a, b) => a.timestamp - b.timestamp),
    });
  }, [scene]);

  const save = useCallback(() => {
    if (scene) saveScene(scene);
  }, [scene]);

  // Keep timeRef in sync when currentTime changes from UI (seek)
  useEffect(() => {
    timeRef.current = currentTime;
  }, [currentTime]);

  // Playback loop
  useFrame((_, delta) => {
    if (!scene || !isPlaying || !controlsRef.current) return;
    if (scene.keyframes.length < 2) return;

    const effectiveStart = playStart;
    const effectiveEnd = Math.min(playEnd, scene.duration);
    const newTime = timeRef.current + delta * playbackSpeed;
    if (newTime >= effectiveEnd) {
      timeRef.current = effectiveStart; // loop to play range start
    } else if (newTime < effectiveStart) {
      timeRef.current = effectiveStart;
    } else {
      timeRef.current = newTime;
    }

    // Interpolate and apply
    const result = interpolateAtTime(scene, timeRef.current);

    // Apply state to controlsRef (direct, every frame)
    if (result.state) {
      const s = controlsRef.current;
      for (const [key, value] of Object.entries(result.state)) {
        (s as unknown as Record<string, unknown>)[key] = value;
      }
    }

    // Apply emitters
    if (result.emitters) {
      setEmitters(result.emitters);
    }

    // Throttle UI state sync and Leva updates to 10Hz
    const now = performance.now();
    if (now - lastLevaUpdateRef.current > 100) {
      lastLevaUpdateRef.current = now;
      setCurrentTime(timeRef.current);
      if (result.state) {
        safeLevaSet(levaSet, result.state as Record<string, unknown>);
      }
      if (result.colorPalette) {
        safeLevaSet(levaSet, { colorPalette: result.colorPalette });
      }
    }
  });

  return {
    scene, isPlaying, currentTime, playbackSpeed,
    playStart, playEnd, setPlayStart, setPlayEnd,
    setScene, newScene, play, pause, togglePlay, seek,
    setPlaybackSpeed, addKeyframe, removeKeyframe,
    updateKeyframeTimestamp, save,
  };
}
