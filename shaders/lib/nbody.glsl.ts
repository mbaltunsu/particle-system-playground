export const nbodyFunctions = /* glsl */ `
vec3 computeNBodyGravity(vec3 pos, float strength, float softening, int sampleCount, float textureSize) {
  vec3 force = vec3(0.0);

  float step = max(1.0, textureSize * textureSize / float(sampleCount));

  for (int i = 0; i < 512; i++) {
    if (i >= sampleCount) break;
    float idx = float(i) * step;
    float row = floor(idx / textureSize);
    float col = mod(idx, textureSize);
    vec2 sampleUV = (vec2(col, row) + 0.5) / textureSize;

    vec4 otherPos = texture2D(tPosition, sampleUV);
    if (otherPos.w <= 0.0) continue;

    vec3 diff = otherPos.xyz - pos;
    float distSq = dot(diff, diff) + softening * softening;
    float invDist = 1.0 / sqrt(distSq);
    float invDist3 = invDist * invDist * invDist;

    force += diff * invDist3;
  }

  return force * strength;
}
`;
