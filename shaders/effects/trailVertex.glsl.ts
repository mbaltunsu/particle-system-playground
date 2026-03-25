export const trailVertexShader = /* glsl */ `
uniform sampler2D tPosition;
uniform sampler2D tVelocity;
uniform float uTextureSize;
uniform float uPixelRatio;
uniform float uTrailOpacity;
uniform float uDeltaTime;

attribute float aIndex;
attribute float aTrailIndex;

varying float vAlpha;
varying float vLife;

void main() {
  float index = aIndex;
  float row = floor(index / uTextureSize);
  float col = mod(index, uTextureSize);
  vec2 dataUV = (vec2(col, row) + 0.5) / uTextureSize;

  vec4 posData = texture2D(tPosition, dataUV);
  vec4 velData = texture2D(tVelocity, dataUV);
  vLife = posData.w;

  // Extrapolate backward in time based on trail index
  // aTrailIndex: 0.0 = newest (near current pos), 1.0 = oldest
  float trailTime = aTrailIndex * 0.15; // seconds into the past
  vec3 trailPos = posData.xyz - velData.xyz * trailTime;

  vAlpha = uTrailOpacity * (1.0 - aTrailIndex) * vLife;

  vec4 mvPosition = modelViewMatrix * vec4(trailPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = max(0.5, (1.5 - aTrailIndex * 0.8) * uPixelRatio * (200.0 / -mvPosition.z));
  gl_PointSize = clamp(gl_PointSize, 0.5, 12.0);
}
`;
