'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { detectDevice, detectGPU, recommendPreset, type DeviceInfo, type GPUInfo, type RecommendedPreset } from '@/lib/device-detection';
import { RESOLUTION_PRESETS } from '@/lib/gpu-capabilities';

interface LoadingScreenProps {
  onReady: (preset: RecommendedPreset) => void;
}

export default function LoadingScreen({ onReady }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'detecting' | 'ready'>('detecting');
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [gpu, setGpu] = useState<GPUInfo | null>(null);
  const [recommended, setRecommended] = useState<RecommendedPreset>('medium');
  const [selected, setSelected] = useState<RecommendedPreset>('medium');
  const [showLines, setShowLines] = useState<number>(0);

  useEffect(() => {
    const d = detectDevice();
    setDevice(d);

    const timer1 = setTimeout(() => {
      const g = detectGPU();
      setGpu(g);
      const rec = recommendPreset(d, g);
      setRecommended(rec);
      setSelected(rec);
      setPhase('ready');
    }, 800);

    return () => clearTimeout(timer1);
  }, []);

  useEffect(() => {
    if (!device || !gpu) return;
    const interval = setInterval(() => {
      setShowLines(prev => {
        if (prev >= 8) { clearInterval(interval); return prev; }
        return prev + 1;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [device, gpu]);

  const infoLines = device && gpu ? [
    { label: 'PLATFORM', value: device.platform },
    { label: 'DEVICE', value: device.isMobile ? 'Mobile' : 'Desktop' },
    { label: 'DISPLAY', value: `${device.screenWidth}\u00d7${device.screenHeight} @${device.pixelRatio}x` },
    { label: 'GPU', value: gpu.renderer },
    { label: 'VENDOR', value: gpu.vendor },
    { label: 'MAX TEXTURE', value: `${gpu.maxTextureSize}\u00d7${gpu.maxTextureSize}` },
    { label: 'GPU TIER', value: gpu.tier.toUpperCase() + (gpu.isIntegrated ? ' (Integrated)' : ' (Discrete)') },
    { label: 'BROWSER', value: `${device.browser} \u2014 ${device.cores} cores` },
  ] : [];

  const presetOptions: RecommendedPreset[] = ['low', 'medium', 'high', 'ultra', 'ultraplus'];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030308] font-mono">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <h1 className="text-lg tracking-[0.4em] text-cyan-400">
          PARTICLE PHYSICS PLAYGROUND
        </h1>
        <p className="mt-1 text-[10px] tracking-[0.3em] text-cyan-400/40">
          GPU-ACCELERATED SIMULATION ENGINE
        </p>
      </motion.div>

      {/* System info panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-[420px] max-w-[90vw] rounded-lg border border-cyan-400/20 bg-[#0a0a1a]/80 p-4 backdrop-blur-sm"
      >
        <p className="mb-3 text-[9px] tracking-[0.3em] text-cyan-400/50">
          SYSTEM ANALYSIS
        </p>

        {/* Info lines */}
        <div className="space-y-1.5 mb-4">
          {infoLines.map((line, i) => (
            <motion.div
              key={line.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i < showLines ? 1 : 0, x: i < showLines ? 0 : -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between"
            >
              <span className="text-[9px] tracking-[0.15em] text-cyan-400/40">{line.label}</span>
              <span className="text-[10px] text-cyan-400/80 truncate max-w-[60%] text-right" title={line.value}>
                {line.value}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Scanning animation */}
        {phase === 'detecting' && (
          <div className="flex items-center gap-2">
            <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-cyan-400/10">
              <motion.div
                className="h-full bg-cyan-400/50"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                style={{ width: '40%' }}
              />
            </div>
            <span className="text-[8px] text-cyan-400/30 tracking-[0.2em]">SCANNING</span>
          </div>
        )}

        {/* Quality selection */}
        {phase === 'ready' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[9px] tracking-[0.15em] text-cyan-400/50">RECOMMENDED QUALITY</span>
              <span className="rounded bg-cyan-400/10 px-2 py-0.5 text-[9px] text-cyan-400">
                {RESOLUTION_PRESETS[recommended].label} ({RESOLUTION_PRESETS[recommended].maxParticles.toLocaleString()} particles)
              </span>
            </div>

            {/* Preset selector */}
            <div className="mb-4 flex gap-1">
              {presetOptions.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelected(p)}
                  className={`flex-1 rounded border py-1.5 text-[9px] transition-colors ${
                    selected === p
                      ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-400'
                      : 'border-cyan-400/10 bg-cyan-400/5 text-cyan-400/40 hover:text-cyan-400/60'
                  }`}
                >
                  <div>{RESOLUTION_PRESETS[p].label}</div>
                  <div className="text-[7px] opacity-60">{RESOLUTION_PRESETS[p].maxParticles >= 1000000 ? '1M' : `${Math.round(RESOLUTION_PRESETS[p].maxParticles / 1000)}K`}</div>
                </button>
              ))}
            </div>

            {/* Warning for high presets on weak GPU */}
            <AnimatePresence>
              {gpu && gpu.isIntegrated && (selected === 'ultra' || selected === 'ultraplus') && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-3 rounded border border-orange-400/20 bg-orange-400/5 p-2 text-[9px] text-orange-400/80"
                >
                  Your GPU ({gpu.renderer}) may struggle with {RESOLUTION_PRESETS[selected].maxParticles.toLocaleString()} particles. Performance issues or crashes may occur.
                </motion.p>
              )}
            </AnimatePresence>

            {/* Launch button */}
            <motion.button
              onClick={() => onReady(selected)}
              className="w-full rounded border border-cyan-400/30 bg-cyan-400/10 py-2.5 text-[11px] tracking-[0.3em] text-cyan-400 transition-colors hover:bg-cyan-400/20"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              INITIALIZE SIMULATION
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Version */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 text-[8px] tracking-[0.2em] text-cyan-400/20"
      >
        ENGINE v1.0 — WEBGL2 GPGPU
      </motion.p>
    </div>
  );
}
