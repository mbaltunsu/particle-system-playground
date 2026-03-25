export const particleFragmentShader = /* glsl */ `
uniform vec3 uColorStops[5];

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

  // Color gradient from palette
  float energy = clamp(vEnergy + vSpeed * 0.1, 0.0, 1.0);
  float t = energy * 4.0;
  int idx = int(floor(t));
  float frac = fract(t);
  vec3 color;
  if (idx >= 4) {
    color = uColorStops[4];
  } else if (idx == 3) {
    color = mix(uColorStops[3], uColorStops[4], frac);
  } else if (idx == 2) {
    color = mix(uColorStops[2], uColorStops[3], frac);
  } else if (idx == 1) {
    color = mix(uColorStops[1], uColorStops[2], frac);
  } else {
    color = mix(uColorStops[0], uColorStops[1], frac);
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
