'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TITLE = 'PARTICLE PHYSICS PLAYGROUND';

export default function Overlay() {
  const [fps, setFps] = useState(60);
  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let animId: number;
    const measure = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;
      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 30) frameTimesRef.current.shift();
      const avg =
        frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      setFps(Math.round(1000 / avg));
      animId = requestAnimationFrame(measure);
    };
    animId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-10 font-mono">
      {/* Title */}
      <div className="absolute left-6 top-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00ffcc]" />
          <h1 className="text-xs tracking-[0.3em] text-cyan-400/90">
            {TITLE.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                {char}
              </motion.span>
            ))}
          </h1>
        </div>
        <motion.p
          className="mt-1 text-[10px] tracking-widest text-cyan-400/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          GPU-ACCELERATED SIMULATION
        </motion.p>
      </div>

      {/* FPS & Stats */}
      <div className="absolute right-6 top-6 text-right">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="text-[10px] tracking-wider text-cyan-400/50">PERFORMANCE</div>
          <div className="mt-1 text-lg tabular-nums text-cyan-400">
            {fps}
            <span className="ml-1 text-[10px] text-cyan-400/50">FPS</span>
          </div>
          <div className="mt-1 text-[10px] text-cyan-400/30">16,384 PARTICLES</div>
        </motion.div>
      </div>

      {/* Corner decorations */}
      <svg className="absolute left-3 top-3 h-6 w-6 text-cyan-400/20" viewBox="0 0 24 24">
        <path d="M0 8 L0 0 L8 0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className="absolute right-3 top-3 h-6 w-6 text-cyan-400/20" viewBox="0 0 24 24">
        <path d="M16 0 L24 0 L24 8" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-3 left-3 h-6 w-6 text-cyan-400/20" viewBox="0 0 24 24">
        <path d="M0 16 L0 24 L8 24" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-3 right-3 h-6 w-6 text-cyan-400/20" viewBox="0 0 24 24">
        <path d="M16 24 L24 24 L24 16" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Bottom gradient line */}
      <motion.div
        className="absolute bottom-8 left-1/2 h-px w-1/2 -translate-x-1/2"
        style={{
          background: 'linear-gradient(90deg, transparent, #00ffcc40, transparent)',
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
      />
    </div>
  );
}
