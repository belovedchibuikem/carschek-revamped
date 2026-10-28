'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Cpu, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import { scannerIngestApi } from '@/lib/api/services';
import { SCANNER_CONTRACT_VERSION, isScannerPayload } from '@/lib/ai/scannerContract';

const SAMPLE = `{
  "deviceId": "CK-SCAN-001",
  "vin": "4T1BE32K34U365910",
  "source": "local_server",
  "schemaVersion": "${SCANNER_CONTRACT_VERSION}",
  "capturedAt": "${new Date().toISOString()}",
  "payload": {
    "schemaVersion": "${SCANNER_CONTRACT_VERSION}",
    "deviceId": "CK-SCAN-001",
    "vin": "4T1BE32K34U365910",
    "capturedAt": "${new Date().toISOString()}",
    "firmwareVersion": "1.0.0",
    "dtcs": [{ "code": "P0300", "status": "confirmed" }],
    "livePids": [{ "pid": "0C", "name": "RPM", "value": 820, "unit": "rpm" }]
  }
}`;

export default function ScannerIngestPage() {
  const pathname = usePathname();
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jsonText, setJsonText] = useState(SAMPLE);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await scannerIngestApi.list(50));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load ingest log');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(jsonText) as Record<string, unknown>;
    } catch {
      toast.error('Invalid JSON');
      return;
    }
    const payload = (body.payload ?? body) as unknown;
    if (!isScannerPayload(payload) && !isScannerPayload(body)) {
      toast.error('Payload needs at least deviceId and capturedAt (see scanner contract)');
      return;
    }
    setSaving(true);
    try {
      await scannerIngestApi.ingest(body);
      toast.success('Ingest accepted');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ingest failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="min-h-screen bg-[#F4F6F8] p-6">
        <div className="mb-6">
          <div className="mb-1 flex items-center gap-2 text-[#1E3A5F]">
            <Cpu size={22} />
            <h1 className="text-2xl font-bold">Scanner ingest</h1>
          </div>
          <p className="max-w-2xl text-sm text-[#6B7280]">
            Accepts local-server / device dumps matching Carschek Scanner Data Contract v1. Safe dry-run for China
            vendor samples — does not alter inspections or valuations.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-[#1F2937]">Paste contract JSON</h2>
            <textarea
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              rows={18}
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 font-mono text-xs"
              spellCheck={false}
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => void submit()}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#1E3A5F] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Submit ingest
            </button>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-[#1F2937]">Recent events</h2>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Loader2 className="animate-spin" size={16} /> Loading…
              </div>
            ) : rows.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">No events yet (mock mode returns empty until you submit).</p>
            ) : (
              <ul className="space-y-2">
                {rows.map((r, i) => (
                  <li key={String(r.id ?? i)} className="rounded-xl border border-[#F4F6F8] bg-[#F9FAFB] px-3 py-2 text-xs">
                    <div className="font-mono font-semibold text-[#1E3A5F]">{String(r.id ?? '—')}</div>
                    <div className="mt-1 text-[#6B7280]">
                      {String(r.deviceId ?? '—')} · VIN {String(r.vin ?? '—')} · {String(r.status ?? '')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
