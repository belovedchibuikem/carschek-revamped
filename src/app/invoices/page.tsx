'use client';
import React, { useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, Search, Send, Eye, Edit2, Trash2, CheckCircle, Clock, AlertCircle, XCircle, FileText, Printer, Copy, MoreVertical, X, Check, ArrowLeft, Building2, RefreshCw, Package } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';

interface LineItem {
  id: string;
  description: string;
  service: string;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientType: 'Corporate' | 'Individual' | 'Dealer';
  issueDate: string;
  dueDate: string;
  items: LineItem[];
  discount: number;
  vatRate: number;
  status: InvoiceStatus;
  notes: string;
  paymentInstructions: string;
  sentAt?: string;
  paidAt?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const SERVICES = [
  'Vehicle Inspection',
  'Re-inspection',
  'Sales Commission',
  'Loan Referral Fee',
  'Fleet Inspection Package',
  'Pre-purchase Inspection',
  'Dealer Onboarding Fee',
  'Report Certification',
  'Express Inspection',
  'Corporate Inspection Package',
];

const MOCK_CLIENTS = [
  { name: 'AutoMart Nigeria Ltd', email: 'finance@automart.ng', phone: '+234 801 234 5678', address: '14 Broad Street, Lagos Island, Lagos', type: 'Corporate' as const },
  { name: 'Lagos Motors Group', email: 'accounts@lagosmotors.com', phone: '+234 802 345 6789', address: '22 Adeola Odeku, Victoria Island, Lagos', type: 'Dealer' as const },
  { name: 'Abuja Car Hub', email: 'billing@abujacarhub.ng', phone: '+234 803 456 7890', address: '5 Wuse Zone 4, Abuja', type: 'Dealer' as const },
  { name: 'PH Auto Dealers', email: 'info@phauto.ng', phone: '+234 804 567 8901', address: '8 Rumuola Road, Port Harcourt', type: 'Corporate' as const },
  { name: 'Chidi Nwosu', email: 'chidi.nwosu@gmail.com', phone: '+234 805 678 9012', address: '3 Okonkwo Close, Enugu', type: 'Individual' as const },
  { name: 'Fixit45 Auto Services', email: 'ops@fixit45.com', phone: '+234 806 789 0123', address: '45 Bode Thomas, Surulere, Lagos', type: 'Corporate' as const },
  { name: 'Ibadan Fleet Solutions', email: 'fleet@ibadanfleet.ng', phone: '+234 807 890 1234', address: '12 Ring Road, Ibadan', type: 'Corporate' as const },
];

const initialInvoices: Invoice[] = [
  {
    id: '1', invoiceNumber: 'INV-2026-001', client: 'AutoMart Nigeria Ltd',
    clientEmail: 'finance@automart.ng', clientPhone: '+234 801 234 5678',
    clientAddress: '14 Broad Street, Lagos Island, Lagos', clientType: 'Corporate',
    issueDate: '2026-04-01', dueDate: '2026-04-15',
    items: [
      { id: 'i1', description: 'Fleet vehicle inspection — 10 units', service: 'Fleet Inspection Package', quantity: 10, unitPrice: 45000 },
      { id: 'i2', description: 'Inspection report certification', service: 'Report Certification', quantity: 10, unitPrice: 5000 },
    ],
    discount: 5, vatRate: 7.5, status: 'Paid', notes: 'Thank you for your continued partnership.',
    paymentInstructions: 'Pay to Carschek Technologies Ltd\nBank: GTBank\nAccount: 0123456789\nSort Code: 058', paidAt: '2026-04-12',
  },
  {
    id: '2', invoiceNumber: 'INV-2026-002', client: 'Lagos Motors Group',
    clientEmail: 'accounts@lagosmotors.com', clientPhone: '+234 802 345 6789',
    clientAddress: '22 Adeola Odeku, Victoria Island, Lagos', clientType: 'Dealer',
    issueDate: '2026-04-05', dueDate: '2026-04-19',
    items: [
      { id: 'i3', description: 'Pre-purchase inspection — 8 vehicles', service: 'Pre-purchase Inspection', quantity: 8, unitPrice: 45000 },
      { id: 'i4', description: 'Sales commission — Toyota Camry 2020', service: 'Sales Commission', quantity: 1, unitPrice: 480000 },
    ],
    discount: 0, vatRate: 7.5, status: 'Sent', notes: '',
    paymentInstructions: 'Pay to Carschek Technologies Ltd\nBank: GTBank\nAccount: 0123456789', sentAt: '2026-04-05',
  },
  {
    id: '3', invoiceNumber: 'INV-2026-003', client: 'Abuja Car Hub',
    clientEmail: 'billing@abujacarhub.ng', clientPhone: '+234 803 456 7890',
    clientAddress: '5 Wuse Zone 4, Abuja', clientType: 'Dealer',
    issueDate: '2026-04-08', dueDate: '2026-04-22',
    items: [
      { id: 'i5', description: 'Vehicle inspection services — April batch', service: 'Vehicle Inspection', quantity: 12, unitPrice: 45000 },
    ],
    discount: 10, vatRate: 7.5, status: 'Draft', notes: 'Pending client confirmation.',
    paymentInstructions: 'Pay to Carschek Technologies Ltd\nBank: GTBank\nAccount: 0123456789',
  },
  {
    id: '4', invoiceNumber: 'INV-2026-004', client: 'PH Auto Dealers',
    clientEmail: 'info@phauto.ng', clientPhone: '+234 804 567 8901',
    clientAddress: '8 Rumuola Road, Port Harcourt', clientType: 'Corporate',
    issueDate: '2026-03-20', dueDate: '2026-04-03',
    items: [
      { id: 'i6', description: 'Corporate inspection package — Q1', service: 'Corporate Inspection Package', quantity: 1, unitPrice: 980000 },
    ],
    discount: 0, vatRate: 7.5, status: 'Overdue', notes: 'Second reminder sent.',
    paymentInstructions: 'Pay to Carschek Technologies Ltd\nBank: GTBank\nAccount: 0123456789',
  },
  {
    id: '5', invoiceNumber: 'INV-2026-005', client: 'Fixit45 Auto Services',
    clientEmail: 'ops@fixit45.com', clientPhone: '+234 806 789 0123',
    clientAddress: '45 Bode Thomas, Surulere, Lagos', clientType: 'Corporate',
    issueDate: '2026-04-09', dueDate: '2026-04-23',
    items: [
      { id: 'i7', description: 'Dealer onboarding fee', service: 'Dealer Onboarding Fee', quantity: 1, unitPrice: 150000 },
      { id: 'i8', description: 'Re-inspection — 3 vehicles', service: 'Re-inspection', quantity: 3, unitPrice: 25000 },
    ],
    discount: 0, vatRate: 7.5, status: 'Sent', notes: '',
    paymentInstructions: 'Pay to Carschek Technologies Ltd\nBank: GTBank\nAccount: 0123456789', sentAt: '2026-04-09',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcInvoice(items: LineItem[], discount: number, vatRate: number) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const discountAmt = subtotal * (discount / 100);
  const afterDiscount = subtotal - discountAmt;
  const vatAmt = afterDiscount * (vatRate / 100);
  const total = afterDiscount + vatAmt;
  return { subtotal, discountAmt, afterDiscount, vatAmt, total };
}

function fmtMoney(n: number) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<InvoiceStatus, { bg: string; text: string; icon: React.ElementType; dot: string }> = {
  Draft:     { bg: 'bg-gray-100',   text: 'text-gray-600',   icon: FileText,    dot: 'bg-gray-400' },
  Sent:      { bg: 'bg-blue-100',   text: 'text-blue-700',   icon: Send,        dot: 'bg-blue-500' },
  Paid:      { bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle, dot: 'bg-green-500' },
  Overdue:   { bg: 'bg-red-100',    text: 'text-red-700',    icon: AlertCircle, dot: 'bg-red-500' },
  Cancelled: { bg: 'bg-gray-100',   text: 'text-gray-500',   icon: XCircle,     dot: 'bg-gray-400' },
};

function StatusPill({ status }: { status: InvoiceStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Ic = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <Ic size={11} />
      {status}
    </span>
  );
}

// ─── QR Code (SVG-based, no external lib) ────────────────────────────────────
function QRCodeDisplay({ value, size = 80 }: { value: string; size?: number }) {
  // Generate a deterministic grid pattern from the value string
  const hash = value.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const cells = 21;
  const cellSize = size / cells;

  const grid: boolean[][] = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      // Finder patterns (corners)
      const inFinder = (
        (r < 8 && c < 8) || (r < 8 && c >= cells - 8) || (r >= cells - 8 && c < 8)
      );
      if (inFinder) {
        const lr = r < 8 ? r : r - (cells - 8);
        const lc = c < 8 ? c : c - (cells - 8);
        const inCorner = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= cells - 8;
        const inBotLeft = r >= cells - 8 && c < 8;
        if (inCorner || inTopRight || inBotLeft) {
          const rr = inBotLeft ? r - (cells - 8) : lr;
          const cc = inTopRight ? c - (cells - 8) : lc;
          if (rr === 0 || rr === 6 || cc === 0 || cc === 6) return true;
          if (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4) return true;
          return false;
        }
      }
      // Data modules — pseudo-random based on hash + position
      const seed = (hash * (r * cells + c + 1)) % 97;
      return seed > 48;
    })
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ imageRendering: 'pixelated' }}>
      <rect width={size} height={size} fill="white" />
      {grid.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#ff5722"
            />
          ) : null
        )
      )}
    </svg>
  );
}

// ─── Invoice Preview (printable) ─────────────────────────────────────────────
function InvoicePreview({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const { subtotal, discountAmt, vatAmt, total } = calcInvoice(invoice.items, invoice.discount, invoice.vatRate);
  const verifyUrl = `https://carschek.com/verify/${invoice.invoiceNumber}`;

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-print-area');
    if (!printContent) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>${invoice.invoiceNumber} — Carschek Invoice</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', Arial, sans-serif; color: #1F2937; background: white; }
        .page { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 3px solid #ff5722; }
        .logo-block h1 { font-size: 24px; font-weight: 800; color: #ff5722; letter-spacing: -0.5px; }
        .logo-block p { font-size: 12px; color: #6B7280; margin-top: 2px; }
        .invoice-meta { text-align: right; }
        .invoice-meta .inv-num { font-size: 20px; font-weight: 700; color: #ff5722; }
        .invoice-meta p { font-size: 12px; color: #6B7280; margin-top: 4px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 8px; background: ${invoice.status === 'Paid' ? '#D1FAE5' : invoice.status === 'Overdue' ? '#FEE2E2' : '#DBEAFE'}; color: ${invoice.status === 'Paid' ? '#065F46' : invoice.status === 'Overdue' ? '#991B1B' : '#1E40AF'}; }
        .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
        .party-block h3 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9CA3AF; margin-bottom: 8px; }
        .party-block p { font-size: 13px; color: #1F2937; line-height: 1.6; }
        .party-block .name { font-weight: 700; font-size: 15px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead tr { background: #ff5722; }
        thead th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; color: white; text-transform: uppercase; letter-spacing: 0.5px; }
        tbody tr { border-bottom: 1px solid #F3F4F6; }
        tbody tr:nth-child(even) { background: #F9FAFB; }
        tbody td { padding: 10px 12px; font-size: 13px; color: #374151; }
        .totals { display: flex; justify-content: flex-end; margin-bottom: 32px; }
        .totals-box { width: 280px; }
        .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #6B7280; border-bottom: 1px solid #F3F4F6; }
        .totals-row.total { font-size: 16px; font-weight: 800; color: #ff5722; border-top: 2px solid #ff5722; border-bottom: none; padding-top: 10px; margin-top: 4px; }
        .footer-grid { display: grid; grid-template-columns: 1fr auto; gap: 24px; padding-top: 24px; border-top: 1px solid #E5E7EB; }
        .payment-block h3 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9CA3AF; margin-bottom: 8px; }
        .payment-block pre { font-size: 12px; color: #374151; white-space: pre-wrap; font-family: monospace; }
        .qr-block { text-align: center; }
        .qr-block p { font-size: 10px; color: #9CA3AF; margin-top: 6px; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 80px; font-weight: 900; color: rgba(30,58,95,0.04); pointer-events: none; white-space: nowrap; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body>
      ${printContent.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-[#E5E7EB] rounded-lg transition-colors">
              <ArrowLeft size={16} className="text-[#6B7280]" />
            </button>
            <div>
              <p className="font-semibold text-[#1F2937] text-sm">{invoice.invoiceNumber}</p>
              <p className="text-xs text-[#6B7280]">{invoice.client}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg text-sm font-medium hover:bg-[#F3F4F6] transition-colors">
              <Printer size={14} /> Print / Save PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-[#E5E7EB] rounded-lg transition-colors">
              <X size={16} className="text-[#6B7280]" />
            </button>
          </div>
        </div>

        {/* Invoice body */}
        <div id="invoice-print-area" className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-4 border-[#ff5722]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 bg-[#ff5722] rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">C</span>
                </div>
                <span className="font-black text-2xl text-[#ff5722] tracking-tight">CARSCHEK</span>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-1">Vehicle Inspection & Certification Services</p>
              <p className="text-xs text-[#9CA3AF]">info@carschek.com · +234 817 362 4953</p>
              <p className="text-xs text-[#9CA3AF]">14 Admiralty Way, Lekki Phase 1, Lagos</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-[#ff5722] tracking-tight">INVOICE</p>
              <p className="text-lg font-bold text-[#374151] mt-1">{invoice.invoiceNumber}</p>
              <StatusPill status={invoice.status} />
            </div>
          </div>

          {/* Parties + Dates */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">Bill To</p>
              <p className="font-bold text-[#1F2937] text-base">{invoice.client}</p>
              <p className="text-sm text-[#6B7280] mt-1">{invoice.clientEmail}</p>
              <p className="text-sm text-[#6B7280]">{invoice.clientPhone}</p>
              <p className="text-sm text-[#6B7280] mt-1 leading-relaxed">{invoice.clientAddress}</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] text-xs font-semibold rounded-full">{invoice.clientType}</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">Invoice Details</p>
              <div className="space-y-1.5">
                <div className="flex justify-end gap-4">
                  <span className="text-sm text-[#9CA3AF]">Issue Date</span>
                  <span className="text-sm font-semibold text-[#1F2937] w-28 text-left">{invoice.issueDate}</span>
                </div>
                <div className="flex justify-end gap-4">
                  <span className="text-sm text-[#9CA3AF]">Due Date</span>
                  <span className={`text-sm font-semibold w-28 text-left ${invoice.status === 'Overdue' ? 'text-red-600' : 'text-[#1F2937]'}`}>{invoice.dueDate}</span>
                </div>
                {invoice.sentAt && (
                  <div className="flex justify-end gap-4">
                    <span className="text-sm text-[#9CA3AF]">Sent</span>
                    <span className="text-sm font-semibold text-[#1F2937] w-28 text-left">{invoice.sentAt}</span>
                  </div>
                )}
                {invoice.paidAt && (
                  <div className="flex justify-end gap-4">
                    <span className="text-sm text-[#9CA3AF]">Paid On</span>
                    <span className="text-sm font-semibold text-green-600 w-28 text-left">{invoice.paidAt}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div className="mb-6 rounded-xl overflow-hidden border border-[#E5E7EB]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#ff5722]">
                  <th className="text-left py-3 px-4 text-white text-xs font-semibold uppercase tracking-wide">#</th>
                  <th className="text-left py-3 px-4 text-white text-xs font-semibold uppercase tracking-wide">Service / Description</th>
                  <th className="text-right py-3 px-4 text-white text-xs font-semibold uppercase tracking-wide">Qty</th>
                  <th className="text-right py-3 px-4 text-white text-xs font-semibold uppercase tracking-wide">Unit Price</th>
                  <th className="text-right py-3 px-4 text-white text-xs font-semibold uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}>
                    <td className="py-3 px-4 text-[#9CA3AF] font-mono text-xs">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#1F2937]">{item.service}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{item.description}</p>
                    </td>
                    <td className="py-3 px-4 text-right text-[#374151]">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-[#374151]">{fmtMoney(item.unitPrice)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-[#1F2937]">{fmtMoney(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-72 space-y-2">
              {(() => {
                const { subtotal, discountAmt, vatAmt, total } = calcInvoice(invoice.items, invoice.discount, invoice.vatRate);
                return (
                  <>
                    <div className="flex justify-between text-sm text-[#6B7280]">
                      <span>Subtotal</span><span className="font-medium text-[#374151]">{fmtMoney(subtotal)}</span>
                    </div>
                    {invoice.discount > 0 && (
                      <div className="flex justify-between text-sm text-[#6B7280]">
                        <span>Discount ({invoice.discount}%)</span>
                        <span className="font-medium text-green-600">−{fmtMoney(discountAmt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-[#6B7280]">
                      <span>VAT ({invoice.vatRate}%)</span>
                      <span className="font-medium text-[#374151]">{fmtMoney(vatAmt)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t-2 border-[#ff5722]">
                      <span className="font-black text-[#ff5722] text-base">TOTAL DUE</span>
                      <span className="font-black text-[#ff5722] text-lg">{fmtMoney(total)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Footer: Payment + QR */}
          <div className="grid grid-cols-[1fr_auto] gap-8 pt-6 border-t border-[#E5E7EB]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">Payment Instructions</p>
              <pre className="text-sm text-[#374151] whitespace-pre-wrap font-sans leading-relaxed">{invoice.paymentInstructions}</pre>
              {invoice.notes && (
                <div className="mt-4 p-3 bg-[#FFF7ED] border border-[#FED7AA] rounded-lg">
                  <p className="text-xs font-semibold text-[#C2410C] mb-1">Notes</p>
                  <p className="text-sm text-[#92400E]">{invoice.notes}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 border-2 border-[#ff5722] rounded-xl">
                <QRCodeDisplay value={verifyUrl} size={96} />
              </div>
              <p className="text-[10px] text-[#9CA3AF] text-center leading-tight">
                Scan to verify<br />this invoice
              </p>
              <p className="text-[9px] text-[#C4C9D4] font-mono text-center">{invoice.invoiceNumber}</p>
            </div>
          </div>

          {/* Legal footer */}
          <div className="mt-8 pt-4 border-t border-[#F3F4F6] text-center">
            <p className="text-[10px] text-[#C4C9D4]">
              This invoice was generated by Carschek Technologies Ltd · RC: 1234567 · VAT Reg: 12345678-0001
            </p>
            <p className="text-[10px] text-[#C4C9D4] mt-0.5">
              Verify at carschek.com/verify/{invoice.invoiceNumber}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create / Edit Invoice Form ───────────────────────────────────────────────
function InvoiceForm({
  initial,
  onSave,
  onCancel,
  nextNumber,
}: {
  initial?: Invoice;
  onSave: (inv: Invoice) => void;
  onCancel: () => void;
  nextNumber: string;
}) {
  const isEdit = !!initial;
  const [clientSearch, setClientSearch] = useState(initial?.client || '');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState(
    initial ? { name: initial.client, email: initial.clientEmail, phone: initial.clientPhone, address: initial.clientAddress, type: initial.clientType } : null as typeof MOCK_CLIENTS[0] | null
  );
  const [issueDate, setIssueDate] = useState(initial?.issueDate || new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(initial?.dueDate || '');
  const [items, setItems] = useState<LineItem[]>(initial?.items || [{ id: genId(), description: '', service: SERVICES[0], quantity: 1, unitPrice: 45000 }]);
  const [discount, setDiscount] = useState(initial?.discount ?? 0);
  const [vatRate] = useState(initial?.vatRate ?? 7.5);
  const [notes, setNotes] = useState(initial?.notes || '');
  const [paymentInstructions, setPaymentInstructions] = useState(initial?.paymentInstructions || 'Pay to Carschek Technologies Ltd\nBank: GTBank\nAccount: 0123456789\nSort Code: 058');
  const [status, setStatus] = useState<InvoiceStatus>(initial?.status || 'Draft');

  const filteredClients = MOCK_CLIENTS.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));
  const { subtotal, discountAmt, vatAmt, total } = calcInvoice(items, discount, vatRate);

  const addItem = () => setItems(prev => [...prev, { id: genId(), description: '', service: SERVICES[0], quantity: 1, unitPrice: 45000 }]);
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof LineItem, value: string | number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const handleSave = () => {
    if (!selectedClient) return;
    const inv: Invoice = {
      id: initial?.id || genId(),
      invoiceNumber: initial?.invoiceNumber || nextNumber,
      client: selectedClient.name,
      clientEmail: selectedClient.email,
      clientPhone: selectedClient.phone,
      clientAddress: selectedClient.address,
      clientType: selectedClient.type,
      issueDate, dueDate, items, discount, vatRate, status, notes, paymentInstructions,
      sentAt: initial?.sentAt,
      paidAt: initial?.paidAt,
    };
    onSave(inv);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="p-2 hover:bg-[#E5E7EB] rounded-lg transition-colors">
              <ArrowLeft size={16} className="text-[#6B7280]" />
            </button>
            <div>
              <p className="font-semibold text-[#1F2937]">{isEdit ? `Edit ${initial!.invoiceNumber}` : `New Invoice — ${nextNumber}`}</p>
              <p className="text-xs text-[#6B7280]">Fill in the details below</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-[#E5E7EB] rounded-lg transition-colors">
            <X size={16} className="text-[#6B7280]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Client selector */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-2">Client</label>
            <div className="relative">
              <input
                value={clientSearch}
                onChange={e => { setClientSearch(e.target.value); setShowClientDropdown(true); }}
                onFocus={() => setShowClientDropdown(true)}
                placeholder="Search or select client..."
                className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65] focus:border-transparent"
              />
              {showClientDropdown && filteredClients.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-20 max-h-52 overflow-y-auto">
                  {filteredClients.map(c => (
                    <button key={c.name} onClick={() => { setSelectedClient(c); setClientSearch(c.name); setShowClientDropdown(false); }}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#F3F4F6] transition-colors text-left">
                      <div className="w-8 h-8 rounded-full bg-[#EFF6FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Building2 size={14} className="text-[#ff8a65]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1F2937]">{c.name}</p>
                        <p className="text-xs text-[#6B7280]">{c.email} · {c.type}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedClient && (
              <div className="mt-2 p-3 bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl flex items-start gap-3">
                <Building2 size={16} className="text-[#0284C7] mt-0.5 flex-shrink-0" />
                <div className="text-xs text-[#0369A1] space-y-0.5">
                  <p className="font-semibold">{selectedClient.name} <span className="font-normal text-[#0284C7]">({selectedClient.type})</span></p>
                  <p>{selectedClient.email} · {selectedClient.phone}</p>
                  <p>{selectedClient.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Dates + Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-2">Issue Date</label>
              <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)}
                className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-2">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-2">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as InvoiceStatus)}
                className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65] bg-white">
                {(['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'] as InvoiceStatus[]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-[#374151] uppercase tracking-wide">Line Items</label>
              <button onClick={addItem}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EFF6FF] text-[#ff8a65] rounded-lg text-xs font-semibold hover:bg-[#DBEAFE] transition-colors">
                <Plus size={12} /> Add Item
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="border border-[#E5E7EB] rounded-xl p-4 bg-[#FAFAFA]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#9CA3AF]">ITEM {idx + 1}</span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(item.id)} className="p-1 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-[#6B7280] mb-1">Service Type</label>
                      <select value={item.service} onChange={e => updateItem(item.id, 'service', e.target.value)}
                        className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65] bg-white">
                        {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#6B7280] mb-1">Description</label>
                      <input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Brief description..."
                        className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-[#6B7280] mb-1">Quantity</label>
                      <input type="number" min={1} value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#6B7280] mb-1">Unit Price (₦)</label>
                      <input type="number" min={0} value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#6B7280] mb-1">Line Total</label>
                      <div className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm font-semibold text-[#1F2937] bg-white">
                        {fmtMoney(item.quantity * item.unitPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discount + Totals */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-2">Discount (%)</label>
              <input type="number" min={0} max={100} value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]" />
            </div>
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm text-[#6B7280]">
                <span>Subtotal</span><span className="font-medium text-[#374151]">{fmtMoney(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-[#6B7280]">
                  <span>Discount ({discount}%)</span>
                  <span className="font-medium text-green-600">−{fmtMoney(discountAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-[#6B7280]">
                <span>VAT (7.5%)</span><span className="font-medium text-[#374151]">{fmtMoney(vatAmt)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5E7EB]">
                <span className="font-bold text-[#ff5722]">Total</span>
                <span className="font-black text-[#ff5722] text-base">{fmtMoney(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes + Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-2">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="Any additional notes for the client..."
                className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65] resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-2">Payment Instructions</label>
              <textarea value={paymentInstructions} onChange={e => setPaymentInstructions(e.target.value)} rows={3}
                className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65] resize-none font-mono" />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB] rounded-b-2xl">
          <button onClick={onCancel} className="px-4 py-2.5 border border-[#D1D5DB] text-[#374151] rounded-xl text-sm font-medium hover:bg-[#F3F4F6] transition-colors">
            Cancel
          </button>
          <div className="flex gap-3">
            <button onClick={() => { setStatus('Draft'); handleSave(); }}
              className="px-4 py-2.5 border border-[#D1D5DB] text-[#374151] rounded-xl text-sm font-medium hover:bg-[#F3F4F6] transition-colors flex items-center gap-2">
              <FileText size={14} /> Save as Draft
            </button>
            <button onClick={handleSave}
              disabled={!selectedClient || items.length === 0}
              className="px-5 py-2.5 bg-[#ff5722] text-white rounded-xl text-sm font-semibold hover:bg-[#e64a19] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Check size={14} /> {isEdit ? 'Update Invoice' : 'Create Invoice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Send Invoice Modal ───────────────────────────────────────────────────────
function SendModal({ invoice, onSend, onClose }: { invoice: Invoice; onSend: () => void; onClose: () => void }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); setTimeout(() => { onSend(); onClose(); }, 1500); }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {sent ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <p className="font-bold text-[#1F2937] text-lg">Invoice Sent!</p>
            <p className="text-sm text-[#6B7280] mt-1">Delivered to {invoice.clientEmail}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#1F2937]">Send Invoice</h3>
              <button onClick={onClose} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors">
                <X size={16} className="text-[#6B7280]" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
                    <FileText size={18} className="text-[#ff8a65]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1F2937] text-sm">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-[#6B7280]">{invoice.client} · {fmtMoney(calcInvoice(invoice.items, invoice.discount, invoice.vatRate).total)}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Recipient Email</label>
                <input defaultValue={invoice.clientEmail}
                  className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Subject</label>
                <input defaultValue={`Invoice ${invoice.invoiceNumber} from Carschek`}
                  className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Message</label>
                <textarea rows={3} defaultValue={`Dear ${invoice.client},\n\nPlease find attached invoice ${invoice.invoiceNumber} for services rendered. Payment is due by ${invoice.dueDate}.\n\nThank you for your business.`}
                  className="w-full border border-[#D1D5DB] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65] resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={onClose} className="flex-1 py-2.5 border border-[#D1D5DB] text-[#374151] rounded-xl text-sm font-medium hover:bg-[#F3F4F6] transition-colors">
                Cancel
              </button>
              <button onClick={handleSend} disabled={sending}
                className="flex-1 py-2.5 bg-[#ff5722] text-white rounded-xl text-sm font-semibold hover:bg-[#e64a19] transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                {sending ? <><RefreshCw size={14} className="animate-spin" /> Sending...</> : <><Send size={14} /> Send Invoice</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Status Update Modal ──────────────────────────────────────────────────────
function StatusModal({ invoice, onUpdate, onClose }: { invoice: Invoice; onUpdate: (s: InvoiceStatus) => void; onClose: () => void }) {
  const statuses: InvoiceStatus[] = ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'];
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#1F2937]">Update Status</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <X size={16} className="text-[#6B7280]" />
          </button>
        </div>
        <p className="text-sm text-[#6B7280] mb-4">{invoice.invoiceNumber} · {invoice.client}</p>
        <div className="space-y-2">
          {statuses.map(s => {
            const cfg = STATUS_CONFIG[s];
            const Ic = cfg.icon;
            const isActive = invoice.status === s;
            return (
              <button key={s} onClick={() => { onUpdate(s); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${isActive ? 'border-[#ff5722] bg-[#EFF6FF]' : 'border-[#E5E7EB] hover:border-[#ff8a65] hover:bg-[#F9FAFB]'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                  <Ic size={15} className={cfg.text} />
                </div>
                <span className={`font-semibold text-sm ${isActive ? 'text-[#ff5722]' : 'text-[#374151]'}`}>{s}</span>
                {isActive && <Check size={14} className="ml-auto text-[#ff5722]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'All'>('All');
  const [showForm, setShowForm] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [sendInvoice, setSendInvoice] = useState<Invoice | null>(null);
  const [statusInvoice, setStatusInvoice] = useState<Invoice | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const nextNumber = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`;

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.client.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'Paid').length,
    sent: invoices.filter(i => i.status === 'Sent').length,
    overdue: invoices.filter(i => i.status === 'Overdue').length,
    draft: invoices.filter(i => i.status === 'Draft').length,
    totalRevenue: invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + calcInvoice(i.items, i.discount, i.vatRate).total, 0),
    outstanding: invoices.filter(i => ['Sent', 'Overdue'].includes(i.status)).reduce((s, i) => s + calcInvoice(i.items, i.discount, i.vatRate).total, 0),
  };

  const handleSave = (inv: Invoice) => {
    setInvoices(prev => {
      const idx = prev.findIndex(i => i.id === inv.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = inv; return next; }
      return [inv, ...prev];
    });
    setShowForm(false);
    setEditInvoice(null);
  };

  const handleDelete = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
    setOpenMenuId(null);
  };

  const handleStatusUpdate = (id: string, status: InvoiceStatus) => {
    setInvoices(prev => prev.map(i => i.id === id ? {
      ...i, status,
      sentAt: status === 'Sent' ? new Date().toISOString().slice(0, 10) : i.sentAt,
      paidAt: status === 'Paid' ? new Date().toISOString().slice(0, 10) : i.paidAt,
    } : i));
  };

  const handleSend = (id: string) => {
    handleStatusUpdate(id, 'Sent');
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F4F6F8]">
        {/* Page header */}
        <div className="bg-white border-b border-[#E5E7EB] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#1F2937]">Invoice Management</h1>
              <p className="text-sm text-[#6B7280] mt-0.5">Generate, send, and track invoices for all Carschek services</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#ff5722] text-white rounded-xl text-sm font-semibold hover:bg-[#e64a19] transition-colors shadow-sm">
              <Plus size={16} /> Create Invoice
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Total Invoiced</span>
                <div className="w-8 h-8 bg-[#EFF6FF] rounded-lg flex items-center justify-center">
                  <FileText size={15} className="text-[#ff8a65]" />
                </div>
              </div>
              <p className="text-2xl font-black text-[#1F2937]">{stats.total}</p>
              <p className="text-xs text-[#6B7280] mt-1">{stats.draft} draft · {stats.sent} sent</p>
            </div>
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Revenue Collected</span>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={15} className="text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-black text-[#1F2937]">{fmtMoney(stats.totalRevenue)}</p>
              <p className="text-xs text-green-600 mt-1">{stats.paid} paid invoices</p>
            </div>
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Outstanding</span>
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock size={15} className="text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-black text-[#1F2937]">{fmtMoney(stats.outstanding)}</p>
              <p className="text-xs text-amber-600 mt-1">{stats.sent} awaiting payment</p>
            </div>
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Overdue</span>
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle size={15} className="text-red-600" />
                </div>
              </div>
              <p className="text-2xl font-black text-[#1F2937]">{stats.overdue}</p>
              <p className="text-xs text-red-600 mt-1">Requires immediate follow-up</p>
            </div>
          </div>

          {/* Overdue alert */}
          {stats.overdue > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-red-700 text-sm">{stats.overdue} Overdue Invoice{stats.overdue > 1 ? 's' : ''}</p>
                <p className="text-xs text-red-600 mt-0.5">These invoices are past their due date. Send reminders or update their status.</p>
              </div>
              <button onClick={() => setStatusFilter('Overdue')}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors">
                View Overdue
              </button>
            </div>
          )}

          {/* Filters + Search */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by client or invoice number..."
                  className="w-full pl-9 pr-4 py-2.5 border border-[#D1D5DB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['All', 'Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'] as const).map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${statusFilter === s ? 'bg-[#ff5722] text-white' : 'bg-[#F4F6F8] text-[#6B7280] hover:bg-[#E5E7EB]'}`}>
                    {s}
                    {s !== 'All' && (
                      <span className="ml-1.5 opacity-70">
                        ({invoices.filter(i => i.status === s).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Invoice table */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    {['Invoice #', 'Client', 'Issue Date', 'Due Date', 'Amount', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 bg-[#F4F6F8] rounded-2xl flex items-center justify-center">
                            <FileText size={24} className="text-[#D1D5DB]" />
                          </div>
                          <p className="font-semibold text-[#6B7280]">No invoices found</p>
                          <p className="text-xs text-[#9CA3AF]">Try adjusting your filters or create a new invoice</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map(inv => {
                      const { total } = calcInvoice(inv.items, inv.discount, inv.vatRate);
                      return (
                        <tr key={inv.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_CONFIG[inv.status].dot}`} />
                              <span className="font-mono text-xs font-bold text-[#ff5722]">{inv.invoiceNumber}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-semibold text-[#1F2937]">{inv.client}</p>
                            <p className="text-xs text-[#9CA3AF]">{inv.clientType}</p>
                          </td>
                          <td className="py-4 px-4 text-[#6B7280] text-xs">{inv.issueDate}</td>
                          <td className="py-4 px-4">
                            <span className={`text-xs font-medium ${inv.status === 'Overdue' ? 'text-red-600 font-bold' : 'text-[#6B7280]'}`}>
                              {inv.dueDate || '—'}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-bold text-[#1F2937]">{fmtMoney(total)}</td>
                          <td className="py-4 px-4"><StatusPill status={inv.status} /></td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => setPreviewInvoice(inv)}
                                title="Preview"
                                className="p-1.5 hover:bg-[#EFF6FF] rounded-lg transition-colors text-[#ff8a65]">
                                <Eye size={14} />
                              </button>
                              <button onClick={() => { setEditInvoice(inv); setShowForm(true); }}
                                title="Edit"
                                className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors text-[#6B7280]">
                                <Edit2 size={14} />
                              </button>
                              {inv.status !== 'Paid' && inv.status !== 'Cancelled' && (
                                <button onClick={() => setSendInvoice(inv)}
                                  title="Send"
                                  className="p-1.5 hover:bg-[#F0FDF4] rounded-lg transition-colors text-green-600">
                                  <Send size={14} />
                                </button>
                              )}
                              <button onClick={() => setStatusInvoice(inv)}
                                title="Update Status"
                                className="p-1.5 hover:bg-[#FFF7ED] rounded-lg transition-colors text-amber-600">
                                <RefreshCw size={14} />
                              </button>
                              {/* More menu */}
                              <div className="relative">
                                <button onClick={() => setOpenMenuId(openMenuId === inv.id ? null : inv.id)}
                                  className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors text-[#9CA3AF]">
                                  <MoreVertical size={14} />
                                </button>
                                {openMenuId === inv.id && (
                                  <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-20 w-40 py-1">
                                    <button onClick={() => { setPreviewInvoice(inv); setOpenMenuId(null); }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6] transition-colors">
                                      <Printer size={13} /> Print / PDF
                                    </button>
                                    <button onClick={() => { navigator.clipboard?.writeText(`https://carschek.com/verify/${inv.invoiceNumber}`); setOpenMenuId(null); }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6] transition-colors">
                                      <Copy size={13} /> Copy Link
                                    </button>
                                    <div className="border-t border-[#F3F4F6] my-1" />
                                    <button onClick={() => handleDelete(inv.id)}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                      <Trash2 size={13} /> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div className="px-4 py-3 border-t border-[#F3F4F6] bg-[#F9FAFB] flex items-center justify-between">
                <p className="text-xs text-[#9CA3AF]">Showing {filtered.length} of {invoices.length} invoices</p>
                <p className="text-xs font-semibold text-[#374151]">
                  Total shown: {fmtMoney(filtered.reduce((s, i) => s + calcInvoice(i.items, i.discount, i.vatRate).total, 0))}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <InvoiceForm
          initial={editInvoice || undefined}
          nextNumber={nextNumber}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditInvoice(null); }}
        />
      )}
      {previewInvoice && (
        <InvoicePreview invoice={previewInvoice} onClose={() => setPreviewInvoice(null)} />
      )}
      {sendInvoice && (
        <SendModal
          invoice={sendInvoice}
          onSend={() => handleSend(sendInvoice.id)}
          onClose={() => setSendInvoice(null)}
        />
      )}
      {statusInvoice && (
        <StatusModal
          invoice={statusInvoice}
          onUpdate={(s) => handleStatusUpdate(statusInvoice.id, s)}
          onClose={() => setStatusInvoice(null)}
        />
      )}

      {/* Click-outside to close menus */}
      {openMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}
    </AppLayout>
  );
}
