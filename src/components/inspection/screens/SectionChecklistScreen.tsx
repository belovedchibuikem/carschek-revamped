'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CloudOff, ThumbsUp, ThumbsDown, Ban, X } from 'lucide-react';
import { toast } from 'sonner';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { modelOptionsByName, yearOptionsForModelName } from '@/lib/reference/carCascade';
import { useInspectorHref } from '@/contexts/InspectorRouteContext';
import {
  loadChecklistState,
  useInspectionChecklistPersistence,
  enqueueInspectionSectionSync,
  type ChecklistPersistPayload,
} from '@/lib/inspectionChecklistPersistence';
import { INSPECTION_SECTIONS } from '@/lib/mockData';
import { getSectionDef, countToggleItems, type SectionDef, type ToggleItem } from '@/lib/inspection/inspectionSections';
import type { InspectionLayoutMode } from '@/components/inspection/InspectionSession';
import { VehiclePhotos } from '@/components/inspection/VehiclePhotos';
import { DamagePhotosHubScreen } from '@/components/inspection/screens/DamagePhotosHubScreen';
import { loadDamagePhotosForOrder } from '@/lib/inspection/dexieDamagePhotos';
import type { VehiclePhotosProgress } from '@/components/inspection/VehiclePhotos';

type ToggleValue = 'yes' | 'no' | 'na' | null;

type Props = {
  layout: InspectionLayoutMode;
  jobId: string;
  sectionId: string;
};

// ─── Toggle Button ──────────────────────────────────────────────────────────

function ToggleBtn({
  value,
  current,
  onSelect,
  groupIndex,
}: {
  value: ToggleValue;
  current: ToggleValue;
  onSelect: (v: ToggleValue) => void;
  /** When set (0–2), equal-width row segment — shared outer border, vertical dividers only */
  groupIndex?: 0 | 1 | 2;
}) {
  const isSelected = current === value;
  const inGroup = groupIndex !== undefined;

  const baseClass = inGroup
    ? [
        'flex min-h-[40px] min-w-0 flex-1 basis-0 items-center justify-center gap-1 py-2 text-[11px] font-bold transition-all',
        'rounded-none border-0',
        groupIndex > 0 ? 'border-l border-[#E5E7EB]' : '',
      ]
        .filter(Boolean)
        .join(' ')
    : 'flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-[11px] font-bold transition-all';

  const selectedYes = `${inGroup ? 'z-[1] !border-[#1A7A4A]' : ''} bg-[#1A7A4A] ${inGroup ? 'border-transparent' : 'border-[#1A7A4A]'} text-white`;
  const idleYes =
    `${inGroup ? '' : 'border-[#E5E7EB]'} bg-white text-[#6B7280] hover:bg-green-50${inGroup ? '' : ' border-[#E5E7EB]'}`;

  const selectedNo = `${inGroup ? 'z-[1] !border-[#C0392B]' : ''} bg-[#C0392B] ${inGroup ? 'border-transparent' : 'border-[#C0392B]'} text-white`;
  const idleNo =
    `${inGroup ? '' : 'border-[#E5E7EB]'} bg-white text-[#6B7280] hover:bg-red-50${inGroup ? '' : ' border-[#E5E7EB]'}`;

  const selectedNa = `${inGroup ? 'z-[1] !border-[#0D6E6E]' : ''} bg-[#0D6E6E] ${inGroup ? 'border-transparent' : 'border-[#0D6E6E]'} text-white`;
  const idleNa =
    `${inGroup ? '' : 'border-[#E5E7EB]'} bg-white text-[#6B7280] hover:bg-teal-50${inGroup ? '' : ' border-[#E5E7EB]'}`;

  if (value === 'yes') {
    return (
      <button
        type="button"
        onClick={() => onSelect(isSelected ? null : 'yes')}
        className={`${baseClass} ${isSelected ? selectedYes : idleYes}`}
      >
        <ThumbsUp size={11} />
        <span>Yes/Good</span>
      </button>
    );
  }
  if (value === 'no') {
    return (
      <button
        type="button"
        onClick={() => onSelect(isSelected ? null : 'no')}
        className={`${baseClass} ${isSelected ? selectedNo : idleNo}`}
      >
        <ThumbsDown size={11} />
        <span>No/Bad</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onSelect(isSelected ? null : 'na')}
      className={`${baseClass} ${isSelected ? selectedNa : idleNa}`}
    >
      <Ban size={11} />
      <span>N/A</span>
    </button>
  );
}

// ─── Toggle Item Row ────────────────────────────────────────────────────────

function ToggleItemCard({
  item,
  value,
  onChange,
  showError,
}: {
  item: ToggleItem;
  value: ToggleValue;
  onChange: (v: ToggleValue) => void;
  showError: boolean;
}) {
  return (
    <div
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 92px' }}
      className={`rounded-xl border p-3 ${showError && value === null ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] bg-white'}`}
    >
      <p className="mb-2 text-[12px] font-semibold text-[#1F2937] leading-tight">{item.label}</p>
      <div
        className={`flex w-full overflow-hidden rounded-lg border ${showError && value === null ? 'border-red-300' : 'border-[#E5E7EB]'}`}
      >
        <ToggleBtn value="yes" current={value} onSelect={onChange} groupIndex={0} />
        <ToggleBtn value="no" current={value} onSelect={onChange} groupIndex={1} />
        <ToggleBtn value="na" current={value} onSelect={onChange} groupIndex={2} />
      </div>
    </div>
  );
}

// ─── Form Section ───────────────────────────────────────────────────────────

function FormSection({
  def,
  formValues,
  setFormValues,
  showErrors,
}: {
  def: SectionDef;
  formValues: Record<string, string>;
  setFormValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  showErrors: boolean;
}) {
  const fields = def.fields ?? [];

  const handleChange = (id: string, val: string) => {
    setFormValues(prev => {
      const next = { ...prev, [id]: val };
      // Brand → Model → Year cascade for S03 Car Details
      if (id === 's03_brand' && prev['s03_model']) next['s03_model'] = '';
      if (id === 's03_model' && prev['s03_year']) {
        const allowed = yearOptionsForModelName(next['s03_brand'], val).map(o => o.value);
        if (!allowed.includes(prev['s03_year'])) next['s03_year'] = '';
      }
      return next;
    });
  };

  const clearField = (id: string) => {
    setFormValues(prev => ({ ...prev, [id]: '' }));
  };

  /** Reference-driven options for the S03 cascade; schema options otherwise. */
  const resolveDropdown = (field: { id: string; options: string[] }) => {
    if (field.id === 's03_model') {
      const models = modelOptionsByName(formValues['s03_brand']);
      // Always keep the field completable for brands outside reference data
      return [...models, { value: 'Other', label: 'Other' }];
    }
    if (field.id === 's03_year') {
      return yearOptionsForModelName(formValues['s03_brand'], formValues['s03_model']);
    }
    return field.options.map(opt => ({ value: opt, label: opt }));
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map(field => {
        const val = formValues[field.id] ?? '';
        const hasError = showErrors && field.required && !val;

        if (field.type === 'dropdown') {
          const options = resolveDropdown(field);
          const cascadeDisabled =
            (field.id === 's03_model' && !formValues['s03_brand']) ||
            (field.id === 's03_year' && !formValues['s03_model']);
          return (
            <div key={field.id}>
              <label htmlFor={`checklist-dd-${field.id}`} className="mb-1 block text-xs font-semibold text-[#374151]">
                {field.label}
                {field.required && <span className="ml-0.5 text-red-500">*</span>}
              </label>
              <div className="relative">
                <SearchableSelect
                  id={`checklist-dd-${field.id}`}
                  aria-label={field.label}
                  value={val}
                  onChange={next => handleChange(field.id, next)}
                  options={options}
                  disabled={cascadeDisabled}
                  placeholder={
                    field.id === 's03_model' && !formValues['s03_brand']
                      ? 'Select Brand first'
                      : field.id === 's03_year' && !formValues['s03_model']
                        ? 'Select Model first'
                        : `Select ${field.label}`
                  }
                  searchPlaceholder={`Search ${field.label}…`}
                  emptyText="No matches"
                  invalid={hasError}
                  buttonClassName={[
                    'px-3 py-2.5 text-sm min-h-[42px]',
                    field.clearable && val ? 'pr-10' : '',
                    'focus:ring-2 focus:ring-[#ff8a65]/30',
                  ].join(' ')}
                  className="w-full"
                />
                {field.clearable && val && (
                  <button
                    type="button"
                    onClick={() => clearField(field.id)}
                    className="absolute right-10 top-1/2 z-[101] -translate-y-1/2 rounded p-0.5 text-[#9CA3AF] hover:bg-[#F4F6F8] hover:text-[#6B7280]"
                    aria-label={`Clear ${field.label}`}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {hasError && <p className="mt-0.5 text-[10px] text-red-500">Required</p>}
            </div>
          );
        }

        if (field.type === 'text' || field.type === 'number') {
          return (
            <div key={field.id}>
              <label className="mb-1 block text-xs font-semibold text-[#374151]">
                {field.label}
                {field.required && <span className="ml-0.5 text-red-500">*</span>}
              </label>
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={val}
                onChange={e => handleChange(field.id, e.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 ${hasError ? 'border-red-400 bg-red-50' : 'border-[#E5E7EB] bg-white text-[#1F2937]'}`}
                placeholder={`Enter ${field.label}`}
              />
              {hasError && <p className="mt-0.5 text-[10px] text-red-500">Required</p>}
            </div>
          );
        }

        if (field.type === 'segmented') {
          return (
            <div key={field.id} className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-[#374151]">
                {field.label}
                {field.required && <span className="ml-0.5 text-red-500">*</span>}
              </label>
              <div className={`flex overflow-hidden rounded-xl border ${hasError ? 'border-red-400' : 'border-[#E5E7EB]'}`}>
                {field.options.map((opt, idx) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleChange(field.id, opt)}
                    className={`flex-1 py-2.5 text-xs font-bold transition-all ${idx > 0 ? 'border-l border-[#E5E7EB]' : ''} ${val === opt ? 'bg-[#ff5722] text-white' : 'bg-white text-[#6B7280] hover:bg-[#FFF3EE]'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {hasError && <p className="mt-0.5 text-[10px] text-red-500">Required</p>}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

// ─── Toggle Grid Section ────────────────────────────────────────────────────

function flattenToggleItems(def: SectionDef): ToggleItem[] {
  const rows = def.toggleRows ?? [];
  const out: ToggleItem[] = [];
  for (const row of rows) {
    out.push(row.left);
    if (row.right) out.push(row.right);
  }
  return out;
}

function ToggleGridSection({
  def,
  toggleValues,
  setToggleValues,
  showErrors,
}: {
  def: SectionDef;
  toggleValues: Record<string, ToggleValue>;
  setToggleValues: React.Dispatch<React.SetStateAction<Record<string, ToggleValue>>>;
  showErrors: boolean;
}) {
  const items = useMemo(() => flattenToggleItems(def), [def]);

  const answered = items.filter(item => (toggleValues[item.id] ?? null) !== null).length;

  const markAll = (value: Exclude<ToggleValue, null>) => {
    setToggleValues(prev => {
      const next = { ...prev };
      for (const item of items) next[item.id] = value;
      return next;
    });
    toast.success(`All ${items.length} items marked ${value === 'yes' ? 'Yes/Good' : 'N/A'} — tap any item to override`);
  };

  const clearAll = () => {
    setToggleValues(prev => {
      const next = { ...prev };
      for (const item of items) next[item.id] = null;
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => markAll('yes')}
          className="inline-flex items-center gap-1 rounded-lg border border-[#1A7A4A] px-3 py-1.5 text-[11px] font-bold text-[#1A7A4A] hover:bg-green-50 transition-colors"
        >
          <ThumbsUp size={11} /> All Yes/Good
        </button>
        <button
          type="button"
          onClick={() => markAll('na')}
          className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-[11px] font-bold text-[#6B7280] hover:bg-teal-50 transition-colors"
        >
          <Ban size={11} /> All N/A
        </button>
        {answered > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium text-[#9CA3AF] hover:text-[#C0392B] hover:bg-red-50 transition-colors"
          >
            <X size={11} /> Clear
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map(item => (
          <ToggleItemCard
            key={item.id}
            item={item}
            value={toggleValues[item.id] ?? null}
            onChange={v => setToggleValues(prev => ({ ...prev, [item.id]: v }))}
            showError={showErrors}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Comments Section ───────────────────────────────────────────────────────

function CommentsSection({
  def,
  commentValues,
  setCommentValues,
}: {
  def: SectionDef;
  commentValues: Record<string, string>;
  setCommentValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const fields = def.commentFields ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map(field => (
        <div key={field.id}>
          <label className="mb-1 block text-xs font-semibold text-[#374151]">{field.label}</label>
          <div className="relative">
            <textarea
              value={commentValues[field.id] ?? ''}
              onChange={e => setCommentValues(prev => ({ ...prev, [field.id]: e.target.value }))}
              placeholder={field.placeholder}
              rows={4}
              className="w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 pr-8 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
            />
            {(commentValues[field.id] ?? '') && (
              <button
                type="button"
                onClick={() => setCommentValues(prev => ({ ...prev, [field.id]: '' }))}
                className="absolute right-2 top-2 rounded-md p-0.5 text-[#9CA3AF] hover:bg-[#F4F6F8] hover:text-[#6B7280]"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Summary Section ────────────────────────────────────────────────────────

function SummarySection({ jobId, onSave }: { jobId: string; onSave: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF3EE]">
        <span className="text-4xl">📋</span>
      </div>
      <div className="text-center">
        <h2 className="font-heading text-xl font-bold text-[#1F2937]">Inspection Complete</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          All sections have been filled. Review your responses and save the report.
        </p>
      </div>
      <div className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Inspection Summary</p>
        <div className="space-y-2 text-sm text-[#374151]">
          <div className="flex justify-between">
            <span>Job ID</span>
            <span className="font-semibold text-[#1F2937]">{jobId}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Sections</span>
            <span className="font-semibold text-[#1F2937]">27</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span className="font-semibold text-[#1A7A4A]">Ready to Save</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onSave}
        className="w-full rounded-xl bg-[#ff5722] py-4 text-sm font-bold text-white shadow-md hover:bg-[#e64a19] transition-colors"
      >
        Save Report
      </button>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function SectionChecklistScreen({ layout, jobId, sectionId }: Props) {
  const router = useRouter();
  const href = useInspectorHref();

  // State for different section types
  const [toggleValues, setToggleValues] = useState<Record<string, ToggleValue>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [commentValues, setCommentValues] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [photosProgress, setPhotosProgress] = useState<VehiclePhotosProgress | null>(null);
  const [damagesCount, setDamagesCount] = useState(0);

  const hydrating = useRef(true);
  const touchStartX = useRef<number | null>(null);
  const { saveStatus, scheduleSave, flush, lastSavedAt } = useInspectionChecklistPersistence(jobId, sectionId);
  const [online, setOnline] = useState(true);
  const [tick, setTick] = useState(0);

  const sectionMeta = useMemo(() => INSPECTION_SECTIONS.find(s => s.id === sectionId), [sectionId]);
  const sectionIndex = useMemo(() => INSPECTION_SECTIONS.findIndex(s => s.id === sectionId), [sectionId]);
  const prevSection = sectionIndex > 0 ? INSPECTION_SECTIONS[sectionIndex - 1] : null;
  const nextSection = sectionIndex >= 0 && sectionIndex < INSPECTION_SECTIONS.length - 1 ? INSPECTION_SECTIONS[sectionIndex + 1] : null;
  const def = useMemo(() => getSectionDef(sectionId), [sectionId]);

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
        if (data?.results) {
          // Restore toggle values
          const tv: Record<string, ToggleValue> = {};
          for (const [k, v] of Object.entries(data.results as Record<string, string | null>)) {
            tv[k] = (v as ToggleValue) ?? null;
          }
          setToggleValues(tv);
        }
        if (data?.defects) {
          // Restore form/comment values stored in defects.notes
          const fv: Record<string, string> = {};
          const cv: Record<string, string> = {};
          for (const [k, v] of Object.entries(data.defects as Record<string, { severity: string; note: string }>)) {
            if (k.startsWith('form_')) fv[k.replace('form_', '')] = v.note;
            else if (k.startsWith('comment_')) cv[k.replace('comment_', '')] = v.note;
          }
          if (Object.keys(fv).length) setFormValues(fv);
          if (Object.keys(cv).length) setCommentValues(cv);
        }
      })
      .finally(() => {
        hydrating.current = false;
      });
  }, [jobId, sectionId]);

  // Load damage photos count when on S25
  useEffect(() => {
    if (def?.layout !== 'damages') return;
    void loadDamagePhotosForOrder(jobId).then(({ photos: list }) => {
      setDamagesCount(list.length);
    });
  }, [def?.layout, jobId]);

  // Compute progress
  const { completed, total } = useMemo(() => {
    if (!def) return { completed: 0, total: 0 };
    if (def.layout === 'toggle-grid') {
      const t = countToggleItems(def);
      const c = Object.values(toggleValues).filter(v => v !== null).length;
      return { completed: Math.min(c, t), total: t };
    }
    if (def.layout === 'form') {
      const requiredFields = (def.fields ?? []).filter(f => f.required);
      const t = requiredFields.length;
      const c = requiredFields.filter(f => (formValues[f.id] ?? '') !== '').length;
      return { completed: c, total: t };
    }
    if (def.layout === 'comments') {
      return { completed: 0, total: 0 };
    }
    if (def.layout === 'photos') {
      const t = photosProgress?.total ?? 11;
      const c = photosProgress?.captured ?? 0;
      return { completed: c, total: t };
    }
    if (def.layout === 'damages') {
      return { completed: damagesCount, total: damagesCount };
    }
    return { completed: 0, total: 0 };
  }, [def, toggleValues, formValues, photosProgress, damagesCount]);

  const progress = total > 0 ? (completed / total) * 100 : 100;

  // Persist
  const buildPayload = useCallback((): ChecklistPersistPayload => {
    const results: Record<string, string | null> = {};
    for (const [k, v] of Object.entries(toggleValues)) results[k] = v;
    const defects: Record<string, { severity: string; note: string }> = {};
    for (const [k, v] of Object.entries(formValues)) defects[`form_${k}`] = { severity: 'Minor', note: v };
    for (const [k, v] of Object.entries(commentValues)) defects[`comment_${k}`] = { severity: 'Minor', note: v };
    return { results, defects, expandedDefect: null };
  }, [toggleValues, formValues, commentValues]);

  useEffect(() => {
    if (hydrating.current) return;
    void flush(buildPayload());
  }, [toggleValues, formValues, commentValues, flush, buildPayload]);

  const savedAgoLabel = () => {
    void tick;
    if (saveStatus === 'saving') return 'Saving…';
    if (lastSavedAt == null) return 'Not saved yet';
    const sec = Math.floor((Date.now() - lastSavedAt) / 1000);
    if (sec < 1) return 'Saved just now';
    return `Saved ${sec}s ago`;
  };

  // Validate before NEXT
  const validate = (): boolean => {
    if (!def) return true;
    if (def.layout === 'toggle-grid') {
      const rows = def.toggleRows ?? [];
      for (const row of rows) {
        if (row.left.required && (toggleValues[row.left.id] ?? null) === null) return false;
        if (row.right && row.right.required && (toggleValues[row.right.id] ?? null) === null) return false;
      }
      return true;
    }
    if (def.layout === 'form') {
      for (const field of def.fields ?? []) {
        if (field.required && !(formValues[field.id] ?? '')) return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validate()) {
      setShowErrors(true);
      toast.error('Please complete all required fields before continuing');
      return;
    }
    setShowErrors(false);
    await enqueueInspectionSectionSync(jobId, sectionId, buildPayload());
    if (nextSection) {
      router.push(href(`inspect/${jobId}/section/${nextSection.id}`));
    } else {
      toast.success('All sections completed!');
      router.push(href(`inspect/${jobId}/overview`));
    }
  };

  const handlePrev = () => {
    if (prevSection) router.push(href(`inspect/${jobId}/section/${prevSection.id}`));
  };

  const handleSaveReport = async () => {
    await enqueueInspectionSectionSync(jobId, sectionId, buildPayload());
    toast.success('Report saved successfully!');
    router.push(href(`inspect/${jobId}/report`));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 60) return;
    if (dx < 0) void handleNext();
    else handlePrev();
  };

  const tabBarReserve = layout === 'pwa' ? 'pb-36' : 'pb-28';
  const isSummary = def?.layout === 'summary';
  const isPhotos = def?.layout === 'photos';
  const isDamages = def?.layout === 'damages';

  return (
    <div className={`space-y-4 ${tabBarReserve}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={href(`inspect/${jobId}/overview`)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white"
        >
          <ArrowLeft size={18} className="text-[#6B7280]" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[#9CA3AF]">← Back to Overview</p>
          <h1 className="font-heading text-base font-bold text-[#1F2937]">
            {sectionMeta?.name ?? sectionId}
          </h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-[#6B7280]">
            {total > 0 && (
              <span>{completed}/{total} items done</span>
            )}
            {total > 0 && <span className="text-[#E5E7EB]">·</span>}
            <span className="font-medium text-[#ff5722]">💾 {savedAgoLabel()}</span>
            {!online && (
              <span className="inline-flex items-center gap-1 text-amber-700">
                <CloudOff size={10} /> Offline
              </span>
            )}
          </div>
        </div>
        {/* Section number badge */}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff5722] text-xs font-bold text-white shadow-sm">
          {sectionIndex + 1}
        </div>
      </div>

      {/* Progress bar (only for sections with items) */}
      {total > 0 && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280]">{completed}/{total} required fields</span>
            <span className="text-xs font-semibold text-[#ff5722]">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#F4F6F8]">
            <div
              className="h-full rounded-full bg-[#ff5722] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Section Content */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        {def?.layout === 'form' && (
          <FormSection
            def={def}
            formValues={formValues}
            setFormValues={setFormValues}
            showErrors={showErrors}
          />
        )}
        {def?.layout === 'toggle-grid' && (
          <ToggleGridSection
            def={def}
            toggleValues={toggleValues}
            setToggleValues={setToggleValues}
            showErrors={showErrors}
          />
        )}
        {def?.layout === 'comments' && (
          <CommentsSection
            def={def}
            commentValues={commentValues}
            setCommentValues={setCommentValues}
          />
        )}
        {def?.layout === 'summary' && (
          <SummarySection jobId={jobId} onSave={handleSaveReport} />
        )}
        {(isPhotos || isDamages) && (
          <div>
            {isPhotos && (
              <VehiclePhotos
                inspectionId={jobId}
                layout="compact"
                presentation="embedded"
                onProgress={setPhotosProgress}
              />
            )}
            {isDamages && (
              <DamagePhotosHubScreen
                layout={layout}
                jobId={jobId}
                backHref={href(`inspect/${jobId}/overview`)}
              />
            )}
          </div>
        )}
        {!def && (
          <p className="py-8 text-center text-sm text-[#9CA3AF]">Section not found: {sectionId}</p>
        )}
      </div>

      {/* Navigation Footer */}
      {!isSummary && (
        <div
          className={`fixed z-[45] border-t border-[#E5E7EB] bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(30,58,95,0.06)] backdrop-blur print:hidden ${
            layout === 'pwa' ?'bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-1/2 w-full max-w-md -translate-x-1/2' :'bottom-0 left-0 right-0'
          }`}
        >
          <div className={`mx-auto flex w-full gap-3 ${layout === 'pwa' ? '' : 'max-w-2xl'}`}>
            <button
              type="button"
              disabled={!prevSection}
              onClick={handlePrev}
              className="flex-1 rounded-xl border border-[#ff5722] py-3 text-xs font-bold text-[#ff5722] transition-colors hover:bg-[#FFF3EE] disabled:border-[#E5E7EB] disabled:text-[#9CA3AF] disabled:hover:bg-transparent"
            >
              ← PREVIOUS
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex-[1.5] rounded-xl bg-[#ff5722] py-3 text-xs font-bold text-white shadow hover:bg-[#e64a19] transition-colors"
            >
              {nextSection ? 'NEXT →' : 'FINISH ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
