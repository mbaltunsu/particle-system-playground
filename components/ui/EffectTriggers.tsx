'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '@/components/providers/SimulationProvider';

function TriggerButton({
  label,
  sublabel,
  onClick,
  cooldown,
  color,
}: {
  label: string;
  sublabel: string;
  onClick: () => void;
  cooldown: number;
  color: string;
}) {
  const [isOnCooldown, setIsOnCooldown] = useState(false);

  const handleClick = useCallback(() => {
    if (isOnCooldown) return;
    onClick();
    setIsOnCooldown(true);
    setTimeout(() => setIsOnCooldown(false), cooldown);
  }, [isOnCooldown, onClick, cooldown]);

  return (
    <motion.button
      className="pointer-events-auto relative flex flex-col items-center gap-1 rounded-md border border-cyan-400/20 bg-black/40 px-4 py-2 backdrop-blur-sm transition-colors hover:border-cyan-400/40 hover:bg-cyan-400/5 disabled:opacity-30"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={handleClick}
      disabled={isOnCooldown}
    >
      <span className="text-[10px] font-medium tracking-widest" style={{ color }}>
        {label}
      </span>
      <span className="text-[8px] tracking-wider text-cyan-400/30">{sublabel}</span>

      {/* Cooldown indicator */}
      {isOnCooldown && (
        <motion.div
          className="absolute inset-0 rounded-md border border-cyan-400/30"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: cooldown / 1000 }}
        />
      )}
    </motion.button>
  );
}

export default function EffectTriggers() {
  const { triggerShockwave, triggerExplosion } = useSimulation();

  return (
    <motion.div
      className="pointer-events-none fixed bottom-12 left-1/2 z-20 flex -translate-x-1/2 gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
    >
      <TriggerButton
        label="SHOCKWAVE"
        sublabel="RADIAL PULSE"
        onClick={triggerShockwave}
        cooldown={2000}
        color="#00ccff"
      />
      <TriggerButton
        label="EXPLOSION"
        sublabel="ENERGY BURST"
        onClick={triggerExplosion}
        cooldown={1500}
        color="#ff6633"
      />
    </motion.div>
  );
}
