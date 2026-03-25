import * as THREE from 'three';

export const MAX_EMITTERS = 32;

export interface EmitterConfig {
  id: string;
  label: string;
  type: number; // 0=point, 1=sphere, 2=directional, 3=box, 4=cylinder, 5=cone, 6=torus, 7=disc, 8=line, 9=grid
  position: [number, number, number];
  direction: [number, number, number];
  speed: number;
  radius: number;
  height: number;
  angle: number;
  majorRadius: number;
  minorRadius: number;
  size: [number, number, number];
  endPoint: [number, number, number];
}

let nextId = 1;

export function createDefaultEmitter(type = 0): EmitterConfig {
  return {
    id: `emitter-${nextId++}`,
    label: `Emitter ${nextId - 1}`,
    type,
    position: [0, 0, 0],
    direction: [0, 1, 0],
    speed: 2.0,
    radius: 1.0,
    height: 2.0,
    angle: 0.8,
    majorRadius: 2.0,
    minorRadius: 0.5,
    size: [2, 2, 2],
    endPoint: [3, 3, 0],
  };
}

export function createEmitterDataTexture(): THREE.DataTexture {
  // 4 pixels wide (4 columns of RGBA data per emitter), MAX_EMITTERS tall
  const data = new Float32Array(4 * MAX_EMITTERS * 4); // width * height * RGBA
  const texture = new THREE.DataTexture(data, 4, MAX_EMITTERS, THREE.RGBAFormat, THREE.FloatType);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
}

export function serializeEmittersToDataTexture(emitters: EmitterConfig[], texture: THREE.DataTexture): void {
  const data = texture.image.data as Float32Array;
  data.fill(0);

  for (let i = 0; i < emitters.length && i < MAX_EMITTERS; i++) {
    const e = emitters[i];
    const row = i * 4 * 4; // each row = 4 pixels * 4 channels (RGBA)

    // Pixel 0: position.xyz, type
    data[row + 0] = e.position[0];
    data[row + 1] = e.position[1];
    data[row + 2] = e.position[2];
    data[row + 3] = e.type;

    // Pixel 1: direction.xyz, speed
    data[row + 4] = e.direction[0];
    data[row + 5] = e.direction[1];
    data[row + 6] = e.direction[2];
    data[row + 7] = e.speed;

    // Pixel 2: radius, height, angle, majorRadius
    data[row + 8] = e.radius;
    data[row + 9] = e.height;
    data[row + 10] = e.angle;
    data[row + 11] = e.majorRadius;

    // Pixel 3: minorRadius, endPoint.xyz
    data[row + 12] = e.minorRadius;
    data[row + 13] = e.endPoint[0];
    data[row + 14] = e.endPoint[1];
    data[row + 15] = e.endPoint[2];
  }

  texture.needsUpdate = true;
}
