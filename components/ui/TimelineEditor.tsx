'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SceneTimelineAPI } from '@/hooks/useSceneTimeline';
import { listScenes, loadScene, deleteScene } from '@/lib/scene/scene-manager';

interface TimelineEditorProps {
  timeline: SceneTimelineAPI;
}

export default function TimelineEditor({ timeline }: TimelineEditorProps) {
  const { scene, isPlaying, currentTime, playbackSpeed } = timeline;
  const keyframes = scene?.keyframes ?? [];
  const [isOpen, setIsOpen] = useState(false);
  const [showSceneList, setShowSceneList] = useState(false);

  const duration = scene?.duration ?? 10;

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scene) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    timeline.seek(x * duration);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="flex justify-center mb-2">
        <motion.button
          onClick={() => {
            if (!scene) timeline.newScene();
            setIsOpen(!isOpen);
          }}
          className="rounded-md border border-cyan-400/30 bg-[#0a0a1a]/90 px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-cyan-400 backdrop-blur-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          TIMELINE
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-4 mb-4 rounded-lg border border-cyan-400/20 bg-[#0a0a1a]/95 p-3 backdrop-blur-sm"
          >
            {/* Controls row */}
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={timeline.togglePlay}
                disabled={!scene || keyframes.length < 2}
                className="rounded border border-cyan-400/20 bg-cyan-400/5 px-2 py-1 font-mono text-[10px] text-cyan-400 hover:bg-cyan-400/10 disabled:opacity-30"
              >
                {isPlaying ? '\u25A0 STOP' : '\u25B6 PLAY'}
              </button>

              <button
                onClick={timeline.addKeyframe}
                disabled={!scene}
                className="rounded border border-orange-400/20 bg-orange-400/5 px-2 py-1 font-mono text-[10px] text-orange-400 hover:bg-orange-400/10 disabled:opacity-30"
              >
                + KEYFRAME
              </button>

              <span className="font-mono text-[9px] text-cyan-400/50">
                {currentTime.toFixed(1)}s / {duration}s
              </span>

              <div className="flex items-center gap-1 ml-auto">
                <span className="font-mono text-[8px] text-cyan-400/40">SPEED</span>
                <select
                  value={playbackSpeed}
                  onChange={(e) => timeline.setPlaybackSpeed(Number(e.target.value))}
                  className="bg-[#0d0d20] border border-cyan-400/10 rounded text-[9px] text-cyan-400/80 px-1"
                >
                  <option value={0.25}>0.25x</option>
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                </select>

                <button
                  onClick={timeline.save}
                  disabled={!scene}
                  className="rounded border border-cyan-400/20 bg-cyan-400/5 px-2 py-1 font-mono text-[9px] text-cyan-400 hover:bg-cyan-400/10 disabled:opacity-30 ml-2"
                >
                  SAVE
                </button>

                <button
                  onClick={() => setShowSceneList(!showSceneList)}
                  className="rounded border border-cyan-400/20 bg-cyan-400/5 px-2 py-1 font-mono text-[9px] text-cyan-400 hover:bg-cyan-400/10"
                >
                  LOAD
                </button>
              </div>
            </div>

            {/* Scene list dropdown */}
            <AnimatePresence>
              {showSceneList && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-2 overflow-hidden"
                >
                  <div className="border border-cyan-400/10 rounded p-1.5 space-y-1 max-h-24 overflow-y-auto">
                    {listScenes().map((s) => (
                      <div key={s.id} className="flex items-center justify-between">
                        <button
                          onClick={() => { const loaded = loadScene(s.id); if (loaded) timeline.setScene(loaded); setShowSceneList(false); }}
                          className="text-[9px] text-cyan-400/70 hover:text-cyan-400 font-mono"
                        >
                          {s.name}
                        </button>
                        <button
                          onClick={() => { deleteScene(s.id); setShowSceneList(false); setTimeout(() => setShowSceneList(true), 50); }}
                          className="text-[9px] text-red-400/50 hover:text-red-400 px-1"
                        >
                          x
                        </button>
                      </div>
                    ))}
                    {listScenes().length === 0 && (
                      <span className="text-[9px] text-cyan-400/30 font-mono">No saved scenes</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timeline bar */}
            <div
              className="relative h-8 bg-cyan-400/5 rounded cursor-pointer border border-cyan-400/10"
              onClick={handleBarClick}
            >
              {/* Time markers */}
              {Array.from({ length: Math.floor(duration) + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-cyan-400/10"
                  style={{ left: `${(i / duration) * 100}%` }}
                >
                  <span className="absolute top-0.5 left-0.5 text-[7px] text-cyan-400/30 font-mono">{i}s</span>
                </div>
              ))}

              {/* Keyframe markers */}
              {keyframes.map((kf) => (
                <div
                  key={kf.id}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-orange-400 rotate-45 cursor-grab hover:bg-orange-300 z-10"
                  style={{ left: `${(kf.timestamp / duration) * 100}%` }}
                  title={`${kf.timestamp.toFixed(1)}s — click timeline to move playhead, drag keyframe to reposition`}
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => { e.stopPropagation(); timeline.removeKeyframe(kf.id); }}
                />
              ))}

              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-20"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full" />
              </div>
            </div>

            {/* Keyframe info */}
            {keyframes.length > 0 && (
              <div className="mt-1.5 flex gap-1 flex-wrap">
                {keyframes.map((kf, i) => (
                  <span key={kf.id} className="font-mono text-[8px] text-cyan-400/40">
                    KF{i + 1}@{kf.timestamp.toFixed(1)}s
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
