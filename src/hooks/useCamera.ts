'use client';

import { useCallback, useRef, useState } from 'react';

export type CameraFacing = 'environment' | 'user';

export function useCamera() {
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const facingRef = useRef<CameraFacing>('environment');
  const [facingMode, setFacingMode] = useState<CameraFacing>('environment');
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingRef.current },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current;
      if (v) {
        v.srcObject = stream;
        await v.play().catch(() => {});
      }
      setActive(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Camera unavailable';
      setError(msg);
      setActive(false);
    }
  }, [stop]);

  const flipFacing = useCallback(() => {
    const next: CameraFacing = facingRef.current === 'environment' ? 'user' : 'environment';
    facingRef.current = next;
    setFacingMode(next);
    void start();
  }, [start]);

  const captureToCanvas = useCallback((): HTMLCanvasElement | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return null;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, w, h);
    return canvas;
  }, []);

  return {
    videoRef,
    facingMode,
    active,
    error,
    start,
    stop,
    flipFacing,
    captureToCanvas,
  };
}
