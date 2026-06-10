'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Camera, Check, ChevronLeft, Eye, FolderOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CameraCaptureModal } from '@/components/inspection/CameraCaptureModal';
import { PhotoLightbox, type LightboxSlide } from '@/components/inspection/PhotoLightbox';
import { loadDexieVehiclePhotoObjectUrls, persistVehiclePhotoBlob } from '@/lib/inspection/dexieVehiclePhotos';
import { compressImage } from '@/lib/imageCompressor';
import {
  REQUIRED_VEHICLE_PHOTOS,
  VEHICLE_PHOTO_GRID_ORDER,
  VEHICLE_PHOTO_SLOTS,
  vehiclePhotoCardTitle,
  type VehicleAngleId,
} from '@/lib/inspection/vehiclePhotoAngles';
import { useVehiclePhotoStore } from '@/stores/vehiclePhotoStore';

export type VehiclePhotosProgress = {
  captured: number;
  total: number;
  requiredCaptured: number;
  requiredTotal: number;
};

export type VehiclePhotosProps = {
  inspectionId: string;
  layout?: 'compact' | 'full';
  presentation?: 'embedded' | 'page';
  backHref?: string;
  onProgress?: (p: VehiclePhotosProgress) => void;
};

export function VehiclePhotos({
  inspectionId,
  layout = 'full',
  presentation = 'embedded',
  backHref,
  onProgress,
}: VehiclePhotosProps) {
  const setPhotoGlobal = useVehiclePhotoStore(s => s.setPhoto);
  const [urls, setUrls] = useState<Partial<Record<VehicleAngleId, string>>>({});
  const [loadingAngle, setLoadingAngle] = useState<VehicleAngleId | null>(null);
  const [highlight, setHighlight] = useState<VehicleAngleId | null>(null);
  const [cameraAngle, setCameraAngle] = useState<VehicleAngleId | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [captureMode, setCaptureMode] = useState<'camera' | 'device'>('camera');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingDeviceAngle, setPendingDeviceAngle] = useState<VehicleAngleId | null>(null);
  const revokeRef = useRef<(() => void) | null>(null);

  const reloadDexie = useCallback(() => {
    revokeRef.current?.();
    void loadDexieVehiclePhotoObjectUrls(inspectionId).then(({ map, revoke }) => {
      revokeRef.current = revoke;
      const store = useVehiclePhotoStore.getState().urlsByOrder[inspectionId] ?? {};
      setUrls({ ...map, ...store });
    });
  }, [inspectionId]);

  useEffect(() => {
    reloadDexie();
    return () => {
      revokeRef.current?.();
      revokeRef.current = null;
    };
  }, [reloadDexie]);

  const labelOf = (id: VehicleAngleId) => vehiclePhotoCardTitle(id);

  const capturedCount = useMemo(() => VEHICLE_PHOTO_SLOTS.filter(s => urls[s.id]).length, [urls]);
  const requiredCaptured = useMemo(
    () => VEHICLE_PHOTO_SLOTS.filter(s => s.required && urls[s.id]).length,
    [urls]
  );
  const canProceed = requiredCaptured >= REQUIRED_VEHICLE_PHOTOS;

  useEffect(() => {
    onProgress?.({
      captured: capturedCount,
      total: VEHICLE_PHOTO_SLOTS.length,
      requiredCaptured,
      requiredTotal: REQUIRED_VEHICLE_PHOTOS,
    });
  }, [capturedCount, requiredCaptured, onProgress]);

  const gridSequence = useMemo(() => {
    const set = new Set<VehicleAngleId>(VEHICLE_PHOTO_GRID_ORDER);
    const extra = VEHICLE_PHOTO_SLOTS.map(s => s.id).filter(id => !set.has(id));
    return [...VEHICLE_PHOTO_GRID_ORDER, ...extra];
  }, []);

  const nextEmpty = useCallback(
    (after?: VehicleAngleId) => {
      const flat = gridSequence;
      const start = after ? Math.max(0, flat.indexOf(after) + 1) : 0;
      for (let i = start; i < flat.length + start; i++) {
        const id = flat[i % flat.length]!;
        if (!urls[id]) return id;
      }
      return null;
    },
    [gridSequence, urls]
  );

  const applyBlob = async (angle: VehicleAngleId, blob: Blob) => {
    const buf = await blob.arrayBuffer();
    await persistVehiclePhotoBlob(inspectionId, angle, buf, {
      mimeType: blob.type || 'image/jpeg',
      sizeKb: Math.round(blob.size / 1024),
    });
    const url = URL.createObjectURL(blob);
    setUrls(prev => ({ ...prev, [angle]: url }));
    setPhotoGlobal(inspectionId, angle, url);
    toast.success(`${labelOf(angle)} saved`);
    const n = nextEmpty(angle);
    if (n) {
      window.setTimeout(() => setHighlight(n), 500);
      window.setTimeout(() => setHighlight(null), 2000);
    }
  };

  const handleCaptureClick = (angle: VehicleAngleId) => {
    if (captureMode === 'camera') {
      setLoadingAngle(angle);
      setCameraAngle(angle);
    } else {
      setPendingDeviceAngle(angle);
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingDeviceAngle) return;
    e.target.value = '';
    try {
      setLoadingAngle(pendingDeviceAngle);
      // Gallery photos can be 5–12MB; compress like the camera path before Dexie
      const { blob } = await compressImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.85 });
      await applyBlob(pendingDeviceAngle, blob);
    } finally {
      setLoadingAngle(null);
      setPendingDeviceAngle(null);
    }
  };

  const slotIndex = useCallback((id: VehicleAngleId) => gridSequence.indexOf(id) + 1, [gridSequence]);

  const lightboxSlides: LightboxSlide[] = useMemo(
    () =>
      VEHICLE_PHOTO_SLOTS.filter(s => urls[s.id]).map(s => ({
        id: s.id,
        label: vehiclePhotoCardTitle(s.id),
        url: urls[s.id]!,
      })),
    [urls]
  );

  const pageChrome = presentation === 'page';
  const remaining = 11 - capturedCount;

  // Build rows of 3 for the 11-slot grid (3+3+3+2 → last row padded to 3)
  const gridRows: VehicleAngleId[][] = useMemo(() => {
    const rows: VehicleAngleId[][] = [];
    for (let i = 0; i < gridSequence.length; i += 3) {
      rows.push(gridSequence.slice(i, i + 3));
    }
    return rows;
  }, [gridSequence]);

  const renderSlot = (angle: VehicleAngleId) => {
    const src = urls[angle];
    const isLoad = loadingAngle === angle;
    const isHi = highlight === angle;
    const idx = slotIndex(angle);

    if (!src) {
      return (
        <div
          key={angle}
          className={`flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm ${
            isHi ? 'ring-2 ring-[#ff8a65] ring-offset-2' : ''
          }`}
        >
          <div className="relative aspect-[4/3] bg-[#F4F6F8]">
            <span className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#ff5722] text-[10px] font-bold text-white shadow">
              {idx}
            </span>
            <button
              type="button"
              onClick={() => handleCaptureClick(angle)}
              className="flex h-full w-full flex-col items-center justify-center px-2 text-center"
            >
              {isLoad ? (
                <Loader2 className="animate-spin text-[#6B7280]" size={22} />
              ) : captureMode === 'camera' ? (
                <Camera className="text-[#9CA3AF]" size={22} />
              ) : (
                <FolderOpen className="text-[#9CA3AF]" size={22} />
              )}
              <span className="mt-1 text-[10px] font-medium text-[#6B7280]">
                {captureMode === 'camera' ? 'Tap to capture' : 'Choose file'}
              </span>
            </button>
          </div>
          <div className="border-t border-[#F4F6F8] px-2 py-2">
            <p className="text-center text-[10px] font-bold text-[#1F2937] leading-tight">{labelOf(angle)}</p>
            <button
              type="button"
              onClick={() => handleCaptureClick(angle)}
              className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-xl bg-[#ff5722] py-2 text-[10px] font-bold text-white"
            >
              {captureMode === 'camera' ? <Camera size={11} /> : <FolderOpen size={11} />}
              {captureMode === 'camera' ? 'Capture' : 'Choose'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={angle}
        className={`flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm ${
          isHi ? 'ring-2 ring-[#ff8a65] ring-offset-2' : ''
        }`}
      >
        <div className="relative aspect-[4/3] bg-[#F4F6F8]">
          <span className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#ff5722] text-[10px] font-bold text-white shadow">
            {idx}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={labelOf(angle)} className="h-full w-full object-cover" />
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
            <Check size={12} strokeWidth={3} />
          </span>
        </div>
        <div className="border-t border-[#F4F6F8] px-2 py-2">
          <p className="text-center text-[10px] font-bold text-[#1F2937] leading-tight">{labelOf(angle)}</p>
          <button
            type="button"
            onClick={() => handleCaptureClick(angle)}
            className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] py-1.5 text-[10px] font-semibold text-[#374151]"
          >
            Retake
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={pageChrome ? 'pb-28' : 'space-y-4'}>
      {/* Hidden file input for device picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {pageChrome && backHref ? (
        <div className="mb-4 flex items-center gap-3">
          <Link
            href={backHref}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white shadow-sm"
            aria-label="Back"
          >
            <ChevronLeft size={20} className="text-[#6B7280]" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="font-heading text-lg font-bold text-[#1F2937]">Vehicle Photos</h1>
                <p className="text-xs text-[#6B7280]">
                  {capturedCount}/11 photos captured
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-[#EEF4FB] px-2 py-1 text-[11px] font-semibold text-[#ff5722]">
                <Eye size={12} aria-hidden />
                {capturedCount}/11
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
              <div
                className="h-full rounded-full bg-[#ff8a65] transition-all"
                style={{ width: `${(capturedCount / 11) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {pageChrome ? (
        <div className="mb-4 flex gap-2 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2.5 text-xs leading-snug text-[#ff5722]">
          <Eye size={14} className="mt-0.5 shrink-0 text-[#ff8a65]" aria-hidden />
          <p>Capture all 11 standard vehicle photos for the inspection report.</p>
        </div>
      ) : null}

      {/* Capture Mode Toggle */}
      <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          {captureMode === 'camera' ? (
            <Camera size={15} className="text-[#ff5722]" />
          ) : (
            <FolderOpen size={15} className="text-[#ff5722]" />
          )}
          <span className="text-xs font-semibold text-[#374151]">
            {captureMode === 'camera' ? 'Live Camera Snap' : 'Choose from Device'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCaptureMode(m => (m === 'camera' ? 'device' : 'camera'))}
          className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1.5 text-[11px] font-bold text-[#374151] transition hover:bg-[#F4F6F8]"
          aria-label="Switch capture mode"
        >
          {captureMode === 'camera' ? (
            <><FolderOpen size={12} /> Switch to Gallery</>
          ) : (
            <><Camera size={12} /> Switch to Camera</>
          )}
        </button>
      </div>

      {/* 11-slot grid: 3 columns, 4 rows (3+3+3+2) */}
      <div className="space-y-3">
        {gridRows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-3 gap-2">
            {row.map(angle => renderSlot(angle))}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          disabled={capturedCount === 0}
          className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#374151] disabled:opacity-40"
        >
          View All Photos
        </button>
      </div>

      {!pageChrome ? (
        <div className="relative">
          <p className="text-center text-xs text-[#6B7280]">
            {canProceed
              ? 'Minimum required vehicle photos captured.'
              : `Need ${REQUIRED_VEHICLE_PHOTOS - requiredCaptured} more required photo(s).`}
          </p>
        </div>
      ) : null}

      {pageChrome && backHref ? (
        <div className="fixed inset-x-0 bottom-0 z-[200] border-t border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur-md">
          <p className="mb-2 text-center text-xs text-[#6B7280]">{capturedCount} of 11 photos captured</p>
          {remaining > 0 ? (
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-2xl bg-[#D1D5DB] py-3.5 text-sm font-bold text-[#6B7280]"
            >
              {`Capture ${remaining} more photo${remaining === 1 ? '' : 's'}`}
            </button>
          ) : (
            <Link
              href={backHref}
              className="flex w-full items-center justify-center rounded-2xl bg-[#ff5722] py-3.5 text-sm font-bold text-white shadow transition hover:bg-[#152d4a]"
            >
              All photos captured — continue
            </Link>
          )}
          <Link href={backHref} className="mt-2 block text-center text-xs font-semibold text-[#ff8a65]">
            ← Back to Sections
          </Link>
        </div>
      ) : null}

      <CameraCaptureModal
        open={cameraAngle != null}
        title={cameraAngle ? labelOf(cameraAngle) : ''}
        showGuideOverlay
        compressOptions={{ maxWidth: 1600, maxHeight: 1600, quality: 0.85 }}
        onClose={() => {
          setCameraAngle(null);
          setLoadingAngle(null);
        }}
        onCapture={async blob => {
          if (!cameraAngle) return;
          try {
            await applyBlob(cameraAngle, blob);
          } finally {
            setLoadingAngle(null);
          }
        }}
      />

      <PhotoLightbox
        open={lightboxOpen}
        slides={lightboxSlides}
        variant="light"
        onClose={() => setLightboxOpen(false)}
        onRetake={id => {
          setLightboxOpen(false);
          if (captureMode === 'camera') {
            setCameraAngle(id as VehicleAngleId);
          } else {
            setPendingDeviceAngle(id as VehicleAngleId);
            fileInputRef.current?.click();
          }
        }}
      />
    </div>
  );
}
