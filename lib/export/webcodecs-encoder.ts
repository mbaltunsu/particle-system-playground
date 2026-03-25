import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

export function isWebCodecsAvailable(): boolean {
  return typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined';
}

export interface FrameAccurateRecorder {
  addFrame(canvas: HTMLCanvasElement, timestampUs: number): void;
  finish(): Promise<Blob>;
}

export function createFrameAccurateRecorder(width: number, height: number, fps: number): FrameAccurateRecorder {
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: {
      codec: 'avc',
      width,
      height,
    },
    fastStart: 'in-memory',
  });

  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta ?? undefined),
    error: (e) => console.error('VideoEncoder error:', e),
  });

  encoder.configure({
    codec: 'avc1.640028',
    width,
    height,
    bitrate: 15_000_000,
    framerate: fps,
  });

  return {
    addFrame(canvas: HTMLCanvasElement, timestampUs: number) {
      const frame = new VideoFrame(canvas, { timestamp: timestampUs });
      const keyFrame = (timestampUs / (1_000_000 / fps)) % 60 < 1;
      encoder.encode(frame, { keyFrame });
      frame.close();
    },
    async finish(): Promise<Blob> {
      await encoder.flush();
      muxer.finalize();
      return new Blob([target.buffer], { type: 'video/mp4' });
    },
  };
}
