export const shockwaveFragmentShader = /* glsl */ `
uniform float uOpacity;
uniform vec3 uColor;

varying float vEdge;
varying vec2 vUv;

void main() {
  float edgeFade = 1.0 - vEdge;
  float alpha = uOpacity * edgeFade;

  if (alpha < 0.01) discard;

  vec3 color = uColor;
  // Brighter at edges
  color += vec3(0.3, 0.5, 1.0) * edgeFade * 0.5;

  gl_FragColor = vec4(color, alpha);
}
`;
