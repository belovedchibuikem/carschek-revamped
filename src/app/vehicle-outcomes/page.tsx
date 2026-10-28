'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AlertTriangle, Download, Loader2, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import { outcomesApi, type OutcomeEventRow } from '@/lib/api/services';
import { downloadCsv } from '@/lib/ai/exportCsv';

const EVENT_TYPES: OutcomeEventRow['eventType'][] = [
  'repair',
  'reinspect',
  'customer_report',
  'warranty',
  'tracker_alert',
  'other',
];

const SYSTEM_AREAS: NonNullable<OutcomeEventRow['systemArea']>[] = [
  'engine',
  'transmission',
  'suspension',
  'electrical',
  'body',
  'brakes',
  'other',
];

function OutcomeFormModal({
  onClose,
  onSave,
  saving,
}: {
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  saving?: boolean;
}) {
  const [form, setForm] = useState({
    vin: '',
    plate: '',
    carId: '',
    inspectionId: '',
    eventType: 'repair' as OutcomeEventRow['eventType'],
    systemArea: 'other' as NonNullable<OutcomeEventRow['systemArea']>,
    severity: 'major' as NonNullable<OutcomeEventRow['severity']>,
    daysAfterInspection: '',
    occurredOn: new Date().toISOString().slice(0, 10),
    description: '',
    costAmount: '',
    trainingConsent: true,
  });

  const submit = async () => {
    if (!form.vin && !form.inspectionId && !form.carId) {
      toast.error('Provide at least VIN, Car ID, or Inspection ID');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Description is required');
      return;
    }
    await onSave({
      vin: form.vin || null,
      plate: form.plate || null,
      carId: form.carId || null,
      inspectionId: form.inspectionId || null,
      eventType: form.eventType,
      systemArea: form.systemArea,
      severity: form.severity,
      daysAfterInspection: form.daysAfterInspection ? Number(form.daysAfterInspection) : null,
      occurredOn: form.occurredOn || null,
      description: form.description,
      costAmount: form.costAmount ? Number(form.costAmount) : null,
      source: 'manual',
      trainingConsent: form.trainingConsent,
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#1E3A5F] px-6 py-4">
          <h2 className="text-base font-bold text-white">Log vehicle outcome</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto p-6">
          <p className="text-xs text-[#6B7280]">
            Record what failed or was repaired after an inspection. These labels train Carschek fault foresight.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#374151]">VIN</label>
              <input
                value={form.vin}
                onChange={e => setForm(f => ({ ...f, vin: e.target.value }))}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#374151]">Inspection ID</label>
              <input
                value={form.inspectionId}
                onChange={e => setForm(f => ({ ...f, inspectionId: e.target.value }))}
                placeholder="INS-RPT-…"
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 font-mono text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#374151]">Car ID</label>
              <input
                value={form.carId}
                onChange={e => setForm(f => ({ ...f, carId: e.target.value }))}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 font-mono text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#374151]">Plate</label>
              <input
                value={form.plate}
                onChange={e => setForm(f => ({ ...f, plate: e.target.value }))}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#374151]">Event type</label>
              <select
                value={form.eventType}
                onChange={e => setForm(f => ({ ...f, eventType: e.target.value as OutcomeEventRow['eventType'] }))}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
              >
                {EVENT_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#374151]">System area</label>
              <select
                value={form.systemArea}
                onChange={e =>
                  setForm(f => ({ ...f, systemArea: e.target.value as NonNullable<OutcomeEventRow['systemArea']> }))
                }
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
              >
                {SYSTEM_AREAS.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#374151]">Severity</label>
              <select
                value={form.severity}
                onChange={e =>
                  setForm(f => ({ ...f, severity: e.target.value as NonNullable<OutcomeEventRow['severity']> }))
                }
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
              >
                <option value="minor">minor</option>
                <option value="major">major</option>
                <option value="critical">critical</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#374151]">Days after inspection</label>
              <input
                type="number"
                value={form.daysAfterInspection}
                onChange={e => setForm(f => ({ ...f, daysAfterInspection: e.target.value }))}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#374151]">Occurred on</label>
              <input
                type="date"
                value={form.occurredOn}
                onChange={e => setForm(f => ({ ...f, occurredOn: e.target.value }))}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#374151]">Cost (₦)</label>
              <input
                type="number"
                value={form.costAmount}
                onChange={e => setForm(f => ({ ...f, costAmount: e.target.value }))}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#374151]">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full resize-none rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-start gap-2 text-xs text-[#374151]">
            <input
              type="checkbox"
              checked={form.trainingConsent}
              onChange={e => setForm(f => ({ ...f, trainingConsent: e.target.checked }))}
              className="mt-0.5"
            />
            Allow use for Carschek AI fault training
          </label>
        </div>
        <div className="flex gap-3 border-t border-[#E5E7EB] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#E5E7EB] py-2.5 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void submit()}
            className="flex-[2] rounded-xl bg-[#1E3A5F] py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save outcome'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VehicleOutcomesPage() {
  const pathname = usePathname();
  const [rows, setRows] = useState<OutcomeEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await outcomesApi.list();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load outcomes');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      await outcomesApi.create(data);
      toast.success('Outcome logged');
      setShowForm(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save outcome');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this outcome event?')) return;
    try {
      await outcomesApi.remove(id);
      toast.success(`Deleted ${id}`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete');
    }
  };

  const exportCsv = () => {
    const consented = rows.filter(r => r.trainingConsent);
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
      consented.map(r => [
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
    toast.success(`Exported ${consented.length} consented outcome(s)`);
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="min-h-screen bg-[#F4F6F8] p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[#1E3A5F]">
              <AlertTriangle size={22} />
              <h1 className="text-2xl font-bold">Vehicle outcomes</h1>
            </div>
            <p className="max-w-2xl text-sm text-[#6B7280]">
              Phase 0 training labels: repairs, re-inspections, and failures after Carschek inspections. Required before
              credible fault prediction.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151]"
            >
              <Download size={16} /> Export training CSV
            </button>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1E3A5F] px-4 py-2.5 text-sm font-bold text-white"
            >
              <Plus size={16} /> Log outcome
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#6B7280]">
              <Loader2 className="animate-spin" size={18} /> Loading…
            </div>
          ) : rows.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-[#6B7280]">
              No outcomes yet. Log the first post-inspection repair or failure to start building labels.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#F9FAFB] text-xs uppercase tracking-wide text-[#6B7280]">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">VIN / Inspection</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Area</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Days</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3">Train</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row.id} className="border-t border-[#E5E7EB]">
                      <td className="px-4 py-3 font-mono text-xs text-[#1E3A5F]">{row.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs">{row.vin || '—'}</div>
                        <div className="font-mono text-[10px] text-[#9CA3AF]">{row.inspectionId || row.carId || ''}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-[#FEF3E8] px-2 py-0.5 text-xs font-semibold text-[#D35400]">
                          {row.eventType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">{row.systemArea || '—'}</td>
                      <td className="px-4 py-3 text-xs capitalize">{row.severity || '—'}</td>
                      <td className="px-4 py-3 text-xs">{row.daysAfterInspection ?? '—'}</td>
                      <td className="px-4 py-3 text-xs">
                        {row.costAmount != null ? `₦${Number(row.costAmount).toLocaleString('en-NG')}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {row.trainingConsent ? (
                          <span className="rounded bg-green-100 px-1.5 py-0.5 font-semibold text-[#1A7A4A]">Yes</span>
                        ) : (
                          <span className="text-[#9CA3AF]">No</span>
                        )}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-xs text-[#374151]">{row.description}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => void handleDelete(row.id)}
                          className="rounded-lg p-2 text-[#C0392B] hover:bg-red-50"
                          aria-label={`Delete ${row.id}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showForm && (
          <OutcomeFormModal onClose={() => setShowForm(false)} onSave={handleSave} saving={saving} />
        )}
      </div>
    </AppLayout>
  );
}
