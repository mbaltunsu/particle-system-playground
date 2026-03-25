'use client';

import { useRef, useState, useCallback } from 'react';
import { startMediaRecorderCapture, downloadBlob } from '@/lib/export/media-recorder-export';
import { isWebCodecsAvailable, createFrameAccurateRecorder } from '@/lib/export/webcodecs-encoder';

export type ExportFormat = 'quick-webm' | 'quality-mp4' | 'png-sequence';
export type ExportState = 'idle' | 'recording' | 'processing';

export function useExport() {
  const [state, setState] = useState<ExportState>('idle');
  const [progress, setProgress] = useState(0);
  const recorderRef = useRef<ReturnType<typeof startMediaRecorderCapture> | null>(null);

  const startQuickRecording = useCallback((canvas: HTMLCanvasElement) => {
    setState('recording');
    recorderRef.current = startMediaRecorderCapture(canvas, 60);
  }, []);

  const stopQuickRecording = useCallback(async () => {
    if (!recorderRef.current) return;
    setState('processing');
    const blob = await recorderRef.current.stop();
    downloadBlob(blob, `particles-${Date.now()}.webm`);
    recorderRef.current = null;
    setState('idle');
    setProgress(0);
  }, []);

  const supportsQualityExport = isWebCodecsAvailable();

  const startQualityExport = useCallback(async (
    canvas: HTMLCanvasElement,
    renderFrame: (frameIndex: number, dt: number) => void,
    durationSec: number,
    fps: number = 60,
  ) => {
    setState('recording');
    const totalFrames = Math.floor(durationSec * fps);
    const dt = 1 / fps;

    const recorder = createFrameAccurateRecorder(canvas.width, canvas.height, fps);

    for (let i = 0; i < totalFrames; i++) {
      renderFrame(i, dt);
      recorder.addFrame(canvas, i * (1_000_000 / fps));
      setProgress(Math.floor((i / totalFrames) * 100));
      // Yield to prevent browser freeze
      if (i % 10 === 0) await new Promise(r => setTimeout(r, 0));
    }

    setState('processing');
    const blob = await recorder.finish();
    downloadBlob(blob, `particles-${Date.now()}.mp4`);
    setState('idle');
    setProgress(0);
  }, []);

  return {
    state,
    progress,
    startQuickRecording,
    stopQuickRecording,
    startQualityExport,
    supportsQualityExport,
  };
}
