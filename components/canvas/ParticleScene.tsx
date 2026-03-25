'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Leva } from 'leva';
import * as THREE from 'three';
import { SimulationProvider, useSimulation } from '@/components/providers/SimulationProvider';
import ParticleSystem from '@/components/canvas/ParticleSystem';
import ParticleTrails from '@/components/canvas/effects/ParticleTrails';
import EnergyGlow from '@/components/canvas/effects/EnergyGlow';
import ShockwaveBurst from '@/components/canvas/effects/ShockwaveBurst';
import ExplosionEffect from '@/components/canvas/effects/ExplosionEffect';
import Overlay from '@/components/ui/Overlay';
import EffectTriggers from '@/components/ui/EffectTriggers';
import ExportPanel from '@/components/ui/ExportPanel';
import LevaEnhancements from '@/components/ui/LevaEnhancements';
import EmitterPanel from '@/components/ui/EmitterPanel';
import TimelineEditor from '@/components/ui/TimelineEditor';
import { RESOLUTION_PRESETS } from '@/lib/gpu-capabilities';
import { useSceneTimeline, type SceneTimelineAPI } from '@/hooks/useSceneTimeline';

function SceneTimelineBridge({ onReady }: { onReady: (api: SceneTimelineAPI) => void }) {
  const { controlsRef, emittersRef, colorPalette, setEmitters, levaSet } = useSimulation();
  const timeline = useSceneTimeline(controlsRef, emittersRef, colorPalette, setEmitters, levaSet);
  const readyRef = useRef(false);

  useEffect(() => {
    if (!readyRef.current) {
      readyRef.current = true;
      onReady(timeline);
    }
  });

  // Keep parent in sync when the timeline object identity changes
  useEffect(() => {
    onReady(timeline);
  }, [timeline, onReady]);

  return null;
}

function SceneContents({ onTimelineReady }: { onTimelineReady: (api: SceneTimelineAPI) => void }) {
  const { controlsRef, resolutionPreset, colorPalette, emittersRef } = useSimulation();
  const positionTextureRef = useRef<THREE.Texture | null>(null);
  const velocityTextureRef = useRef<THREE.Texture | null>(null);

  const preset = RESOLUTION_PRESETS[resolutionPreset] ?? RESOLUTION_PRESETS.medium;
  const textureSize = preset.textureSize;
  const maxParticles = preset.maxParticles;

  const getPositionTexture = useCallback(() => positionTextureRef.current, []);
  const getVelocityTexture = useCallback(() => velocityTextureRef.current, []);

  return (
    <>
      <SceneTimelineBridge onReady={onTimelineReady} />
      <ParticleSystem
        controlsRef={controlsRef}
        positionTextureRef={positionTextureRef}
        velocityTextureRef={velocityTextureRef}
        textureSize={textureSize}
        maxParticles={maxParticles}
        colorPalette={colorPalette}
        emittersRef={emittersRef}
      />
      <ParticleTrails
        getPositionTexture={getPositionTexture}
        getVelocityTexture={getVelocityTexture}
        textureSize={textureSize}
        maxParticles={maxParticles}
        colorPalette={colorPalette}
      />
      <ShockwaveBurst />
      <ExplosionEffect />
      <EnergyGlow />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={50}
        makeDefault
      />
    </>
  );
}

function ParticleSceneInner() {
  const [timelineAPI, setTimelineAPI] = useState<SceneTimelineAPI | null>(null);
  const handleTimelineReady = useCallback((api: SceneTimelineAPI) => {
    setTimelineAPI(api);
  }, []);

  return (
    <div className="fixed inset-0 bg-black">
      <Canvas
        camera={{ position: [0, 3, 12], fov: 60, near: 0.1, far: 100 }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          alpha: false,
          toneMapping: THREE.NoToneMapping,
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#030308']} />
        <SceneContents onTimelineReady={handleTimelineReady} />
      </Canvas>
      <Overlay />
      <EmitterPanel />
      <EffectTriggers />
      <ExportPanel
        getCanvas={() => document.querySelector('canvas') as HTMLCanvasElement | null}
      />
      {timelineAPI && <TimelineEditor timeline={timelineAPI} />}
      <Leva
        collapsed
        theme={{
          colors: {
            elevation1: '#0a0a1a',
            elevation2: '#0d0d20',
            elevation3: '#12122a',
            accent1: '#00ffcc',
            accent2: '#00ccaa',
            accent3: '#009988',
            highlight1: '#e0e0ff',
            highlight2: '#b0b0dd',
            highlight3: '#8080bb',
          },
          fontSizes: {
            root: '11px',
          },
        }}
      />
      <LevaEnhancements />
    </div>
  );
}

export default function ParticleScene() {
  return (
    <SimulationProvider>
      <ParticleSceneInner />
    </SimulationProvider>
  );
}
