'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createGPUCompute, GPUComputeInstance } from '@/components/canvas/GPUCompute';

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
  emitterHeight: number;
  emitterAngle: number;
  emitterMajorRadius: number;
  emitterMinorRadius: number;
  drag: number;
  windStrength: number;
  windDirectionX: number;
  windDirectionY: number;
  windDirectionZ: number;
  attractorStrength: number;
  attractorX: number;
  attractorY: number;
  attractorZ: number;
  turbulenceOctaves: number;
  turbulenceStrength: number;
  shockwaveActive: number;
  shockwaveRadius: number;
  shockwaveStrength: number;
  explosionActive: number;
  explosionStrength: number;
  simulationSpeed: number;
  collider0Type: number;
  collider0PositionY: number;
  collider0Size: number;
  collider0Restitution: number;
  collider1Type: number;
  collider1PositionX: number;
  collider1PositionY: number;
  collider1PositionZ: number;
  collider1Size: number;
  collider1Restitution: number;
  simulationMode: number;
  boidSeparation: number;
  boidAlignment: number;
  boidCohesion: number;
  boidRadius: number;
  boidSampleCount: number;
  nBodyStrength: number;
  nBodySoftening: number;
  nBodySampleCount: number;
} | null>, textureSize: number): GPUComputeRef {
  const { gl } = useThree();
  const computeRef = useRef<GPUComputeInstance | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    computeRef.current?.gpuCompute.dispose();
    computeRef.current = createGPUCompute(gl, textureSize);
    timeRef.current = 0;
    return () => {
      computeRef.current?.gpuCompute.dispose();
      computeRef.current = null;
    };
  }, [gl, textureSize]);

  useFrame((_, delta) => {
    const compute = computeRef.current;
    const controls = controlsRef.current;
    if (!compute || !controls) return;

    const dt = Math.min(delta, 0.05) * (controls.simulationSpeed ?? 1.0);
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

    // New forces
    vu.uDrag.value = controls.drag;
    vu.uWindDirection.value.set(controls.windDirectionX, controls.windDirectionY, controls.windDirectionZ);
    vu.uWindStrength.value = controls.windStrength;
    vu.uAttractorPosition.value.set(controls.attractorX, controls.attractorY, controls.attractorZ);
    vu.uAttractorStrength.value = controls.attractorStrength;
    vu.uTurbulenceOctaves.value = controls.turbulenceOctaves;
    vu.uTurbulenceStrength.value = controls.turbulenceStrength;

    // Simulation mode uniforms
    vu.uSimulationMode.value = controls.simulationMode;
    vu.uBoidSeparation.value = controls.boidSeparation;
    vu.uBoidAlignment.value = controls.boidAlignment;
    vu.uBoidCohesion.value = controls.boidCohesion;
    vu.uBoidRadius.value = controls.boidRadius;
    vu.uBoidSampleCount.value = controls.boidSampleCount;
    vu.uNBodyStrength.value = controls.nBodyStrength;
    vu.uNBodySoftening.value = controls.nBodySoftening;
    vu.uNBodySampleCount.value = controls.nBodySampleCount;

    // Collider uniforms
    vu.uCollider0Type.value = controls.collider0Type;
    vu.uCollider0Position.value.set(0, controls.collider0PositionY, 0);
    vu.uCollider0Size.value.set(controls.collider0Size, controls.collider0Size, controls.collider0Size);
    vu.uCollider0Restitution.value = controls.collider0Restitution;
    vu.uCollider1Type.value = controls.collider1Type;
    vu.uCollider1Position.value.set(controls.collider1PositionX, controls.collider1PositionY, controls.collider1PositionZ);
    vu.uCollider1Size.value.set(controls.collider1Size, controls.collider1Size, controls.collider1Size);
    vu.uCollider1Restitution.value = controls.collider1Restitution;

    // Update position uniforms
    const pu = compute.positionUniforms;
    pu.uDeltaTime.value = dt;
    pu.uLifeDecay.value = controls.lifeDecay;
    pu.uTime.value = timeRef.current;
    pu.uEmitterType.value = controls.emitterType;
    pu.uEmitterSpeed.value = controls.emitterSpeed;
    pu.uEmitterRadius.value = controls.emitterRadius;
    pu.uEmitterHeight.value = controls.emitterHeight;
    pu.uEmitterAngle.value = controls.emitterAngle;
    pu.uEmitterMajorRadius.value = controls.emitterMajorRadius;
    pu.uEmitterMinorRadius.value = controls.emitterMinorRadius;

    vu.uEmitterHeight.value = controls.emitterHeight;
    vu.uEmitterAngle.value = controls.emitterAngle;
    vu.uEmitterMajorRadius.value = controls.emitterMajorRadius;
    vu.uEmitterMinorRadius.value = controls.emitterMinorRadius;

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
