'use client';

import React, { useState, useRef } from 'react';
import { Car, DollarSign, FileText, Printer, Plus, Trash2, X, CheckCircle } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ValuationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ValuationData {
  id: string;
  date: string;
  clientName: string;
  vehicleDescription: string;
  marketValue: number;
  fsv: number;
  conditionValue: number;
  notes: string;
  status: 'draft' | 'final';
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
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

function generateId(): string {
  return `VAL-${Date.now().toString().slice(-6)}`;
}

/** FSV is 70% of the stated market value. */
const FSV_MARKET_RATIO = 0.7;

function calculateFsv(marketValue: number): number {
  if (!marketValue || marketValue <= 0) return 0;
  return Math.round(marketValue * FSV_MARKET_RATIO);
}

// ─── Mock saved valuations ────────────────────────────────────────────────────

const MOCK_VALUATIONS: ValuationData[] = [
  {
    id: 'VAL-001',
    date: 'April 20, 2026',
    clientName: 'KOINS BANK LTD',
    vehicleDescription: 'TOYOTA CAMRY 2004 4T1BE32K34U365910 SGM632AE',
    marketValue: 4000000,
    fsv: 2800000,
    conditionValue: 2000000,
    notes: '',
    status: 'final',
    createdAt: '2026-04-20',
  },
  {
    id: 'VAL-002',
    date: 'April 18, 2026',
    clientName: 'FIRST BANK PLC',
    vehicleDescription: 'HONDA ACCORD 2018 1HGCV1F30JA012345 LND789KJ',
    marketValue: 8500000,
    fsv: 6000000,
    conditionValue: 5200000,
    notes: 'Minor scratches on rear bumper',
    status: 'final',
    createdAt: '2026-04-18',
  },
];

// ─── Valuation Print Report ───────────────────────────────────────────────────

function ValuationPrintReport({ data }: { data: ValuationData }) {
  const rows: Array<{ no: string; qty: string; description: string; unitPrice: string; total: string }> = [
    { no: '', qty: '1', description: data.vehicleDescription, unitPrice: '', total: '' },
    { no: '', qty: '', description: '', unitPrice: '', total: '' },
    { no: '', qty: '', description: 'MARKET VALUE', unitPrice: formatNaira(data.marketValue), total: formatNaira(data.marketValue) },
    { no: '', qty: '', description: '', unitPrice: '', total: '' },
    { no: '', qty: '', description: 'FSV', unitPrice: formatNaira(data.fsv), total: '' },
    { no: '', qty: '', description: '', unitPrice: '', total: '' },
    { no: '', qty: '', description: 'CONDITION VALUE', unitPrice: formatNaira(data.conditionValue), total: '' },
    { no: '', qty: '', description: '', unitPrice: '', total: '' },
    { no: '', qty: '', description: '', unitPrice: '', total: '' },
    { no: '', qty: '', description: '', unitPrice: '', total: '' },
    { no: '', qty: '', description: '', unitPrice: '', total: '' },
    { no: '', qty: '', description: '', unitPrice: '', total: '' },
  ];

  return (
    <div className="valuation-print-report bg-white p-8" style={{ fontFamily: 'Arial, sans-serif', minWidth: 700 }}>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div />
        <div className="text-right">
          <AppLogo size={80} />
        </div>
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#1F2937]">VALUATION PRICE</h1>
      </div>

      {/* Date & Name */}
      <div className="mb-8 space-y-1">
        <div className="flex items-center gap-4">
          <span className="w-16 text-sm font-semibold text-[#374151]">DATE</span>
          <div className="flex-1 border border-[#D1D5DB] px-3 py-1.5 text-sm text-[#1F2937]">{data.date}</div>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-16 text-sm font-semibold text-[#374151]">NAME</span>
          <div className="flex-1 border border-[#D1D5DB] px-3 py-1.5 text-sm font-semibold text-[#1F2937]">{data.clientName}</div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-[#D1D5DB] text-sm">
        <thead>
          <tr className="bg-[#ff5722] text-white">
            <th className="border border-[#D1D5DB] px-3 py-2 text-left font-bold" style={{ width: 60 }}>No.</th>
            <th className="border border-[#D1D5DB] px-3 py-2 text-right font-bold" style={{ width: 80 }}>Quantity</th>
            <th className="border border-[#D1D5DB] px-3 py-2 text-left font-bold">Description</th>
            <th className="border border-[#D1D5DB] px-3 py-2 text-right font-bold" style={{ width: 140 }}>Unit Price</th>
            <th className="border border-[#D1D5DB] px-3 py-2 text-right font-bold" style={{ width: 140 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-[#FEF3E8]' : 'bg-white'}>
              <td className="border border-[#D1D5DB] px-3 py-2 text-[#374151]">{row.no}</td>
              <td className="border border-[#D1D5DB] px-3 py-2 text-right text-[#374151]">{row.qty}</td>
              <td className="border border-[#D1D5DB] px-3 py-2 font-medium text-[#1F2937]">{row.description}</td>
              <td className="border border-[#D1D5DB] px-3 py-2 text-right font-semibold text-[#1F2937]">{row.unitPrice}</td>
              <td className="border border-[#D1D5DB] px-3 py-2 text-right font-semibold text-[#1F2937]">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-sm text-[#374151]">
            <span className="font-bold">Amount in words:</span>{' '}
            <span>{numberToWords(data.marketValue)}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-[#1F2937]">Total</p>
          <p className="text-lg font-black text-[#1F2937]">{formatNaira(data.marketValue)}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Valuation Form Modal ─────────────────────────────────────────────────────

function ValuationFormModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (data: ValuationData) => void;
  initial?: Partial<ValuationData>;
}) {
  const [form, setForm] = useState<Partial<ValuationData>>(() => {
    const base: Partial<ValuationData> = {
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      clientName: '',
      vehicleDescription: '',
      marketValue: 0,
      fsv: 0,
      conditionValue: 0,
      notes: '',
      status: 'draft',
      ...initial,
    };
    const marketValue = Number(base.marketValue) || 0;
    if (marketValue > 0) {
      base.fsv = calculateFsv(marketValue);
    }
    return base;
  });

  const set = (key: keyof ValuationData, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const setMarketValue = (value: number) => {
    setForm(prev => ({
      ...prev,
      marketValue: value,
      fsv: calculateFsv(value),
    }));
  };

  const handleSave = () => {
    if (!form.clientName || !form.vehicleDescription || !form.marketValue) {
      alert('Please fill in Client Name, Vehicle Description, and Market Value');
      return;
    }
    const marketValue = Number(form.marketValue) || 0;
    onSave({
      id: initial?.id ?? generateId(),
      date: form.date ?? '',
      clientName: form.clientName ?? '',
      vehicleDescription: form.vehicleDescription ?? '',
      marketValue,
      fsv: calculateFsv(marketValue),
      conditionValue: Number(form.conditionValue) || 0,
      notes: form.notes ?? '',
      status: 'final',
      createdAt: initial?.createdAt ?? new Date().toISOString().split('T')[0] ?? '',
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
                <input
                  type="text"
                  value={form.date ?? ''}
                  onChange={e => set('date', e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                />
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
                placeholder="e.g. TOYOTA CAMRY 2004 4T1BE32K34U365910 SGM632AE"
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
              />
              <p className="mt-0.5 text-[10px] text-[#9CA3AF]">Format: MAKE MODEL YEAR VIN PLATE</p>
            </div>

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
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#E5E7EB] py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#F4F6F8]">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="flex-[2] rounded-xl bg-[#ff5722] py-2.5 text-sm font-bold text-white hover:bg-[#e64a19]">
            Save Valuation
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Print Preview Modal ──────────────────────────────────────────────────────

function PrintPreviewModal({ data, onClose }: { data: ValuationData; onClose: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-white px-6 py-3 print:hidden">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-[#ff5722]" />
          <span className="font-bold text-[#1F2937]">Valuation Report — {data.id}</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-[#ff5722] px-4 py-2 text-sm font-bold text-white hover:bg-[#e64a19]"
          >
            <Printer size={15} /> Print / Save PDF
          </button>
          <button type="button" onClick={onClose} className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F4F6F8]">
            Close
          </button>
        </div>
      </div>
      {/* Report */}
      <div className="flex-1 overflow-auto bg-[#F4F6F8] p-6 print:bg-white print:p-0">
        <div className="mx-auto max-w-3xl shadow-lg print:shadow-none">
          <ValuationPrintReport data={data} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Valuation Module ────────────────────────────────────────────────────

export default function VehicleValuationPage() {
  const [valuations, setValuations] = useState<ValuationData[]>(MOCK_VALUATIONS);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<ValuationData | undefined>();
  const [printData, setPrintData] = useState<ValuationData | undefined>();
  const [search, setSearch] = useState('');

  const filtered = valuations.filter(v =>
    v.clientName.toLowerCase().includes(search.toLowerCase()) ||
    v.vehicleDescription.toLowerCase().includes(search.toLowerCase()) ||
    v.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (data: ValuationData) => {
    setValuations(prev => {
      const idx = prev.findIndex(v => v.id === data.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = data;
        return updated;
      }
      return [data, ...prev];
    });
    setShowForm(false);
    setEditData(undefined);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this valuation?')) return;
    setValuations(prev => prev.filter(v => v.id !== id));
  };

  const totalMarketValue = valuations.reduce((a, v) => a + v.marketValue, 0);

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {/* Page Header */}
      <div className="border-b border-[#E5E7EB] bg-white px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1F2937]">Vehicle Valuation</h1>
            <p className="mt-0.5 text-sm text-[#6B7280]">Professional vehicle valuation price reports</p>
          </div>
          <button
            type="button"
            onClick={() => { setEditData(undefined); setShowForm(true); }}
            className="flex items-center gap-2 rounded-xl bg-[#ff5722] px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-[#e64a19]"
          >
            <Plus size={16} /> New Valuation
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Valuations', value: String(valuations.length), icon: FileText, color: '#ff5722' },
            { label: 'Total Market Value', value: formatNaira(totalMarketValue), icon: DollarSign, color: '#1A7A4A' },
            { label: 'This Month', value: String(valuations.filter(v => v.createdAt.startsWith('2026-04')).length), icon: Car, color: '#2563EB' },
            { label: 'Final Reports', value: String(valuations.filter(v => v.status === 'final').length), icon: CheckCircle, color: '#7C3AED' },
          ].map(kpi => (
            <div key={kpi.label} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#6B7280]">{kpi.label}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${kpi.color}15` }}>
                  <kpi.icon size={15} style={{ color: kpi.color }} />
                </div>
              </div>
              <p className="mt-2 text-lg font-bold text-[#1F2937]">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by client, vehicle, or ID..."
            className="w-full max-w-md rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
          />
        </div>

        {/* Valuations Table */}
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
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Market Value</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">FSV</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Condition</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F6F8]">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-[#9CA3AF]">
                      No valuations found. Create your first valuation.
                    </td>
                  </tr>
                )}
                {filtered.map(v => (
                  <tr key={v.id} className="hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[#ff5722]">{v.id}</td>
                    <td className="px-4 py-3 text-xs text-[#374151]">{v.date}</td>
                    <td className="px-4 py-3 font-semibold text-[#1F2937]">{v.clientName}</td>
                    <td className="max-w-[200px] px-4 py-3 text-xs text-[#374151]">
                      <span className="line-clamp-2">{v.vehicleDescription}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#1A7A4A]">{formatNaira(v.marketValue)}</td>
                    <td className="px-4 py-3 text-right text-xs text-[#374151]">{formatNaira(v.fsv)}</td>
                    <td className="px-4 py-3 text-right text-xs text-[#374151]">{formatNaira(v.conditionValue)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${v.status === 'final' ? 'bg-green-100 text-[#1A7A4A]' : 'bg-amber-100 text-amber-700'}`}>
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
                          onClick={() => { setEditData(v); setShowForm(true); }}
                          className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-[11px] font-semibold text-[#374151] hover:bg-[#F4F6F8]"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(v.id)}
                          className="rounded-lg border border-red-100 p-1.5 text-[#C0392B] hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <ValuationFormModal
          onClose={() => { setShowForm(false); setEditData(undefined); }}
          onSave={handleSave}
          initial={editData}
        />
      )}

      {/* Print Preview */}
      {printData && (
        <PrintPreviewModal data={printData} onClose={() => setPrintData(undefined)} />
      )}
    </div>
  );
}
