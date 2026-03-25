export const particleVertexShader = /* glsl */ `
uniform sampler2D tPosition;
uniform sampler2D tVelocity;
uniform float uTextureSize;
uniform float uPixelRatio;

attribute float aIndex;

varying float vLife;
varying float vEnergy;
varying float vSpeed;
varying float vDistFade;

void main() {
  float index = aIndex;
  float row = floor(index / uTextureSize);
  float col = mod(index, uTextureSize);
  vec2 dataUV = (vec2(col, row) + 0.5) / uTextureSize;

  vec4 posData = texture2D(tPosition, dataUV);
  vec4 velData = texture2D(tVelocity, dataUV);

  vec3 particlePos = posData.xyz;
  vLife = posData.w;
  vSpeed = length(velData.xyz);
  vEnergy = velData.w;

  // Fade particles near center to prevent additive pile-up
  float distFromCenter = length(particlePos);
  vDistFade = smoothstep(0.0, 5.0, distFromCenter);

  // Scale by life
  float baseSize = 1.0 + vSpeed * 0.3 + vEnergy * 0.5;
  float lifeScale = smoothstep(0.0, 0.05, vLife);

  vec4 mvPosition = modelViewMatrix * vec4(particlePos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = baseSize * lifeScale * uPixelRatio * (120.0 / -mvPosition.z);
  gl_PointSize = clamp(gl_PointSize, 0.5, 24.0);
}
`;
