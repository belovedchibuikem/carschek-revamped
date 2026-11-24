'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Car, DollarSign, FileText, Printer, Plus, Trash2, X, CheckCircle, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import { captureElementToPdf } from '@/lib/reportPdf';
import { CARSCHEK_LOGO_PATH } from '@/lib/branding';
import { aiTrainingApi, valuationsApi, type ValuationRow, type VehicleLookupHit } from '@/lib/api/services';
import { mergeParsedIntoForm, parseVehicleDescription } from '@/lib/valuations/parseVehicleDescription';
import { downloadCsv } from '@/lib/ai/exportCsv';
import { ValuationAssistPanel } from '@/components/valuations/ValuationAssistPanel';

// ─── Types ───────────────────────────────────────────────────────────────────

type ValuationData = ValuationRow;


// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

function todayIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Date input value. Accepts YYYY-MM-DD and existing long labels such as "November 24, 2026". */
function toIsoDate(value: string | null | undefined): string {
  const raw = (value ?? '').trim();
  if (!raw) return '';
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${parsed.getFullYear()}-${month}-${day}`;
}

function formatValuationDate(value: string | null | undefined): string {
  const iso = toIsoDate(value);
  if (!iso) return (value ?? '').trim();
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

type LookupField = 'vin' | 'carId' | 'inspectionId';

function lookupIsExact(hit: VehicleLookupHit, query: string, field: LookupField): boolean {
  const compact = query.replace(/\s/g, '').toUpperCase();
  const alnum = compact.replace(/[^A-Z0-9]/g, '');
  if (field === 'vin') {
    const vin = (hit.vin || '').replace(/[^A-Z0-9]/g, '').toUpperCase();
    return alnum.length >= 8 && vin === alnum;
  }
  if (field === 'carId') return (hit.carId || '').toUpperCase() === compact && compact.length >= 4;
  return (hit.inspectionId || '').toUpperCase() === compact && compact.length >= 6;
}

function numberToWords(num: number): string {
  if (num === 0) return 'Zero Naira Only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convert(n: number): string {
    if (n < 20) return ones[n] ?? '';
    if (n < 100) return (tens[Math.floor(n / 10)] ?? '') + (n % 10 !== 0 ? ' ' + (ones[n % 10] ?? '') : '');
    if (n < 1000) return (ones[Math.floor(n / 100)] ?? '') + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
    if (n < 1000000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 1000000000) return convert(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 !== 0 ? ' ' + convert(n % 1000000) : '');
    return convert(Math.floor(n / 1000000000)) + ' Billion' + (n % 1000000000 !== 0 ? ' ' + convert(n % 1000000000) : '');
  }

  return convert(Math.round(num)) + ' Naira Only';
}

/** FSV is 70% of the stated market value. */
const FSV_MARKET_RATIO = 0.7;

function calculateFsv(marketValue: number): number {
  if (!marketValue || marketValue <= 0) return 0;
  return Math.round(marketValue * FSV_MARKET_RATIO);
}

/** Valuation PDF palette — inline styles so html2canvas / print keep color. */
const VAL_ORANGE = '#ff5722';
const VAL_STRIPE = '#FEF3E8';
const VAL_BORDER = '#D1D5DB';
const VAL_INK = '#1F2937';
const VAL_INK_MUTED = '#374151';

const tdStyle = (stripe: boolean): React.CSSProperties => ({
  border: `1px solid ${VAL_BORDER}`,
  padding: '10px 12px',
  fontSize: 14,
  color: VAL_INK_MUTED,
  backgroundColor: stripe ? VAL_STRIPE : '#ffffff',
  verticalAlign: 'middle',
  minHeight: 40,
});

// ─── Valuation Print Report ───────────────────────────────────────────────────

function ValuationPrintReport({ data }: { data: ValuationData }) {
  const fsv = data.fsv > 0 ? data.fsv : calculateFsv(data.marketValue);

  const rows: Array<{ no: string; qty: string; description: string; unitPrice: string; total: string; bold?: boolean }> = [
    { no: '', qty: '1', description: data.vehicleDescription, unitPrice: '', total: '', bold: true },
    { no: '', qty: '', description: '', unitPrice: '', total: '' },
    { no: '', qty: '', description: 'MARKET VALUE', unitPrice: formatNaira(data.marketValue), total: formatNaira(data.marketValue), bold: true },
    { no: '', qty: '', description: '', unitPrice: '', total: '' },
    { no: '', qty: '', description: 'FSV', unitPrice: formatNaira(fsv), total: '', bold: true },
    { no: '', qty: '', description: '', unitPrice: '', total: '' },
    { no: '', qty: '', description: 'CONDITION VALUE', unitPrice: formatNaira(data.conditionValue), total: '', bold: true },
    { no: '', qty: '', description: '', unitPrice: '', total: '' },
    { no: '', qty: '', description: '', unitPrice: '', total: '' },
    { no: '', qty: '', description: '', unitPrice: '', total: '' },
    { no: '', qty: '', description: '', unitPrice: '', total: '' },
    { no: '', qty: '', description: '', unitPrice: '', total: '' },
  ];

  const thStyle: React.CSSProperties = {
    border: `1px solid ${VAL_BORDER}`,
    padding: '10px 12px',
    fontSize: 14,
    fontWeight: 700,
    backgroundColor: VAL_ORANGE,
    color: '#ffffff',
    textAlign: 'left',
  };

  return (
    <div
      id="valuation-print-report"
      className="valuation-print-report"
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        backgroundColor: '#ffffff',
        color: VAL_INK,
        width: '100%',
        maxWidth: 794,
        margin: '0 auto',
        padding: 32,
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CARSCHEK_LOGO_PATH}
          alt="Carschek"
          style={{ height: 72, width: 'auto', objectFit: 'contain' }}
        />
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: '0.02em',
            color: VAL_INK,
            textTransform: 'uppercase',
          }}
        >
          VALUATION PRICE
        </h1>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <span style={{ width: 64, fontSize: 14, fontWeight: 600, color: VAL_INK_MUTED }}>DATE</span>
          <div
            style={{
              flex: 1,
              border: `1px solid ${VAL_BORDER}`,
              padding: '8px 12px',
              fontSize: 14,
              color: VAL_INK,
              backgroundColor: '#ffffff',
            }}
          >
            {formatValuationDate(data.date)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ width: 64, fontSize: 14, fontWeight: 600, color: VAL_INK_MUTED }}>NAME</span>
          <div
            style={{
              flex: 1,
              border: `1px solid ${VAL_BORDER}`,
              padding: '8px 12px',
              fontSize: 14,
              fontWeight: 700,
              color: VAL_INK,
              backgroundColor: '#ffffff',
              textTransform: 'uppercase',
            }}
          >
            {data.clientName}
          </div>
        </div>
      </div>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: `1px solid ${VAL_BORDER}`,
          tableLayout: 'fixed',
        }}
      >
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 56 }}>No.</th>
            <th style={{ ...thStyle, width: 88, textAlign: 'right' }}>Quantity</th>
            <th style={thStyle}>Description</th>
            <th style={{ ...thStyle, width: 140, textAlign: 'right' }}>Unit Price</th>
            <th style={{ ...thStyle, width: 140, textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const stripe = i % 2 === 0;
            const cell = tdStyle(stripe);
            const descWeight = row.bold ? 700 : 400;
            const moneyWeight = row.unitPrice ? 600 : 400;
            return (
              <tr key={i}>
                <td style={cell}>{row.no}</td>
                <td style={{ ...cell, textAlign: 'right' }}>{row.qty}</td>
                <td style={{ ...cell, fontWeight: descWeight, color: VAL_INK }}>{row.description}</td>
                <td style={{ ...cell, textAlign: 'right', fontWeight: moneyWeight, color: VAL_INK }}>{row.unitPrice}</td>
                <td style={{ ...cell, textAlign: 'right', fontWeight: row.total ? 600 : 400, color: VAL_INK }}>{row.total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div
        style={{
          marginTop: 24,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <p style={{ margin: 0, fontSize: 14, color: VAL_INK_MUTED, maxWidth: '60%' }}>
          <span style={{ fontWeight: 700 }}>Amount in words:</span>{' '}
          {numberToWords(data.marketValue)}
        </p>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: VAL_INK }}>Total</p>
          <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 900, color: VAL_INK }}>{formatNaira(data.marketValue)}</p>
        </div>
      </div>
    </div>
  );
}

function VehicleLookupMenu({
  busy,
  miss,
  hits,
  onSelect,
}: {
  busy: boolean;
  miss: boolean;
  hits: VehicleLookupHit[];
  onSelect: (hit: VehicleLookupHit) => void;
}) {
  if (!busy && !miss && hits.length === 0) return null;
  return (
    <div className="mt-1 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-lg">
      {busy ? <p className="px-3 py-2 text-xs text-[#6B7280]">Searching vehicles…</p> : null}
      {!busy && miss ? (
        <p className="px-3 py-2 text-xs text-[#6B7280]">No matching vehicle in the database.</p>
      ) : null}
      {hits.length > 0 ? (
        <ul className="max-h-52 overflow-auto">
          {hits.map((hit, index) => (
            <li key={`${hit.carId ?? ''}-${hit.inspectionId ?? ''}-${hit.vin ?? ''}-${index}`}>
              <button
                type="button"
                onMouseDown={event => {
                  event.preventDefault();
                  onSelect(hit);
                }}
                className="block w-full px-3 py-2 text-left hover:bg-[#FFF3EE]"
              >
                <span className="block text-xs font-semibold text-[#1F2937]">
                  {hit.vehicleDescription || hit.vin || hit.carId || hit.inspectionId}
                </span>
                <span className="mt-0.5 block text-[10px] text-[#6B7280]">
                  {[
                    hit.vin ? `VIN ${hit.vin}` : null,
                    hit.carId,
                    hit.inspectionId,
                    hit.mileage != null ? `${hit.mileage.toLocaleString()} km` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

// ─── Valuation Form Modal ─────────────────────────────────────────────────────

function ValuationFormModal({
  onClose,
  onSave,
  initial,
  saving,
  comps = [],
}: {
  onClose: () => void;
  onSave: (data: Omit<ValuationData, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => void | Promise<void>;
  initial?: Partial<ValuationData>;
  saving?: boolean;
  comps?: ValuationData[];
}) {
  const [form, setForm] = useState<Partial<ValuationData>>(() => {
    const base: Partial<ValuationData> = {
      date: formatValuationDate(todayIsoDate()),
      clientName: '',
      vehicleDescription: '',
      vin: '',
      plate: '',
      carId: '',
      inspectionId: '',
      make: '',
      model: '',
      year: undefined,
      mileage: undefined,
      marketValue: 0,
      fsv: 0,
      conditionValue: 0,
      notes: '',
      status: 'draft',
      trainingConsent: false,
      featureSnapshot: null,
      ...initial,
    };
    const marketValue = Number(base.marketValue) || 0;
    if (marketValue > 0) {
      base.fsv = calculateFsv(marketValue);
    }
    return base;
  });
  const [snapshotStatus, setSnapshotStatus] = useState<'idle' | 'loading' | 'attached' | 'missing'>('idle');
  const [lookupField, setLookupField] = useState<LookupField | null>(null);
  const [lookupHits, setLookupHits] = useState<VehicleLookupHit[]>([]);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupMiss, setLookupMiss] = useState(false);
  const dateRef = useRef<HTMLInputElement>(null);
  const lookupTyped = useRef(false);

  const applyVehicleHit = (hit: VehicleLookupHit) => {
    setLookupField(null);
    setLookupHits([]);
    setLookupMiss(false);
    setLookupBusy(false);
    setForm(prev => ({
      ...prev,
      vin: hit.vin || '',
      plate: hit.plate || '',
      carId: hit.carId || '',
      inspectionId: hit.inspectionId || '',
      make: hit.make || '',
      model: hit.model || '',
      year: hit.year ?? null,
      mileage: hit.mileage ?? null,
      vehicleDescription: hit.vehicleDescription || prev.vehicleDescription || '',
    }));
    if (hit.inspectionId) void attachSnapshotForInspection(hit.inspectionId);
  };

  useEffect(() => {
    if (!lookupField) return;
    const query = String(form[lookupField] ?? '').trim();
    if (query.replace(/[^a-z0-9]/gi, '').length < 3) {
      setLookupHits([]);
      setLookupMiss(false);
      setLookupBusy(false);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLookupBusy(true);
      setLookupMiss(false);
      void valuationsApi
        .lookup(query)
        .then(rows => {
          if (cancelled) return;
          setLookupHits(rows);
          setLookupBusy(false);
          setLookupMiss(rows.length === 0);
          const vinComplete = lookupField === 'vin' && query.replace(/[^a-z0-9]/gi, '').length >= 17;
          const exact = rows.filter(row => lookupIsExact(row, query, lookupField));
          if (lookupTyped.current && vinComplete && rows.length === 1 && exact.length === 1 && exact[0]) {
            lookupTyped.current = false;
            applyVehicleHit(exact[0]);
          }
        })
        .catch(() => {
          if (cancelled) return;
          setLookupHits([]);
          setLookupBusy(false);
          setLookupMiss(true);
        });
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [lookupField, form.vin, form.carId, form.inspectionId]);

  const set = (key: keyof ValuationData, value: string | number | boolean | null | Record<string, unknown>) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const attachSnapshotForInspection = async (inspectionId: string) => {
    const id = inspectionId.trim();
    if (!id) {
      setSnapshotStatus('idle');
      setForm(prev => ({ ...prev, featureSnapshot: null }));
      return;
    }
    setSnapshotStatus('loading');
    const res = await aiTrainingApi.featureSnapshot(id);
    const snap =
      res && typeof res === 'object' && 'snapshot' in res && res.snapshot && typeof res.snapshot === 'object'
        ? (res.snapshot as Record<string, unknown>)
        : res && typeof res === 'object'
          ? (res as Record<string, unknown>)
          : null;
    if (snap) {
      setForm(prev => ({ ...prev, featureSnapshot: snap }));
      setSnapshotStatus('attached');
    } else {
      setForm(prev => ({ ...prev, featureSnapshot: null }));
      setSnapshotStatus('missing');
    }
  };

  const setMarketValue = (value: number) => {
    setForm(prev => ({
      ...prev,
      marketValue: value,
      fsv: calculateFsv(value),
    }));
  };

  const handleSave = () => {
    if (!toIsoDate(form.date)) {
      toast.error('Please pick a date');
      return;
    }
    if (!form.clientName || !form.vehicleDescription || !form.marketValue) {
      toast.error('Please fill in Client Name, Vehicle Description, and Market Value');
      return;
    }
    const marketValue = Number(form.marketValue) || 0;
    void onSave({
      id: initial?.id,
      date: form.date ?? '',
      clientName: form.clientName ?? '',
      vehicleDescription: form.vehicleDescription ?? '',
      vin: form.vin || null,
      plate: form.plate || null,
      carId: form.carId || null,
      inspectionId: form.inspectionId || null,
      make: form.make || null,
      model: form.model || null,
      year: form.year ? Number(form.year) : null,
      mileage: form.mileage != null && form.mileage !== undefined ? Number(form.mileage) : null,
      marketValue,
      fsv: calculateFsv(marketValue),
      conditionValue: Number(form.conditionValue) || 0,
      notes: form.notes ?? '',
      status: 'final',
      trainingConsent: Boolean(form.trainingConsent),
      featureSnapshot: form.featureSnapshot ?? null,
      createdAt: initial?.createdAt,
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#ff5722] px-6 py-4">
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-white" />
            <h2 className="text-base font-bold text-white">
              {initial?.id ? 'Edit Valuation' : 'New Vehicle Valuation'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Date <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input
                    ref={dateRef}
                    type="date"
                    required
                    value={toIsoDate(form.date)}
                    onChange={e => set('date', e.target.value ? formatValuationDate(e.target.value) : '')}
                    className="min-w-0 flex-1 rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#1F2937] [color-scheme:light] focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100"
                  />
                  <button
                    type="button"
                    aria-label="Open calendar"
                    onClick={() => {
                      const el = dateRef.current;
                      if (!el) return;
                      el.focus();
                      try {
                        el.showPicker();
                      } catch {
                        el.click();
                      }
                    }}
                    className="flex h-[42px] w-11 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#374151] hover:bg-[#F4F6F8]"
                  >
                    <Calendar size={16} />
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Client / Bank Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.clientName ?? ''}
                  onChange={e => set('clientName', e.target.value)}
                  placeholder="e.g. KOINS BANK LTD"
                  className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#374151]">Vehicle Description <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.vehicleDescription ?? ''}
                onChange={e => set('vehicleDescription', e.target.value)}
                onBlur={() => {
                  const parsed = parseVehicleDescription(String(form.vehicleDescription ?? ''));
                  setForm(prev => mergeParsedIntoForm(prev, parsed));
                }}
                placeholder="e.g. TOYOTA CAMRY 2004 4T1BE32K34U365910 SGM632AE"
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
              />
              <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
                Format: MAKE MODEL YEAR VIN PLATE — empty linkage fields auto-fill on blur
              </p>
            </div>

            <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <p className="mb-1 text-xs font-semibold text-[#1E3A5F]">AI training linkage (optional)</p>
              <p className="mb-3 text-[10px] text-[#6B7280]">
                Type a VIN, chassis number, car ID, or inspection ID. Select a match to fill the vehicle, including mileage.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">VIN</label>
                  <input
                    type="text"
                    value={form.vin ?? ''}
                    onChange={e => {
                      lookupTyped.current = true;
                      set('vin', e.target.value.toUpperCase());
                      setLookupField('vin');
                    }}
                    onFocus={() => setLookupField('vin')}
                    onBlur={() => {
                      window.setTimeout(() => setLookupField(current => (current === 'vin' ? null : current)), 180);
                    }}
                    placeholder="Search VIN or chassis"
                    autoComplete="off"
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  />
                  {lookupField === 'vin' ? (
                    <VehicleLookupMenu busy={lookupBusy} miss={lookupMiss} hits={lookupHits} onSelect={applyVehicleHit} />
                  ) : null}
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Plate</label>
                  <input
                    type="text"
                    value={form.plate ?? ''}
                    onChange={e => set('plate', e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  />
                </div>
                <div className="relative">
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Car ID</label>
                  <input
                    type="text"
                    value={form.carId ?? ''}
                    onChange={e => {
                      lookupTyped.current = true;
                      set('carId', e.target.value.toUpperCase());
                      setLookupField('carId');
                    }}
                    onFocus={() => setLookupField('carId')}
                    onBlur={() => {
                      window.setTimeout(() => setLookupField(current => (current === 'carId' ? null : current)), 180);
                    }}
                    placeholder="CK-…"
                    autoComplete="off"
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  />
                  {lookupField === 'carId' ? (
                    <VehicleLookupMenu busy={lookupBusy} miss={lookupMiss} hits={lookupHits} onSelect={applyVehicleHit} />
                  ) : null}
                </div>
                <div className="relative">
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Inspection ID</label>
                  <input
                    type="text"
                    value={form.inspectionId ?? ''}
                    onChange={e => {
                      lookupTyped.current = true;
                      set('inspectionId', e.target.value.toUpperCase());
                      setLookupField('inspectionId');
                      setSnapshotStatus('idle');
                    }}
                    onFocus={() => setLookupField('inspectionId')}
                    onBlur={e => {
                      window.setTimeout(() => setLookupField(current => (current === 'inspectionId' ? null : current)), 180);
                      void attachSnapshotForInspection(e.target.value);
                    }}
                    placeholder="INS-RPT-…"
                    autoComplete="off"
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  />
                  {lookupField === 'inspectionId' ? (
                    <VehicleLookupMenu busy={lookupBusy} miss={lookupMiss} hits={lookupHits} onSelect={applyVehicleHit} />
                  ) : null}
                  <p className="mt-0.5 text-[10px] text-[#6B7280]">
                    {snapshotStatus === 'loading'
                      ? 'Fetching feature snapshot…'
                      : snapshotStatus === 'attached' || form.featureSnapshot
                        ? 'Feature snapshot attached'
                        : snapshotStatus === 'missing'
                          ? 'No snapshot found for this inspection'
                          : 'Select a match, or blur to attach the inspection snapshot'}
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Make</label>
                  <input
                    type="text"
                    value={form.make ?? ''}
                    onChange={e => set('make', e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Model</label>
                  <input
                    type="text"
                    value={form.model ?? ''}
                    onChange={e => set('model', e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Year</label>
                  <input
                    type="number"
                    value={form.year ?? ''}
                    onChange={e => set('year', e.target.value ? Number(e.target.value) : (null as unknown as number))}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Mileage</label>
                  <input
                    type="number"
                    value={form.mileage ?? ''}
                    onChange={e => set('mileage', e.target.value ? Number(e.target.value) : (null as unknown as number))}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  />
                </div>
              </div>
              <label className="mt-3 flex items-start gap-2 text-xs text-[#374151]">
                <input
                  type="checkbox"
                  checked={Boolean(form.trainingConsent)}
                  onChange={e => set('trainingConsent', e.target.checked)}
                  className="mt-0.5 rounded border-[#D1D5DB]"
                />
                <span>Allow this valuation to be used for Carschek AI price training (consent).</span>
              </label>
            </div>

            <ValuationAssistPanel
              input={{
                make: form.make,
                model: form.model,
                year: form.year,
                mileage: form.mileage,
                score: form.featureSnapshot && typeof (form.featureSnapshot as { inspection?: { score?: number } }).inspection?.score === 'number'
                  ? (form.featureSnapshot as { inspection: { score: number } }).inspection.score
                  : null,
                comps: comps.map(c => ({
                  make: c.make,
                  model: c.model,
                  year: c.year,
                  mileage: c.mileage,
                  marketValue: c.marketValue,
                  conditionValue: c.conditionValue,
                })),
              }}
              onApply={({ marketValue, fsv, conditionValue }) => {
                setForm(prev => ({
                  ...prev,
                  marketValue,
                  fsv,
                  conditionValue,
                }));
                toast.message('Suggestions applied — review before saving');
              }}
            />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Market Value (₦) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={form.marketValue ?? 0}
                  onChange={e => setMarketValue(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                />
                {(form.marketValue ?? 0) > 0 && (
                  <p className="mt-0.5 text-[10px] text-[#6B7280]">{formatNaira(Number(form.marketValue))}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">FSV (₦)</label>
                <input
                  type="number"
                  readOnly
                  value={form.fsv ?? 0}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-sm text-[#1F2937] focus:outline-none"
                  aria-describedby="fsv-hint"
                />
                <p id="fsv-hint" className="mt-0.5 text-[10px] text-[#6B7280]">
                  Auto-calculated at 70% of market value
                  {(form.fsv ?? 0) > 0 ? ` · ${formatNaira(Number(form.fsv))}` : ''}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Condition Value (₦)</label>
                <input
                  type="number"
                  value={form.conditionValue ?? 0}
                  onChange={e => set('conditionValue', Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                />
                {(form.conditionValue ?? 0) > 0 && (
                  <p className="mt-0.5 text-[10px] text-[#6B7280]">{formatNaira(Number(form.conditionValue))}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#374151]">Notes / Remarks</label>
              <textarea
                value={form.notes ?? ''}
                onChange={e => set('notes', e.target.value)}
                rows={3}
                placeholder="Any additional notes about the vehicle condition..."
                className="w-full resize-none rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-[#E5E7EB] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-[#E5E7EB] py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#F4F6F8] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="flex-[2] rounded-xl bg-[#ff5722] py-2.5 text-sm font-bold text-white hover:bg-[#e64a19] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Valuation'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Print Preview Modal ──────────────────────────────────────────────────────

function PrintPreviewModal({ data, onClose }: { data: ValuationData; onClose: () => void }) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    const el = reportRef.current;
    if (!el) {
      toast.error('Report not ready');
      return;
    }
    setDownloading(true);
    try {
      await captureElementToPdf(el, `valuation-${data.id}.pdf`, { marginMm: 10, windowWidth: 794 });
      toast.success('PDF downloaded');
    } catch {
      toast.error('Could not generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleBrowserPrint = () => {
    document.documentElement.classList.add('ck-valuation-print');
    const off = () => document.documentElement.classList.remove('ck-valuation-print');
    window.addEventListener('afterprint', off, { once: true });
    window.print();
  };

  return (
    <div className="valuation-print-modal fixed inset-0 z-[200] flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-white px-6 py-3 print:hidden">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-[#ff5722]" />
          <span className="font-bold text-[#1F2937]">Valuation Report — {data.id}</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void handleDownloadPdf()}
            disabled={downloading}
            className="flex items-center gap-2 rounded-xl bg-[#ff5722] px-4 py-2 text-sm font-bold text-white hover:bg-[#e64a19] disabled:opacity-60"
          >
            {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {downloading ? 'Generating…' : 'Download PDF'}
          </button>
          <button
            type="button"
            onClick={handleBrowserPrint}
            className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F4F6F8]"
          >
            <Printer size={15} /> Print
          </button>
          <button type="button" onClick={onClose} className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F4F6F8]">
            Close
          </button>
        </div>
      </div>
      {/* Report */}
      <div className="flex-1 overflow-auto bg-[#F4F6F8] p-6 print:bg-white print:p-0">
        <div ref={reportRef} className="mx-auto max-w-[794px] shadow-lg print:shadow-none">
          <ValuationPrintReport data={data} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Valuation Module ────────────────────────────────────────────────────

export default function VehicleValuationPage() {
  const pathname = usePathname();
  const [valuations, setValuations] = useState<ValuationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<ValuationData | undefined>();
  const [printData, setPrintData] = useState<ValuationData | undefined>();
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await valuationsApi.list();
      setValuations(Array.isArray(rows) ? rows : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load valuations');
      setValuations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const q = search.toLowerCase().trim();
  const filtered = valuations.filter(v => {
    if (!q) return true;
    return (
      v.clientName.toLowerCase().includes(q) ||
      v.vehicleDescription.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q) ||
      (v.vin || '').toLowerCase().includes(q) ||
      (v.inspectionId || '').toLowerCase().includes(q) ||
      (v.carId || '').toLowerCase().includes(q) ||
      (v.plate || '').toLowerCase().includes(q)
    );
  });

  const exportTrainingCsv = () => {
    const rows = valuations.filter(v => v.trainingConsent);
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
  };

  const handleSave = async (
    data: Omit<ValuationData, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
  ) => {
    setSaving(true);
    try {
      const payload = {
        date: data.date,
        clientName: data.clientName,
        vehicleDescription: data.vehicleDescription,
        vin: data.vin ?? null,
        plate: data.plate ?? null,
        carId: data.carId ?? null,
        inspectionId: data.inspectionId ?? null,
        make: data.make ?? null,
        model: data.model ?? null,
        year: data.year ?? null,
        mileage: data.mileage ?? null,
        marketValue: data.marketValue,
        fsv: data.fsv,
        conditionValue: data.conditionValue,
        notes: data.notes,
        status: data.status,
        trainingConsent: Boolean(data.trainingConsent),
        featureSnapshot: data.featureSnapshot ?? null,
      };
      if (data.id) {
        await valuationsApi.update(data.id, payload);
        toast.success(`Valuation ${data.id} updated`);
      } else {
        const created = await valuationsApi.create(payload);
        toast.success(`Valuation ${created.id} saved`);
      }
      setShowForm(false);
      setEditData(undefined);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save valuation');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this valuation?')) return;
    try {
      await valuationsApi.remove(id);
      toast.success(`Deleted ${id}`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete valuation');
    }
  };

  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const totalMarketValue = valuations.reduce((a, v) => a + (Number(v.marketValue) || 0), 0);

  return (
    <AppLayout currentPath={pathname}>
    <div className="min-h-screen bg-[#F4F6F8]">
      <div className="border-b border-[#E5E7EB] bg-white px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1F2937]">Vehicle Valuation</h1>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              Professional vehicle valuation price reports ·{' '}
              <Link href="/vehicle-outcomes" className="font-semibold text-[#2E75B6] hover:underline">
                Log outcomes
              </Link>
              {' · '}
              <Link href="/ai-training" className="font-semibold text-[#2E75B6] hover:underline">
                AI training baseline
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportTrainingCsv}
              className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#F4F6F8]"
            >
              <Download size={16} /> Export training CSV
            </button>
            <button
              type="button"
              onClick={() => {
                setEditData(undefined);
                setShowForm(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-[#ff5722] px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-[#e64a19]"
            >
              <Plus size={16} /> New Valuation
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Valuations', value: String(valuations.length), icon: FileText, color: '#ff5722' },
            { label: 'Total Market Value', value: formatNaira(totalMarketValue), icon: DollarSign, color: '#1A7A4A' },
            {
              label: 'This Month',
              value: String(valuations.filter(v => (v.createdAt || '').startsWith(monthPrefix)).length),
              icon: Car,
              color: '#2563EB',
            },
            {
              label: 'Final Reports',
              value: String(valuations.filter(v => v.status === 'final').length),
              icon: CheckCircle,
              color: '#7C3AED',
            },
          ].map(kpi => (
            <div key={kpi.label} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#6B7280]">{kpi.label}</p>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${kpi.color}15` }}
                >
                  <kpi.icon size={15} style={{ color: kpi.color }} />
                </div>
              </div>
              <p className="mt-2 text-lg font-bold text-[#1F2937]">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by client, vehicle, VIN, inspection, or ID..."
            className="w-full max-w-md rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
          />
          {loading ? <span className="text-xs text-[#6B7280]">Loading…</span> : null}
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="border-b border-[#E5E7EB] px-5 py-4">
            <h2 className="font-bold text-[#1F2937]">Valuation Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F4F6F8] bg-[#F9FAFB]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">AI link</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Market Value</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">FSV</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Condition</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F6F8]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-sm text-[#9CA3AF]">
                      {loading ? 'Loading valuations…' : 'No valuations found. Create your first valuation.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(v => (
                    <tr key={v.id} className="hover:bg-[#FAFAFA]">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-[#ff5722]">{v.id}</td>
                      <td className="px-4 py-3 text-xs text-[#374151]">{formatValuationDate(v.date)}</td>
                      <td className="px-4 py-3 font-semibold text-[#1F2937]">{v.clientName}</td>
                      <td className="max-w-[200px] px-4 py-3 text-xs text-[#374151]">
                        <span className="line-clamp-2">{v.vehicleDescription}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {v.vin ? (
                            <span className="rounded bg-[#E8F1FB] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#1E3A5F]">
                              VIN
                            </span>
                          ) : null}
                          {v.inspectionId ? (
                            <span className="rounded bg-[#FEF3E8] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#D35400]">
                              INS
                            </span>
                          ) : null}
                          {v.trainingConsent ? (
                            <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-[#1A7A4A]">
                              Train
                            </span>
                          ) : null}
                          {v.featureSnapshot ? (
                            <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
                              Snap
                            </span>
                          ) : null}
                          {!v.vin && !v.inspectionId && !v.trainingConsent ? (
                            <span className="text-[10px] text-[#9CA3AF]">—</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-[#1A7A4A]">{formatNaira(v.marketValue)}</td>
                      <td className="px-4 py-3 text-right text-xs text-[#374151]">{formatNaira(v.fsv)}</td>
                      <td className="px-4 py-3 text-right text-xs text-[#374151]">{formatNaira(v.conditionValue)}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            v.status === 'final' ? 'bg-green-100 text-[#1A7A4A]' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {v.status === 'final' ? 'Final' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPrintData(v)}
                            className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-[11px] font-semibold text-[#374151] hover:bg-[#F4F6F8]"
                            title="View / Print Report"
                          >
                            <Printer size={12} /> Report
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditData(v);
                              setShowForm(true);
                            }}
                            className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-[11px] font-semibold text-[#374151] hover:bg-[#F4F6F8]"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(v.id)}
                            className="rounded-lg border border-red-100 p-1.5 text-[#C0392B] hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <ValuationFormModal
          key={editData?.id ?? 'new'}
          initial={editData}
          saving={saving}
          comps={valuations.filter(v => v.id !== editData?.id)}
          onClose={() => {
            if (saving) return;
            setShowForm(false);
            setEditData(undefined);
          }}
          onSave={handleSave}
        />
      )}
      {printData && <PrintPreviewModal data={printData} onClose={() => setPrintData(undefined)} />}
    </div>
    </AppLayout>
  );
}
