export interface DeviceInfo {
  isMobile: boolean;
  platform: string;
  cores: number;
  memory: number;
  browser: string;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  touchScreen: boolean;
}

export function detectDevice(): DeviceInfo {
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);

  let platform = 'Unknown';
  if (/Windows/i.test(ua)) platform = 'Windows';
  else if (/Mac/i.test(ua)) platform = 'macOS';
  else if (/Linux/i.test(ua)) platform = 'Linux';
  else if (/Android/i.test(ua)) platform = 'Android';
  else if (/iPhone|iPad/i.test(ua)) platform = 'iOS';

  let browser = 'Unknown';
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Edg/i.test(ua)) browser = 'Edge';

  return {
    isMobile,
    platform,
    cores: navigator.hardwareConcurrency || 4,
    memory: (navigator as any).deviceMemory || 4,
    browser,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    pixelRatio: window.devicePixelRatio || 1,
    touchScreen: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  };
}

export interface GPUInfo {
  renderer: string;
  vendor: string;
  maxTextureSize: number;
  isIntegrated: boolean;
  tier: 'low' | 'mid' | 'high' | 'ultra';
}

export function detectGPU(): GPUInfo {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  if (!gl) {
    return { renderer: 'No WebGL', vendor: 'Unknown', maxTextureSize: 0, isIntegrated: true, tier: 'low' };
  }

  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;

  let renderer = 'Unknown GPU';
  let vendor = 'Unknown';
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (debugInfo) {
    renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
    vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) as string;
  }

  const isIntegrated = /Intel|UHD|Iris|HD Graphics|Mali|Adreno|Apple GPU|PowerVR|Tegra/i.test(renderer);

  let tier: GPUInfo['tier'] = 'mid';
  if (/RTX\s*(30|40|50)|RX\s*(6[789]|7[0-9])|Arc\s*[AB]/i.test(renderer)) {
    tier = 'ultra';
  } else if (/GTX\s*(10|16)|RTX\s*20|RX\s*(5[5-9]|6[0-5])|Radeon\s*Pro/i.test(renderer)) {
    tier = 'high';
  } else if (isIntegrated) {
    tier = 'low';
  }

  const ext = gl.getExtension('WEBGL_lose_context');
  if (ext) ext.loseContext();

  return { renderer, vendor, maxTextureSize, isIntegrated, tier };
}

export type RecommendedPreset = 'low' | 'medium' | 'high' | 'ultra' | 'ultraplus';

export function recommendPreset(device: DeviceInfo, gpu: GPUInfo): RecommendedPreset {
  if (device.isMobile) return 'low';
  if (gpu.tier === 'low') return 'low';
  if (gpu.tier === 'mid') return 'medium';
  if (gpu.tier === 'high') return 'high';
  if (gpu.tier === 'ultra') return 'ultra';
  return 'medium';
}
