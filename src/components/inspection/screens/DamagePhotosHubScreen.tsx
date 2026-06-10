'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Camera, Check, ChevronLeft, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { CameraCaptureModal } from '@/components/inspection/CameraCaptureModal';
import { useAIDefectAnalysis } from '@/hooks/useAIDefectAnalysis';
import {
  deleteDamagePhoto,
  loadDamagePhotosForOrder,
  persistOrderHubDamagePhoto,
  type OrderDamagePhotoRow,
} from '@/lib/inspection/dexieDamagePhotos';
import {
  deleteVoiceNoteForDamagePhoto,
  loadVoiceNotesForOrder,
  persistDamageVoiceNote,
  type VoiceNoteWithUrl,
} from '@/lib/inspection/dexieVoiceNotes';
import { VoiceNoteRecorder } from '@/components/inspection/VoiceNoteRecorder';
import type { InspectionLayoutMode } from '@/components/inspection/InspectionSession';

type Props = {
  layout: InspectionLayoutMode;
  jobId: string;
  backHref: string;
};

export function DamagePhotosHubScreen({ layout, jobId, backHref }: Props) {
  const [photos, setPhotos] = useState<OrderDamagePhotoRow[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<Map<number, VoiceNoteWithUrl>>(new Map());
  const [addOpen, setAddOpen] = useState(false);
  const [damageName, setDamageName] = useState('');
  const [comment, setComment] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [pendingLabel, setPendingLabel] = useState('');
  const ai = useAIDefectAnalysis();

  const reloadVoiceNotes = useCallback(() => {
    void loadVoiceNotesForOrder(jobId).then(({ notes }) => setVoiceNotes(notes));
  }, [jobId]);

  const reload = useCallback(() => {
    void loadDamagePhotosForOrder(jobId).then(({ photos: list }) => {
      setPhotos(list);
    });
    reloadVoiceNotes();
  }, [jobId, reloadVoiceNotes]);

  useEffect(() => {
    let revokeLatest: (() => void) | null = null;
    let revokeNotes: (() => void) | null = null;
    void loadDamagePhotosForOrder(jobId).then(({ photos: list, revoke: r }) => {
      revokeLatest = r;
      setPhotos(list);
    });
    void loadVoiceNotesForOrder(jobId).then(({ notes, revoke: r }) => {
      revokeNotes = r;
      setVoiceNotes(notes);
    });
    return () => {
      revokeLatest?.();
      revokeNotes?.();
    };
  }, [jobId]);

  const openCapture = (label: string) => {
    setPendingLabel(label);
    setCameraOpen(true);
  };

  const onSaveModal = () => {
    const n = damageName.trim();
    if (!n) {
      toast.error('Enter a damage name');
      return;
    }
    setAddOpen(false);
    openCapture(n);
  };

  const remove = (id: number) => {
    if (!confirm('Remove this damage photo?')) return;
    void Promise.all([deleteDamagePhoto(id), deleteVoiceNoteForDamagePhoto(id)]).then(() => {
      reload();
      toast.message('Removed');
    });
  };

  return (
    <div className={`space-y-4 ${layout === 'mobile-app' ? 'mx-auto max-w-lg' : ''}`}>
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white shadow-sm"
          aria-label="Back"
        >
          <ChevronLeft size={20} className="text-[#6B7280]" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-lg font-bold text-[#1F2937]">Damage Photos</h1>
          <p className="text-xs text-[#6B7280]">
            {photos.length} damage photo{photos.length === 1 ? '' : 's'} added
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#992E24] px-3 py-2 text-xs font-bold text-white shadow-sm"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
        <Sparkles size={14} className="mt-0.5 shrink-0 text-amber-600" />
        <p>AI-powered defect detection is active for damage photos</p>
      </div>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-[#E5E7EB] bg-white px-6 py-12 text-center shadow-sm">
          <Camera className="mb-3 text-[#D1D5DB]" size={48} strokeWidth={1.25} />
          <p className="font-semibold text-[#374151]">No damage photos yet</p>
          <p className="mt-1 max-w-xs text-sm text-[#6B7280]">Tap Add to capture a defect photo with AI analysis</p>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="mt-6 w-full max-w-sm rounded-2xl bg-[#992E24] py-3.5 text-sm font-bold text-white shadow"
          >
            + Add Damage Photo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {photos.map((p, i) => (
            <div
              key={p.id}
              className="flex gap-3 rounded-2xl border border-red-100 bg-white p-3 shadow-sm"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-amber-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-full w-full object-cover" />
                <span className="absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff5722] text-[9px] font-bold text-white">
                  #{i + 1}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-[#1F2937]">{p.label}</p>
                  <button type="button" onClick={() => remove(p.id)} className="text-[#9CA3AF] hover:text-[#C0392B]" aria-label="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                    AI ready
                  </span>
                  <VoiceNoteRecorder
                    existingUrl={voiceNotes.get(p.id)?.url ?? null}
                    durationSec={voiceNotes.get(p.id)?.durationSec}
                    onSave={async (blob, durationSec) => {
                      await persistDamageVoiceNote(jobId, p.id, blob, durationSec);
                      reloadVoiceNotes();
                    }}
                    onDelete={async () => {
                      await deleteVoiceNoteForDamagePhoto(p.id);
                      reloadVoiceNotes();
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="w-full rounded-2xl border-2 border-dashed border-[#992E24] bg-white py-3 text-sm font-bold text-[#992E24]"
        >
          + Add Another Damage Photo
        </button>
        <Link
          href={backHref}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1B7143] py-3.5 text-center text-sm font-bold text-white shadow"
        >
          Done — {photos.length} damage photo{photos.length === 1 ? '' : 's'}
          <Check className="h-4 w-4 shrink-0" strokeWidth={3} aria-hidden />
        </Link>
      </div>

      {addOpen && (
        <div className="fixed inset-0 z-[250] flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-base font-bold text-[#ff5722]">Add Damage Photo</h2>
              <button type="button" onClick={() => setAddOpen(false)} className="rounded-full p-2 hover:bg-[#F4F6F8]" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">
              Damage name *
              <input
                value={damageName}
                onChange={e => setDamageName(e.target.value)}
                placeholder="e.g. Front bumper dent…"
                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#1F2937]"
              />
            </label>
            <label className="mt-3 block text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">
              Comment (optional)
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Describe the damage…"
                rows={3}
                className="mt-1 w-full resize-none rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#1F2937]"
              />
            </label>
            <div className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
              <Sparkles size={14} className="shrink-0" />
              <p>After saving, you&apos;ll open the camera. AI will detect and classify the defect.</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="flex-1 rounded-xl border border-[#E5E7EB] py-3 text-sm font-semibold text-[#6B7280]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSaveModal}
                disabled={!damageName.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#992E24] py-3 text-sm font-bold text-white disabled:opacity-40"
              >
                <Camera size={16} /> Save & Capture
              </button>
            </div>
          </div>
        </div>
      )}

      {ai.isAnalyzing && (
        <div className="fixed inset-0 z-[320] flex flex-col bg-black text-white">
          <div className="flex-1 overflow-hidden bg-gradient-to-b from-[#1a1a2e] to-black px-4 pt-8">
            <div className="mx-auto mb-6 h-40 max-w-sm rounded-xl bg-gradient-to-br from-[#334155] to-[#1e293b] flex items-center justify-center text-sm text-white/50">
              Captured Photo
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#ff8a65] shadow-[0_0_24px_rgba(46,117,182,0.5)]">
                <Sparkles className="text-[#ff8a65]" size={28} />
              </div>
              <p className="text-center text-lg font-bold">Carschek AI is analysing…</p>
              <ul className="mt-4 w-full max-w-xs space-y-2 text-sm text-white/90">
                {['Detecting defects…', 'Classifying severity…', 'Done'].map(t => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={3} aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-6 h-1 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-3/4 animate-pulse rounded-full bg-[#ff8a65]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {ai.result && !ai.isAnalyzing && (
        <div className="fixed inset-0 z-[320] overflow-y-auto bg-[#F8FAFC] p-4">
          <div className="mx-auto max-w-md space-y-4 pb-8">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-[#E5E7EB]">
              <div className="absolute inset-8 rounded-lg border-2 border-[#E5534B]">
                <span className="absolute -top-3 left-2 rounded-full bg-[#E5534B] px-2 py-0.5 text-[10px] font-bold text-white">
                  Possible defect
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#ff5722]">
              <AlertTriangle className="text-[#D35400]" size={18} />
              <p className="font-bold">AI Detected: possible defect</p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-rose-50/80 p-4">
              <p className="font-bold text-[#E5534B]">{ai.result.defect}</p>
              <p className="mt-2 text-xs text-[#6B7280]">{Math.round(ai.result.confidence * 100)}% confidence</p>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-[#D35400]"
                  style={{ width: `${Math.round(ai.result.confidence * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] font-semibold text-[#374151]">
                Suggested severity:{' '}
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-800">{ai.result.suggestedSeverity}</span>
              </p>
              <p className="mt-2 text-xs italic text-[#6B7280]">&quot;{ai.result.description}&quot;</p>
            </div>
            <button
              type="button"
              onClick={() => ai.clearResult()}
              className="w-full rounded-2xl bg-[#1D7A46] py-3.5 text-sm font-bold text-white"
            >
              Apply AI Result
            </button>
            <button
              type="button"
              onClick={() => ai.clearResult()}
              className="w-full rounded-2xl bg-[#2B70B1] py-3.5 text-sm font-bold text-white"
            >
              Enter Manually
            </button>
            <button
              type="button"
              onClick={() => ai.clearResult()}
              className="w-full rounded-2xl border border-[#E5E7EB] bg-white py-3.5 text-sm font-semibold text-[#6B7280]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <CameraCaptureModal
        open={cameraOpen}
        title={pendingLabel || 'Damage'}
        subtitle="Position damage in frame"
        showAiBadge
        allowCameraFlip={false}
        showGuideOverlay
        compressOptions={{ maxWidth: 1200, maxHeight: 1200, quality: 0.82 }}
        onClose={() => {
          setCameraOpen(false);
          setPendingLabel('');
        }}
        onCapture={async blob => {
          const label = pendingLabel || damageName.trim() || 'Damage';
          const buf = await blob.arrayBuffer();
          await persistOrderHubDamagePhoto(jobId, label, buf, {
            mimeType: blob.type || 'image/jpeg',
            sizeKb: Math.round(blob.size / 1024),
          });
          reload();
          setCameraOpen(false);
          setPendingLabel('');
          setDamageName('');
          setComment('');
          void ai.analyzePhoto(blob);
        }}
      />
    </div>
  );
}
