'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { CRM_CONTACTS } from '@/lib/mockData';
import type {
  ClientType,
  DiscountType,
  FinanceInvoiceListRow,
  InvoiceForOption,
  InvoiceLine,
  PrintableInvoice,
} from '@/lib/finance/invoiceTypes';
import {
  computeInvoiceTotals,
  formatInvoiceMoney,
  generateInvoiceNumber,
} from '@/lib/finance/invoiceTypes';

const INVOICE_FOR_OPTIONS: InvoiceForOption[] = [
  'Inspection Service',
  'Vehicle Sale Commission',
  'Re-inspection Fee',
  'Loan Referral',
  'Dealer Package',
  'Custom',
];

const DEFAULT_PAYMENT = 'Carschek Ltd | GTBank | 0123456789 | Sort: 058-000000';

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function newLine(): InvoiceLine {
  return { id: `ln-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, description: '', qty: 1, unitPrice: 0 };
}

function parseMoneyInput(raw: string): number {
  const n = Number(raw.replace(/,/g, '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function formToPrintable(
  invoiceNumber: string,
  status: string,
  clientType: ClientType,
  clientName: string,
  company: string,
  email: string,
  phone: string,
  billingAddress: string,
  invoiceDate: string,
  dueDate: string,
  invoiceFor: InvoiceForOption | string,
  lines: InvoiceLine[],
  discountType: DiscountType,
  discountValue: number,
  notes: string,
  paymentAccount: string
): PrintableInvoice {
  const cleanLines = lines
    .filter(l => l.description.trim() && l.qty > 0 && l.unitPrice > 0)
    .map(l => ({ description: l.description.trim(), qty: Math.floor(l.qty), unitPrice: l.unitPrice }));
  const { subtotal, discountAmount, vat, total } = computeInvoiceTotals(cleanLines, discountType, discountValue, 0.075);
  return {
    invoiceNumber,
    status,
    clientType,
    clientName: clientName.trim(),
    company: company.trim(),
    email: email.trim(),
    phone: phone.trim(),
    billingAddress: billingAddress.trim(),
    invoiceDate,
    dueDate,
    invoiceFor,
    lines: cleanLines,
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    vatRate: 0.075,
    vat,
    total,
    notes: notes.trim(),
    paymentAccount: paymentAccount.trim() || DEFAULT_PAYMENT,
  };
}

export type CreateInvoiceModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (row: FinanceInvoiceListRow) => void;
};

export function CreateInvoiceModal({ open, onClose, onCreated }: CreateInvoiceModalProps) {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientType, setClientType] = useState<ClientType>('Individual');
  const [clientName, setClientName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [invoiceFor, setInvoiceFor] = useState<InvoiceForOption>('Inspection Service');
  const [lines, setLines] = useState<InvoiceLine[]>([newLine()]);
  const [discountType, setDiscountType] = useState<DiscountType>('₦');
  const [discountValue, setDiscountValue] = useState(0);
  const [notes, setNotes] = useState('Payment due within 30 days from invoice date.');
  const [paymentAccount, setPaymentAccount] = useState(DEFAULT_PAYMENT);
  const descRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setInvoiceNumber(generateInvoiceNumber());
    const t = new Date();
    const iso = t.toISOString().slice(0, 10);
    setInvoiceDate(iso);
    const d = new Date(t);
    d.setDate(d.getDate() + 30);
    setDueDate(d.toISOString().slice(0, 10));
  }, [open]);

  const totals = useMemo(() => {
    const clean = lines
      .filter(l => l.description.trim() && l.qty > 0 && l.unitPrice > 0)
      .map(l => ({ qty: Math.floor(l.qty), unitPrice: l.unitPrice }));
    return computeInvoiceTotals(clean, discountType, discountValue, 0.075);
  }, [lines, discountType, discountValue]);

  const applyContact = (name: string) => {
    const c = CRM_CONTACTS.find(x => x.name.toLowerCase() === name.trim().toLowerCase());
    if (!c) return;
    setEmail(c.email);
    setPhone(c.phone);
    if (c.type === 'Dealer' || c.type === 'Corporate') {
      setClientType(c.type as ClientType);
      setCompany(c.type === 'Dealer' ? c.name : c.name);
    } else {
      setClientType('Individual');
      setCompany('');
    }
  };

  const validateFull = (): string | null => {
    if (!clientName.trim()) return 'Client name is required';
    if (!email.trim()) return 'Email is required';
    if (!EMAIL_OK.test(email.trim())) return 'Enter a valid email';
    if (!invoiceDate) return 'Invoice date is required';
    if (!dueDate) return 'Due date is required';
    if (dueDate < invoiceDate) return 'Due date must be on or after invoice date';
    for (const l of lines) {
      if (!l.description.trim()) continue;
      if (!Number.isInteger(l.qty) || l.qty < 1) return 'Qty must be a positive integer';
      if (l.unitPrice <= 0) return 'Unit price must be greater than 0';
    }
    const hasComplete = lines.some(l => l.description.trim() && l.qty >= 1 && l.unitPrice > 0);
    if (!hasComplete) return 'Complete all line items (description, qty, unit price)';
    return null;
  };

  const validateDraft = (): string | null => {
    if (!invoiceDate) return 'Invoice date is required';
    if (!dueDate) return 'Due date is required';
    if (dueDate < invoiceDate) return 'Due date must be on or after invoice date';
    return null;
  };

  const addLine = () => {
    setLines(prev => [...prev, newLine()]);
    window.setTimeout(() => descRef.current?.focus(), 50);
  };

  const removeLine = (id: string) => {
    setLines(prev => (prev.length <= 1 ? prev : prev.filter(l => l.id !== id)));
  };

  const updateLine = (id: string, patch: Partial<InvoiceLine>) => {
    setLines(prev => prev.map(l => (l.id === id ? { ...l, ...patch } : l)));
  };

  const handlePreview = () => {
    const err = validateFull();
    if (err) {
      toast.error(err);
      return;
    }
    const printable = formToPrintable(
      invoiceNumber,
      'Sent',
      clientType,
      clientName,
      company,
      email,
      phone,
      billingAddress,
      invoiceDate,
      dueDate,
      invoiceFor,
      lines,
      discountType,
      discountValue,
      notes,
      paymentAccount
    );
    try {
      sessionStorage.setItem('ck-invoice-preview', JSON.stringify(printable));
      window.open('/finance/invoices/preview', '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Could not open preview');
    }
  };

  const handleDraft = () => {
    const err = validateDraft();
    if (err) {
      toast.error(err);
      return;
    }
    const printable = formToPrintable(
      invoiceNumber,
      'Draft',
      clientType,
      clientName || '—',
      company,
      email || '—',
      phone,
      billingAddress,
      invoiceDate,
      dueDate,
      invoiceFor,
      lines,
      discountType,
      discountValue,
      notes,
      paymentAccount
    );
    onCreated({
      id: printable.invoiceNumber,
      customer: printable.clientName,
      amount: printable.total,
      date: printable.invoiceDate,
      dueDate: printable.dueDate,
      status: 'Draft',
      printable: { ...printable, status: 'Draft' },
    });
    toast.success(`Draft saved — ${printable.invoiceNumber}`);
    onClose();
  };

  const handleSend = () => {
    const err = validateFull();
    if (err) {
      toast.error(err);
      return;
    }
    const printable = formToPrintable(
      invoiceNumber,
      'Sent',
      clientType,
      clientName,
      company,
      email,
      phone,
      billingAddress,
      invoiceDate,
      dueDate,
      invoiceFor,
      lines,
      discountType,
      discountValue,
      notes,
      paymentAccount
    );
    toast.success(`Invoice ${printable.invoiceNumber} sent to ${printable.email} (simulated)`);
    onCreated({
      id: printable.invoiceNumber,
      customer: printable.clientName,
      amount: printable.total,
      date: printable.invoiceDate,
      dueDate: printable.dueDate,
      status: 'Sent',
      printable,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-invoice-title"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[680px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 id="create-invoice-title" className="text-lg font-heading font-bold text-[#1F2937]">
              Create Invoice
            </h2>
            <p className="mt-1 text-xs text-[#6B7280]">
              Invoice #:{' '}
              <span className="rounded-md bg-[#1E3A5F] px-2 py-0.5 font-mono text-[11px] font-semibold text-white">
                {invoiceNumber}
              </span>
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F4F6F8]" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <datalist id="finance-crm-names">
            {CRM_CONTACTS.map(c => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>

          <section className="mb-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#1E3A5F]">Bill To</p>
            <p className="mb-2 text-xs text-[#6B7280]">Client Type</p>
            <div className="mb-3 grid grid-cols-3 gap-2">
              {(['Individual', 'Dealer', 'Corporate'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setClientType(t)}
                  className={`rounded-xl border py-2 text-xs font-semibold transition ${
                    clientType === t ? 'border-[#1E3A5F] bg-[#1E3A5F] text-white' : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <label className="mb-2 block text-xs font-medium text-[#6B7280]">
              Client Name *
              <input
                list="finance-crm-names"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                onBlur={e => applyContact(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                placeholder="Start typing — CRM contacts"
              />
            </label>
            {(clientType === 'Dealer' || clientType === 'Corporate') && (
              <label className="mb-2 block text-xs font-medium text-[#6B7280]">
                Company
                <input
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                />
              </label>
            )}
            <label className="mb-2 block text-xs font-medium text-[#6B7280]">
              Email *
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
              />
            </label>
            <label className="mb-2 block text-xs font-medium text-[#6B7280]">
              Phone
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-[#6B7280]">
              Billing Address
              <textarea
                value={billingAddress}
                onChange={e => setBillingAddress(e.target.value)}
                rows={2}
                className="mt-1 w-full resize-none rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
              />
            </label>
          </section>

          <section className="mb-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#1E3A5F]">Invoice Details</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-[#6B7280]">
                Invoice Date *
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={e => setInvoiceDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-medium text-[#6B7280]">
                Due Date *
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="mt-3 block text-xs font-medium text-[#6B7280]">
              Invoice For
              <select
                value={invoiceFor}
                onChange={e => setInvoiceFor(e.target.value as InvoiceForOption)}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
              >
                {INVOICE_FOR_OPTIONS.map(o => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-[#1E3A5F]">Line Items</p>
              <button type="button" onClick={addLine} className="text-xs font-semibold text-[#2E75B6] hover:underline">
                + Add Item
              </button>
            </div>
            <div className="space-y-2">
              {lines.map((line, idx) => (
                <div key={line.id} className="grid gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 sm:grid-cols-[1fr_4rem_7rem_6rem_auto]">
                  <input
                    ref={idx === lines.length - 1 ? descRef : undefined}
                    value={line.description}
                    onChange={e => updateLine(line.id, { description: e.target.value })}
                    placeholder="Description *"
                    className="rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-sm sm:col-span-1"
                  />
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={line.qty}
                    onChange={e => updateLine(line.id, { qty: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                    className="rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-sm tabular-nums"
                    title="Qty"
                  />
                  <input
                    value={line.unitPrice ? line.unitPrice.toLocaleString('en-NG') : ''}
                    onChange={e => updateLine(line.id, { unitPrice: parseMoneyInput(e.target.value) })}
                    placeholder="Unit ₦"
                    className="rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-sm tabular-nums"
                    title="Unit price"
                  />
                  <div className="flex items-center text-sm font-semibold tabular-nums text-[#1F2937]">
                    {formatInvoiceMoney(line.qty * line.unitPrice)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line.id)}
                    disabled={lines.length <= 1}
                    className="text-[#C0392B] disabled:opacity-30"
                    aria-label="Remove line"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addLine} className="mt-2 text-xs font-semibold text-[#2E75B6] hover:underline">
              + Add Item
            </button>
          </section>

          <section className="mb-6 rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] p-4 text-sm">
            <div className="ml-auto max-w-xs space-y-2 text-right">
              <div className="flex justify-between gap-4">
                <span className="text-[#6B7280]">Subtotal</span>
                <span className="tabular-nums">{formatInvoiceMoney(totals.subtotal)}</span>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="text-[#6B7280]">Discount</span>
                <div className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setDiscountType('%')}
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${discountType === '%' ? 'bg-[#1E3A5F] text-white' : ''}`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('₦')}
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${discountType === '₦' ? 'bg-[#1E3A5F] text-white' : ''}`}
                  >
                    ₦
                  </button>
                </div>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={discountValue}
                  onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="w-20 rounded-lg border border-[#E5E7EB] px-2 py-1 text-right text-xs tabular-nums"
                />
                <span className="tabular-nums text-[#6B7280]">→ {formatInvoiceMoney(totals.discountAmount)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#6B7280]">VAT (7.5%)</span>
                <span className="tabular-nums">{formatInvoiceMoney(totals.vat)}</span>
              </div>
              <div className="flex justify-between border-t border-[#E5E7EB] pt-2 text-base font-bold text-[#1E3A5F]">
                <span>TOTAL</span>
                <span className="tabular-nums">{formatInvoiceMoney(totals.total)}</span>
              </div>
            </div>
          </section>

          <section className="mb-6">
            <label className="mb-2 block text-xs font-medium text-[#6B7280]">
              Notes / Payment Instructions (optional)
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full resize-none rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-[#6B7280]">
              Payment Account (editable)
              <input
                value={paymentAccount}
                onChange={e => setPaymentAccount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
              />
            </label>
          </section>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-[#E5E7EB] bg-[#F9FAFB] px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#6B7280]">
            Cancel
          </button>
          <button type="button" onClick={handleDraft} className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151]">
            Save as Draft
          </button>
          <button type="button" onClick={handlePreview} className="rounded-xl border border-[#2E75B6] bg-white px-4 py-2.5 text-sm font-semibold text-[#2E75B6]">
            Preview Invoice
          </button>
          <button type="button" onClick={handleSend} className="rounded-xl bg-[#1E3A5F] px-4 py-2.5 text-sm font-bold text-white">
            Send &amp; Save
          </button>
        </div>
      </div>
    </div>
  );
}
