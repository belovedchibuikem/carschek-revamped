'use client';

import React, { useEffect, useState } from 'react';
import { Camera, FlipHorizontal, Loader2, Sparkles, X } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { compressImage, type CompressImageOptions } from '@/lib/imageCompressor';

export type CameraCaptureModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  /** Pill on the right (damage / AI flows). */
  showAiBadge?: boolean;
  /** Default true; set false for simple damage capture header. */
  allowCameraFlip?: boolean;
  showGuideOverlay?: boolean;
  compressOptions?: CompressImageOptions;
  onClose: () => void;
  onCapture: (blob: Blob) => void | Promise<void>;
};

export function CameraCaptureModal({
  open,
  title,
  subtitle,
  showAiBadge = false,
  allowCameraFlip = true,
  showGuideOverlay = true,
  compressOptions,
  onClose,
  onCapture,
}: CameraCaptureModalProps) {
  const cam = useCamera();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      cam.stop();
      return;
    }
    void cam.start();
    return () => {
      cam.stop();
    };
    // Intentionally only `open`: start/stop identity would re-bind the stream on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleShutter = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const canvas = cam.captureToCanvas();
      if (!canvas) return;
      const opts = compressOptions ?? { maxWidth: 1600, maxHeight: 1600, quality: 0.85 };
      const { blob } = await compressImage(canvas, opts);
      await onCapture(blob);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-black">
      <div className="flex items-center justify-between gap-2 px-4 py-3 text-white">
        <button type="button" onClick={onClose} className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Close">
          <X size={20} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-bold text-white">{title}</p>
          {subtitle ? <p className="truncate text-[11px] text-white/65">{subtitle}</p> : null}
        </div>
        {showAiBadge ? (
          <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#2E75B6] px-2.5 py-1 text-[10px] font-bold text-white shadow-[0_0_12px_rgba(46,117,182,0.45)]">
            <Sparkles size={12} className="text-white" />
            AI On
          </div>
        ) : allowCameraFlip ? (
          <button
            type="button"
            onClick={() => cam.flipFacing()}
            className="rounded-full bg-white/10 p-2 hover:bg-white/20"
            aria-label="Flip camera"
          >
            <FlipHorizontal size={20} />
          </button>
        ) : (
          <span className="w-10 shrink-0" aria-hidden />
        )}
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
        {cam.error ? (
          <p className="px-6 text-center text-sm text-white/80">{cam.error}</p>
        ) : (
          <>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video ref={cam.videoRef} className="max-h-full max-w-full object-contain" playsInline muted autoPlay />
            {showGuideOverlay && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                <div className="flex aspect-[4/3] w-[min(92vw,22rem)] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/80 bg-black/20">
                  <span className="text-sm text-white/50">Camera Feed</span>
                  <span className="mt-auto mb-3 rounded-full bg-black/65 px-3 py-1 text-center text-[10px] font-medium text-white">
                    Position within frame
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-6 bg-black py-8">
        <button
          type="button"
          onClick={() => void handleShutter()}
          disabled={busy || !!cam.error || !cam.active}
          className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/20 disabled:opacity-40"
          aria-label="Capture"
        >
          {busy ? <Loader2 className="animate-spin text-white" size={28} /> : <Camera className="text-white" size={28} />}
        </button>
      </div>
    </div>
  );
}
