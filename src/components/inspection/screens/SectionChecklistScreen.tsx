'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mic, CloudOff } from 'lucide-react';
import { DamagePhotoCapture } from '@/components/inspection/DamagePhotoCapture';
import { toast } from 'sonner';
import { useInspectorHref } from '@/contexts/InspectorRouteContext';
import {
  loadChecklistState,
  useInspectionChecklistPersistence,
  enqueueInspectionSectionSync,
  type ChecklistPersistPayload,
} from '@/lib/inspectionChecklistPersistence';
import {
  SECTION_ITEMS,
  itemActioned,
  itemHasFail,
  type ItemResult,
} from '@/lib/inspector/sectionChecklist';
import { INSPECTION_SECTIONS } from '@/lib/mockData';
import type { InspectionLayoutMode } from '@/components/inspection/InspectionSession';

type Props = {
  layout: InspectionLayoutMode;
  jobId: string;
  sectionId: string;
};

export function SectionChecklistScreen({ layout, jobId, sectionId }: Props) {
  const router = useRouter();
  const href = useInspectorHref();
  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [defects, setDefects] = useState<Record<string, { severity: string; note: string }>>({});
  const [expandedDefect, setExpandedDefect] = useState<string | null>(null);
  const hydrating = useRef(true);
  const touchStartX = useRef<number | null>(null);
  const { saveStatus, scheduleSave, flush, lastSavedAt } = useInspectionChecklistPersistence(jobId, sectionId);
  const [online, setOnline] = useState(true);
  const [tick, setTick] = useState(0);
  const defectsRef = useRef(defects);
  defectsRef.current = defects;

  const sectionMeta = useMemo(() => INSPECTION_SECTIONS.find(s => s.id === sectionId), [sectionId]);
  const sectionIndex = useMemo(() => INSPECTION_SECTIONS.findIndex(s => s.id === sectionId), [sectionId]);
  const prevSection = sectionIndex > 0 ? INSPECTION_SECTIONS[sectionIndex - 1] : null;
  const nextSection = sectionIndex >= 0 && sectionIndex < INSPECTION_SECTIONS.length - 1 ? INSPECTION_SECTIONS[sectionIndex + 1] : null;

  useEffect(() => {
    const id = window.setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const on = () => setOnline(navigator.onLine);
    setOnline(navigator.onLine);
    window.addEventListener('online', on);
    window.addEventListener('offline', on);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', on);
    };
  }, []);

  useEffect(() => {
    hydrating.current = true;
    void loadChecklistState(jobId, sectionId)
      .then(data => {
        if (data?.results) setResults(data.results as Record<string, ItemResult>);
        if (data?.defects) setDefects(data.defects);
        if (data?.expandedDefect !== undefined) setExpandedDefect(data.expandedDefect);
      })
      .finally(() => {
        hydrating.current = false;
      });
  }, [jobId, sectionId]);

  const payload = useCallback(
    (): ChecklistPersistPayload => ({
      results: results as Record<string, string | null>,
      defects,
      expandedDefect,
    }),
    [results, defects, expandedDefect]
  );

  useEffect(() => {
    if (hydrating.current) return;
    void flush({
      results: results as Record<string, string | null>,
      defects: defectsRef.current,
      expandedDefect,
    });
  }, [results, expandedDefect, flush]);

  useEffect(() => {
    if (hydrating.current) return;
    scheduleSave(payload());
  }, [defects, scheduleSave, payload]);

  const setResult = (resultKey: string, result: ItemResult, defectGroupId?: string) => {
    const group = defectGroupId ?? resultKey;
    setResults(prev => ({ ...prev, [resultKey]: result }));
    if (result === 'fail') {
      setExpandedDefect(group);
      setDefects(prev => ({ ...prev, [group]: prev[group] || { severity: 'Major', note: '' } }));
    } else if (expandedDefect === group) {
      setExpandedDefect(null);
    }
  };

  const completed = useMemo(
    () => SECTION_ITEMS.filter(item => itemActioned(item, results)).length,
    [results]
  );
  const progress = (completed / SECTION_ITEMS.length) * 100;

  const savedAgoLabel = () => {
    void tick;
    if (saveStatus === 'saving') return 'Saving…';
    if (lastSavedAt == null) return 'Not saved yet';
    const sec = Math.floor((Date.now() - lastSavedAt) / 1000);
    if (sec < 1) return 'Saved just now';
    return `Saved ${sec}s ago`;
  };

  const handleComplete = async () => {
    const allActioned = SECTION_ITEMS.every(item => itemActioned(item, results));
    if (!allActioned) {
      toast.error('Please action all items before completing');
      return;
    }
    await enqueueInspectionSectionSync(jobId, sectionId, payload());
    toast.success(`Section ${sectionId} completed — queued for sync`);
    router.push(href(`inspect/${jobId}/overview`));
  };

  const goPrev = () => {
    if (prevSection) router.push(href(`inspect/${jobId}/section/${prevSection.id}`));
  };

  const goNext = () => {
    if (nextSection) router.push(href(`inspect/${jobId}/section/${nextSection.id}`));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 60) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  const markBothPass = (itemId: string) => {
    setResults(prev => ({ ...prev, [`${itemId}-L`]: 'pass', [`${itemId}-R`]: 'pass' }));
    toast.message('Both sides marked pass');
  };

  const tabBarReserve = layout === 'pwa' ? 'pb-36' : 'pb-28';

  return (
    <div className={`space-y-4 ${tabBarReserve}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex flex-wrap items-center gap-3">
        <Link href={href(`inspect/${jobId}/overview`)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white">
          <ArrowLeft size={18} className="text-[#6B7280]" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[#9CA3AF]">← Back to Overview</p>
          <h1 className="font-heading text-base font-bold text-[#1F2937]">{sectionMeta?.name ?? sectionId}</h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-[#6B7280]">
            <span>
              {completed}/{SECTION_ITEMS.length} items done
            </span>
            <span className="text-[#E5E7EB]">·</span>
            <span className="font-medium text-[#ff5722]">💾 {savedAgoLabel()}</span>
            {!online && (
              <span className="inline-flex items-center gap-1 text-amber-700">
                <CloudOff size={10} /> Offline
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#6B7280]">
            {completed}/{SECTION_ITEMS.length} items
          </span>
          <span className="text-xs font-semibold text-[#ff5722]">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#F4F6F8]">
          <div className="h-full rounded-full bg-[#ff5722] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="space-y-2">
        {SECTION_ITEMS.map(item => (
          <div key={item.id} className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-[#1F2937]">{item.name}</p>
              </div>
              {item.type === 'single' ? (
                <div className="flex gap-2">
                  {(['pass', 'fail', 'na'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setResult(item.id, r, item.id)}
                      className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
                        results[item.id] === r
                          ? r === 'pass'
                            ? 'bg-[#1A7A4A] text-white'
                            : r === 'fail'
                              ? 'bg-[#C0392B] text-white'
                              : 'bg-[#6B7280] text-white'
                          : 'border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      {r === 'pass' ? '✓ Pass' : r === 'fail' ? '✗ Fail' : '⊘ N/A'}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {(['L', 'R'] as const).map(side => (
                    <div key={side}>
                      <button
                        type="button"
                        onContextMenu={e => {
                          e.preventDefault();
                          markBothPass(item.id);
                        }}
                        className="mb-1.5 block w-full text-left text-xs text-[#6B7280] hover:text-[#ff5722]"
                      >
                        {side === 'L' ? 'Left' : 'Right'} <span className="text-[10px] text-[#9CA3AF]">(long-press both pass)</span>
                      </button>
                      <div className="flex gap-1">
                        {(['pass', 'fail'] as const).map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setResult(`${item.id}-${side}`, r, item.id)}
                            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                              results[`${item.id}-${side}`] === r
                                ? r === 'pass'
                                  ? 'bg-[#1A7A4A] text-white'
                                  : 'bg-[#C0392B] text-white'
                                : 'border border-[#E5E7EB] bg-white text-[#6B7280]'
                            }`}
                          >
                            {r === 'pass' ? '✓ PASS' : '✗ FAIL'} {side}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {(itemHasFail(item, results) || expandedDefect === item.id) && (
              <div className="space-y-3 border-t border-[#F4F6F8] bg-red-50/90 p-4 transition-all duration-200 ease-out">
                <p className="text-xs font-semibold text-[#C0392B]">
                  ⚠ Defect Detail — {item.name}
                </p>
                <div>
                  <p className="mb-1.5 text-xs text-[#6B7280]">Severity</p>
                  <div className="flex gap-2">
                    {['Minor', 'Major', 'Critical'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setDefects(prev => ({ ...prev, [item.id]: { ...prev[item.id], severity: s } }))}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                          defects[item.id]?.severity === s
                            ? s === 'Critical'
                              ? 'bg-[#C0392B] text-white'
                              : s === 'Major'
                                ? 'bg-[#D35400] text-white'
                                : 'bg-amber-500 text-white'
                            : 'border border-[#E5E7EB] bg-white text-[#6B7280]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <DamagePhotoCapture
                  itemKey={item.id}
                  sectionId={sectionId}
                  inspectionOrderId={jobId}
                  note={defects[item.id]?.note ?? ''}
                  severity={defects[item.id]?.severity ?? 'Major'}
                  onNoteChange={n =>
                    setDefects(prev => ({
                      ...prev,
                      [item.id]: { severity: prev[item.id]?.severity ?? 'Major', note: n },
                    }))
                  }
                  onSeverityChange={s =>
                    setDefects(prev => ({
                      ...prev,
                      [item.id]: { severity: s, note: prev[item.id]?.note ?? '' },
                    }))
                  }
                />
                <div className="relative">
                  <textarea
                    value={defects[item.id]?.note || ''}
                    onChange={e => setDefects(prev => ({ ...prev, [item.id]: { ...prev[item.id], note: e.target.value } }))}
                    placeholder="Type or record defect description…"
                    rows={2}
                    className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  />
                  <button
                    type="button"
                    onClick={() => toast.success('Voice note (demo)')}
                    className="absolute bottom-2 right-2 rounded-lg p-1 text-[#6B7280] hover:bg-[#F4F6F8]"
                  >
                    <Mic size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className={`fixed z-[45] border-t border-[#E5E7EB] bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(30,58,95,0.06)] backdrop-blur print:hidden ${
          layout === 'pwa'
            ? 'bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-1/2 w-full max-w-md -translate-x-1/2'
            : 'bottom-0 left-0 right-0'
        }`}
      >
        <div className={`mx-auto flex w-full flex-col gap-2 ${layout === 'pwa' ? '' : 'max-w-md'}`}>
          <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>
              Items: {completed} / {SECTION_ITEMS.length} completed
            </span>
            <span className="text-[#9CA3AF]">Swipe ← → between sections</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!prevSection}
              onClick={goPrev}
              className="flex-1 rounded-xl border border-[#E5E7EB] py-3 text-xs font-bold text-[#6B7280] disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={handleComplete}
              className="flex-[1.2] rounded-xl bg-[#1A7A4A] py-3 text-xs font-bold text-white shadow"
            >
              Section Complete ✓
            </button>
            <button
              type="button"
              disabled={!nextSection}
              onClick={goNext}
              className="flex-1 rounded-xl border border-[#E5E7EB] py-3 text-xs font-bold text-[#6B7280] disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
