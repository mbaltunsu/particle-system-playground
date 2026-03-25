export const shockwaveVertexShader = /* glsl */ `
uniform float uRadius;
uniform float uThickness;

varying float vEdge;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Scale the ring geometry by radius
  pos.xz *= uRadius;

  vEdge = smoothstep(0.0, 0.1, abs(uv.y - 0.5) * 2.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;
