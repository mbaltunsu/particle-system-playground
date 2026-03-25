export const boidsFunctions = /* glsl */ `
vec3 computeBoidForces(vec3 pos, vec3 vel, float separation, float alignment, float cohesion, float radius, int sampleCount, float textureSize) {
  vec3 sepForce = vec3(0.0);
  vec3 alignForce = vec3(0.0);
  vec3 cohesionCenter = vec3(0.0);
  int neighborCount = 0;

  float step = max(1.0, textureSize * textureSize / float(sampleCount));

  for (int i = 0; i < 512; i++) {
    if (i >= sampleCount) break;
    float idx = float(i) * step;
    float row = floor(idx / textureSize);
    float col = mod(idx, textureSize);
    vec2 sampleUV = (vec2(col, row) + 0.5) / textureSize;

    vec4 otherPos = texture2D(tPosition, sampleUV);
    vec4 otherVel = texture2D(tVelocity, sampleUV);

    if (otherPos.w <= 0.0) continue; // dead particle

    vec3 diff = pos - otherPos.xyz;
    float dist = length(diff);

    if (dist < 0.001 || dist > radius) continue;

    neighborCount++;

    // Separation: steer away from close neighbors
    if (dist < radius * 0.4) {
      sepForce += normalize(diff) / dist;
    }

    // Alignment: match velocity of neighbors
    alignForce += otherVel.xyz;

    // Cohesion: steer toward center of neighbors
    cohesionCenter += otherPos.xyz;
  }

  vec3 force = vec3(0.0);
  if (neighborCount > 0) {
    float fn = float(neighborCount);
    force += sepForce * separation;
    force += (alignForce / fn - vel) * alignment;
    force += (cohesionCenter / fn - pos) * cohesion;
  }

  // Speed limits for boids
  float speed = length(vel + force * 0.016);
  if (speed < 0.5) force += normalize(vel + vec3(0.001)) * 0.5;

  return force;
}
`;
