'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import SignatureCanvas from 'react-signature-canvas';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Camera, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { useInspectorHref } from '@/contexts/InspectorRouteContext';
import { getScoreLabel } from '@/lib/mockData';
import { persistSignatureBase64, loadSignatureBase64 } from '@/lib/inspection/sessionDexie';
import { loadDamagePhotosForOrder } from '@/lib/inspection/dexieDamagePhotos';
import { loadDexieVehiclePhotoObjectUrls } from '@/lib/inspection/dexieVehiclePhotos';
import { useInspectionSignOffStore } from '@/stores/inspectionSignOffStore';
import { EMPTY_VEHICLE_PHOTO_MAP, useVehiclePhotoStore } from '@/stores/vehiclePhotoStore';
import { VEHICLE_PHOTO_SLOTS } from '@/lib/inspection/vehiclePhotoAngles';
import type { InspectionLayoutMode } from '@/components/inspection/InspectionSession';
import { db } from '@/lib/db/schema';

type Props = {
  layout: InspectionLayoutMode;
  jobId: string;
};

const MOCK_DEFECTS: {
  sectionId: string;
  section: string;
  item: string;
  severity: 'Minor' | 'Major' | 'Critical';
  note: string;
}[] = [
  {
    sectionId: 'S02',
    section: 'Body Frame',
    item: 'Front Rail (Right)',
    severity: 'Major',
    note: 'Visible dent on right front rail, approximately 15cm.',
  },
  {
    sectionId: 'S02',
    section: 'Body Frame',
    item: 'Door Sill (Left)',
    severity: 'Minor',
    note: 'Surface rust on left door sill.',
  },
  {
    sectionId: 'S01',
    section: 'Engine Bay',
    item: 'Valve Cover Seal',
    severity: 'Critical',
    note: 'Oil leak from valve cover gasket — requires immediate attention.',
  },
  {
    sectionId: 'S04',
    section: 'Transmission',
    item: 'Fluid Level',
    severity: 'Major',
    note: 'Transmission fluid below minimum level.',
  },
];

export function ReviewScreen({ layout, jobId }: Props) {
  const href = useInspectorHref();
  const router = useRouter();
  const sigRef = useRef<SignatureCanvas>(null);
  const [sigMounted, setSigMounted] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const targetScore = 73;
  const photoUrls = useVehiclePhotoStore(s => s.urlsByOrder[jobId] ?? EMPTY_VEHICLE_PHOTO_MAP);
  const signature = useInspectionSignOffStore(s => s.signatureByOrder[jobId]);
  const setSignature = useInspectionSignOffStore(s => s.setSignature);
  const [vehicleCaptured, setVehicleCaptured] = useState(0);
  const [damageCount, setDamageCount] = useState(0);

  const refreshPhotoCounts = useCallback(() => {
    void loadDexieVehiclePhotoObjectUrls(jobId).then(({ map, revoke }) => {
      const store = useVehiclePhotoStore.getState().urlsByOrder[jobId] ?? {};
      const merged: Record<string, string | undefined> = { ...map, ...store };
      setVehicleCaptured(VEHICLE_PHOTO_SLOTS.filter(s => Boolean(merged[s.id])).length);
      revoke();
    });
    void loadDamagePhotosForOrder(jobId).then(({ photos, revoke }) => {
      setDamageCount(photos.length);
      revoke();
    });
  }, [jobId]);

  useEffect(() => {
    setSigMounted(true);
    void loadSignatureBase64(jobId).then(url => {
      if (url) setSignature(jobId, url);
    });
  }, [jobId, setSignature]);

  useEffect(() => {
    refreshPhotoCounts();
  }, [refreshPhotoCounts]);

  useEffect(() => {
    const start = performance.now();
    const dur = 800;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - t) ** 2;
      setDisplayScore(Math.round(targetScore * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetScore]);

  const clearSig = () => {
    sigRef.current?.clear();
    setSignature(jobId, null);
  };

  const saveSig = async () => {
    const dataUrl = sigRef.current?.toDataURL('image/png');
    if (!dataUrl || sigRef.current?.isEmpty()) {
      toast.error('Please sign in the box');
      return;
    }
    setSignature(jobId, dataUrl);
    await persistSignatureBase64(jobId, dataUrl);
    toast.success('Signature saved locally');
  };

  const submitQa = async () => {
    let sig = signature;
    if (!sig && sigRef.current && !sigRef.current.isEmpty()) {
      sig = sigRef.current.toDataURL('image/png');
      setSignature(jobId, sig);
    }
    if (!sig) {
      toast.error('Please add your signature');
      return;
    }
    if (!navigator.onLine) {
      if (db) {
        await db.syncQueue.add({
          type: 'inspection-submit-qa',
          entityType: 'inspectionSubmit',
          entityId: jobId,
          payload: JSON.stringify({ jobId, inspectionId: jobId, at: Date.now() }),
          attempts: 0,
          createdAt: Date.now(),
        });
      }
      toast.message('Queued for QA when online', { description: 'Saved locally in Dexie sync queue' });
      return;
    }
    await new Promise(r => setTimeout(r, 900));
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.65 } });
    toast.success('Submitted to QA');
    window.setTimeout(() => router.push(href(`inspect/${jobId}/report`)), 1200);
  };

  const healthLabel = getScoreLabel(displayScore);
  const ringR = 40;
  const ringC = 2 * Math.PI * ringR;
  const strokePct = displayScore;

  return (
    <div
      data-inspection-layout={layout}
      className={`space-y-5 ${layout === 'mobile-app' ? 'mx-auto max-w-lg' : ''}`}
    >
      <div className="flex items-center gap-3 px-1">
        <Link href={href(`inspect/${jobId}/overview`)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
          <ArrowLeft size={18} className="text-[#6B7280]" />
        </Link>
        <span className="sr-only">Back to overview</span>
      </div>

      <div className="overflow-hidden rounded-b-3xl bg-[#1E3A5F] px-5 pb-6 pt-2 text-white shadow-lg">
        <h1 className="mb-4 font-heading text-lg font-bold">Review &amp; Submit</h1>
        <div className="flex flex-col items-center">
          <div className="relative h-36 w-36">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
              <circle cx="50" cy="50" r={ringR} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r={ringR}
                fill="none"
                stroke="#4ADE80"
                strokeWidth="8"
                strokeDasharray={`${ringC}`}
                strokeDashoffset={`${ringC * (1 - strokePct / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tabular-nums">{displayScore}</span>
              <span className="text-sm text-white/75">/100</span>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold text-emerald-300">Vehicle Health: {healthLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { k: 'Total', v: 210, c: '#1F2937' },
          { k: 'Pass', v: 198, c: '#1A7A4A' },
          { k: 'Fail', v: 8, c: '#C0392B' },
          { k: 'N/A', v: 4, c: '#6B7280' },
        ].map(row => (
          <div key={row.k} className="rounded-xl border border-[#E5E7EB] bg-white p-3 text-center shadow-sm">
            <p className="text-lg font-bold tabular-nums" style={{ color: row.c }}>
              {row.v}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">{row.k}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#E8EDF3] bg-[#EEF4FB] px-4 py-3">
          <Camera className="text-[#2E75B6]" size={18} aria-hidden />
          <h2 className="text-sm font-semibold text-[#1E3A5F]">Photo Documentation</h2>
        </div>
        <div className="divide-y divide-[#F4F6F8]">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-2 text-sm text-[#374151]">
              <Camera size={16} className="text-[#6B7280]" aria-hidden /> Vehicle Photos
            </span>
            <span className="text-sm font-semibold text-[#1A7A4A]">
              {vehicleCaptured}/11 captured
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-2 text-sm text-[#374151]">
              <AlertTriangle className="text-[#D35400]" size={16} aria-hidden /> Damage Photos
            </span>
            <span className="text-sm font-semibold text-[#C0392B]">
              {damageCount} defect{damageCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-2 px-1 text-sm font-semibold text-[#1F2937]">Vehicle photos</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {VEHICLE_PHOTO_SLOTS.map(slot => {
            const src = photoUrls[slot.id];
            return (
              <div key={slot.id} className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F4F6F8]">
                {src ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={src} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center px-1 text-center text-[9px] text-[#9CA3AF]">Not captured</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#1F2937]">Defects Found ({MOCK_DEFECTS.length})</h2>
        <div className="space-y-3">
          {MOCK_DEFECTS.map(d => (
            <div key={d.item} className="rounded-xl border border-[#F4F6F8] bg-[#F9FAFB] p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-[#1F2937]">
                    {d.section} → {d.item}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      d.severity === 'Critical'
                        ? 'bg-red-100 text-red-700'
                        : d.severity === 'Major'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {d.severity}
                  </span>
                  <p className="mt-1 text-xs text-[#6B7280]">{d.note}</p>
                </div>
                <Link href={href(`inspect/${jobId}/section/${d.sectionId}`)} className="shrink-0 text-xs font-semibold text-[#2E75B6] hover:underline">
                  ✏ Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-[#1F2937]">Inspector Sign-Off</h2>
        <p className="mb-3 text-xs text-[#6B7280]">Tap to sign</p>
        <div className="mx-auto max-w-[520px] overflow-hidden rounded-xl border-2 border-dashed border-[#E5E7EB] bg-[#FAFAFA]">
          {sigMounted && (
            <SignatureCanvas
              ref={sigRef}
              canvasProps={{ className: 'w-full h-[120px] touch-none', width: 280, height: 120 }}
              backgroundColor="rgba(0,0,0,0)"
            />
          )}
        </div>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={clearSig} className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-[#6B7280]">
            Clear
          </button>
          <button type="button" onClick={() => void saveSig()} className="rounded-xl bg-[#1E3A5F] px-4 py-2 text-xs font-bold text-white">
            Save signature
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-6">
        <button
          type="button"
          onClick={() => void submitQa()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1B7143] py-4 text-sm font-bold text-white shadow-lg shadow-green-900/15"
        >
          <Send size={18} aria-hidden />
          Submit Report
        </button>
        <Link
          href={href(`inspect/${jobId}/report`)}
          className="block text-center text-sm font-semibold text-[#2E75B6] hover:underline"
        >
          Preview report &amp; PDF
        </Link>
      </div>
    </div>
  );
}
