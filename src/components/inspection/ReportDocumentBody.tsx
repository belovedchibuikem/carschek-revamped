'use client';

import React from 'react';
import { Camera, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
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

// ─── Helpers ────────────────────────────────────────────────────────────────

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

function severityBg(sev: string): string {
  if (sev === 'Critical') return 'bg-red-50 border-red-200';
  if (sev === 'Major') return 'bg-orange-50 border-orange-200';
  return 'bg-yellow-50 border-yellow-200';
}

function resultIcon(result: 'pass' | 'fail' | 'na', classic: boolean) {
  const sz = classic ? 10 : 12;
  if (result === 'pass') return <CheckCircle size={sz} className="text-[#1A7A4A] shrink-0" />;
  if (result === 'fail') return <XCircle size={sz} className="text-[#C0392B] shrink-0" />;
  return <MinusCircle size={sz} className="text-[#9CA3AF] shrink-0" />;
}

function resultLabel(result: 'pass' | 'fail' | 'na'): string {
  if (result === 'pass') return 'OK';
  if (result === 'fail') return 'NOT OK';
  return 'N/A';
}

function resultColor(result: 'pass' | 'fail' | 'na'): string {
  if (result === 'pass') return 'text-[#1A7A4A]';
  if (result === 'fail') return 'text-[#C0392B]';
  return 'text-[#9CA3AF]';
}

function findDefectForLine(defects: DefectSummary[], sectionId: string, line: SectionLineResult): DefectSummary | undefined {
  return defects.find(d => d.sectionId === sectionId && d.itemLabel === line.label);
}

function vehicleDetailGridItems(data: InspectionReportData): { label: string; value: string }[] {
  if (data.carDetailFields.length > 0) {
    return data.carDetailFields.map(f => ({
      label: f.label,
      value: f.value.trim() || '—',
    }));
  }
  const v = data.vehicle;
  return [
    { label: 'Brand', value: v.make || '—' },
    { label: 'Model', value: v.model || '—' },
    { label: 'Year', value: String(v.year) },
    { label: 'Colour', value: v.colour || '—' },
    { label: 'Transmission', value: v.transmission || '—' },
    { label: 'Mileage', value: v.mileage || '—' },
    { label: 'Plate', value: v.plate || '—' },
    { label: 'City', value: v.city || '—' },
    { label: 'Chasis Number', value: v.vin || '—' },
    { label: 'Engine Capacity', value: v.engineNumber || '—' },
  ];
}

function VehicleDetailsGrid({ data, classic }: { data: InspectionReportData; classic: boolean }) {
  const items = vehicleDetailGridItems(data);
  if (classic) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-[#374151]">
        {items.map(item => (
          <React.Fragment key={item.label}>
            <span className="font-bold uppercase">{item.label}:</span>
            <span>{item.value}</span>
          </React.Fragment>
        ))}
      </div>
    );
  }
  return (
    <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:grid-cols-3">
      {items.map(item => (
        <div key={item.label}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{item.label}</p>
          <p className="text-sm font-bold text-[#1F2937]">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function CategoryMiniBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[#374151]">
      <span className="w-[4.5rem] shrink-0 font-medium">{label}</span>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded bg-[#F4F6F8]">
        <div className="h-full rounded bg-[#ff5722]" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-[10px] font-bold text-[#374151]">{pct}%</span>
    </div>
  );
}

function PhotoTile({ label, url, classic }: { label: string; url: string | null; classic: boolean }) {
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
      <p className={`text-center text-[#374151] ${classic ? 'text-[8px] font-bold uppercase' : 'text-[10px] font-medium'}`}>
        {label}
      </p>
    </div>
  );
}

// ─── Vehicle Photo Gallery ───────────────────────────────────────────────────

function VehiclePhotoGallery({ data, variant }: { data: InspectionReportData; variant: ReportVariant }) {
  const classic = variant === 'classic';
  const slots = VEHICLE_PHOTO_SLOTS.map(s => {
    const row = data.vehiclePhotos.find(p => p.angleId === s.id);
    return { ...s, url: row?.url ?? null };
  });

  const h2 = classic ? 'text-sm font-black uppercase tracking-wide text-[#1F2937]' : 'text-base font-bold text-[#1F2937]';
  const capturedCount = slots.filter(s => s.url).length;

  if (classic) {
    return (
      <section className="section-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className={h2}>S04 — Vehicle Photo Documentation</h2>
          <span className="rounded-full bg-[#ff5722] px-2 py-0.5 text-[9px] font-bold text-white">{capturedCount}/11</span>
        </div>
        <p className="pdf-exclude mb-3 text-[9px] leading-snug text-[#6B7280]">{data.inspection.photoDocSubheading}</p>
        <div className="grid grid-cols-3 gap-2">
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
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className={h2}>S04 — Vehicle Photo Documentation</h2>
          <p className="pdf-exclude mt-1 text-xs text-[#6B7280]">{data.inspection.photoDocSubheading}</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-[#FFF3EE] px-3 py-1.5">
          <span className="text-xs font-bold text-[#ff5722]">{capturedCount}/11 photos</span>
        </div>
      </div>
      <div className="photo-grid mt-4 space-y-3">
        {[row1, row2, row3].map((row, ri) => (
          <div key={ri} className="grid grid-cols-3 gap-3">
            {row.map(s => (
              <PhotoTile key={s.id} label={s.label} url={s.url} classic={false} />
            ))}
          </div>
        ))}
        <div className="grid grid-cols-3 gap-3">
          {row4.map(s => (
            <PhotoTile key={s.id} label={s.label} url={s.url} classic={false} />
          ))}
          {/* Empty placeholder to maintain grid alignment */}
          <div />
        </div>
      </div>
    </section>
  );
}

// ─── Section Card (Modern) ───────────────────────────────────────────────────

function ModernSectionCard({ sec, defects }: { sec: ReportSectionBreakdown; defects: DefectSummary[] }) {
  const passLines = sec.lines.filter(l => l.result === 'pass');
  const failLines = sec.lines.filter(l => l.result === 'fail');
  const naLines = sec.lines.filter(l => l.result === 'na');
  /** Form/comment sections record values rather than OK/NOT OK ticks */
  const isValueSection = sec.lines.length > 0 && sec.lines.every(l => l.value !== undefined);

  const statusColor = sec.pct >= 80 ? '#1A7A4A' : sec.pct >= 60 ? '#D35400' : '#C0392B';
  const statusBg = sec.pct >= 80 ? 'bg-green-50 border-green-200' : sec.pct >= 60 ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200';

  return (
    <div
      className="section-card overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"
      style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
    >
      {/* Section Header */}
      <div className="pdf-avoid-break flex items-center justify-between gap-3 border-b border-[#F4F6F8] bg-[#F9FAFB] px-4 py-3" data-pdf-atomic>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff5722] text-[10px] font-bold text-white">
            {sec.sectionId}
          </div>
          <h3 className="text-sm font-bold text-[#1F2937]">{sec.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold ${statusBg}`} style={{ color: statusColor }}>
            {sec.pct}%
          </div>
          <span className="text-[10px] text-[#6B7280]">
            {sec.passed}/{sec.total} {isValueSection ? 'recorded' : 'passed'}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#F4F6F8]">
        <div className="h-full transition-all" style={{ width: `${sec.pct}%`, backgroundColor: statusColor }} />
      </div>

      {/* Summary stats */}
      {!isValueSection && (
        <div className="flex gap-4 border-b border-[#F4F6F8] px-4 py-2">
          <div className="flex items-center gap-1 text-[11px]">
            <CheckCircle size={11} className="text-[#1A7A4A]" />
            <span className="font-semibold text-[#1A7A4A]">{passLines.length} OK</span>
          </div>
          {failLines.length > 0 && (
            <div className="flex items-center gap-1 text-[11px]">
              <XCircle size={11} className="text-[#C0392B]" />
              <span className="font-semibold text-[#C0392B]">{failLines.length} NOT OK</span>
            </div>
          )}
          {naLines.length > 0 && (
            <div className="flex items-center gap-1 text-[11px]">
              <MinusCircle size={11} className="text-[#9CA3AF]" />
              <span className="font-semibold text-[#9CA3AF]">{naLines.length} N/A</span>
            </div>
          )}
        </div>
      )}

      {/* Line items */}
      {sec.lines.length > 0 && (
        <div className="divide-y divide-[#F4F6F8] px-4">
          {sec.lines.map((line, idx) => {
            // Form/comment lines carry a recorded value instead of an OK/NOT OK tick
            if (line.value !== undefined) {
              return (
                <div
                  key={`${line.label}-${idx}`}
                  className="pdf-avoid-break flex items-baseline justify-between gap-3 py-2"
                  data-pdf-atomic
                >
                  <span className="text-xs text-[#6B7280]">{line.label}</span>
                  <span className="min-w-0 text-right text-xs font-semibold text-[#1F2937]">{line.value}</span>
                </div>
              );
            }
            const isFail = line.result === 'fail';
            const defect = isFail ? findDefectForLine(defects, sec.sectionId, line) : undefined;
            return (
              <div
                key={`${line.label}-${idx}`}
                className={`pdf-avoid-break py-2.5 ${isFail ? 'bg-red-50/30' : ''}`}
                data-pdf-atomic
              >
                <div className="flex items-start gap-2">
                  {resultIcon(line.result, false)}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-[#1F2937]">{line.label}</span>
                      <span className={`text-[10px] font-bold ${resultColor(line.result)}`}>{resultLabel(line.result)}</span>
                      {isFail && line.severity && (
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${severityBg(String(line.severity))} ${severityStyle(String(line.severity))}`}>
                          {line.severity}
                        </span>
                      )}
                    </div>
                    {line.note && (
                      <p className="mt-0.5 text-[11px] italic text-[#6B7280]">"{line.note}"</p>
                    )}
                    {defect && defect.damagePhotoUrls.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {defect.damagePhotoUrls.map((u, pi) => (
                          <div key={pi} className="photo-tile h-12 w-16 overflow-hidden rounded-lg border border-[#E5E7EB]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={u} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sec.lines.length === 0 && (
        <div className="px-4 py-3 text-center text-[11px] text-[#9CA3AF]">No checklist items recorded for this section</div>
      )}
    </div>
  );
}

// ─── Section Card (Classic) ──────────────────────────────────────────────────

function ClassicSectionCard({ sec, defects }: { sec: ReportSectionBreakdown; defects: DefectSummary[] }) {
  const failLines = sec.lines.filter(l => l.result === 'fail');

  return (
    <div
      className="section-card border border-[#D1D5DB] bg-white"
      style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
    >
      {/* Header */}
      <div className="pdf-avoid-break flex items-center justify-between border-b border-[#D1D5DB] bg-[#F4F6F8] px-3 py-2" data-pdf-atomic>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-black text-[#ff5722]">{sec.sectionId}</span>
          <span className="text-[11px] font-black uppercase tracking-wide text-[#1F2937]">{sec.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-[#6B7280]">{textProgressBar(sec.pct, 10)}</span>
          <span className="font-mono text-[10px] font-bold text-[#1F2937]">{sec.pct}%</span>
          {failLines.length > 0 && (
            <span className="font-mono text-[10px] font-bold text-[#C0392B]">✗ {failLines.length} FAIL</span>
          )}
        </div>
      </div>

      {/* Items table */}
      {sec.lines.length > 0 && (
        <table className="w-full border-collapse text-[9px]">
          <tbody>
            {sec.lines.map((line, idx) => {
              if (line.value !== undefined) {
                return (
                  <tr key={`${line.label}-${idx}`} className={`border-b border-[#F4F6F8] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                    <td className="w-5 px-2 py-1.5 text-center text-[#9CA3AF]">•</td>
                    <td className="px-2 py-1.5 font-medium text-[#1F2937]">{line.label}</td>
                    <td className="px-2 py-1.5 font-bold text-[#1F2937]" colSpan={2}>{line.value}</td>
                  </tr>
                );
              }
              const isFail = line.result === 'fail';
              const defect = isFail ? findDefectForLine(defects, sec.sectionId, line) : undefined;
              return (
                <tr key={`${line.label}-${idx}`} className={`border-b border-[#F4F6F8] ${isFail ? 'bg-red-50/40' : idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                  <td className="w-5 px-2 py-1.5 text-center">
                    <span className={resultColor(line.result)}>{line.result === 'pass' ? '✓' : line.result === 'fail' ? '✗' : '—'}</span>
                  </td>
                  <td className="px-2 py-1.5 font-medium text-[#1F2937]">{line.label}</td>
                  <td className={`px-2 py-1.5 font-bold ${resultColor(line.result)}`}>{resultLabel(line.result)}</td>
                  <td className="px-2 py-1.5 text-[#6B7280]">
                    {isFail && line.severity && <span className={`font-bold ${severityStyle(String(line.severity))}`}>{line.severity}</span>}
                    {line.note && <span className="ml-1 italic">"{line.note}"</span>}
                    {defect && defect.damagePhotoUrls.length > 0 && (
                      <span className="ml-1 text-[#ff5722]">📷 {defect.damagePhotoUrls.length} photo(s)</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {sec.lines.length === 0 && (
        <p className="px-3 py-2 text-[9px] text-[#9CA3AF]">No items recorded</p>
      )}
    </div>
  );
}

// ─── All Sections Breakdown ──────────────────────────────────────────────────

function AllSectionsBreakdown({ data, variant }: { data: InspectionReportData; variant: ReportVariant }) {
  const classic = variant === 'classic';
  const h2 = classic ? 'mb-3 text-sm font-black uppercase tracking-wide text-[#1F2937]' : 'mb-4 text-base font-bold text-[#1F2937]';

  // Group sections by category for better readability
  const sectionGroups = [
    { label: 'Customer Information', ids: ['S01', 'S02', 'S03'] },
    { label: 'Exterior & Body', ids: ['S05', 'S06', 'S07', 'S08'] },
    { label: 'Mechanical Systems', ids: ['S09', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S17'] },
    { label: 'Interior & Comfort', ids: ['S18', 'S19', 'S20', 'S21', 'S22'] },
    { label: 'Electronics & Diagnostics', ids: ['S23', 'S24'] },
  ];

  return (
    <section className="section-card">
      <h2 className={h2}>Inspection Results — All 26 Sections</h2>

      {/* Quick summary table */}
      <div className={`mb-6 overflow-hidden ${classic ? 'border border-[#D1D5DB]' : 'rounded-xl border border-[#E5E7EB]'}`}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#ff5722] text-white">
              <th className={`px-3 py-2 text-left ${classic ? 'text-[9px] uppercase' : 'text-[11px]'} font-bold`}>Section</th>
              <th className={`px-3 py-2 text-center ${classic ? 'text-[9px] uppercase' : 'text-[11px]'} font-bold`}>Pass</th>
              <th className={`px-3 py-2 text-center ${classic ? 'text-[9px] uppercase' : 'text-[11px]'} font-bold`}>Fail</th>
              <th className={`px-3 py-2 text-center ${classic ? 'text-[9px] uppercase' : 'text-[11px]'} font-bold`}>Score</th>
              <th className={`px-3 py-2 text-left ${classic ? 'text-[9px] uppercase' : 'text-[11px]'} font-bold`}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.sectionBreakdowns.map((sec, idx) => {
              const failCount = sec.lines.filter(l => l.result === 'fail').length;
              const statusLabel = sec.pct >= 80 ? 'Good' : sec.pct >= 60 ? 'Fair' : sec.total === 0 ? 'N/A' : 'Poor';
              const statusColor = sec.pct >= 80 ? '#1A7A4A' : sec.pct >= 60 ? '#D35400' : sec.total === 0 ? '#9CA3AF' : '#C0392B';
              return (
                <tr key={sec.sectionId} className={`border-b border-[#F4F6F8] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                  <td className={`px-3 py-2 ${classic ? 'text-[9px]' : 'text-xs'}`}>
                    <span className="font-bold text-[#ff5722]">{sec.sectionId}</span>
                    <span className="ml-1.5 text-[#374151]">{sec.name}</span>
                  </td>
                  <td className={`px-3 py-2 text-center font-semibold text-[#1A7A4A] ${classic ? 'text-[9px]' : 'text-xs'}`}>{sec.passed}</td>
                  <td className={`px-3 py-2 text-center font-semibold ${failCount > 0 ? 'text-[#C0392B]' : 'text-[#9CA3AF]'} ${classic ? 'text-[9px]' : 'text-xs'}`}>{failCount}</td>
                  <td className={`px-3 py-2 text-center font-bold ${classic ? 'font-mono text-[9px]' : 'text-xs'}`} style={{ color: statusColor }}>
                    {sec.total > 0 ? `${sec.pct}%` : '—'}
                  </td>
                  <td className={`px-3 py-2 font-bold ${classic ? 'text-[9px]' : 'text-xs'}`} style={{ color: statusColor }}>
                    {statusLabel}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* S26 — immediately after summary table */}
      <InspectorCommentsSection data={data} variant={variant} embedded />

      {/* Detailed section cards */}
      {sectionGroups.map(group => {
        const groupSections = data.sectionBreakdowns.filter(s => group.ids.includes(s.sectionId));
        if (groupSections.length === 0) return null;
        return (
          <div key={group.label} className="mb-6">
            <div className={`mb-3 flex items-center gap-2 ${classic ? '' : ''}`}>
              <div className={`h-px flex-1 bg-[#E5E7EB]`} />
              <span className={`px-3 font-bold text-[#6B7280] ${classic ? 'text-[9px] uppercase tracking-widest' : 'text-xs uppercase tracking-wide'}`}>
                {group.label}
              </span>
              <div className="h-px flex-1 bg-[#E5E7EB]" />
            </div>
            <div className={`space-y-3`}>
              {groupSections.map(sec =>
                classic ? (
                  <ClassicSectionCard key={sec.sectionId} sec={sec} defects={data.defects} />
                ) : (
                  <ModernSectionCard key={sec.sectionId} sec={sec} defects={data.defects} />
                )
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

// ─── Inspector Comments (S26) ────────────────────────────────────────────────

function InspectorCommentsSection({
  data,
  variant,
  embedded,
}: {
  data: InspectionReportData;
  variant: ReportVariant;
  /** When true, render inside the inspection-results block (no outer section card). */
  embedded?: boolean;
}) {
  const comments = data.inspectorComments;
  if (!comments.length) return null;

  const classic = variant === 'classic';
  const h2 = classic ? 'text-sm font-black uppercase tracking-wide text-[#1F2937]' : 'text-base font-bold text-[#1F2937]';

  const body = (
    <>
      <h2 className={embedded ? `${h2} mb-4` : h2}>S26 — Inspector Comments</h2>
      <div className={`space-y-3 ${embedded ? '' : 'mt-4'}`}>
        {comments.map(c => (
          <div
            key={c.label}
            className={`pdf-avoid-break ${classic ? 'border border-[#D1D5DB] px-3 py-2' : 'rounded-xl border border-[#E5E7EB] bg-white px-4 py-3'}`}
            data-pdf-atomic
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
          >
            <p className={`font-bold text-[#1F2937] ${classic ? 'text-[10px] uppercase' : 'text-sm'}`}>{c.label}</p>
            <p className={`mt-1 text-[#374151] ${classic ? 'text-[10px]' : 'text-sm'} ${!c.value ? 'text-[#9CA3AF]' : ''}`}>
              {c.value || '—'}
            </p>
          </div>
        ))}
      </div>
    </>
  );

  if (embedded) {
    return <div className="mb-6">{body}</div>;
  }

  return <section className="section-card">{body}</section>;
}

// ─── Hub Damage Photos (S25) ─────────────────────────────────────────────────

function HubDamageGallery({ data, variant }: { data: InspectionReportData; variant: ReportVariant }) {
  const entries = data.hubDamages;
  if (!entries.length) return null;

  const classic = variant === 'classic';
  const h2 = classic ? 'text-sm font-black uppercase tracking-wide text-[#1F2937]' : 'text-base font-bold text-[#1F2937]';

  return (
    <section className="section-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className={h2}>S25 — Damage Pictures</h2>
        <span className={`rounded-full bg-[#FFF3EE] px-2 py-0.5 font-bold text-[#ff5722] ${classic ? 'text-[9px]' : 'text-xs'}`}>
          {entries.length} photo{entries.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="space-y-4">
        {entries.map(entry => (
          <div
            key={entry.id}
            className={`flex flex-col gap-3 sm:flex-row sm:items-start ${classic ? 'border border-[#D1D5DB] p-3' : 'rounded-xl border border-[#E5E7EB] bg-white p-4'}`}
            style={{ pageBreakInside: 'avoid' }}
          >
            <div
              className={`shrink-0 overflow-hidden bg-[#F9FAFB] ${classic ? 'border border-black' : 'rounded-lg border border-[#E5E7EB]'}`}
              style={{ width: classic ? 140 : 180, aspectRatio: '4 / 3' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={entry.photoUrl} alt={entry.label} className="h-full w-full object-cover" crossOrigin="anonymous" />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-bold text-[#1F2937] ${classic ? 'text-[11px] uppercase' : 'text-sm'}`}>
                Damage: {entry.label}
              </p>
              <p className={`mt-2 text-[#6B7280] ${classic ? 'text-[9px] font-bold uppercase' : 'text-xs font-semibold uppercase tracking-wide'}`}>
                Comment
              </p>
              <p className={`mt-0.5 text-[#374151] ${classic ? 'text-[10px]' : 'text-sm'} ${!entry.comment ? 'text-[#9CA3AF]' : ''}`}>
                {entry.comment || '—'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Repair Costs ────────────────────────────────────────────────────────────

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
            <tr className={`${classic ? 'border-b-2 border-[#1F2937]' : 'border-b border-[#E5E7EB]'}`}>
              <th className="py-2 pr-2 font-bold text-[#1F2937]">Item</th>
              <th className="py-2 pr-2 font-bold text-[#1F2937]">Severity</th>
              <th className="py-2 font-bold text-[#1F2937]">Est. Cost Range</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={`border-b ${classic ? 'border-[#D1D5DB]' : 'border-[#F4F6F8]'}`}>
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
        Total estimated range: {formatNaira(lowSum)} – {formatNaira(highSum)}{anyOpen ? '+' : ''}
      </p>
      <p className={`mt-2 text-[#6B7280] ${classic ? 'text-[8px]' : 'text-xs'}`}>
        Disclaimer: Estimates are indicative only. Obtain a professional workshop quote.
      </p>
    </section>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export type ReportDocumentBodyProps = {
  data: InspectionReportData;
  variant: ReportVariant;
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

  const coverHeading = 'VEHICLE INSPECTION REPORT';
  const subHeadClass = classic ? 'text-[10px] font-black uppercase text-[#6B7280]' : 'text-xs font-bold uppercase tracking-wide text-[#9CA3AF]';

  return (
    <div className={`report-doc-inner relative z-[1] space-y-6 ${classic ? 'p-4 md:p-5' : 'p-4 md:p-6'}`}>

      {/* ── Cover Page ── */}
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
                Date: {data.inspection.inspectionDateLong}
                <span className="pdf-exclude"> · Duration: {data.inspection.durationHuman}</span>
              </p>
              <p className="mt-1 text-[10px] text-[#6B7280]">
                Zone: {data.inspection.zone} · Report Version: v{data.inspection.version}
              </p>
              <VehicleDetailsGrid data={data} classic />
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

            <VehicleDetailsGrid data={data} classic={false} />

            <div className="mt-6 flex flex-wrap items-start justify-center gap-6 md:justify-start">
              <CarschekScore score={data.score.total} size={96} animated={false} showLabel />
              <div className="flex min-w-[12rem] flex-1 flex-col justify-center gap-2">
                <CategoryMiniBar label="Body" pct={sc.body} />
                <CategoryMiniBar label="Engine" pct={sc.engine} />
                <CategoryMiniBar label="Interior" pct={sc.interior} />
                <CategoryMiniBar label="Electrical" pct={sc.electrical} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'Inspector', value: data.inspector.name },
                { label: 'Cert #', value: data.inspector.certNumber },
                { label: 'Date', value: data.inspection.inspectionDateLong },
                { label: 'Duration', value: data.inspection.durationHuman },
              ].map(item => (
                <div
                  key={item.label}
                  className={`rounded-lg border border-[#E5E7EB] bg-white px-3 py-2${item.label === 'Duration' ? ' pdf-exclude' : ''}`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{item.label}</p>
                  <p className="text-xs font-bold text-[#1F2937]">{item.value}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── Critical Findings ── */}
      {data.criticalDefects.length > 0 && (
        <section className="relative z-[1] mb-3 rounded-xl border border-amber-300 bg-amber-50/90 p-4 md:p-5">
          <p className={`font-bold text-[#92400E] ${classic ? 'text-[11px] uppercase' : 'text-sm'}`}>
            ⚠ CRITICAL ISSUES FOUND — {data.criticalDefects.length}{' '}
            {data.criticalDefects.length === 1 ? 'Item Requires' : 'Items Require'} Immediate Attention Before This Vehicle Is Listed or Sold
          </p>
          <ol className={`mt-4 list-decimal space-y-3 pl-5 ${classic ? 'text-[10px]' : 'text-xs'}`}>
            {data.criticalDefects.map((c, i) => (
              <li key={i} className="text-[#78350F]">
                <span className="font-bold uppercase">{c.sectionName} → {c.itemLabel}</span>
                <p className="mt-0.5 text-[#92400E]">{c.note || '—'}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── S04: Vehicle Photos ── */}
      <VehiclePhotoGallery data={data} variant={variant} />

      {/* ── All 26 Sections Detailed Breakdown ── */}
      <AllSectionsBreakdown data={data} variant={variant} />

      {/* ── S25: Damage Pictures ── */}
      <HubDamageGallery data={data} variant={variant} />

      {/* ── Repair Costs ── */}
      <RepairCostsSection data={data} variant={variant} />

      {/* ── Inspector Certification ── */}
      <section className="section-card">
        <h2 className={classic ? 'text-sm font-black uppercase text-[#1F2937]' : 'text-base font-bold text-[#1F2937]'}>
          Inspector Certification
        </h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {data.inspector.photoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={data.inspector.photoUrl} alt="" width={64} height={64} className="h-16 w-16 rounded-full object-cover" crossOrigin="anonymous" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#ff5722] text-sm font-bold text-white" aria-hidden>
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
          &quot;I certify that this vehicle inspection was conducted by me on {data.inspection.inspectionDateLong} in accordance with Carschek Automotive Platform inspection standards.&quot;
        </blockquote>
        <div className="mt-4">
          <p className={`mb-1 font-semibold text-[#1F2937] ${classic ? 'text-[10px] uppercase' : 'text-xs'}`}>Digital Signature:</p>
          <div className={`inline-block min-h-[48px] min-w-[200px] border bg-white ${classic ? 'border-black' : 'rounded-lg border-[#E5E7EB]'}`}>
            {data.inspector.signatureDataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={data.inspector.signatureDataUrl} alt="Signature" className="h-14 max-w-full object-contain p-1" crossOrigin="anonymous" />
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
              This report is valid for 48 hrs from the inspection date. Re-inspection recommended after this period.
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
