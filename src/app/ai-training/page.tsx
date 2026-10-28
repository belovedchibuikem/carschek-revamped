'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Brain, CheckCircle2, Download, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import { aiTrainingApi, outcomesApi, valuationsApi, type AiBaselineCounts } from '@/lib/api/services';
import { downloadCsv } from '@/lib/ai/exportCsv';

const PHASE0_CHECKLIST: Array<{ label: string; href: string; done: true }> = [
  { label: 'GET feature snapshot API', href: '/vehicle-valuation', done: true },
  { label: 'AI baseline dashboard', href: '/ai-training', done: true },
  { label: 'Scanner ingest UI', href: '/scanner-ingest', done: true },
  { label: 'Training CSV exports', href: '/vehicle-valuation', done: true },
  { label: 'Valuation description parse helper', href: '/vehicle-valuation', done: true },
  { label: 'Valuation list VIN/INS/Train/Snap badges', href: '/vehicle-valuation', done: true },
  { label: 'Outcomes severity / cost / consent columns', href: '/vehicle-outcomes', done: true },
];

const PHASE1_CHECKLIST: Array<{ label: string; href: string; done: true }> = [
  { label: 'Observed risks on inspection reports', href: '/reports', done: true },
  { label: 'Valuation assistant (suggest + Apply)', href: '/vehicle-valuation', done: true },
  { label: 'Pricing guidance heuristic', href: '/listings', done: true },
  { label: 'Vision assist with stub / optional provider', href: '/ai-training', done: true },
];

export default function AiTrainingBaselinePage() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<AiBaselineCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<'valuations' | 'outcomes' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await aiTrainingApi.baseline();
      setCounts(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load AI baseline');
      setCounts(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const exportValuations = async () => {
    setExporting('valuations');
    try {
      const rows = (await valuationsApi.list()).filter(v => v.trainingConsent);
      downloadCsv(
        `carschek-valuations-training-${new Date().toISOString().slice(0, 10)}.csv`,
        [
          'id',
          'date',
          'clientName',
          'vehicleDescription',
          'vin',
          'plate',
          'carId',
          'inspectionId',
          'make',
          'model',
          'year',
          'mileage',
          'marketValue',
          'fsv',
          'conditionValue',
          'status',
          'trainingConsent',
          'hasFeatureSnapshot',
          'createdAt',
        ],
        rows.map(v => [
          v.id,
          v.date,
          v.clientName,
          v.vehicleDescription,
          v.vin ?? '',
          v.plate ?? '',
          v.carId ?? '',
          v.inspectionId ?? '',
          v.make ?? '',
          v.model ?? '',
          v.year ?? '',
          v.mileage ?? '',
          v.marketValue,
          v.fsv,
          v.conditionValue,
          v.status,
          v.trainingConsent ? '1' : '0',
          v.featureSnapshot ? '1' : '0',
          v.createdAt,
        ])
      );
      toast.success(`Exported ${rows.length} consented valuation(s)`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(null);
    }
  };

  const exportOutcomes = async () => {
    setExporting('outcomes');
    try {
      const rows = (await outcomesApi.list()).filter(o => o.trainingConsent);
      downloadCsv(
        `carschek-outcomes-training-${new Date().toISOString().slice(0, 10)}.csv`,
        [
          'id',
          'vin',
          'plate',
          'carId',
          'inspectionId',
          'eventType',
          'systemArea',
          'severity',
          'daysAfterInspection',
          'occurredOn',
          'description',
          'costAmount',
          'source',
          'trainingConsent',
          'createdAt',
        ],
        rows.map(r => [
          r.id,
          r.vin ?? '',
          r.plate ?? '',
          r.carId ?? '',
          r.inspectionId ?? '',
          r.eventType,
          r.systemArea ?? '',
          r.severity ?? '',
          r.daysAfterInspection ?? '',
          r.occurredOn ?? '',
          r.description,
          r.costAmount ?? '',
          r.source,
          r.trainingConsent ? '1' : '0',
          r.createdAt,
        ])
      );
      toast.success(`Exported ${rows.length} consented outcome(s)`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(null);
    }
  };

  const cards: Array<{ label: string; value: string | number; hint?: string }> = counts
    ? [
        { label: 'Inspections', value: counts.inspectionsTotal, hint: `${counts.inspectionsSubmitted} submitted` },
        { label: 'Feature snapshots', value: counts.featureSnapshots },
        { label: 'Valuations', value: counts.valuationsTotal, hint: `${counts.valuationsTrainingConsent} with consent` },
        { label: 'Valuations with VIN', value: counts.valuationsWithVin },
        { label: 'Valuations linked to inspection', value: counts.valuationsWithInspection },
        { label: 'Valuations with snapshot', value: counts.valuationsWithSnapshot },
        { label: 'Outcome events', value: counts.outcomesTotal, hint: `${counts.outcomesTrainingConsent} with consent` },
        { label: 'Scanner ingest events', value: counts.scannerIngestEvents },
      ]
    : [];

  return (
    <AppLayout currentPath={pathname}>
      <div className="min-h-screen bg-[#F4F6F8] p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[#1E3A5F]">
              <Brain size={22} />
              <h1 className="text-2xl font-bold">AI training baseline</h1>
            </div>
            <p className="max-w-2xl text-sm text-[#6B7280]">
              Phase 0 readiness counts for Carschek AI. Does not train models — tracks whether labels and linkage are
              accumulating. See{' '}
              <Link href="/vehicle-valuation" className="font-semibold text-[#2E75B6] hover:underline">
                valuations
              </Link>
              ,{' '}
              <Link href="/vehicle-outcomes" className="font-semibold text-[#2E75B6] hover:underline">
                outcomes
              </Link>
              , and{' '}
              <Link href="/scanner-ingest" className="font-semibold text-[#2E75B6] hover:underline">
                scanner ingest
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={exporting !== null}
              onClick={() => void exportValuations()}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] disabled:opacity-60"
            >
              {exporting === 'valuations' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Export valuations CSV
            </button>
            <button
              type="button"
              disabled={exporting !== null}
              onClick={() => void exportOutcomes()}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] disabled:opacity-60"
            >
              {exporting === 'outcomes' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Export outcomes CSV
            </button>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151]"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {counts ? (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              counts.phase0TablesReady
                ? 'border-green-200 bg-green-50 text-[#1A7A4A]'
                : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            {counts.phase0TablesReady
              ? 'Phase 0 database tables are ready (or mock mode).'
              : 'Phase 0 tables not fully migrated — run the Phase 0 migration when MySQL is available. Mock UI still works.'}
            <span className="ml-2 text-xs opacity-80">Updated {counts.generatedAt}</span>
          </div>
        ) : null}

        <div className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-[#1F2937]">Phase 0 checklist (safe slice)</h2>
          <ul className="space-y-2">
            {PHASE0_CHECKLIST.map(item => (
              <li key={item.label} className="flex items-center gap-2 text-sm text-[#374151]">
                <CheckCircle2 size={16} className="shrink-0 text-[#1A7A4A]" />
                <Link href={item.href} className="hover:text-[#2E75B6] hover:underline">
                  {item.label}
                </Link>
                <span className="text-[11px] font-semibold text-[#1A7A4A]">Done</span>
              </li>
            ))}
          </ul>
          <h2 className="mb-3 mt-6 text-sm font-bold text-[#1F2937]">Phase 1 checklist (AI-ready assist)</h2>
          <ul className="space-y-2">
            {PHASE1_CHECKLIST.map(item => (
              <li key={item.label} className="flex items-center gap-2 text-sm text-[#374151]">
                <CheckCircle2 size={16} className="shrink-0 text-[#1A7A4A]" />
                <Link href={item.href} className="hover:text-[#2E75B6] hover:underline">
                  {item.label}
                </Link>
                <span className="text-[11px] font-semibold text-[#1A7A4A]">Done</span>
              </li>
            ))}
          </ul>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Loader2 className="animate-spin" size={18} /> Loading baseline…
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(c => (
              <div key={c.label} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold text-[#6B7280]">{c.label}</p>
                <p className="mt-2 text-2xl font-bold text-[#1E3A5F]">{c.value}</p>
                {c.hint ? <p className="mt-1 text-[11px] text-[#9CA3AF]">{c.hint}</p> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
