/** Per-user saved filter presets for admin list pages — localStorage until API exists. */

import { getGuestUserId } from '@/lib/drafts';

export type FilterPreset = {
  id: string;
  name: string;
  /** URL-param-shaped filters, empty values omitted (shareable as a query string). */
  params: Record<string, string>;
  createdAt: number;
};

function storageKey(pageKey: string): string {
  return `carschek-filter-presets_${pageKey}_${getGuestUserId()}`;
}

export function loadFilterPresets(pageKey: string): FilterPreset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(pageKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FilterPreset[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(pageKey: string, presets: FilterPreset[]): void {
  try {
    localStorage.setItem(storageKey(pageKey), JSON.stringify(presets));
  } catch {
    /* quota */
  }
}

export function saveFilterPreset(pageKey: string, name: string, params: Record<string, string>): FilterPreset[] {
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== '') cleaned[k] = v;
  }
  const preset: FilterPreset = {
    id: `fp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    params: cleaned,
    createdAt: Date.now(),
  };
  const next = [...loadFilterPresets(pageKey).filter(p => p.name !== preset.name), preset];
  persist(pageKey, next);
  return next;
}

export function deleteFilterPreset(pageKey: string, id: string): FilterPreset[] {
  const next = loadFilterPresets(pageKey).filter(p => p.id !== id);
  persist(pageKey, next);
  return next;
}

/** Shallow equality between a preset's params and the currently active filters. */
export function presetMatches(preset: FilterPreset, current: Record<string, string>): boolean {
  const cur: Record<string, string> = {};
  for (const [k, v] of Object.entries(current)) {
    if (v !== '') cur[k] = v;
  }
  const a = Object.keys(preset.params);
  const b = Object.keys(cur);
  if (a.length !== b.length) return false;
  return a.every(k => preset.params[k] === cur[k]);
}
