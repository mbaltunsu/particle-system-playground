'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { trailVertexShader } from '@/shaders/effects/trailVertex.glsl';
import { trailFragmentShader } from '@/shaders/effects/trailFragment.glsl';
import { DEFAULTS } from '@/lib/constants';
import { COLOR_PALETTES } from '@/lib/color-palettes';

interface ParticleTrailsProps {
  getPositionTexture: () => THREE.Texture | null;
  getVelocityTexture: () => THREE.Texture | null;
  textureSize: number;
  maxParticles: number;
  colorPalette?: string;
}

export default function ParticleTrails({ getPositionTexture, getVelocityTexture, textureSize, maxParticles, colorPalette = 'plasma' }: ParticleTrailsProps) {
  const { viewport } = useThree();
  const trailCount = DEFAULTS.trailLength;
  const lastPaletteRef = useRef(colorPalette);

  const { trailIndices, trailSlots, positions } = useMemo(() => {
    const totalPoints = maxParticles * trailCount;
    const indices = new Float32Array(totalPoints);
    const slots = new Float32Array(totalPoints);

    for (let t = 0; t < trailCount; t++) {
      for (let i = 0; i < maxParticles; i++) {
        const idx = t * maxParticles + i;
        indices[idx] = i;
        slots[idx] = t / (trailCount - 1); // 0.0 = newest, 1.0 = oldest
      }
    }
    return {
      trailIndices: indices,
      trailSlots: slots,
      positions: new Float32Array(totalPoints * 3),
    };
  }, [trailCount, maxParticles]);

  const shaderMaterial = useMemo(() => {
    const palette = COLOR_PALETTES[colorPalette] ?? COLOR_PALETTES.plasma;
    const stop = palette.stops[2];
    return new THREE.ShaderMaterial({
      uniforms: {
        tPosition: { value: null },
        tVelocity: { value: null },
        uTextureSize: { value: textureSize },
        uPixelRatio: { value: 1 },
        uTrailOpacity: { value: 0.2 },
        uDeltaTime: { value: 0.016 },
        uTrailColor: { value: new THREE.Vector3(stop[0], stop[1], stop[2]) },
      },
      vertexShader: trailVertexShader,
      fragmentShader: trailFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [textureSize]);

  useFrame((_, delta) => {
    const posTex = getPositionTexture();
    const velTex = getVelocityTexture();
    if (posTex && velTex) {
      shaderMaterial.uniforms.tPosition.value = posTex;
      shaderMaterial.uniforms.tVelocity.value = velTex;
      shaderMaterial.uniforms.uPixelRatio.value = viewport.dpr;
      shaderMaterial.uniforms.uDeltaTime.value = Math.min(delta, 0.05);
    }

    if (lastPaletteRef.current !== colorPalette) {
      lastPaletteRef.current = colorPalette;
      const palette = COLOR_PALETTES[colorPalette] ?? COLOR_PALETTES.plasma;
      const stop = palette.stops[2];
      shaderMaterial.uniforms.uTrailColor.value = new THREE.Vector3(stop[0], stop[1], stop[2]);
    }
  });

  return (
    <points material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aIndex"
          args={[trailIndices, 1]}
        />
        <bufferAttribute
          attach="attributes-aTrailIndex"
          args={[trailSlots, 1]}
        />
      </bufferGeometry>
    </points>
  );
}
