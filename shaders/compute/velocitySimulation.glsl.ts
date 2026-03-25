import { simplexNoise3D } from '../lib/noise.glsl';
import { forcesFunctions } from '../lib/forces.glsl';

export const velocitySimulationShader = /* glsl */ `
uniform float uDeltaTime;
uniform float uGravityStrength;
uniform float uRepulsionStrength;
uniform float uNoiseScale;
uniform float uNoiseTime;
uniform float uMagneticStrength;
uniform float uVortexStrength;
uniform vec3 uGravityCenter;
uniform float uTime;

// Emitter uniforms (shared with position shader)
uniform int uEmitterType;
uniform vec3 uEmitterDirection;
uniform float uEmitterSpeed;

uniform float uShockwaveActive;
uniform vec3 uShockwaveOrigin;
uniform float uShockwaveRadius;
uniform float uShockwaveStrength;

uniform float uExplosionActive;
uniform vec3 uExplosionOrigin;
uniform float uExplosionStrength;

${simplexNoise3D}
${forcesFunctions}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec3 randomSphereDir(vec2 uv, float t) {
  float u = hash(uv + t) * 2.0 - 1.0;
  float theta = hash(uv * 1.7 + t + 0.5) * 6.28318;
  float s = sqrt(1.0 - u * u);
  return vec3(s * cos(theta), u, s * sin(theta));
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 posData = texture2D(tPosition, uv);
  vec4 velData = texture2D(tVelocity, uv);

  vec3 pos = posData.xyz;
  vec3 vel = velData.xyz;
  float life = posData.w;

  // Detect respawning particle: life was <= 0 last frame, now reset to ~1.0
  // We use a high life threshold to detect freshly spawned particles
  if (life <= 0.0) {
    // Particle is dead — set initial velocity for when position shader respawns it
    vec3 newVel = vec3(0.0);
    float seed = uTime * 0.1;

    if (uEmitterType == 0) {
      // Point emitter: random direction
      newVel = randomSphereDir(uv, seed) * uEmitterSpeed;
    } else if (uEmitterType == 1) {
      // Sphere emitter: outward from center
      newVel = normalize(posData.xyz + vec3(0.001)) * uEmitterSpeed;
    } else {
      // Directional emitter: along direction with spread
      vec3 spread = randomSphereDir(uv, seed) * 0.3;
      newVel = normalize(uEmitterDirection + spread) * uEmitterSpeed;
    }

    gl_FragColor = vec4(newVel, velData.w);
    return;
  }

  vec3 force = vec3(0.0);

  // Core physics forces
  force += applyGravity(pos, uGravityCenter, uGravityStrength);
  force += applyRepulsion(pos, uGravityCenter, uRepulsionStrength);
  force += applyMagnetic(pos, vel, uMagneticStrength);
  force += applyNoiseFlow(pos, uNoiseScale, uNoiseTime);
  force += applyVortex(pos, uVortexStrength);

  // Shockwave impulse
  if (uShockwaveActive > 0.0) {
    vec3 shockDir = pos - uShockwaveOrigin;
    float shockDist = length(shockDir);
    float ringDist = abs(shockDist - uShockwaveRadius);
    float impulse = smoothstep(1.0, 0.0, ringDist) * uShockwaveStrength;
    force += normalize(shockDir + vec3(0.001)) * impulse;
  }

  // Explosion impulse
  if (uExplosionActive > 0.0) {
    vec3 expDir = pos - uExplosionOrigin;
    float expDist = max(length(expDir), 0.1);
    float expForce = uExplosionStrength / (expDist * expDist);
    force += normalize(expDir) * expForce;
  }

  // Semi-implicit Euler integration
  vel += force * uDeltaTime;
  vel *= 0.985; // drag

  // Clamp velocity
  float speed = length(vel);
  if (speed > 15.0) {
    vel = normalize(vel) * 15.0;
  }

  gl_FragColor = vec4(vel, velData.w);
}
`;
