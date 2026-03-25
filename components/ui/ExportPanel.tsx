'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useExport } from '@/hooks/useExport';

interface ExportPanelProps {
  getCanvas: () => HTMLCanvasElement | null;
  renderFrame?: (frameIndex: number, dt: number) => void;
}

export default function ExportPanel({ getCanvas, renderFrame }: ExportPanelProps) {
  const { state, progress, startQuickRecording, stopQuickRecording, startQualityExport, supportsQualityExport } = useExport();
  const [isOpen, setIsOpen] = useState(false);
  const [duration, setDuration] = useState(5);

  const handleQuickRecord = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    if (state === 'recording') {
      stopQuickRecording();
    } else {
      startQuickRecording(canvas);
    }
  };

  const handleQualityExport = () => {
    const canvas = getCanvas();
    if (!canvas || !renderFrame) return;
    startQualityExport(canvas, renderFrame, duration, 60);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 rounded-md border border-cyan-400/30 bg-[#0a0a1a]/90 px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] text-cyan-400 backdrop-blur-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        EXPORT
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-12 right-0 w-56 rounded-lg border border-cyan-400/20 bg-[#0a0a1a]/95 p-3 backdrop-blur-sm"
          >
            <p className="mb-2 font-mono text-[9px] tracking-[0.2em] text-cyan-400/60">CAPTURE</p>

            <button
              onClick={handleQuickRecord}
              disabled={state === 'processing'}
              className="mb-2 w-full rounded border border-cyan-400/20 bg-cyan-400/5 px-2 py-1.5 font-mono text-[10px] text-cyan-400 transition-colors hover:bg-cyan-400/10 disabled:opacity-30"
            >
              {state === 'recording' ? '■ STOP RECORDING' : '● QUICK RECORD (WebM)'}
            </button>

            {supportsQualityExport && renderFrame && (
              <>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="font-mono text-[9px] text-cyan-400/40">DURATION</span>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-mono text-[10px] text-cyan-400">{duration}s</span>
                </div>

                <button
                  onClick={handleQualityExport}
                  disabled={state !== 'idle'}
                  className="w-full rounded border border-orange-400/20 bg-orange-400/5 px-2 py-1.5 font-mono text-[10px] text-orange-400 transition-colors hover:bg-orange-400/10 disabled:opacity-30"
                >
                  QUALITY EXPORT (MP4)
                </button>
              </>
            )}

            {state !== 'idle' && (
              <div className="mt-2">
                <div className="h-1 overflow-hidden rounded-full bg-cyan-400/10">
                  <motion.div
                    className="h-full bg-cyan-400/60"
                    initial={{ width: '0%' }}
                    animate={{ width: state === 'recording' ? '100%' : `${progress}%` }}
                    transition={{ duration: state === 'recording' ? 0.3 : 0 }}
                  />
                </div>
                <p className="mt-1 font-mono text-[8px] text-cyan-400/40">
                  {state === 'recording' ? 'RECORDING...' : `ENCODING ${progress}%`}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
