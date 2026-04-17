'use client';

import React from 'react';
import { getScoreColor, getScoreLabel } from '@/lib/mockData';

/** Reusable Carschek score display — uses mock thresholds until API scores land. */
export default function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size / 2) * 0.8;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, score)) / 100);
  const stroke = getScoreColor(score);

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F4F6F8" strokeWidth="8" className="dark:stroke-slate-700" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="8"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color: stroke }}>
            {score}
          </span>
        </div>
      </div>
      <div>
        <p className="text-lg font-heading font-bold" style={{ color: stroke }}>
          {getScoreLabel(score)}
        </p>
        <p className="text-xs text-[#6B7280]">Weighted inspection score</p>
      </div>
    </div>
  );
}
