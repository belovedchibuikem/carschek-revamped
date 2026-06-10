'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, BookmarkPlus, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  loadFilterPresets,
  saveFilterPreset,
  deleteFilterPreset,
  presetMatches,
  type FilterPreset,
} from '@/lib/filterPresets';

type Props = {
  /** Storage namespace, e.g. "orders" | "cars" | "reports". */
  pageKey: string;
  /** Currently active filters in URL-param shape (empty values allowed — ignored). */
  currentParams: Record<string, string>;
  /** Apply a preset's filters to the page. */
  onApply: (params: Record<string, string>) => void;
};

export function FilterPresetBar({ pageKey, currentParams, onApply }: Props) {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPresets(loadFilterPresets(pageKey));
  }, [pageKey]);

  useEffect(() => {
    if (saving) setTimeout(() => inputRef.current?.focus(), 30);
  }, [saving]);

  const hasActiveFilters = useMemo(
    () => Object.values(currentParams).some(v => v !== ''),
    [currentParams]
  );

  if (presets.length === 0 && !hasActiveFilters) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    setPresets(saveFilterPreset(pageKey, name, currentParams));
    toast.success(`Preset "${name.trim()}" saved`);
    setName('');
    setSaving(false);
  };

  const handleDelete = (preset: FilterPreset) => {
    setPresets(deleteFilterPreset(pageKey, preset.id));
    toast.message(`Preset "${preset.name}" removed`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B7280]">
        <Bookmark size={13} /> Presets
      </span>

      {presets.map(preset => {
        const active = presetMatches(preset, currentParams);
        return (
          <span
            key={preset.id}
            className={`group inline-flex items-center gap-1 rounded-full border pl-3 pr-1.5 py-1 text-xs font-medium transition-colors ${
              active
                ? 'border-[#ff5722] bg-[#ff5722] text-white'
                : 'border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#374151] dark:text-slate-200 hover:border-[#ff8a65]'
            }`}
          >
            <button type="button" onClick={() => onApply(preset.params)} title={describeParams(preset.params)}>
              {preset.name}
            </button>
            <button
              type="button"
              onClick={() => handleDelete(preset)}
              aria-label={`Delete preset ${preset.name}`}
              className={`rounded-full p-0.5 transition-colors ${
                active ? 'hover:bg-white/20 text-white/80' : 'text-[#9CA3AF] hover:bg-[#F4F6F8] hover:text-[#C0392B]'
              }`}
            >
              <X size={11} />
            </button>
          </span>
        );
      })}

      {hasActiveFilters &&
        (saving ? (
          <span className="inline-flex items-center gap-1">
            <input
              ref={inputRef}
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') {
                  setSaving(false);
                  setName('');
                }
              }}
              placeholder="Preset name…"
              className="w-36 rounded-full border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim()}
              aria-label="Confirm save preset"
              className="rounded-full bg-[#ff5722] p-1.5 text-white disabled:opacity-40"
            >
              <Check size={11} />
            </button>
            <button
              type="button"
              onClick={() => {
                setSaving(false);
                setName('');
              }}
              aria-label="Cancel save preset"
              className="rounded-full border border-[#E5E7EB] dark:border-slate-700 p-1.5 text-[#6B7280]"
            >
              <X size={11} />
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setSaving(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#E5E7EB] dark:border-slate-700 px-3 py-1 text-xs font-medium text-[#6B7280] hover:border-[#ff8a65] hover:text-[#ff5722] transition-colors"
          >
            <BookmarkPlus size={12} /> Save current
          </button>
        ))}
    </div>
  );
}

function describeParams(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
}
