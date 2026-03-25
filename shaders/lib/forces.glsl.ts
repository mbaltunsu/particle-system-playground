export const forcesFunctions = /* glsl */ `
vec3 applyGravity(vec3 pos, vec3 center, float strength) {
  vec3 dir = center - pos;
  float dist = max(length(dir), 0.1);
  return normalize(dir) * strength / (dist * dist);
}

vec3 applyRepulsion(vec3 pos, vec3 center, float strength) {
  vec3 dir = pos - center;
  float dist = max(length(dir), 0.1);
  return normalize(dir) * strength / (dist * dist);
}

vec3 applyMagnetic(vec3 pos, vec3 vel, float strength) {
  vec3 B = normalize(vec3(0.0, 1.0, 0.3));
  return cross(vel, B) * strength;
}

vec3 applyNoiseFlow(vec3 pos, float scale, float time) {
  float eps = 0.01;
  vec3 p = pos * scale;
  float t = time * 0.2;

  float nx1 = snoise(p + vec3(eps, 0.0, 0.0) + t);
  float nx2 = snoise(p - vec3(eps, 0.0, 0.0) + t);
  float ny1 = snoise(p + vec3(0.0, eps, 0.0) + t);
  float ny2 = snoise(p - vec3(0.0, eps, 0.0) + t);
  float nz1 = snoise(p + vec3(0.0, 0.0, eps) + t);
  float nz2 = snoise(p - vec3(0.0, 0.0, eps) + t);

  // Curl noise (divergence-free)
  float curlX = (ny1 - ny2) - (nz1 - nz2);
  float curlY = (nz1 - nz2) - (nx1 - nx2);
  float curlZ = (nx1 - nx2) - (ny1 - ny2);

  return vec3(curlX, curlY, curlZ) / (2.0 * eps);
}

vec3 applyVortex(vec3 pos, float strength) {
  vec3 toAxis = vec3(pos.x, 0.0, pos.z);
  float dist = max(length(toAxis), 0.1);
  vec3 tangent = normalize(cross(vec3(0.0, 1.0, 0.0), toAxis));
  return tangent * strength / dist;
}
`;
