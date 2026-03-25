import { emitterFunctions } from '../lib/emitters.glsl';

export const positionSimulationShader = /* glsl */ `
uniform float uDeltaTime;
uniform float uLifeDecay;
uniform float uTime;

// Emitter uniforms
uniform int uEmitterType; // 0=point, 1=sphere, 2=directional, 3=box, 4=cylinder, 5=cone, 6=torus, 7=disc, 8=line, 9=grid
uniform vec3 uEmitterPosition;
uniform vec3 uEmitterDirection;
uniform float uEmitterSpeed;
uniform float uEmitterRadius;
uniform vec3 uEmitterSize;
uniform float uEmitterHeight;
uniform float uEmitterAngle;
uniform float uEmitterMajorRadius;
uniform float uEmitterMinorRadius;
uniform vec3 uEmitterEndPoint;

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
    // Respawn particle based on emitter type
    vec3 newPos;
    float seed = uTime * 0.1;

    if (uEmitterType == 0) {
      // Point emitter
      newPos = uEmitterPosition + randomSpherePoint(uv, seed) * 0.5;
    } else if (uEmitterType == 1) {
      // Sphere emitter
      newPos = uEmitterPosition + randomSpherePoint(uv, seed) * uEmitterRadius;
    } else if (uEmitterType == 2) {
      // Directional emitter - disk perpendicular to direction
      vec3 right = normalize(cross(uEmitterDirection, vec3(0.0, 1.0, 0.001)));
      vec3 up = cross(right, uEmitterDirection);
      float angle = hash(uv + seed) * 6.28318;
      float radius = sqrt(hash(uv * 2.3 + seed)) * uEmitterRadius;
      newPos = uEmitterPosition + right * cos(angle) * radius + up * sin(angle) * radius;
    } else if (uEmitterType == 3) {
      // Box emitter
      newPos = uEmitterPosition + emitBox(uv, seed, uEmitterSize);
    } else if (uEmitterType == 4) {
      // Cylinder emitter
      newPos = uEmitterPosition + emitCylinder(uv, seed, uEmitterRadius, uEmitterHeight);
    } else if (uEmitterType == 5) {
      // Cone emitter
      newPos = uEmitterPosition + emitCone(uv, seed, uEmitterAngle, uEmitterHeight);
    } else if (uEmitterType == 6) {
      // Torus emitter
      newPos = uEmitterPosition + emitTorus(uv, seed, uEmitterMajorRadius, uEmitterMinorRadius);
    } else if (uEmitterType == 7) {
      // Disc emitter
      newPos = uEmitterPosition + emitDisc(uv, seed, uEmitterRadius);
    } else if (uEmitterType == 8) {
      // Line emitter
      newPos = emitLine(uv, seed, uEmitterPosition, uEmitterEndPoint);
    } else if (uEmitterType == 9) {
      // Grid emitter
      newPos = uEmitterPosition + emitGrid(uv, seed, 0.5, uEmitterRadius * 4.0);
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
