'use client';

import { useRef, useCallback } from 'react';
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

function SceneContents() {
  const { controlsRef } = useSimulation();
  const positionTextureRef = useRef<THREE.Texture | null>(null);
  const velocityTextureRef = useRef<THREE.Texture | null>(null);

  const getPositionTexture = useCallback(() => positionTextureRef.current, []);
  const getVelocityTexture = useCallback(() => velocityTextureRef.current, []);

  return (
    <>
      <ParticleSystem
        controlsRef={controlsRef}
        positionTextureRef={positionTextureRef}
        velocityTextureRef={velocityTextureRef}
      />
      <ParticleTrails
        getPositionTexture={getPositionTexture}
        getVelocityTexture={getVelocityTexture}
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

export default function ParticleScene() {
  return (
    <SimulationProvider>
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
          <SceneContents />
        </Canvas>
        <Overlay />
        <EffectTriggers />
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
      </div>
    </SimulationProvider>
  );
}
