export const positionSimulationShader = /* glsl */ `
uniform float uDeltaTime;
uniform float uLifeDecay;
uniform float uTime;

// Emitter uniforms
uniform int uEmitterType; // 0=point, 1=sphere, 2=directional
uniform vec3 uEmitterPosition;
uniform vec3 uEmitterDirection;
uniform float uEmitterSpeed;
uniform float uEmitterRadius;

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
    } else {
      // Directional emitter - disk perpendicular to direction
      vec3 right = normalize(cross(uEmitterDirection, vec3(0.0, 1.0, 0.001)));
      vec3 up = cross(right, uEmitterDirection);
      float angle = hash(uv + seed) * 6.28318;
      float radius = sqrt(hash(uv * 2.3 + seed)) * uEmitterRadius;
      newPos = uEmitterPosition + right * cos(angle) * radius + up * sin(angle) * radius;
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
