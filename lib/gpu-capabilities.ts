export interface ResolutionPreset {
  label: string;
  textureSize: number;
  maxParticles: number;
  description: string;
}

export const RESOLUTION_PRESETS = {
  low: {
    label: 'Low',
    textureSize: 64,
    maxParticles: 4096,
    description: '4K particles — integrated GPU / mobile',
  },
  medium: {
    label: 'Medium',
    textureSize: 128,
    maxParticles: 16384,
    description: '16K particles — default',
  },
  high: {
    label: 'High',
    textureSize: 256,
    maxParticles: 65536,
    description: '65K particles — discrete GPU',
  },
  ultra: {
    label: 'Ultra',
    textureSize: 512,
    maxParticles: 262144,
    description: '262K particles — high-end GPU',
  },
  ultraplus: {
    label: 'Ultra+',
    textureSize: 1024,
    maxParticles: 1048576,
    description: '1M particles — high-end discrete GPU only',
  },
} as const satisfies Record<string, ResolutionPreset>;

export type ResolutionPresetKey = keyof typeof RESOLUTION_PRESETS;

export function detectGPUCapabilities(gl: WebGLRenderingContext) {
  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;

  let renderer = 'unknown';
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (debugInfo) {
    renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
  }

  let maxPreset: ResolutionPresetKey = 'ultraplus';
  if (maxTextureSize < 256) {
    maxPreset = 'medium';
  } else if (maxTextureSize < 512) {
    maxPreset = 'high';
  } else if (maxTextureSize < 1024) {
    maxPreset = 'ultra';
  }

  return { maxTextureSize, renderer, maxPreset };
}

export class PerformanceMonitor {
  frameTimes: number[] = [];

  push(delta: number) {
    this.frameTimes.push(delta);
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }
  }

  avgFPS(): number {
    if (this.frameTimes.length === 0) return 0;
    const avgDelta =
      this.frameTimes.reduce((sum, t) => sum + t, 0) / this.frameTimes.length;
    return avgDelta > 0 ? 1 / avgDelta : 0;
  }

  isUnderPerforming(): boolean {
    return this.frameTimes.length >= 60 && this.avgFPS() < 30;
  }

  isWarning(): boolean {
    return this.avgFPS() < 50;
  }
}
