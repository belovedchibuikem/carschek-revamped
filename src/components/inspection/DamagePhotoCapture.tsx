'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Camera, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { CameraCaptureModal } from '@/components/inspection/CameraCaptureModal';
import { PhotoLightbox, type LightboxSlide } from '@/components/inspection/PhotoLightbox';
import { compressImage } from '@/lib/imageCompressor';
import type { AIDefectResult } from '@/hooks/useAIDefectAnalysis';
import { useAIDefectAnalysis } from '@/hooks/useAIDefectAnalysis';
import {
  deleteDamagePhoto,
  loadDamagePhotosForItem,
  persistDamagePhotoBlob,
  type DamagePhotoWithUrl,
} from '@/lib/inspection/dexieDamagePhotos';

export type DamagePhotoCaptureProps = {
  /** Checklist item group id (e.g. SECTION_ITEMS id) */
  itemKey: string;
  sectionId: string;
  inspectionOrderId: string;
  /** Legacy: Dexie `items` PK when that pipeline exists */
  itemId?: number;
  maxPhotos?: number;
  onAnalyzed?: (result: AIDefectResult) => void;
  note: string;
  severity: string;
  onNoteChange: (note: string) => void;
  onSeverityChange: (severity: string) => void;
};

function confidenceColor(c: number): string {
  if (c >= 0.8) return '#1A7A4A';
  if (c >= 0.6) return '#D35400';
  return '#6B7280';
}

function AIAnalyzingCard({ step }: { step: number }) {
  const rows = [
    { label: '[Detecting components...]', i: 0 },
    { label: '[Classifying defects...]', i: 1 },
    { label: '[Estimating severity...]', i: 2 },
  ];
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
      <p className="text-xs font-semibold text-[#1F2937]">🤖 Carschek AI is analysing this photo…</p>
      <div className="mt-3 space-y-2">
        {rows.map(r => (
          <div key={r.i} className="flex items-center justify-between gap-2 text-[10px] text-[#6B7280]">
            <span className={step >= r.i ? 'font-medium text-[#1F2937]' : ''}>{r.label}</span>
            <span className="font-mono">
              {step > r.i ? '████████' : step === r.i ? '████░░░░' : '░░░░░░░░'} step {r.i + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DamagePhotoCapture({
  itemKey,
  sectionId,
  inspectionOrderId,
  itemId: _itemId,
  maxPhotos = 5,
  onAnalyzed,
  note,
  severity,
  onNoteChange,
  onSeverityChange,
}: DamagePhotoCaptureProps) {
  const [photos, setPhotos] = useState<DamagePhotoWithUrl[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [aiStep, setAiStep] = useState(0);
  const [captureMode, setCaptureMode] = useState<'camera' | 'device'>('camera');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const revokeRef = React.useRef<(() => void) | null>(null);

  const ai = useAIDefectAnalysis();

  const reload = useCallback(() => {
    revokeRef.current?.();
    void loadDamagePhotosForItem(inspectionOrderId, sectionId, itemKey).then(({ photos: list, revoke }) => {
      revokeRef.current = revoke;
      setPhotos(list);
    });
  }, [inspectionOrderId, sectionId, itemKey]);

  useEffect(() => {
    reload();
    return () => {
      revokeRef.current?.();
      revokeRef.current = null;
    };
  }, [reload]);

  useEffect(() => {
    if (!ai.isAnalyzing) {
      setAiStep(0);
      return;
    }
    setAiStep(0);
    const t1 = window.setTimeout(() => setAiStep(1), 500);
    const t2 = window.setTimeout(() => setAiStep(2), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [ai.isAnalyzing]);

  const slides: LightboxSlide[] = useMemo(
    () => photos.map(p => ({ id: String(p.id), label: 'Damage photo', url: p.url })),
    [photos]
  );

  const applyAI = useCallback(
    (mode: 'accept' | 'edit' | 'ignore') => {
      const r = ai.result;
      if (mode === 'ignore' || !r) {
        ai.clearResult();
        return;
      }
      const sev = r.suggestedSeverity;
      onSeverityChange(sev);
      if (mode === 'accept') {
        onNoteChange(r.description);
      } else {
        onNoteChange(r.description);
      }
      onAnalyzed?.(r);
      ai.clearResult();
      toast.success('AI suggestion applied — review and adjust if needed');
    },
    [ai, onAnalyzed, onNoteChange, onSeverityChange]
  );

  const removePhoto = (id: number) => {
    if (!confirm('Remove this damage photo?')) return;
    void deleteDamagePhoto(id).then(() => {
      reload();
      toast.message('Photo removed');
    });
  };

  const handleAddPhoto = () => {
    if (captureMode === 'camera') {
      setCameraOpen(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      // Gallery photos can be 5–12MB; compress like the camera path before Dexie
      const { blob: compressed, sizeKb } = await compressImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.85 });
      const buf = await compressed.arrayBuffer();
      await persistDamagePhotoBlob(inspectionOrderId, sectionId, itemKey, buf, {
        mimeType: compressed.type || 'image/jpeg',
        sizeKb,
      });
      reload();
      toast.success('Damage photo saved');
      // Run AI on device-picked photo
      const blob = compressed;
      void ai.analyzePhoto(blob).then(result => {
        if (result) onAnalyzed?.(result);
      });
    } catch {
      toast.error('Failed to save photo');
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Capture mode toggle */}
      <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
        <div className="flex items-center gap-1.5">
          {captureMode === 'camera' ? (
            <Camera size={13} className="text-[#ff5722]" />
          ) : (
            <FolderOpen size={13} className="text-[#ff5722]" />
          )}
          <span className="text-[11px] font-semibold text-[#374151]">
            {captureMode === 'camera' ? 'Live Camera' : 'From Device'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCaptureMode(m => (m === 'camera' ? 'device' : 'camera'))}
          className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1 text-[10px] font-bold text-[#374151] transition hover:bg-[#F4F6F8]"
        >
          {captureMode === 'camera' ? <><FolderOpen size={10} /> Gallery</> : <><Camera size={10} /> Camera</>}
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-[#6B7280]">
          DAMAGE PHOTOS ({photos.length}/{maxPhotos})
        </p>
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={handleAddPhoto}
            className="inline-flex items-center gap-1 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#374151]"
          >
            {captureMode === 'camera' ? <Camera size={14} /> : <FolderOpen size={14} />}
            {captureMode === 'camera' ? 'Add Photo' : 'Choose Photo'}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {photos.map(p => (
          <div key={p.id} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#F4F6F8]">
            <button
              type="button"
              onClick={() => {
                const i = photos.findIndex(x => x.id === p.id);
                setLightboxIdx(Math.max(0, i));
                setLightboxOpen(true);
              }}
              className="block h-full w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="h-full w-full object-cover" />
            </button>
            <button
              type="button"
              onClick={() => removePhoto(p.id)}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C0392B] text-[10px] font-bold text-white shadow"
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        ))}
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={handleAddPhoto}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-[#D1D5DB] bg-white text-[#9CA3AF]"
          >
            +
          </button>
        )}
      </div>

      {ai.isAnalyzing && <AIAnalyzingCard step={aiStep} />}

      {ai.error && !ai.isAnalyzing && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-900">{ai.error}</p>
      )}

      {ai.result && !ai.isAnalyzing && (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
          <p className="text-xs font-bold text-[#1F2937]">🤖 Carschek AI — Analysis Complete</p>
          <p className="mt-2 text-sm font-semibold text-[#374151]">&quot;{ai.result.defect}&quot;</p>
          <div className="mt-2">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[10px] text-[#6B7280]">Confidence:</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F4F6F8]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.round(ai.result.confidence * 100)}%`,
                    backgroundColor: confidenceColor(ai.result.confidence),
                  }}
                />
              </div>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: confidenceColor(ai.result.confidence) }}>
                {Math.round(ai.result.confidence * 100)}%
              </span>
            </div>
            {ai.result.confidence < 0.6 && (
              <p className="text-[10px] text-[#6B7280]">Low confidence — verify manually</p>
            )}
          </div>
          <p className="mt-2 text-[10px] text-[#6B7280]">
            Suggested severity:{' '}
            <span className="font-bold text-[#C0392B]">{ai.result.suggestedSeverity}</span>
          </p>
          <p className="mt-2 text-xs italic leading-relaxed text-[#6B7280]">&quot;{ai.result.description}&quot;</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyAI('accept')}
              className="rounded-lg bg-[#1A7A4A] px-3 py-1.5 text-[10px] font-bold text-white"
            >
              ✓ Accept &amp; Apply
            </button>
            <button
              type="button"
              onClick={() => applyAI('edit')}
              className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-[10px] font-bold text-[#374151]"
            >
              ✏ Edit
            </button>
            <button
              type="button"
              onClick={() => applyAI('ignore')}
              className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-[10px] font-bold text-[#6B7280]"
            >
              Ignore
            </button>
          </div>
        </div>
      )}

      <CameraCaptureModal
        open={cameraOpen}
        title="Damage Photo"
        subtitle="Capture clear photo of the damage"
        showAiBadge
        allowCameraFlip
        showGuideOverlay={false}
        compressOptions={{ maxWidth: 1600, maxHeight: 1600, quality: 0.85 }}
        onClose={() => setCameraOpen(false)}
        onCapture={async blob => {
          await persistDamagePhotoBlob(inspectionOrderId, sectionId, itemKey, await blob.arrayBuffer(), {
            mimeType: blob.type || 'image/jpeg',
            sizeKb: Math.round(blob.size / 1024),
          });
          reload();
          toast.success('Damage photo saved');
          void ai.analyzePhoto(blob).then(result => {
            if (result) onAnalyzed?.(result);
          });
        }}
      />

      <PhotoLightbox
        open={lightboxOpen}
        slides={slides}
        initialIndex={lightboxIdx}
        variant="light"
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
