import { emitterFunctions } from '../lib/emitters.glsl';

export const positionSimulationShader = /* glsl */ `
uniform float uDeltaTime;
uniform float uLifeDecay;
uniform float uTime;

// Multi-emitter DataTexture
uniform sampler2D tEmitterData;
uniform int uNumEmitters;

// Hash function for pseudo-random
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec3 randomSpherePoint(vec2 uv, float t) {
  float u = hash(uv + t) * 2.0 - 1.0;
  float theta = hash(uv * 1.7 + t + 0.5) * 6.28318;
  float s = sqrt(1.0 - u * u);
  return vec3(s * cos(theta), u, s * sin(theta));
}

${emitterFunctions}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 posData = texture2D(tPosition, uv);
  vec4 velData = texture2D(tVelocity, uv);

  vec3 pos = posData.xyz;
  float life = posData.w;

  life -= uLifeDecay * uDeltaTime;

  if (life <= 0.0) {
    // Determine which emitter this particle belongs to
    float particleIndex = gl_FragCoord.y * resolution.x + gl_FragCoord.x;
    int emitterIdx = int(mod(particleIndex, float(max(uNumEmitters, 1))));
    float emitterV = (float(emitterIdx) + 0.5) / 32.0;

    vec4 e0 = texture2D(tEmitterData, vec2(0.125, emitterV));
    vec4 e1 = texture2D(tEmitterData, vec2(0.375, emitterV));
    vec4 e2 = texture2D(tEmitterData, vec2(0.625, emitterV));
    vec4 e3 = texture2D(tEmitterData, vec2(0.875, emitterV));

    vec3 emitterPos = e0.xyz;
    int emitterType = int(e0.w);
    vec3 emitterDir = e1.xyz;
    float emitterSpeed = e1.w;
    float emitterRadius = e2.x;
    float emitterHeight = e2.y;
    float emitterAngle = e2.z;
    float emitterMajorR = e2.w;
    float emitterMinorR = e3.x;
    vec3 emitterEndPt = e3.yzw;
    vec3 emitterSize = vec3(emitterRadius * 2.0, emitterHeight, emitterRadius * 2.0);

    // Respawn particle based on emitter type
    vec3 newPos;
    float seed = uTime * 0.1;

    if (emitterType == 0) {
      // Point emitter
      newPos = emitterPos + randomSpherePoint(uv, seed) * 0.5;
    } else if (emitterType == 1) {
      // Sphere emitter
      newPos = emitterPos + randomSpherePoint(uv, seed) * emitterRadius;
    } else if (emitterType == 2) {
      // Directional emitter - disk perpendicular to direction
      vec3 right = normalize(cross(emitterDir, vec3(0.0, 1.0, 0.001)));
      vec3 up = cross(right, emitterDir);
      float angle = hash(uv + seed) * 6.28318;
      float radius = sqrt(hash(uv * 2.3 + seed)) * emitterRadius;
      newPos = emitterPos + right * cos(angle) * radius + up * sin(angle) * radius;
    } else if (emitterType == 3) {
      // Box emitter
      newPos = emitterPos + emitBox(uv, seed, emitterSize);
    } else if (emitterType == 4) {
      // Cylinder emitter
      newPos = emitterPos + emitCylinder(uv, seed, emitterRadius, emitterHeight);
    } else if (emitterType == 5) {
      // Cone emitter
      newPos = emitterPos + emitCone(uv, seed, emitterAngle, emitterHeight);
    } else if (emitterType == 6) {
      // Torus emitter
      newPos = emitterPos + emitTorus(uv, seed, emitterMajorR, emitterMinorR);
    } else if (emitterType == 7) {
      // Disc emitter
      newPos = emitterPos + emitDisc(uv, seed, emitterRadius);
    } else if (emitterType == 8) {
      // Line emitter
      newPos = emitLine(uv, seed, emitterPos, emitterEndPt);
    } else if (emitterType == 9) {
      // Grid emitter
      newPos = emitterPos + emitGrid(uv, seed, 0.5, emitterRadius * 4.0);
    }

    // Random life duration
    float newLife = 0.7 + hash(uv + seed * 3.0) * 0.3;

    gl_FragColor = vec4(newPos, newLife);
    return;
  }

  // Integrate position
  pos += velData.xyz * uDeltaTime;

  // Soft boundary - push particles back toward origin if too far
  float distFromOrigin = length(pos);
  if (distFromOrigin > 20.0) {
    pos *= 20.0 / distFromOrigin;
  }

  gl_FragColor = vec4(pos, life);
}
`;
