export const sdfFunctions = /* glsl */ `
// SDF Primitives
float sdSphere(vec3 p, vec3 center, float radius) {
  return length(p - center) - radius;
}

float sdBox(vec3 p, vec3 center, vec3 halfSize) {
  vec3 d = abs(p - center) - halfSize;
  return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
}

float sdPlane(vec3 p, vec3 normal, float offset) {
  return dot(p, normal) - offset;
}

float sdCylinder(vec3 p, vec3 center, float radius, float halfHeight) {
  vec3 d = p - center;
  vec2 w = vec2(length(d.xz) - radius, abs(d.y) - halfHeight);
  return length(max(w, 0.0)) + min(max(w.x, w.y), 0.0);
}

float sdTorus(vec3 p, vec3 center, float majorR, float minorR) {
  vec3 d = p - center;
  vec2 q = vec2(length(d.xz) - majorR, d.y);
  return length(q) - minorR;
}

// Evaluate SDF for a collider type (0=none, 1=sphere, 2=box, 3=plane, 4=cylinder, 5=torus)
float evaluateSDF(vec3 p, int type, vec3 position, vec3 size) {
  if (type == 1) return sdSphere(p, position, size.x);
  if (type == 2) return sdBox(p, position, size);
  if (type == 3) return sdPlane(p, vec3(0.0, 1.0, 0.0), position.y);
  if (type == 4) return sdCylinder(p, position, size.x, size.y);
  if (type == 5) return sdTorus(p, position, size.x, size.y);
  return 1000.0; // no collision
}

// Compute SDF gradient (surface normal) via central differences
vec3 sdfGradient(vec3 p, int type, vec3 position, vec3 size) {
  float eps = 0.01;
  float d = evaluateSDF(p, type, position, size);
  return normalize(vec3(
    evaluateSDF(p + vec3(eps, 0.0, 0.0), type, position, size) - d,
    evaluateSDF(p + vec3(0.0, eps, 0.0), type, position, size) - d,
    evaluateSDF(p + vec3(0.0, 0.0, eps), type, position, size) - d
  ));
}

// Collision response: push out + reflect velocity
void resolveCollision(inout vec3 pos, inout vec3 vel, int type, vec3 position, vec3 size, float restitution) {
  if (type == 0) return;
  float d = evaluateSDF(pos, type, position, size);
  if (d < 0.0) {
    vec3 normal = sdfGradient(pos, type, position, size);
    pos += normal * (-d + 0.01); // push out
    float vn = dot(vel, normal);
    if (vn < 0.0) {
      vel -= normal * vn * (1.0 + restitution); // reflect
    }
  }
}
`;
