export const particleFragmentShader = /* glsl */ `
varying float vLife;
varying float vEnergy;
varying float vSpeed;
varying float vDistFade;

void main() {
  // Soft circle
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center) * 2.0;
  float alpha = smoothstep(1.0, 0.3, dist) * vLife;

  if (alpha < 0.01) discard;

  // Color gradient: blue (cold) -> cyan -> white -> orange -> red (hot)
  float energy = clamp(vEnergy + vSpeed * 0.1, 0.0, 1.0);

  vec3 color;
  if (energy < 0.25) {
    color = mix(vec3(0.05, 0.15, 0.6), vec3(0.0, 0.7, 1.0), energy * 4.0);
  } else if (energy < 0.5) {
    color = mix(vec3(0.0, 0.7, 1.0), vec3(0.7, 1.0, 1.0), (energy - 0.25) * 4.0);
  } else if (energy < 0.75) {
    color = mix(vec3(0.7, 1.0, 1.0), vec3(1.0, 0.6, 0.1), (energy - 0.5) * 4.0);
  } else {
    color = mix(vec3(1.0, 0.6, 0.1), vec3(1.0, 0.2, 0.05), (energy - 0.75) * 4.0);
  }

  // Speed brightens (subtle)
  color += vec3(0.02) * clamp(vSpeed, 0.0, 1.0);

  // Core glow - brighter at center
  float glow = exp(-dist * dist * 5.0);
  color += vec3(0.08, 0.12, 0.2) * glow;

  // Fade near center to prevent additive pile-up, clamp color output
  float fadedAlpha = alpha * 0.18 * (0.05 + 0.95 * vDistFade);
  gl_FragColor = vec4(clamp(color * 0.35, 0.0, 0.45), fadedAlpha);
}
`;
