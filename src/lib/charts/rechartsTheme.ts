'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useTheme } from 'next-themes';

/** Consistent tick/grid/tooltip colors for Recharts in light and dark mode (matches finance page). */
export function useRechartsTheme() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { resolvedTheme } = useTheme();
  /** Before mount, match SSR (light) so chart stroke/tooltip HTML matches server. */
  const isDark = mounted && resolvedTheme === 'dark';

  return useMemo(
    () => ({
      isDark,
      tickFill: isDark ? '#94a3b8' : '#9CA3AF',
      tickFillMuted: isDark ? '#cbd5e1' : '#6B7280',
      gridStroke: isDark ? '#334155' : '#F4F6F8',
      gridStrokeAlt: isDark ? '#334155' : '#F3F4F6',
      tooltipContentStyle: {
        borderRadius: 8,
        border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
        fontSize: 12,
        background: isDark ? '#1e293b' : '#fff',
        color: isDark ? '#e2e8f0' : '#1F2937',
      } as CSSProperties,
      legendWrapperStyle: { fontSize: 12, color: isDark ? '#e2e8f0' : '#1F2937' } as CSSProperties,
    }),
    [isDark]
  );
}
