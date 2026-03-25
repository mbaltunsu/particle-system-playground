'use client';

import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGPUCompute } from '@/hooks/useGPUCompute';
import { particleVertexShader } from '@/shaders/render/particleVertex.glsl';
import { particleFragmentShader } from '@/shaders/render/particleFragment.glsl';
import { MAX_PARTICLES, TEXTURE_SIZE } from '@/lib/constants';

interface ParticleSystemProps {
  controlsRef: React.RefObject<{
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
  } | null>;
  positionTextureRef: React.MutableRefObject<THREE.Texture | null>;
  velocityTextureRef: React.MutableRefObject<THREE.Texture | null>;
}

export default function ParticleSystem({ controlsRef, positionTextureRef, velocityTextureRef }: ParticleSystemProps) {
  const { viewport } = useThree();

  const gpuCompute = useGPUCompute(controlsRef);

  const indices = useMemo(() => {
    const arr = new Float32Array(MAX_PARTICLES);
    for (let i = 0; i < MAX_PARTICLES; i++) {
      arr[i] = i;
    }
    return arr;
  }, []);

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          tPosition: { value: null },
          tVelocity: { value: null },
          uTextureSize: { value: TEXTURE_SIZE },
          uPixelRatio: { value: 1 },
        },
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

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
  });

  const positions = useMemo(() => new Float32Array(MAX_PARTICLES * 3), []);

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
