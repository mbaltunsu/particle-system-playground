'use client';

import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { trailVertexShader } from '@/shaders/effects/trailVertex.glsl';
import { trailFragmentShader } from '@/shaders/effects/trailFragment.glsl';
import { MAX_PARTICLES, TEXTURE_SIZE, DEFAULTS } from '@/lib/constants';

interface ParticleTrailsProps {
  getPositionTexture: () => THREE.Texture | null;
  getVelocityTexture: () => THREE.Texture | null;
}

export default function ParticleTrails({ getPositionTexture, getVelocityTexture }: ParticleTrailsProps) {
  const { viewport } = useThree();
  const trailCount = DEFAULTS.trailLength;

  const { trailIndices, trailSlots, positions } = useMemo(() => {
    const totalPoints = MAX_PARTICLES * trailCount;
    const indices = new Float32Array(totalPoints);
    const slots = new Float32Array(totalPoints);

    for (let t = 0; t < trailCount; t++) {
      for (let i = 0; i < MAX_PARTICLES; i++) {
        const idx = t * MAX_PARTICLES + i;
        indices[idx] = i;
        slots[idx] = t / (trailCount - 1); // 0.0 = newest, 1.0 = oldest
      }
    }
    return {
      trailIndices: indices,
      trailSlots: slots,
      positions: new Float32Array(totalPoints * 3),
    };
  }, [trailCount]);

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          tPosition: { value: null },
          tVelocity: { value: null },
          uTextureSize: { value: TEXTURE_SIZE },
          uPixelRatio: { value: 1 },
          uTrailOpacity: { value: 0.2 },
          uDeltaTime: { value: 0.016 },
        },
        vertexShader: trailVertexShader,
        fragmentShader: trailFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  useFrame((_, delta) => {
    const posTex = getPositionTexture();
    const velTex = getVelocityTexture();
    if (posTex && velTex) {
      shaderMaterial.uniforms.tPosition.value = posTex;
      shaderMaterial.uniforms.tVelocity.value = velTex;
      shaderMaterial.uniforms.uPixelRatio.value = viewport.dpr;
      shaderMaterial.uniforms.uDeltaTime.value = Math.min(delta, 0.05);
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
