'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Camera, Check, ChevronLeft, Loader2, Plus, Sparkles, Trash2, X } from 'lucide-react';
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
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { InspectionLayoutMode } from '@/components/inspection/InspectionSession';

type Props = {
  layout: InspectionLayoutMode;
  jobId: string;
  backHref: string;
};

export function DamagePhotosHubScreen({ layout, jobId, backHref }: Props) {
  const [photos, setPhotos] = useState<OrderDamagePhotoRow[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<Map<number, VoiceNoteWithUrl>>(new Map());
  const [cameraOpen, setCameraOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [damageName, setDamageName] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const ai = useAIDefectAnalysis();
  const reducedMotion = usePrefersReducedMotion();

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

  const discardPending = useCallback(() => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingBlob(null);
    setPendingPreview(null);
    setDetailsOpen(false);
    setDamageName('');
    setComment('');
    ai.clearResult();
  }, [pendingPreview, ai]);

  const startCapture = () => {
    setDamageName('');
    setComment('');
    setCameraOpen(true);
  };

  const onSaveDetails = async () => {
    const name = damageName.trim();
    if (!name) {
      toast.error('Enter a damage name');
      return;
    }
    if (!pendingBlob) {
      toast.error('No photo captured');
      return;
    }
    setSaving(true);
    try {
      const buf = await pendingBlob.arrayBuffer();
      await persistOrderHubDamagePhoto(jobId, name, buf, {
        mimeType: pendingBlob.type || 'image/jpeg',
        sizeKb: Math.round(pendingBlob.size / 1024),
        comment: comment.trim() || undefined,
        aiSeverity: ai.result?.suggestedSeverity,
      });
      reload();
      discardPending();
      toast.success('Damage photo saved');
    } catch {
      toast.error('Failed to save damage photo');
    } finally {
      setSaving(false);
    }
  };

  // Prefill name / comment from AI while the details sheet is open
  useEffect(() => {
    if (!detailsOpen || !ai.result) return;
    if (!damageName.trim()) setDamageName(ai.result.defect);
    if (!comment.trim()) setComment(ai.result.description);
  }, [ai.result, detailsOpen, damageName, comment]);

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
          onClick={startCapture}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#992E24] px-3 py-2 text-xs font-bold text-white shadow-sm"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
        <Sparkles size={14} className="mt-0.5 shrink-0 text-amber-600" />
        <p>Capture the damage first, then name it and add a description. AI analysis runs on the photo.</p>
      </div>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-[#E5E7EB] bg-white px-6 py-12 text-center shadow-sm">
          <Camera className="mb-3 text-[#D1D5DB]" size={48} strokeWidth={1.25} />
          <p className="font-semibold text-[#374151]">No damage photos yet</p>
          <p className="mt-1 max-w-xs text-sm text-[#6B7280]">Tap Add to open the camera and snap the defect</p>
          <button
            type="button"
            onClick={startCapture}
            className="mt-6 flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-[#992E24] py-3.5 text-sm font-bold text-white shadow"
          >
            <Camera size={16} /> Capture Damage Photo
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
                <img src={p.url} alt={p.label} className="h-full w-full object-cover" />
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
                {p.comment ? (
                  <p className="mt-1 line-clamp-2 text-xs text-[#6B7280]">{p.comment}</p>
                ) : null}
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
          onClick={startCapture}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#992E24] bg-white py-3 text-sm font-bold text-[#992E24]"
        >
          <Camera size={16} /> Capture Another Damage Photo
        </button>
        <Link
          href={backHref}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1B7143] py-3.5 text-center text-sm font-bold text-white shadow"
        >
          Done — {photos.length} damage photo{photos.length === 1 ? '' : 's'}
          <Check className="h-4 w-4 shrink-0" strokeWidth={3} aria-hidden />
        </Link>
      </div>

      {/* Step 2 — name & description after photo is captured */}
      {detailsOpen && pendingPreview && (
        <div className="fixed inset-0 z-[250] flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-base font-bold text-[#ff5722]">Name This Damage</h2>
              <button
                type="button"
                onClick={discardPending}
                className="rounded-full p-2 hover:bg-[#F4F6F8]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F4F6F8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingPreview} alt="Captured damage" className="aspect-video w-full object-cover" />
            </div>

            {ai.isAnalyzing && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900" role="status" aria-live="polite">
                <Loader2 size={14} className={`shrink-0 ${reducedMotion ? '' : 'animate-spin'}`} aria-hidden />
                <p>Carschek assist is analysing this photo…</p>
              </div>
            )}

            {ai.result && !ai.isAnalyzing && (
              <div className="mb-3 rounded-xl border border-red-100 bg-rose-50/80 p-3">
                <div className="flex items-center gap-2 text-[#ff5722]">
                  <AlertTriangle size={14} className="text-[#D35400]" />
                  <p className="text-xs font-bold">AI suggestion available</p>
                </div>
                <p className="mt-1 text-xs font-semibold text-[#E5534B]">{ai.result.defect}</p>
                <p className="mt-1 text-[11px] text-[#6B7280]">{ai.result.description}</p>
                <p className="mt-1 text-[10px] text-[#9CA3AF]">Suggestion only — edit name/comment before saving.</p>
              </div>
            )}

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
              Description / comment (optional)
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Describe the damage…"
                rows={3}
                className="mt-1 w-full resize-none rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#1F2937]"
              />
            </label>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={discardPending}
                className="flex-1 rounded-xl border border-[#E5E7EB] py-3 text-sm font-semibold text-[#6B7280]"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => void onSaveDetails()}
                disabled={!damageName.trim() || saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#992E24] py-3 text-sm font-bold text-white disabled:opacity-40"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Save Damage
              </button>
            </div>
          </div>
        </div>
      )}

      <CameraCaptureModal
        open={cameraOpen}
        title="Damage photo"
        subtitle="Position damage in frame, then capture"
        showAiBadge
        allowCameraFlip={false}
        showGuideOverlay
        compressOptions={{ maxWidth: 1200, maxHeight: 1200, quality: 0.82 }}
        onClose={() => setCameraOpen(false)}
        onCapture={async blob => {
          setCameraOpen(false);
          if (pendingPreview) URL.revokeObjectURL(pendingPreview);
          setPendingBlob(blob);
          setPendingPreview(URL.createObjectURL(blob));
          setDetailsOpen(true);
          setDamageName('');
          setComment('');
          void ai.analyzePhoto(blob);
        }}
      />
    </div>
  );
}
