'use client';

/** Tiny in-memory placeholder for damage thumbnails (html2canvas-safe, no network). */
export function makeDamagePlaceholderDataUrl(index: number): string {
  if (typeof document === 'undefined') return '';
  const c = document.createElement('canvas');
  c.width = 160;
  c.height = 120;
  const ctx = c.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = '#E8ECF0';
  ctx.fillRect(0, 0, 160, 120);
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '11px sans-serif';
  ctx.fillText(`Evidence ${index + 1}`, 48, 64);
  return c.toDataURL('image/jpeg', 0.88);
}
