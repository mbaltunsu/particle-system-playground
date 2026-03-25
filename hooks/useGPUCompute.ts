'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createGPUCompute, GPUComputeInstance } from '@/components/canvas/GPUCompute';
import { TEXTURE_SIZE } from '@/lib/constants';

export interface GPUComputeRef {
  getPositionTexture: () => THREE.Texture | null;
  getVelocityTexture: () => THREE.Texture | null;
  instance: GPUComputeInstance | null;
}

export function useGPUCompute(controlsRef: React.RefObject<{
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
} | null>): GPUComputeRef {
  const { gl } = useThree();
  const computeRef = useRef<GPUComputeInstance | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    computeRef.current = createGPUCompute(gl);
    return () => {
      computeRef.current?.gpuCompute.dispose();
      computeRef.current = null;
    };
  }, [gl]);

  useFrame((_, delta) => {
    const compute = computeRef.current;
    const controls = controlsRef.current;
    if (!compute || !controls) return;

    const dt = Math.min(delta, 0.05);
    timeRef.current += dt;

    // Update velocity uniforms
    const vu = compute.velocityUniforms;
    vu.uDeltaTime.value = dt;
    vu.uGravityStrength.value = controls.gravity;
    vu.uRepulsionStrength.value = controls.repulsion;
    vu.uNoiseScale.value = controls.noiseScale;
    vu.uNoiseTime.value = timeRef.current * controls.noiseSpeed;
    vu.uMagneticStrength.value = controls.magneticStrength;
    vu.uVortexStrength.value = controls.vortexStrength;

    // Emitter uniforms on velocity shader (for respawn velocity)
    vu.uTime.value = timeRef.current;
    vu.uEmitterType.value = controls.emitterType;
    vu.uEmitterSpeed.value = controls.emitterSpeed;

    // Effects
    vu.uShockwaveActive.value = controls.shockwaveActive;
    vu.uShockwaveRadius.value = controls.shockwaveRadius;
    vu.uShockwaveStrength.value = controls.shockwaveStrength;
    vu.uExplosionActive.value = controls.explosionActive;
    vu.uExplosionStrength.value = controls.explosionStrength;

    // Update position uniforms
    const pu = compute.positionUniforms;
    pu.uDeltaTime.value = dt;
    pu.uLifeDecay.value = controls.lifeDecay;
    pu.uTime.value = timeRef.current;
    pu.uEmitterType.value = controls.emitterType;
    pu.uEmitterSpeed.value = controls.emitterSpeed;
    pu.uEmitterRadius.value = controls.emitterRadius;

    compute.gpuCompute.compute();
  });

  const getPositionTexture = useCallback(() => {
    if (!computeRef.current) return null;
    return computeRef.current.gpuCompute.getCurrentRenderTarget(
      computeRef.current.positionVariable
    ).texture;
  }, []);

  const getVelocityTexture = useCallback(() => {
    if (!computeRef.current) return null;
    return computeRef.current.gpuCompute.getCurrentRenderTarget(
      computeRef.current.velocityVariable
    ).texture;
  }, []);

  return {
    getPositionTexture,
    getVelocityTexture,
    instance: computeRef.current,
  };
}
