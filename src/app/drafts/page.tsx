'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileEdit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type DraftEntry = { key: string; preview: string; savedAt: number };

function scanDrafts(): DraftEntry[] {
  if (typeof window === 'undefined') return [];
  const out: DraftEntry[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key || !key.startsWith('draft_')) continue;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      let savedAt = 0;
      let preview = raw;
      try {
        const obj = JSON.parse(raw) as { savedAt?: number; _savedAt?: number };
        savedAt = obj.savedAt ?? obj._savedAt ?? 0;
        preview = JSON.stringify(obj).slice(0, 140);
      } catch {
        preview = raw.slice(0, 140);
      }
      out.push({ key, preview: preview.length > 140 ? `${preview}…` : preview, savedAt: savedAt || Date.now() });
    } catch {
      out.push({ key, preview: '(could not parse)', savedAt: 0 });
    }
  }
  return out.sort((a, b) => b.savedAt - a.savedAt);
}

export default function DraftsPage() {
  const pathname = usePathname();
  const [drafts, setDrafts] = useState<DraftEntry[]>([]);

  const refresh = useCallback(() => setDrafts(scanDrafts()), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const discard = (key: string) => {
    try {
      localStorage.removeItem(key);
      toast.success('Draft discarded');
      refresh();
    } catch {
      toast.error('Could not remove draft');
    }
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="max-w-3xl space-y-4">
        <h1 className="text-2xl font-heading font-bold text-[#1F2937] dark:text-slate-100 flex items-center gap-2">
          <FileEdit className="text-[#ff5722]" size={26} />
          Draft recovery
        </h1>
        <p className="text-sm text-[#6B7280]">
          Unsaved form drafts stored in this browser under <code className="font-mono text-xs bg-[#F4F6F8] dark:bg-slate-800 px-1 rounded">draft_[formName]_[userId]</code>.
        </p>

        {drafts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#E5E7EB] dark:border-slate-700 p-8 text-center text-sm text-[#6B7280]">
            No drafts found. Start a form — auto-save will create entries here.
          </div>
        ) : (
          <ul className="space-y-2">
            {drafts.map(d => (
              <li
                key={d.key}
                className="flex flex-wrap items-start gap-3 bg-white dark:bg-slate-900 rounded-xl border border-[#E5E7EB] dark:border-slate-700 p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs font-semibold text-[#ff5722] break-all">{d.key}</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-1">
                    {d.savedAt ? new Date(d.savedAt).toLocaleString('en-NG') : 'Unknown time'}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-2 line-clamp-2">{d.preview}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      toast.message('Open the target form to restore — draft key copied', { description: d.key });
                      void navigator.clipboard.writeText(d.key);
                    }}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#ff5722] text-white hover:bg-[#e64a19]"
                  >
                    Copy key
                  </button>
                  <button
                    type="button"
                    onClick={() => discard(d.key)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#E5E7EB] text-[#C0392B] hover:bg-red-50 inline-flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Discard
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link href="/dashboard" className="text-sm font-semibold text-[#ff8a65] hover:underline inline-block">
          ← Back to dashboard
        </Link>
      </div>
    </AppLayout>
  );
}
