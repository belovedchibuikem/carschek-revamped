'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
export type LightboxSlide = {
  id: string;
  label: string;
  url: string;
};

export type PhotoLightboxProps = {
  open: boolean;
  slides: LightboxSlide[];
  initialIndex?: number;
  onClose: () => void;
  onRetake?: (id: string) => void;
  variant?: 'dark' | 'light';
};

export function PhotoLightbox({
  open,
  slides,
  initialIndex = 0,
  onClose,
  onRetake,
  variant = 'dark',
}: PhotoLightboxProps) {
  const [idx, setIdx] = useState(initialIndex);

  useEffect(() => {
    if (open) setIdx(Math.min(initialIndex, Math.max(0, slides.length - 1)));
  }, [open, initialIndex, slides.length]);

  const cur = slides[idx];

  const go = useCallback(
    (d: number) => {
      if (!slides.length) return;
      setIdx(i => (i + d + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, go]);

  if (!open || !slides.length || !cur) return null;

  const bg = variant === 'light' ? 'bg-white' : 'bg-black/95';
  const text = variant === 'light' ? 'text-[#1F2937]' : 'text-white';
  const sub = variant === 'light' ? 'text-[#6B7280]' : 'text-white/70';

  return (
    <div className={`fixed inset-0 z-[250] flex flex-col ${bg}`} role="dialog" aria-modal="true">
      <div className={`flex items-center justify-between px-4 py-3 ${text}`}>
        <span className="text-sm font-semibold">
          {idx + 1} / {slides.length}
        </span>
        <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-black/5" aria-label="Close">
          <X size={22} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
        <button
          type="button"
          onClick={() => go(-1)}
          className={`absolute left-2 z-10 rounded-full p-2 ${variant === 'light' ? 'bg-[#F4F6F8]' : 'bg-white/10'}`}
          aria-label="Previous"
        >
          <ChevronLeft size={24} className={text} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cur.url} alt={cur.label} className="max-h-[70vh] max-w-full object-contain" />
        <button
          type="button"
          onClick={() => go(1)}
          className={`absolute right-2 z-10 rounded-full p-2 ${variant === 'light' ? 'bg-[#F4F6F8]' : 'bg-white/10'}`}
          aria-label="Next"
        >
          <ChevronRight size={24} className={text} />
        </button>
      </div>

      <p className={`px-4 pb-2 text-center text-sm font-medium ${text}`}>{cur.label}</p>
      {onRetake && (
        <div className="flex justify-center pb-2">
          <button
            type="button"
            onClick={() => onRetake(cur.id)}
            className="text-sm font-semibold text-[#ff8a65] hover:underline"
          >
            Retake
          </button>
        </div>
      )}

      <div className={`flex gap-1 overflow-x-auto px-4 pb-6 ${sub}`}>
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIdx(i)}
            className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
              i === idx ? 'border-[#ff8a65]' : 'border-transparent opacity-70'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
