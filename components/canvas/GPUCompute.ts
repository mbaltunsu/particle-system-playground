import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import { velocitySimulationShader } from '@/shaders/compute/velocitySimulation.glsl';
import { positionSimulationShader } from '@/shaders/compute/positionSimulation.glsl';
import { TEXTURE_SIZE } from '@/lib/constants';

export interface GPUComputeInstance {
  gpuCompute: GPUComputationRenderer;
  positionVariable: ReturnType<GPUComputationRenderer['addVariable']>;
  velocityVariable: ReturnType<GPUComputationRenderer['addVariable']>;
  positionUniforms: Record<string, THREE.IUniform>;
  velocityUniforms: Record<string, THREE.IUniform>;
}

function fillPositionTexture(texture: THREE.DataTexture) {
  const data = texture.image.data as Float32Array;
  for (let i = 0; i < data.length; i += 4) {
    // Random position in a sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.random() * 6;
    data[i] = r * Math.sin(phi) * Math.cos(theta);     // x
    data[i + 1] = r * Math.sin(phi) * Math.sin(theta); // y
    data[i + 2] = r * Math.cos(phi);                    // z
    data[i + 3] = Math.random();                         // life
  }
}

function fillVelocityTexture(texture: THREE.DataTexture) {
  const data = texture.image.data as Float32Array;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = (Math.random() - 0.5) * 0.5;     // vx
    data[i + 1] = (Math.random() - 0.5) * 0.5; // vy
    data[i + 2] = (Math.random() - 0.5) * 0.5; // vz
    data[i + 3] = Math.random();                  // energy/charge packed
  }
}

export function createGPUCompute(renderer: THREE.WebGLRenderer): GPUComputeInstance {
  const gpuCompute = new GPUComputationRenderer(TEXTURE_SIZE, TEXTURE_SIZE, renderer);

  if (!renderer.capabilities.isWebGL2) {
    gpuCompute.setDataType(THREE.HalfFloatType);
  }

  const positionTexture = gpuCompute.createTexture();
  const velocityTexture = gpuCompute.createTexture();

  fillPositionTexture(positionTexture);
  fillVelocityTexture(velocityTexture);

  const positionVariable = gpuCompute.addVariable(
    'tPosition',
    positionSimulationShader,
    positionTexture
  );
  const velocityVariable = gpuCompute.addVariable(
    'tVelocity',
    velocitySimulationShader,
    velocityTexture
  );

  gpuCompute.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);
  gpuCompute.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);

  // Position uniforms
  const posUniforms = positionVariable.material.uniforms;
  posUniforms.uDeltaTime = { value: 0.016 };
  posUniforms.uLifeDecay = { value: 0.15 };
  posUniforms.uTime = { value: 0 };
  posUniforms.uEmitterType = { value: 0 };
  posUniforms.uEmitterPosition = { value: new THREE.Vector3(0, 0, 0) };
  posUniforms.uEmitterDirection = { value: new THREE.Vector3(0, 1, 0) };
  posUniforms.uEmitterSpeed = { value: 2.0 };
  posUniforms.uEmitterRadius = { value: 1.0 };

  // Velocity uniforms
  const velUniforms = velocityVariable.material.uniforms;
  velUniforms.uDeltaTime = { value: 0.016 };
  velUniforms.uGravityStrength = { value: 0.5 };
  velUniforms.uRepulsionStrength = { value: 0.3 };
  velUniforms.uNoiseScale = { value: 1.5 };
  velUniforms.uNoiseTime = { value: 0 };
  velUniforms.uMagneticStrength = { value: 0.4 };
  velUniforms.uVortexStrength = { value: 0.5 };
  velUniforms.uGravityCenter = { value: new THREE.Vector3(0, 0, 0) };

  // Emitter uniforms on velocity shader (for initial velocity on respawn)
  velUniforms.uTime = { value: 0 };
  velUniforms.uEmitterType = { value: 0 };
  velUniforms.uEmitterDirection = { value: new THREE.Vector3(0, 1, 0) };
  velUniforms.uEmitterSpeed = { value: 2.0 };

  // Effect uniforms
  velUniforms.uShockwaveActive = { value: 0 };
  velUniforms.uShockwaveOrigin = { value: new THREE.Vector3(0, 0, 0) };
  velUniforms.uShockwaveRadius = { value: 0 };
  velUniforms.uShockwaveStrength = { value: 0 };
  velUniforms.uExplosionActive = { value: 0 };
  velUniforms.uExplosionOrigin = { value: new THREE.Vector3(0, 0, 0) };
  velUniforms.uExplosionStrength = { value: 0 };

  const error = gpuCompute.init();
  if (error !== null) {
    console.error('GPUComputationRenderer init error:', error);
  }

  return {
    gpuCompute,
    positionVariable,
    velocityVariable,
    positionUniforms: posUniforms,
    velocityUniforms: velUniforms,
  };
}
