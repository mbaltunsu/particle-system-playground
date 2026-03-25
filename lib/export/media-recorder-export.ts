export function startMediaRecorderCapture(canvas: HTMLCanvasElement, fps = 60) {
  const stream = canvas.captureStream(fps);
  const chunks: Blob[] = [];
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 8_000_000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.start(100); // collect data every 100ms

  return {
    stop: (): Promise<Blob> => {
      return new Promise((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          resolve(blob);
        };
        recorder.stop();
      });
    },
  };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
