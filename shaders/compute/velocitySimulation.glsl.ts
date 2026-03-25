import { simplexNoise3D } from '../lib/noise.glsl';
import { forcesFunctions } from '../lib/forces.glsl';
import { emitterFunctions } from '../lib/emitters.glsl';
import { sdfFunctions } from '../lib/sdf.glsl';
import { boidsFunctions } from '../lib/boids.glsl';
import { nbodyFunctions } from '../lib/nbody.glsl';

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

uniform float uShockwaveActive;
uniform vec3 uShockwaveOrigin;
uniform float uShockwaveRadius;
uniform float uShockwaveStrength;

uniform float uExplosionActive;
uniform vec3 uExplosionOrigin;
uniform float uExplosionStrength;

uniform float uDrag;
uniform vec3 uWindDirection;
uniform float uWindStrength;
uniform vec3 uAttractorPosition;
uniform float uAttractorStrength;
uniform int uTurbulenceOctaves;
uniform float uTurbulenceStrength;

uniform int uCollider0Type;
uniform vec3 uCollider0Position;
uniform vec3 uCollider0Size;
uniform float uCollider0Restitution;
uniform int uCollider1Type;
uniform vec3 uCollider1Position;
uniform vec3 uCollider1Size;
uniform float uCollider1Restitution;

uniform int uSimulationMode; // 0=particles, 1=boids, 2=nbody, 3=cloth
uniform float uBoidSeparation;
uniform float uBoidAlignment;
uniform float uBoidCohesion;
uniform float uBoidRadius;
uniform int uBoidSampleCount;
uniform float uNBodyStrength;
uniform float uNBodySoftening;
uniform int uNBodySampleCount;
uniform float uTextureSize;

${simplexNoise3D}
${forcesFunctions}
${emitterFunctions}
${sdfFunctions}
${boidsFunctions}
${nbodyFunctions}

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
    } else if (uEmitterType == 2) {
      // Directional emitter: along direction with spread
      vec3 spread = randomSphereDir(uv, seed) * 0.3;
      newVel = normalize(uEmitterDirection + spread) * uEmitterSpeed;
    } else if (uEmitterType == 3) {
      // Box emitter: random direction velocity
      newVel = randomSphereDir(uv, seed) * uEmitterSpeed;
    } else if (uEmitterType == 4) {
      // Cylinder emitter: radially outward in xz plane
      vec3 spread = randomSphereDir(uv, seed);
      float angle = emitHash(uv + seed) * 6.28318;
      newVel = normalize(vec3(cos(angle), 0.0, sin(angle))) * uEmitterSpeed;
    } else if (uEmitterType == 5) {
      // Cone emitter: along cone surface
      vec3 spread = randomSphereDir(uv, seed);
      newVel = normalize(vec3(spread.x, 1.0, spread.z)) * uEmitterSpeed;
    } else if (uEmitterType == 6) {
      // Torus emitter: outward from torus center in xz
      float theta = emitHash(uv + seed) * 6.28318;
      newVel = normalize(vec3(cos(theta), 0.0, sin(theta))) * uEmitterSpeed;
    } else if (uEmitterType == 7) {
      // Disc emitter: upward with slight spread
      vec3 spread = randomSphereDir(uv, seed);
      newVel = normalize(vec3(spread.x * 0.3, 1.0, spread.z * 0.3)) * uEmitterSpeed;
    } else if (uEmitterType == 8) {
      // Line emitter: perpendicular to line direction with spread
      vec3 lineDir = normalize(uEmitterEndPoint - uEmitterPosition + vec3(0.001));
      vec3 spread = randomSphereDir(uv, seed);
      vec3 perp = normalize(spread - lineDir * dot(spread, lineDir));
      newVel = perp * uEmitterSpeed;
    } else if (uEmitterType == 9) {
      // Grid emitter: upward
      vec3 spread = randomSphereDir(uv, seed);
      newVel = vec3(spread.x * 0.2, 1.0, spread.z * 0.2) * uEmitterSpeed;
    }

    gl_FragColor = vec4(newVel, velData.w);
    return;
  }

  vec3 force = vec3(0.0);

  if (uSimulationMode == 0) {
    // Standard particle mode - existing forces
    force += applyGravity(pos, uGravityCenter, uGravityStrength);
    force += applyRepulsion(pos, uGravityCenter, uRepulsionStrength);
    force += applyMagnetic(pos, vel, uMagneticStrength);
    force += applyNoiseFlow(pos, uNoiseScale, uNoiseTime);
    force += applyVortex(pos, uVortexStrength);
    force += applyWind(uWindDirection, uWindStrength);
    force += applyPointAttractor(pos, uAttractorPosition, uAttractorStrength);
    if (uTurbulenceOctaves > 0) {
      force += applyTurbulence(pos, uNoiseScale, uNoiseTime, uTurbulenceOctaves, uTurbulenceStrength);
    }
  } else if (uSimulationMode == 1) {
    // Boids mode
    force += computeBoidForces(pos, vel, uBoidSeparation, uBoidAlignment, uBoidCohesion, uBoidRadius, uBoidSampleCount, uTextureSize);
    force += applyNoiseFlow(pos, uNoiseScale * 0.3, uNoiseTime); // subtle noise
    force += applyGravity(pos, uGravityCenter, uGravityStrength * 0.1); // weak centering
  } else if (uSimulationMode == 2) {
    // N-Body mode
    force += computeNBodyGravity(pos, uNBodyStrength, uNBodySoftening, uNBodySampleCount, uTextureSize);
    force += applyNoiseFlow(pos, uNoiseScale * 0.1, uNoiseTime); // very subtle noise
  } else if (uSimulationMode == 3) {
    // Cloth mode - basic gravity + wind (constraints would need separate pass)
    force += vec3(0.0, -9.8, 0.0) * uGravityStrength;
    force += applyWind(uWindDirection, uWindStrength);
  }

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
  vel *= (1.0 - uDrag * uDeltaTime);

  // Collision detection on predicted position
  vec3 nextPos = pos + vel * uDeltaTime;
  resolveCollision(nextPos, vel, uCollider0Type, uCollider0Position, uCollider0Size, uCollider0Restitution);
  resolveCollision(nextPos, vel, uCollider1Type, uCollider1Position, uCollider1Size, uCollider1Restitution);

  // Clamp velocity
  float speed = length(vel);
  if (speed > 15.0) {
    vel = normalize(vel) * 15.0;
  }

  gl_FragColor = vec4(vel, velData.w);
}
`;
