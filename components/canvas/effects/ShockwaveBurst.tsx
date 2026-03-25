'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulation } from '@/components/providers/SimulationProvider';

export default function ShockwaveBurst() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { controlsRef } = useSimulation();

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uRadius: { value: 0 },
          uOpacity: { value: 0 },
          uColor: { value: new THREE.Color(0.2, 0.5, 1.0) },
          uTime: { value: 0 },
        },
        vertexShader: /* glsl */ `
          uniform float uRadius;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 pos = position * uRadius;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uOpacity;
          uniform vec3 uColor;
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vec2 center = vUv - 0.5;
            float dist = length(center) * 2.0;

            // Ring shape
            float ring = smoothstep(0.8, 0.9, dist) * smoothstep(1.0, 0.95, dist);
            float alpha = ring * uOpacity;

            if (alpha < 0.01) discard;

            vec3 color = uColor + vec3(0.3, 0.4, 0.6) * ring;
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  );

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    material.uniforms.uRadius.value = controls.shockwaveRadius;
    material.uniforms.uOpacity.value = controls.shockwaveActive * controls.shockwaveStrength * 0.1;

    if (meshRef.current) {
      meshRef.current.visible = controls.shockwaveActive > 0;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} material={material} visible={false}>
      <planeGeometry args={[2, 2, 1, 1]} />
    </mesh>
  );
}
