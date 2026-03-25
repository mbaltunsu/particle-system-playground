export const emitterFunctions = /* glsl */ `
// Hash function for pseudo-random (same as used in position shader)
float emitHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec3 emitRandomSpherePoint(vec2 uv, float t) {
  float u = emitHash(uv + t) * 2.0 - 1.0;
  float theta = emitHash(uv * 1.7 + t + 0.5) * 6.28318;
  float s = sqrt(1.0 - u * u);
  return vec3(s * cos(theta), u, s * sin(theta));
}

vec3 emitBox(vec2 uv, float seed, vec3 size) {
  float x = (emitHash(uv + seed) - 0.5) * size.x;
  float y = (emitHash(uv * 1.3 + seed + 0.1) - 0.5) * size.y;
  float z = (emitHash(uv * 1.7 + seed + 0.2) - 0.5) * size.z;
  return vec3(x, y, z);
}

vec3 emitCylinder(vec2 uv, float seed, float radius, float height) {
  float angle = emitHash(uv + seed) * 6.28318;
  float h = (emitHash(uv * 1.3 + seed + 0.1) - 0.5) * height;
  return vec3(cos(angle) * radius, h, sin(angle) * radius);
}

vec3 emitCone(vec2 uv, float seed, float angle, float height) {
  float t = emitHash(uv + seed);
  float h = t * height;
  float r = t * tan(angle * 0.5);
  float theta = emitHash(uv * 1.3 + seed + 0.1) * 6.28318;
  return vec3(cos(theta) * r, h, sin(theta) * r);
}

vec3 emitTorus(vec2 uv, float seed, float majorR, float minorR) {
  float theta = emitHash(uv + seed) * 6.28318;
  float phi = emitHash(uv * 1.3 + seed + 0.1) * 6.28318;
  float x = (majorR + minorR * cos(phi)) * cos(theta);
  float y = minorR * sin(phi);
  float z = (majorR + minorR * cos(phi)) * sin(theta);
  return vec3(x, y, z);
}

vec3 emitDisc(vec2 uv, float seed, float radius) {
  float angle = emitHash(uv + seed) * 6.28318;
  float r = sqrt(emitHash(uv * 1.3 + seed + 0.1)) * radius;
  return vec3(cos(angle) * r, 0.0, sin(angle) * r);
}

vec3 emitLine(vec2 uv, float seed, vec3 start, vec3 end) {
  float t = emitHash(uv + seed);
  return mix(start, end, t);
}

vec3 emitGrid(vec2 uv, float seed, float spacing, float size) {
  float gridCount = floor(size / spacing);
  float x = (floor(emitHash(uv + seed) * gridCount) - gridCount * 0.5) * spacing;
  float z = (floor(emitHash(uv * 1.3 + seed + 0.1) * gridCount) - gridCount * 0.5) * spacing;
  float jitter = spacing * 0.1;
  x += (emitHash(uv * 2.1 + seed + 0.3) - 0.5) * jitter;
  z += (emitHash(uv * 2.7 + seed + 0.4) - 0.5) * jitter;
  return vec3(x, 0.0, z);
}
`;
