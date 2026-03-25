'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '@/components/providers/SimulationProvider';
import { createDefaultEmitter, type EmitterConfig } from '@/lib/emitter-config';

const EMITTER_TYPES = [
  { label: 'Point', value: 0 },
  { label: 'Sphere', value: 1 },
  { label: 'Directional', value: 2 },
  { label: 'Box', value: 3 },
  { label: 'Cylinder', value: 4 },
  { label: 'Cone', value: 5 },
  { label: 'Torus', value: 6 },
  { label: 'Disc', value: 7 },
  { label: 'Line', value: 8 },
  { label: 'Grid', value: 9 },
];

function NumberInput({ label, value, onChange, min, max, step = 0.1 }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-[9px] text-cyan-400/50 truncate" title={label}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1 appearance-none bg-cyan-400/10 rounded"
      />
      <span className="w-10 text-right text-[9px] text-cyan-400/70">{value.toFixed(1)}</span>
    </div>
  );
}

function EmitterItem({ emitter, index, onUpdate, onRemove, canRemove }: {
  emitter: EmitterConfig; index: number;
  onUpdate: (updated: EmitterConfig) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [expanded, setExpanded] = useState(index === 0);

  const update = (field: keyof EmitterConfig, value: EmitterConfig[keyof EmitterConfig]) => {
    onUpdate({ ...emitter, [field]: value });
  };

  const updatePosition = (axis: number, value: number) => {
    const pos = [...emitter.position] as [number, number, number];
    pos[axis] = value;
    onUpdate({ ...emitter, position: pos });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border border-cyan-400/10 rounded-md overflow-hidden mb-1.5"
    >
      <div
        className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-cyan-400/5"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-[10px] text-cyan-400/80 font-mono">
          {expanded ? '\u25BE' : '\u25B8'} {emitter.label}
        </span>
        <div className="flex gap-1">
          <span className="text-[8px] text-cyan-400/40">{EMITTER_TYPES[emitter.type]?.label}</span>
          {canRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="text-[10px] text-red-400/60 hover:text-red-400 px-1"
            >
              x
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-2 pb-2 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-16 text-[9px] text-cyan-400/50">Type</span>
            <select
              value={emitter.type}
              onChange={(e) => update('type', Number(e.target.value))}
              className="flex-1 bg-[#0d0d20] border border-cyan-400/10 rounded text-[9px] text-cyan-400/80 px-1 py-0.5"
            >
              {EMITTER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <NumberInput label="Pos X" value={emitter.position[0]} onChange={(v) => updatePosition(0, v)} min={-10} max={10} />
          <NumberInput label="Pos Y" value={emitter.position[1]} onChange={(v) => updatePosition(1, v)} min={-10} max={10} />
          <NumberInput label="Pos Z" value={emitter.position[2]} onChange={(v) => updatePosition(2, v)} min={-10} max={10} />
          <NumberInput label="Speed" value={emitter.speed} onChange={(v) => update('speed', v)} min={0.1} max={10} />
          <NumberInput label="Radius" value={emitter.radius} onChange={(v) => update('radius', v)} min={0.1} max={5} />
          <NumberInput label="Height" value={emitter.height} onChange={(v) => update('height', v)} min={0.1} max={10} />
          <NumberInput label="Angle" value={emitter.angle} onChange={(v) => update('angle', v)} min={0.1} max={3.14} step={0.01} />
        </div>
      )}
    </motion.div>
  );
}

export default function EmitterPanel() {
  const { emitters, setEmitters } = useSimulation();
  const [isOpen, setIsOpen] = useState(false);

  const addEmitter = () => {
    if (emitters.length >= 32) return;
    setEmitters((prev) => [...prev, createDefaultEmitter(0)]);
  };

  const removeEmitter = (index: number) => {
    setEmitters((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEmitter = (index: number, updated: EmitterConfig) => {
    setEmitters((prev) => prev.map((e, i) => (i === index ? updated : e)));
  };

  return (
    <div className="fixed left-4 top-20 z-50">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 rounded-md border border-cyan-400/30 bg-[#0a0a1a]/90 px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] text-cyan-400 backdrop-blur-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        EMITTERS ({emitters.length})
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="w-64 max-h-[60vh] overflow-y-auto rounded-lg border border-cyan-400/20 bg-[#0a0a1a]/95 p-2 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] tracking-[0.2em] text-cyan-400/60">EMITTERS</span>
              <button
                onClick={addEmitter}
                disabled={emitters.length >= 32}
                className="rounded border border-cyan-400/20 bg-cyan-400/5 px-2 py-0.5 font-mono text-[9px] text-cyan-400 hover:bg-cyan-400/10 disabled:opacity-30"
              >
                + ADD
              </button>
            </div>

            <AnimatePresence>
              {emitters.map((emitter, index) => (
                <EmitterItem
                  key={emitter.id}
                  emitter={emitter}
                  index={index}
                  onUpdate={(updated) => updateEmitter(index, updated)}
                  onRemove={() => removeEmitter(index)}
                  canRemove={emitters.length > 1}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
