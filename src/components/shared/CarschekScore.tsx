'use client';

import React, { useEffect, useMemo, useState } from 'react';

export interface CarschekScoreProps {
  score: number;
  size?: number;
  animated?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function getCarschekScoreStyle(score: number): { color: string; label: string } {
  const s = Math.max(0, Math.min(100, score));
  if (s <= 40) return { color: '#C0392B', label: 'Poor Condition' };
  if (s <= 60) return { color: '#D35400', label: 'Fair Condition' };
  if (s <= 75) return { color: '#1A7A4A', label: 'Good Condition' };
  if (s <= 90) return { color: '#ff5722', label: 'Very Good' };
  return { color: '#0E6655', label: 'Excellent' };
}

export function CarschekScore({ score, size = 64, animated = false, showLabel = false, className }: CarschekScoreProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const { color, label } = useMemo(() => getCarschekScoreStyle(clamped), [clamped]);
  const [displayPct, setDisplayPct] = useState(animated ? 0 : clamped);

  useEffect(() => {
    if (!animated) {
      setDisplayPct(clamped);
      return;
    }
    const start = performance.now();
    const dur = 900;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - t) ** 2;
      setDisplayPct(Math.round(clamped * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated, clamped]);

  const vb = 100;
  const cx = 50;
  const cy = 50;
  const r = 38;
  const strokeW = 8;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - displayPct / 100);

  return (
    <div className={['flex flex-col items-center', className].filter(Boolean).join(' ')}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${vb} ${vb}`} className="h-full w-full -rotate-90" aria-hidden>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F4F6F8" strokeWidth={strokeW} />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-bold tabular-nums text-[#1F2937]" style={{ fontSize: Math.max(11, size * 0.28) }}>
            {displayPct}
          </span>
          <span className="text-[#9CA3AF]" style={{ fontSize: Math.max(8, size * 0.12) }}>
            /100
          </span>
        </div>
      </div>
      {showLabel ? (
        <p className="mt-1.5 text-center text-sm font-semibold max-w-[14rem]" style={{ color }}>
          {label}
        </p>
      ) : null}
    </div>
  );
}

export default CarschekScore;
