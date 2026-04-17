'use client';

import React from 'react';
import { Camera } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { CarschekScore } from '@/components/shared/CarschekScore';
import { formatNaira } from '@/lib/mockData';
import type {
  DefectSummary,
  InspectionReportData,
  ReportSectionBreakdown,
  ReportVariant,
  SectionLineResult,
} from '@/lib/inspection/reportTypes';
import { VEHICLE_PHOTO_SLOTS } from '@/lib/inspection/vehiclePhotoAngles';

function textProgressBar(pct: number, width = 12): string {
  const filled = Math.round((pct / 100) * width);
  const f = Math.max(0, Math.min(width, filled));
  return `${'█'.repeat(f)}${'░'.repeat(width - f)}`;
}

function severityStyle(sev: string): string {
  if (sev === 'Critical') return 'text-[#C0392B]';
  if (sev === 'Major') return 'text-[#D35400]';
  return 'text-[#D35400]';
}

function findDefectForLine(defects: DefectSummary[], sectionId: string, line: SectionLineResult): DefectSummary | undefined {
  return defects.find(d => d.sectionId === sectionId && d.itemLabel === line.label);
}

function CategoryMiniBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[#374151]">
      <span className="w-[4.5rem] shrink-0 font-medium">{label}</span>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded bg-[#F4F6F8]">
        <div className="h-full rounded bg-[#ff5722]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PhotoTile({
  label,
  url,
  classic,
}: {
  label: string;
  url: string | null;
  classic: boolean;
}) {
  return (
    <div className="photo-tile flex flex-col gap-1" style={{ pageBreakInside: 'avoid' as const }}>
      <div
        className={`relative w-full overflow-hidden bg-[#F4F6F8] ${classic ? 'rounded-none border border-[#D1D5DB]' : 'rounded-lg border border-[#E5E7EB]'}`}
        style={{ aspectRatio: '4 / 3' }}
      >
        {url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={url} alt={label} className="h-full w-full object-cover" crossOrigin="anonymous" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-[#E5E7EB] px-2 text-center text-[#9CA3AF]">
            <Camera className={`${classic ? 'h-6 w-6' : 'h-8 w-8'} opacity-50`} aria-hidden />
            <span className={`mt-1 ${classic ? 'text-[8px]' : 'text-[10px]'}`}>Not captured</span>
          </div>
        )}
      </div>
      <p
        className={`text-center text-[#374151] ${classic ? 'text-[8px] font-bold uppercase' : 'text-[10px] font-medium'}`}
      >
        {label}
      </p>
    </div>
  );
}

function VehiclePhotoGallery({ data, variant }: { data: InspectionReportData; variant: ReportVariant }) {
  const classic = variant === 'classic';
  const slots = VEHICLE_PHOTO_SLOTS.map(s => {
    const row = data.vehiclePhotos.find(p => p.angleId === s.id);
    return { ...s, url: row?.url ?? null };
  });

  const h2 = variant === 'classic' ? 'UPPERCASE text-sm font-black tracking-wide text-[#1F2937]' : 'text-base font-bold text-[#1F2937]';

  if (classic) {
    return (
      <section className="section-card">
        <h2 className={h2}>Vehicle Condition — Photo Documentation</h2>
        <p className="mt-1 text-[9px] leading-snug text-[#6B7280]">{data.inspection.photoDocSubheading}</p>
        <div className="photo-grid-classic mt-3">
          {slots.map(s => (
            <PhotoTile key={s.id} label={s.label} url={s.url} classic />
          ))}
        </div>
      </section>
    );
  }

  const row1 = slots.slice(0, 3);
  const row2 = slots.slice(3, 6);
  const row3 = slots.slice(6, 9);
  const row4 = slots.slice(9, 11);

  return (
    <section className="section-card">
      <h2 className={h2}>Vehicle Condition — Photo Documentation</h2>
      <p className="mt-1 text-xs text-[#6B7280]">{data.inspection.photoDocSubheading}</p>
      <div className="photo-grid mt-4">
        {[row1, row2, row3].map((row, ri) => (
          <div key={ri} className="grid grid-cols-3 gap-3">
            {row.map(s => (
              <PhotoTile key={s.id} label={s.label} url={s.url} classic={false} />
            ))}
          </div>
        ))}
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {row4.map(s => (
            <div key={s.id} className="w-[calc(33.333%-0.5rem)] min-w-[140px] max-w-[220px]">
              <PhotoTile label={s.label} url={s.url} classic={false} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionBreakdown({ data, variant }: { data: InspectionReportData; variant: ReportVariant }) {
  const classic = variant === 'classic';
  const h2 = classic ? 'mb-3 text-sm font-black uppercase tracking-wide text-[#1F2937]' : 'mb-3 text-base font-bold text-[#1F2937]';

  return (
    <section className="section-card">
      <h2 className={h2}>Section-by-Section Breakdown</h2>
      <div className="space-y-4">
        {data.sectionBreakdowns.map((sec: ReportSectionBreakdown) => {
          const failLines = sec.lines.filter(l => l.result === 'fail');
          if (!sec.anyFailure) {
            return (
              <div
                key={sec.sectionId}
                className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${classic ? 'font-mono text-[10px]' : 'text-sm'}`}
              >
                <span className="min-w-[7rem] flex-1 font-semibold text-[#1F2937]">{sec.name}</span>
                <span className="text-[#1A7A4A]">
                  ✓ {sec.passed}/{sec.total} passed
                </span>
                <span className="font-mono text-[#6B7280]">{textProgressBar(sec.pct)}</span>
                <span className="font-bold tabular-nums text-[#1F2937]">{sec.pct}%</span>
              </div>
            );
          }

          return (
            <div key={sec.sectionId} className="border-b border-[#E5E7EB] pb-4 last:border-0 last:pb-0">
              <div className={`mb-2 flex flex-wrap items-baseline justify-between gap-2 ${classic ? 'uppercase' : ''}`}>
                <h3 className={`font-bold text-[#1F2937] ${classic ? 'text-[11px]' : 'text-sm'}`}>{sec.name}</h3>
                <span className={`text-xs font-bold ${classic ? 'font-mono' : ''} text-[#C0392B]`}>
                  ✗ {failLines.length} {failLines.length === 1 ? 'failure' : 'failures'}
                </span>
              </div>
              <div className="space-y-2 border-t border-[#F4F6F8] pt-2">
                {sec.lines.map((line, idx) => {
                  const isFail = line.result === 'fail';
                  const defect = isFail ? findDefectForLine(data.defects, sec.sectionId, line) : undefined;
                  return (
                    <div key={`${line.label}-${idx}`} className={`${classic ? 'text-[10px] leading-relaxed' : 'text-xs'}`}>
                      <div className="flex flex-wrap items-start gap-2">
                        <span className="shrink-0">{line.result === 'pass' ? '✓' : line.result === 'fail' ? '✗' : '—'}</span>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-[#1F2937]">{line.label}</span>{' '}
                          <span className={line.result === 'pass' ? 'text-[#1A7A4A]' : line.result === 'fail' ? 'text-[#C0392B]' : 'text-[#6B7280]'}>
                            {line.result === 'pass' ? 'PASS' : line.result === 'fail' ? 'FAIL' : 'N/A'}
                          </span>
                          {isFail && line.severity ? (
                            <span className={`ml-1 text-[10px] font-bold ${severityStyle(String(line.severity))}`}>
                              — {line.severity}
                            </span>
                          ) : null}
                          {line.note ? <p className="mt-0.5 whitespace-pre-wrap text-[#6B7280]">&quot;{line.note}&quot;</p> : null}
                          {defect && defect.damagePhotoUrls.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {defect.damagePhotoUrls.map((u, i) => (
                                <div key={i} className="h-14 w-[4.5rem] shrink-0 overflow-hidden rounded border border-[#E5E7EB] bg-white">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={u} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DamageGallery({ data, variant }: { data: InspectionReportData; variant: ReportVariant }) {
  const withPhotos = data.defects.filter(d => d.damagePhotoUrls.length > 0);
  if (!withPhotos.length) return null;

  const classic = variant === 'classic';
  const h2 = classic ? 'text-sm font-black uppercase tracking-wide text-[#1F2937]' : 'text-base font-bold text-[#1F2937]';

  return (
    <section className="section-card">
      <h2 className={h2}>Documented Defects — Photo Evidence</h2>
      <div className="mt-4 space-y-6">
        {withPhotos.map((d, di) => (
          <div key={`${d.sectionId}-${d.itemLabel}-${di}`} className="border-b border-[#E5E7EB] pb-6 last:border-0 last:pb-0">
            <div className={`mb-2 flex flex-wrap items-baseline justify-between gap-2 ${classic ? 'uppercase' : ''}`}>
              <p className={`font-bold text-[#1F2937] ${classic ? 'text-[11px]' : 'text-sm'}`}>
                {d.sectionName} — {d.itemLabel}
              </p>
              <span className={`text-xs font-bold ${severityStyle(d.severity)}`}>🔴 {d.severity}</span>
            </div>
            <div className={`flex flex-wrap gap-2 ${classic ? 'gap-1.5' : 'gap-3'}`}>
              {d.damagePhotoUrls.map((u, pi) => (
                <div key={pi} className="flex flex-col gap-1">
                  <div
                    className={`overflow-hidden bg-[#F9FAFB] ${classic ? 'border border-black' : 'rounded-lg border border-[#E5E7EB]'}`}
                    style={{ width: classic ? 120 : 140, aspectRatio: '4 / 3' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
                  </div>
                  <p className={`text-[#6B7280] ${classic ? 'text-[8px]' : 'text-[10px]'}`}>
                    Photo {pi + 1} of {d.damagePhotoUrls.length}
                  </p>
                </div>
              ))}
            </div>
            {d.aiAnalysis ? (
              <p className={`mt-2 text-[#374151] ${classic ? 'text-[9px]' : 'text-xs'}`}>
                <span className="font-semibold">AI Analysis:</span> {d.aiAnalysis}
              </p>
            ) : null}
            {d.note ? (
              <p className={`mt-1 text-[#6B7280] ${classic ? 'text-[9px]' : 'text-xs'}`}>
                <span className="font-semibold">Note:</span> {d.note}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function RepairCostsSection({ data, variant }: { data: InspectionReportData; variant: ReportVariant }) {
  const rows = data.repairCosts;
  if (!rows?.length) return null;

  const classic = variant === 'classic';
  const h2 = classic ? 'text-sm font-black uppercase tracking-wide text-[#1F2937]' : 'text-base font-bold text-[#1F2937]';

  const lowSum = rows.reduce((a, r) => a + r.low, 0);
  const highSum = rows.reduce((a, r) => a + r.high, 0);
  const anyOpen = rows.some(r => r.openEnded);

  return (
    <section className="section-card">
      <h2 className={h2}>Estimated Repair Costs</h2>
      <div className={`mt-3 overflow-x-auto ${classic ? 'text-[9px]' : 'text-xs'}`}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="py-2 pr-2 font-bold text-[#1F2937]">Item</th>
              <th className="py-2 pr-2 font-bold text-[#1F2937]">Severity</th>
              <th className="py-2 font-bold text-[#1F2937]">Est. Cost Range</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-[#F4F6F8]">
                <td className="py-2 pr-2 text-[#374151]">{r.item}</td>
                <td className="py-2 pr-2 font-medium">{r.severity}</td>
                <td className="py-2 font-mono tabular-nums text-[#1F2937]">
                  {formatNaira(r.low)} – {formatNaira(r.high)}
                  {r.openEnded ? '+' : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={`mt-3 font-semibold text-[#1F2937] ${classic ? 'text-[10px]' : 'text-sm'}`}>
        Total estimated range: {formatNaira(lowSum)} – {formatNaira(highSum)}
        {anyOpen ? '+' : ''}
      </p>
      <p className={`mt-2 text-[#6B7280] ${classic ? 'text-[8px]' : 'text-xs'}`}>
        Disclaimer: Estimates are indicative only. Obtain a professional workshop quote.
      </p>
    </section>
  );
}

export type ReportDocumentBodyProps = {
  data: InspectionReportData;
  variant: ReportVariant;
  /** Typically `QRCodeSVG` from `qrcode.react` (props are wider than our usage; avoid fighting library generics). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  QRCode: React.ComponentType<any>;
};

export function ReportDocumentBody({ data, variant, QRCode }: ReportDocumentBodyProps) {
  const classic = variant === 'classic';
  const v = data.vehicle;
  const title = `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ''}`;
  const subtitleParts = [v.plate, v.mileage, v.colour, v.transmission].filter(Boolean);
  const metaLine = `VIN: ${v.vin}  •  ${v.city}`;
  const sc = data.scoreCategories;

  const coverHeading = classic ? 'INSPECTION REPORT' : 'INSPECTION REPORT';
  const subHeadClass = classic ? 'text-[10px] font-black uppercase text-[#6B7280]' : 'text-xs font-bold uppercase tracking-wide text-[#9CA3AF]';

  return (
    <div className={`report-doc-inner relative z-[1] space-y-6 ${classic ? 'p-4 md:p-5' : 'p-4 md:p-6'}`}>
      {/* Cover */}
      <section className="section-card">
        {classic ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <AppLogo size={96} />
              <p className={`mt-4 ${subHeadClass}`}>{coverHeading}</p>
              <p className="font-mono text-sm font-bold text-[#1F2937]">{data.inspection.reportNumber}</p>
              <hr className="my-3 border-[#E5E7EB]" />
              <h1 className="text-base font-black uppercase leading-tight text-[#1F2937]">{title}</h1>
              <p className="mt-2 text-[11px] font-bold text-[#374151]">{subtitleParts.join('  •  ')}</p>
              <p className="mt-1 font-mono text-[10px] text-[#6B7280]">{metaLine}</p>
            </div>
            <div className="flex flex-col items-end text-right">
              <p className="score-text text-sm font-bold text-[#1F2937]">
                {data.score.total} / 100 — {data.score.label}
              </p>
              <p className="mt-4 text-[10px] leading-relaxed text-[#374151]">
                <span className="font-bold uppercase">Inspector:</span> {data.inspector.name} · Cert #{data.inspector.certNumber}
              </p>
              <p className="mt-1 text-[10px] text-[#6B7280]">
                Date: {data.inspection.inspectionDateLong} · Duration: {data.inspection.durationHuman}
              </p>
              <p className="mt-1 text-[10px] text-[#6B7280]">
                Zone: {data.inspection.zone} · Report Version: v{data.inspection.version}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <AppLogo size={120} />
              <div className="text-right">
                <p className={subHeadClass}>{coverHeading}</p>
                <p className="font-mono text-base font-bold text-[#1F2937]">{data.inspection.reportNumber}</p>
              </div>
            </div>
            <hr className="my-4 border-[#E5E7EB]" />
            <h1 className="text-xl font-bold text-[#1F2937]">{title}</h1>
            <p className="mt-2 text-sm text-[#374151]">{subtitleParts.join('  •  ')}</p>
            <p className="mt-1 font-mono text-xs text-[#6B7280]">{metaLine}</p>
            <div className="mt-6 flex flex-wrap items-start justify-center gap-6 md:justify-start">
              <CarschekScore score={data.score.total} size={96} animated={false} showLabel />
              <div className="flex min-w-[12rem] flex-1 flex-col justify-center gap-2">
                <CategoryMiniBar label="Body" pct={sc.body} />
                <CategoryMiniBar label="Engine" pct={sc.engine} />
                <CategoryMiniBar label="Interior" pct={sc.interior} />
                <CategoryMiniBar label="Electrical" pct={sc.electrical} />
              </div>
            </div>
            <p className="mt-6 text-xs text-[#374151]">
              <span className="font-semibold">Inspector:</span> {data.inspector.name} · Cert #{data.inspector.certNumber}
            </p>
            <p className="mt-1 text-xs text-[#6B7280]">
              Date: {data.inspection.inspectionDateLong} · Duration: {data.inspection.durationHuman}
            </p>
            <p className="mt-1 text-xs text-[#6B7280]">
              Zone: {data.inspection.zone} · Report Version: v{data.inspection.version}
            </p>
          </>
        )}
      </section>

      {/* Critical findings */}
      {data.criticalDefects.length > 0 ? (
        <section className="relative z-[1] mb-3 rounded-xl border border-amber-300 bg-amber-50/90 p-4 md:p-5">
          <p className={`font-bold text-[#92400E] ${classic ? 'text-[11px] uppercase' : 'text-sm'}`}>
            ⚠ CRITICAL ISSUES FOUND — {data.criticalDefects.length}{' '}
            {data.criticalDefects.length === 1 ? 'Item Requires' : 'Items Require'} Immediate Attention Before This Vehicle Is Listed or Sold
          </p>
          <ol className={`mt-4 list-decimal space-y-3 pl-5 ${classic ? 'text-[10px]' : 'text-xs'}`}>
            {data.criticalDefects.map((c, i) => (
              <li key={i} className="text-[#78350F]">
                <span className="font-bold uppercase">
                  {c.sectionName} → {c.itemLabel}
                </span>
                <p className="mt-0.5 text-[#92400E]">{c.note || '—'}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <VehiclePhotoGallery data={data} variant={variant} />

      <SectionBreakdown data={data} variant={variant} />

      <DamageGallery data={data} variant={variant} />

      <RepairCostsSection data={data} variant={variant} />

      {/* Certification */}
      <section className="section-card">
        <h2 className={classic ? 'text-sm font-black uppercase text-[#1F2937]' : 'text-base font-bold text-[#1F2937]'}>
          Inspector Certification
        </h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {data.inspector.photoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={data.inspector.photoUrl}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#ff5722] text-sm font-bold text-white"
              aria-hidden
            >
              {data.inspector.initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className={`font-bold text-[#1F2937] ${classic ? 'text-[11px] uppercase' : 'text-sm'}`}>{data.inspector.name}</p>
            <p className={`text-[#6B7280] ${classic ? 'text-[9px]' : 'text-xs'}`}>Certification #: {data.inspector.certNumber}</p>
            <p className={`text-[#6B7280] ${classic ? 'text-[9px]' : 'text-xs'}`}>Carschek Certified Inspector</p>
          </div>
        </div>
        <blockquote className={`mt-4 border-l-4 border-[#ff5722] pl-3 italic text-[#374151] ${classic ? 'text-[10px]' : 'text-sm'}`}>
          &quot;I certify that this vehicle inspection was conducted by me on {data.inspection.inspectionDateLong} in accordance with
          Carschek Automotive Platform inspection standards.&quot;
        </blockquote>
        <div className="mt-4">
          <p className={`mb-1 font-semibold text-[#1F2937] ${classic ? 'text-[10px] uppercase' : 'text-xs'}`}>Digital Signature:</p>
          <div className={`inline-block min-h-[48px] min-w-[200px] border bg-white ${classic ? 'border-black' : 'rounded-lg border-[#E5E7EB]'}`}>
            {data.inspector.signatureDataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={data.inspector.signatureDataUrl}
                alt="Signature"
                className="h-14 max-w-full object-contain p-1"
                crossOrigin="anonymous"
              />
            ) : (
              <p className="p-3 text-[10px] text-[#9CA3AF]">No signature on file</p>
            )}
          </div>
        </div>
        <p className={`mt-4 text-[#374151] ${classic ? 'text-[10px]' : 'text-xs'}`}>
          Date: {data.inspection.inspectionDateLong} · Time: {data.inspection.completedAtTime}
        </p>
        <p className={`text-[#374151] ${classic ? 'text-[10px]' : 'text-xs'}`}>
          Location: {data.inspection.zone}, {v.city}, Nigeria
        </p>
        <hr className="my-4 border-[#E5E7EB]" />
        <div className="flex flex-wrap items-start gap-4">
          <div className="rounded border border-[#E5E7EB] bg-white p-1">
            <QRCode value={data.inspection.qrVerifyUrl} size={80} level="M" />
          </div>
          <div className={`min-w-0 flex-1 text-[#374151] ${classic ? 'text-[9px]' : 'text-xs'}`}>
            <p className="font-semibold text-[#1F2937]">Scan to verify this report at</p>
            <p className="break-all font-mono text-[11px] text-[#ff8a65]">{data.inspection.qrVerifyUrl.replace(/^https:\/\//, '')}</p>
            <p className="mt-3 text-[#6B7280]">
              This report is valid for 90 days from the inspection date. Re-inspection recommended after this period.
            </p>
            <p className="mt-4 font-bold text-[#1F2937]">Carschek Automotive Platform</p>
            <p>info@carschek.com · +234 817 362 4953</p>
            <p>carschek.com · admin.carschek.com</p>
          </div>
        </div>
      </section>
    </div>
  );
}
