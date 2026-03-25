'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulation } from '@/components/providers/SimulationProvider';

export default function ExplosionEffect() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { controlsRef } = useSimulation();

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uStrength: { value: 0 },
          uTime: { value: 0 },
        },
        vertexShader: /* glsl */ `
          uniform float uStrength;
          varying vec3 vPosition;
          void main() {
            vPosition = position;
            float scale = uStrength * 0.3;
            vec3 pos = position * scale;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uStrength;
          uniform float uTime;
          varying vec3 vPosition;
          void main() {
            float dist = length(vPosition);
            float alpha = smoothstep(1.0, 0.0, dist) * uStrength * 0.08;

            if (alpha < 0.01) discard;

            vec3 color = mix(
              vec3(1.0, 0.4, 0.1),
              vec3(1.0, 0.9, 0.5),
              smoothstep(0.5, 0.0, dist)
            );

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

  const timeRef = useRef(0);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    timeRef.current += delta;
    material.uniforms.uStrength.value = controls.explosionStrength;
    material.uniforms.uTime.value = timeRef.current;

    if (meshRef.current) {
      meshRef.current.visible = controls.explosionActive > 0;
    }
  });

  return (
    <mesh ref={meshRef} material={material} visible={false}>
      <icosahedronGeometry args={[1, 4]} />
    </mesh>
  );
}
