'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowRightLeft,
  Check,
  ChevronRight,
  Database,
  FileSpreadsheet,
  Loader2,
  Plug,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { appendReconciliationEvent } from '@/lib/localActivity';

const STORAGE_KEY = 'carschek-migration-connection-v1';

type StepId = 1 | 2 | 3 | 4 | 5;
type ConnectMethod = 'api' | 'csv';

const ENTITIES = [
  { id: 'brands', label: 'Vehicle Brands', count: 8 },
  { id: 'models', label: 'Car Models', count: 24 },
  { id: 'years', label: 'Car Years', count: 35 },
  { id: 'cars', label: 'Cars / Vehicles', count: 33 },
  { id: 'appointments', label: 'Inspection Appointments', count: 89 },
  { id: 'reports', label: 'Inspection Reports', count: 41 },
  { id: 'customers', label: 'Customers / Contacts', count: 156 },
  { id: 'inspectors', label: 'Inspectors', count: 12 },
  { id: 'offers', label: 'Offers', count: 23 },
  { id: 'activity', label: 'Activity Logs', count: 1240 },
  { id: 'documents', label: 'Document Files', count: 0, note: 'Requires manual re-upload after migration' },
] as const;

const STEPS: { id: StepId; title: string }[] = [
  { id: 1, title: 'Connect' },
  { id: 2, title: 'Scan & Select' },
  { id: 3, title: 'Validate' },
  { id: 4, title: 'Migrate' },
  { id: 5, title: 'Complete' },
];

/** Mock dry-run ledger — replace with API response when backend exists. */
const DRY_RUN_PREVIEW_ROWS: {
  entity: string;
  operation: string;
  records: number;
  outcome: 'ok' | 'warning' | 'error' | 'skipped';
  note: string;
}[] = [
  { entity: 'Vehicle Brands', operation: 'upsert', records: 8, outcome: 'ok', note: 'All keys matched' },
  { entity: 'Car Models', operation: 'upsert', records: 24, outcome: 'ok', note: 'Cascade from brands' },
  { entity: 'Cars / Vehicles', operation: 'insert', records: 32, outcome: 'ok', note: 'New inventory' },
  { entity: 'Cars / Vehicles', operation: 'skip', records: 1, outcome: 'warning', note: 'Duplicate plate in target' },
  { entity: 'Cars / Vehicles', operation: 'error', records: 1, outcome: 'error', note: 'Invalid VIN checksum' },
  { entity: 'Inspection Reports', operation: 'insert', records: 41, outcome: 'ok', note: 'Linked to cars' },
  { entity: 'Document Files', operation: '—', records: 0, outcome: 'skipped', note: 'Re-upload required' },
];

export default function DataMigrationPage() {
  const pathname = usePathname();
  const [step, setStep] = useState<StepId>(1);
  const [method, setMethod] = useState<ConnectMethod>('api');
  const [baseUrl, setBaseUrl] = useState('https://admin.carschek.com/api');
  const [apiToken, setApiToken] = useState('');
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ENTITIES.map(e => [e.id, e.id !== 'documents']))
  );
  const [scanning, setScanning] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationDone, setValidationDone] = useState(false);
  const [dryRunDone, setDryRunDone] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrateProgress, setMigrateProgress] = useState(0);
  const [migrateLog, setMigrateLog] = useState<string[]>([]);
  const [typed, setTyped] = useState('');
  const [summary, setSummary] = useState<{ imported: number; warnings: number; errors: number; ms: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const p = JSON.parse(raw) as {
        method?: ConnectMethod;
        baseUrl?: string;
        connectionOk?: boolean;
      };
      if (p.method) setMethod(p.method);
      if (p.baseUrl) setBaseUrl(p.baseUrl);
      if (typeof p.connectionOk === 'boolean') setConnectionOk(p.connectionOk);
    } catch {
      /* ignore */
    }
  }, []);

  const persistConnection = useCallback(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ method, baseUrl, connectionOk, savedAt: Date.now() })
      );
    } catch {
      /* ignore */
    }
  }, [method, baseUrl, connectionOk]);

  useEffect(() => {
    persistConnection();
  }, [persistConnection]);

  const estimatedRecords = useMemo(() => {
    return ENTITIES.filter(e => selected[e.id]).reduce((s, e) => s + e.count, 0);
  }, [selected]);

  const testConnection = () => {
    setConnectionOk(null);
    toast.message('Testing connection…');
    setTimeout(() => {
      const ok = apiToken.trim().length >= 4 || method === 'csv';
      setConnectionOk(ok);
      toast[ok ? 'success' : 'error'](ok ? 'Connection successful' : 'Invalid token or URL');
    }, 900);
  };

  const scanAgain = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      toast.success('Scan complete — counts refreshed');
    }, 1200);
  };

  const runValidation = () => {
    setValidating(true);
    setValidationDone(false);
    setDryRunDone(false);
    setTimeout(() => {
      setValidating(false);
      setValidationDone(true);
      toast.success('Validation finished');
    }, 1600);
  };

  const runDryRun = () => {
    setValidating(true);
    setTimeout(() => {
      setValidating(false);
      setDryRunDone(true);
      toast.success('Dry run complete — no data was written');
    }, 2000);
  };

  const startMigration = () => {
    if (typed.trim().toUpperCase() !== 'MIGRATE') {
      toast.error('Type MIGRATE to confirm');
      return;
    }
    setMigrating(true);
    setMigrateProgress(0);
    setMigrateLog([]);
    const lines = [
      '✓ Created Brand: Toyota',
      '✓ Created Model: Toyota Camry (Sedan)',
      '✓ Imported Car CK-1041: Toyota Camry 2011 — VIN 4T1BF3EK9BU228086',
      '⚠ Car CK-1036: Duplicate plate detected — flagged for review',
      '✗ Car CK-1039: Invalid VIN checksum — skipped',
    ];
    let i = 0;
    const tick = () => {
      i += 1;
      setMigrateProgress(Math.min(100, Math.floor((i / 40) * 100)));
      if (i <= lines.length) {
        setMigrateLog(prev => [...prev, lines[i - 1]!]);
      }
      if (i < 40) {
        setTimeout(tick, 120);
      } else {
        setMigrating(false);
        setSummary({ imported: 1588, warnings: 4, errors: 1, ms: 720000 });
        appendReconciliationEvent({
          id: `ACT-REC-${Date.now()}`,
          actor: 'Data migration',
          action: 'Reconciliation summary recorded',
          target: '1588 imported · 4 warnings · 1 error',
          targetType: 'migration',
          timestamp: new Date().toISOString(),
          ip: '—',
          role: 'System',
        });
        setStep(5);
        toast.success('Migration complete');
      }
    };
    tick();
  };

  const downloadReport = () => {
    const csv = ['record,status,message', 'CK-1041,imported,ok', 'CK-1039,skipped,invalid VIN'].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'carschek-migration-report.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Report downloaded');
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-6 max-w-6xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-1">Settings</p>
          <h1 className="text-2xl font-heading font-bold text-[#1F2937] flex items-center gap-2">
            <ArrowRightLeft className="text-[#ff5722]" size={26} />
            Data Migration
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Migrate from the legacy Carschek admin into this platform. Super Admin access required.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <nav className="lg:w-52 flex-shrink-0 space-y-1">
            {STEPS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => s.id < step && setStep(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                  step === s.id
                    ? 'bg-[#ff5722] text-white'
                    : s.id < step
                      ? 'text-[#ff5722] hover:bg-[#EEF2FF]'
                      : 'text-[#9CA3AF] cursor-default'
                }`}
              >
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                  {s.id < step ? <Check size={14} /> : s.id}
                </span>
                {s.title}
              </button>
            ))}
          </nav>

          <div className="flex-1 min-w-0 bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-heading font-semibold text-[#1F2937]">Connect to Legacy System</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('api')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-semibold ${
                      method === 'api' ? 'border-[#ff5722] bg-[#EEF2FF] text-[#ff5722]' : 'border-[#E5E7EB] text-[#6B7280]'
                    }`}
                  >
                    <Plug size={18} /> API Connection
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('csv')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-semibold ${
                      method === 'csv' ? 'border-[#ff5722] bg-[#EEF2FF] text-[#ff5722]' : 'border-[#E5E7EB] text-[#6B7280]'
                    }`}
                  >
                    <FileSpreadsheet size={18} /> CSV Export Import
                  </button>
                </div>

                {method === 'api' ? (
                  <div className="space-y-3 max-w-lg">
                    <div>
                      <label className="block text-xs font-semibold text-[#374151] mb-1.5">Base URL</label>
                      <input
                        value={baseUrl}
                        onChange={e => setBaseUrl(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 font-mono text-[13px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#374151] mb-1.5">API token</label>
                      <input
                        type="password"
                        value={apiToken}
                        onChange={e => setApiToken(e.target.value)}
                        placeholder="Paste legacy API token"
                        className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={testConnection}
                      className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-colors"
                    >
                      Test Connection
                    </button>
                    {connectionOk !== null && (
                      <div
                        className={`flex items-center gap-2 text-sm font-medium ${
                          connectionOk ? 'text-[#1A7A4A]' : 'text-[#C0392B]'
                        }`}
                      >
                        {connectionOk ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                        {connectionOk ? 'Connected — credentials stored locally for this wizard' : 'Connection failed — check URL and token'}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] text-sm text-[#4B5563]">
                    <p className="mb-3">Download CSV templates per entity, then use Step 2 after upload (mapping in a later iteration).</p>
                    <button
                      type="button"
                      onClick={() => toast.success('Template download started (mock)')}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F4F6F8]"
                    >
                      <Database size={16} /> Download all templates (ZIP)
                    </button>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1 px-4 py-2.5 bg-[#D35400] text-white text-sm font-bold rounded-xl hover:bg-orange-700"
                  >
                    Continue <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-lg font-heading font-semibold text-[#1F2937]">Select Data to Migrate</h2>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelected(Object.fromEntries(ENTITIES.map(e => [e.id, true])))}
                      className="text-sm font-medium text-[#ff8a65] hover:underline"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelected(Object.fromEntries(ENTITIES.map(e => [e.id, false])))}
                      className="text-sm font-medium text-[#6B7280] hover:underline"
                    >
                      Deselect All
                    </button>
                    <button
                      type="button"
                      onClick={scanAgain}
                      disabled={scanning}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-sm font-medium hover:bg-[#F9FAFB] disabled:opacity-50"
                    >
                      {scanning && <Loader2 className="animate-spin" size={16} />}
                      Scan Again
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[#6B7280]">
                  Estimated time: ~{Math.max(1, Math.round(estimatedRecords / 140))} minutes for {estimatedRecords.toLocaleString()} records
                </p>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {ENTITIES.map(e => (
                    <label
                      key={e.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        e.id === 'documents' ? 'border-amber-200 bg-amber-50/80' : 'border-[#E5E7EB] bg-[#F9FAFB]'
                      } cursor-pointer`}
                    >
                      <input
                        type="checkbox"
                        checked={!!selected[e.id]}
                        onChange={ev =>
                          setSelected(prev => ({ ...prev, [e.id]: ev.target.checked }))
                        }
                        className="w-4 h-4 rounded"
                      />
                      <span className="flex-1 text-sm text-[#1F2937]">{e.label}</span>
                      <span className="text-xs font-semibold text-[#6B7280]">
                        {e.count.toLocaleString()} found
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-between pt-2">
                  <button type="button" onClick={() => setStep(1)} className="text-sm font-medium text-[#6B7280] hover:text-[#1F2937]">
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-1 px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19]"
                  >
                    Continue <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-lg font-heading font-semibold text-[#1F2937]">Pre-Migration Validation</h2>
                <button
                  type="button"
                  onClick={runValidation}
                  disabled={validating}
                  className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {validating && <Loader2 className="animate-spin" size={18} />}
                  Run Validation Checks
                </button>

                {validationDone && (
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="p-4 rounded-xl border border-green-200 bg-green-50">
                      <p className="text-xs font-bold text-green-800 uppercase mb-2">Passed</p>
                      <ul className="text-sm text-green-900 space-y-1">
                        <li>✓ No duplicate VINs in legacy snapshot</li>
                        <li>✓ Brand references resolvable</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                      <p className="text-xs font-bold text-amber-900 uppercase mb-2">Warnings</p>
                      <ul className="text-sm text-amber-950 space-y-1">
                        <li>⚠ 3 cars missing VIN — placeholder on import</li>
                        <li>⚠ 2 inspector emails will merge</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border border-red-200 bg-red-50">
                      <p className="text-xs font-bold text-red-900 uppercase mb-2">Errors</p>
                      <ul className="text-sm text-red-950 space-y-1">
                        <li>✗ 1 invalid plate &quot;ABC&quot; — skip unless fixed</li>
                      </ul>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={runDryRun}
                  disabled={validating}
                  className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-semibold hover:bg-[#F9FAFB] disabled:opacity-60"
                >
                  Dry Run (simulate, no writes)
                </button>
                {dryRunDone && (
                  <div className="space-y-3">
                    <p className="text-sm text-[#1A7A4A] font-medium">Dry run complete — no writes performed (mock).</p>
                    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                            {['Entity', 'Operation', 'Records', 'Outcome', 'Note'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {DRY_RUN_PREVIEW_ROWS.map((row, i) => (
                            <tr key={`${row.entity}-${i}`} className="border-b border-[#F4F6F8] last:border-0">
                              <td className="px-4 py-2.5 text-[#1F2937]">{row.entity}</td>
                              <td className="px-4 py-2.5 font-mono text-xs text-[#6B7280]">{row.operation}</td>
                              <td className="px-4 py-2.5 tabular-nums">{row.records}</td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                    row.outcome === 'ok' ?'bg-green-100 text-green-800'
                                      : row.outcome === 'warning' ?'bg-amber-100 text-amber-900'
                                        : row.outcome === 'error' ?'bg-red-100 text-red-800' :'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {row.outcome}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-[#6B7280] text-xs">{row.note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={() => setStep(2)} className="text-sm font-medium text-[#6B7280] hover:text-[#1F2937]">
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="inline-flex items-center gap-1 px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19]"
                  >
                    Continue <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <h2 className="text-lg font-heading font-semibold text-[#1F2937]">Run Migration</h2>
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-sm text-amber-950">
                  <p className="font-semibold mb-1">Pre-migration warning</p>
                  <p>This will import selected data. Existing records are not deleted. Duplicate VINs and plates are flagged.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                    Type <span className="font-mono font-bold">MIGRATE</span> to confirm
                  </label>
                  <input
                    value={typed}
                    onChange={e => setTyped(e.target.value)}
                    className="w-full max-w-xs px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg font-mono uppercase"
                    placeholder="MIGRATE"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={startMigration}
                    disabled={migrating}
                    className="px-4 py-2.5 bg-[#D35400] text-white text-sm font-bold rounded-xl hover:bg-orange-700 disabled:opacity-60 inline-flex items-center gap-2"
                  >
                    {migrating && <Loader2 className="animate-spin" size={18} />}
                    I Understand — Start Migration
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.message('Pause after current record (mock)')}
                    disabled={!migrating}
                    className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg disabled:opacity-40"
                  >
                    Pause Migration
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.error('Cancel requested — partial import retained (mock)')}
                    className="px-3 py-2 text-sm border border-red-200 text-red-700 rounded-lg"
                  >
                    Cancel Migration
                  </button>
                </div>

                {(migrating || migrateLog.length > 0) && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6B7280]">Progress</span>
                      <span className="font-mono font-semibold text-[#ff5722]">{migrateProgress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
                      <div
                        className="h-full bg-[#ff8a65] transition-all duration-300"
                        style={{ width: `${migrateProgress}%` }}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto rounded-lg bg-[#0F172A] text-[#E2E8F0] text-xs font-mono p-3 space-y-1">
                      {migrateLog.map((line, idx) => (
                        <div key={`${idx}-${line.slice(0, 12)}`}>{line}</div>
                      ))}
                    </div>
                  </div>
                )}

                <button type="button" onClick={() => setStep(3)} className="text-sm font-medium text-[#6B7280] hover:text-[#1F2937]">
                  Back
                </button>
              </div>
            )}

            {step === 5 && summary && (
              <div className="space-y-5">
                <h2 className="text-lg font-heading font-semibold text-[#1F2937]">Migration Complete</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Imported', value: summary.imported, color: 'text-[#1A7A4A]' },
                    { label: 'Warnings', value: summary.warnings, color: 'text-[#D35400]' },
                    { label: 'Errors', value: summary.errors, color: 'text-[#C0392B]' },
                    { label: 'Time', value: `${Math.round(summary.ms / 60000)}m`, color: 'text-[#ff5722]' },
                  ].map(c => (
                    <div key={c.label} className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
                      <p className="text-xs text-[#6B7280] font-semibold uppercase">{c.label}</p>
                      <p className={`text-2xl font-heading font-bold ${c.color}`}>{c.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={downloadReport}
                    className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg"
                  >
                    Download Migration Report
                  </button>
                  <Link
                    href="/cars?flag=migration_warning"
                    className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-semibold hover:bg-[#F9FAFB] inline-flex items-center"
                  >
                    Review Flagged Records
                  </Link>
                  <button
                    type="button"
                    onClick={() => toast.success('Retry queued for failed records (mock)')}
                    className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-semibold"
                  >
                    Retry Failed Records
                  </button>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2.5 bg-[#D35400] text-white text-sm font-bold rounded-xl inline-flex items-center"
                  >
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
