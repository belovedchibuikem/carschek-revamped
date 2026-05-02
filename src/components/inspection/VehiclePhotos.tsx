'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Camera, Check, ChevronLeft, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CameraCaptureModal } from '@/components/inspection/CameraCaptureModal';
import { PhotoLightbox, type LightboxSlide } from '@/components/inspection/PhotoLightbox';
import { loadDexieVehiclePhotoObjectUrls, persistVehiclePhotoBlob } from '@/lib/inspection/dexieVehiclePhotos';
import {
  REQUIRED_VEHICLE_PHOTOS,
  VEHICLE_PHOTO_GRID_ORDER,
  VEHICLE_PHOTO_SLOTS,
  vehiclePhotoCardTitle,
  type VehicleAngleId,
} from '@/lib/inspection/vehiclePhotoAngles';
import { useVehiclePhotoStore } from '@/stores/vehiclePhotoStore';

const COMPACT_ROWS: VehicleAngleId[][] = [
  ['front', 'rear', 'left_side'],
  ['right_side', 'front_left_45', 'front_right_45'],
  ['rear_left_45', 'rear-right_45', 'interior'],
  ['odometer', 'engine_bay'],
];

export type VehiclePhotosProgress = {
  captured: number;
  total: number;
  requiredCaptured: number;
  requiredTotal: number;
};

export type VehiclePhotosProps = {
  inspectionId: string;
  layout?: 'compact' | 'full';
  /** `page` = full-screen style header, banner, sticky footer (reference UI). */
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
      const flat = layout === 'full' ? gridSequence : COMPACT_ROWS.flat();
      const start = after ? Math.max(0, flat.indexOf(after) + 1) : 0;
      for (let i = start; i < flat.length + start; i++) {
        const id = flat[i % flat.length]!;
        if (!urls[id]) return id;
      }
      return null;
    },
    [layout, gridSequence, urls]
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

  const rows = useMemo(() => {
    if (layout !== 'full') return COMPACT_ROWS;
    const pairs: VehicleAngleId[][] = [];
    for (let i = 0; i < gridSequence.length; i += 2) {
      pairs.push(gridSequence.slice(i, i + 2));
    }
    return pairs;
  }, [layout, gridSequence]);

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

  const grid = (
    <div className="space-y-3">
      {rows.map((row, ri) => (
        <div key={ri} className={`grid gap-3 ${layout === 'full' ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {row.map(angle => {
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
                    <span className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff5722] text-xs font-bold text-white shadow">
                      {idx}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setLoadingAngle(angle);
                        setCameraAngle(angle);
                      }}
                      className="flex h-full w-full flex-col items-center justify-center px-2 text-center"
                    >
                      {isLoad ? (
                        <Loader2 className="animate-spin text-[#6B7280]" size={28} />
                      ) : (
                        <Camera className="text-[#9CA3AF]" size={28} />
                      )}
                      <span className="mt-2 text-[11px] font-medium text-[#6B7280]">Tap to capture</span>
                    </button>
                  </div>
                  <div className="border-t border-[#F4F6F8] px-3 py-2">
                    <p className="text-center text-xs font-bold text-[#1F2937]">{labelOf(angle)}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setLoadingAngle(angle);
                        setCameraAngle(angle);
                      }}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff5722] py-2.5 text-xs font-bold text-white"
                    >
                      <Camera size={14} /> Capture
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
                  <span className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff5722] text-xs font-bold text-white shadow">
                    {idx}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
                    <Check size={14} strokeWidth={3} />
                  </span>
                </div>
                <div className="border-t border-[#F4F6F8] px-3 py-2">
                  <p className="text-center text-xs font-bold text-[#1F2937]">{labelOf(angle)}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setLoadingAngle(angle);
                      setCameraAngle(angle);
                    }}
                    className="mt-2 w-full rounded-xl border border-[#E5E7EB] py-2 text-xs font-semibold text-[#374151]"
                  >
                    Retake
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  const embeddedGrid = (
    <div className="space-y-3">
      {rows.map((row, ri) => (
        <div
          key={ri}
          className={`grid gap-3 ${
            layout === 'full' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'
          } ${row.length < (layout === 'full' ? 4 : 3) && ri === rows.length - 1 ? 'justify-items-center' : ''}`}
          style={
            row.length < (layout === 'full' ? 4 : 3) && ri === rows.length - 1
              ? {
                  gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
                  maxWidth: layout === 'full' ? '75%' : '66%',
                  margin: '0 auto',
                }
              : undefined
          }
        >
          {row.map(angle => {
            const src = urls[angle];
            const isLoad = loadingAngle === angle;
            const isHi = highlight === angle;
            if (!src) {
              return (
                <button
                  key={angle}
                  type="button"
                  onClick={() => {
                    setLoadingAngle(angle);
                    setCameraAngle(angle);
                  }}
                  className={`relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-[#F4F6F8] text-center transition hover:border-[#ff8a65]/50 ${
                    isHi ? 'ring-2 ring-[#ff8a65] ring-offset-2' : ''
                  }`}
                >
                  {isLoad ? (
                    <>
                      <Loader2 className="animate-spin text-[#6B7280]" size={24} />
                      <span className="mt-2 px-2 text-[10px] font-medium text-[#6B7280]">Capturing…</span>
                    </>
                  ) : (
                    <>
                      <Camera className="text-[#9CA3AF]" size={24} />
                      <span className="mt-2 px-2 text-[11px] font-semibold text-[#6B7280]">{labelOf(angle)}</span>
                    </>
                  )}
                </button>
              );
            }

            return (
              <div
                key={angle}
                className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F4F6F8] ${
                  isHi ? 'ring-2 ring-[#ff8a65] ring-offset-2' : ''
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
                  <Check size={14} strokeWidth={3} />
                </span>
                <div className="absolute inset-0 flex flex-col justify-end bg-black/0 transition group-hover:bg-black/40">
                  <button
                    type="button"
                    onClick={() => {
                      setLoadingAngle(angle);
                      setCameraAngle(angle);
                    }}
                    className="w-full py-2 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100"
                  >
                    Retake
                  </button>
                </div>
                <span className="pointer-events-none absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-[10px] font-medium text-white">
                  {labelOf(angle)}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className={pageChrome ? 'pb-28' : 'space-y-4'}>
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

      {!pageChrome ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-[#374151]">
            Vehicle Photos — {requiredCaptured}/{REQUIRED_VEHICLE_PHOTOS} required · {capturedCount}/11 total
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F4F6F8]">
            <div
              className="h-full rounded-full bg-[#ff8a65] transition-all"
              style={{ width: `${(capturedCount / 11) * 100}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-[#9CA3AF]">Minimum {REQUIRED_VEHICLE_PHOTOS} required angles to proceed</p>
        </div>
      ) : (
        <div className="mb-4 flex gap-2 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2.5 text-xs leading-snug text-[#ff5722]">
          <Eye size={14} className="mt-0.5 shrink-0 text-[#ff8a65]" aria-hidden />
          <p>Capture all 11 standard vehicle photos for the inspection report.</p>
        </div>
      )}

      {pageChrome ? grid : embeddedGrid}

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
          setCameraAngle(id as VehicleAngleId);
        }}
      />
    </div>
  );
}
