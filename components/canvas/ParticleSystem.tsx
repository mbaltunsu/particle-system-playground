'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGPUCompute } from '@/hooks/useGPUCompute';
import { particleVertexShader } from '@/shaders/render/particleVertex.glsl';
import { particleFragmentShader } from '@/shaders/render/particleFragment.glsl';
import { COLOR_PALETTES } from '@/lib/color-palettes';
import type { SimulationState } from '@/hooks/useSimulationControls';

interface ParticleSystemProps {
  controlsRef: React.RefObject<SimulationState | null>;
  positionTextureRef: React.MutableRefObject<THREE.Texture | null>;
  velocityTextureRef: React.MutableRefObject<THREE.Texture | null>;
  textureSize: number;
  maxParticles: number;
  colorPalette?: string;
}

export default function ParticleSystem({ controlsRef, positionTextureRef, velocityTextureRef, textureSize, maxParticles, colorPalette = 'plasma' }: ParticleSystemProps) {
  const { viewport } = useThree();
  const lastPaletteRef = useRef(colorPalette);

  const gpuCompute = useGPUCompute(controlsRef, textureSize);

  const indices = useMemo(() => {
    const arr = new Float32Array(maxParticles);
    for (let i = 0; i < maxParticles; i++) {
      arr[i] = i;
    }
    return arr;
  }, [maxParticles]);

  const shaderMaterial = useMemo(() => {
    const palette = COLOR_PALETTES[colorPalette] ?? COLOR_PALETTES.plasma;
    return new THREE.ShaderMaterial({
      uniforms: {
        tPosition: { value: null },
        tVelocity: { value: null },
        uTextureSize: { value: textureSize },
        uPixelRatio: { value: 1 },
        uColorStops: { value: palette.stops.map(s => new THREE.Vector3(s[0], s[1], s[2])) },
      },
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [textureSize]);

  useFrame(() => {
    const posTex = gpuCompute.getPositionTexture();
    const velTex = gpuCompute.getVelocityTexture();
    if (posTex && velTex) {
      shaderMaterial.uniforms.tPosition.value = posTex;
      shaderMaterial.uniforms.tVelocity.value = velTex;
      shaderMaterial.uniforms.uPixelRatio.value = viewport.dpr;
      positionTextureRef.current = posTex;
      velocityTextureRef.current = velTex;
    }

    if (lastPaletteRef.current !== colorPalette) {
      lastPaletteRef.current = colorPalette;
      const palette = COLOR_PALETTES[colorPalette] ?? COLOR_PALETTES.plasma;
      shaderMaterial.uniforms.uColorStops.value = palette.stops.map(s => new THREE.Vector3(s[0], s[1], s[2]));
    }
  });

  const positions = useMemo(() => new Float32Array(maxParticles * 3), [maxParticles]);

  return (
    <points material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aIndex"
          args={[indices, 1]}
        />
      </bufferGeometry>
    </points>
  );
}
