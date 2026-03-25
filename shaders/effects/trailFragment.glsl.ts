export const trailFragmentShader = /* glsl */ `
varying float vAlpha;
varying float vLife;

void main() {
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center) * 2.0;
  float alpha = smoothstep(1.0, 0.2, dist) * vAlpha;

  if (alpha < 0.005) discard;

  vec3 color = vec3(0.1, 0.4, 0.9) * vLife + vec3(0.0, 0.2, 0.4);

  gl_FragColor = vec4(color * 0.3, alpha * 0.08);
}
`;
