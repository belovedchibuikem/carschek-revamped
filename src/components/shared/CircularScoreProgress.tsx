'use client';

import React, { useMemo } from 'react';
import { getCarschekScoreStyle } from '@/components/shared/CarschekScore';

export type CircularScoreProgressProps = {
  score: number;
  /** Outer box size in px */
  size?: number;
  className?: string;
};

/**
 * Radial progress: arc length matches score % of full circle.
 * Label is `score/100` centered with flex + translate (no SVG text baseline quirks).
 */
export function CircularScoreProgress({ score, size = 56, className = '' }: CircularScoreProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const { color, label } = useMemo(() => getCarschekScoreStyle(clamped), [clamped]);

  const vb = 100;
  const cx = 50;
  const cy = 50;
  /** Larger ring in the viewBox + thicker stroke so the arc reads clearly at table sizes */
  const r = 42;
  const stroke = 6;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <div
      className={['relative inline-flex shrink-0 items-center justify-center', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
      title={`${clamped}/100 · ${label}`}
      role="img"
      aria-label={`Total score ${clamped} out of 100, ${label}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${vb} ${vb}`}
        className="block overflow-visible"
        aria-hidden
      >
        <g transform={`translate(${cx},${cy}) rotate(-90)`}>
          <circle
            cx={0}
            cy={0}
            r={r}
            fill="none"
            stroke="#E8ECF1"
            strokeWidth={stroke}
          />
          <circle
            cx={0}
            cy={0}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </g>
      </svg>
      <p
        className="pointer-events-none absolute left-1/2 top-1/2 m-0 inline-flex -translate-x-1/2 -translate-y-1/2 items-baseline gap-0 leading-none"
        aria-hidden
      >
        <span
          className="font-semibold tabular-nums text-[#1F2937]"
          style={{ fontSize: Math.max(11, Math.min(13, size * 0.22)) }}
        >
          {clamped}
        </span>
        <span
          className="font-medium tabular-nums text-[#64748B]"
          style={{ fontSize: Math.max(8, Math.min(10, size * 0.15)) }}
        >
          /100
        </span>
      </p>
    </div>
  );
}
