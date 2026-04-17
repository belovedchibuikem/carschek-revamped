'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import AppLogo from '@/components/ui/AppLogo';
import type { PrintableInvoice } from '@/lib/finance/invoiceTypes';
import { formatInvoiceMoney } from '@/lib/finance/invoiceTypes';

const QRCodeSVG = dynamic(() => import('qrcode.react').then(m => m.QRCodeSVG), { ssr: false });

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function parsePaymentAccount(s: string): { name: string; bank: string; account: string; sort: string } {
  const parts = s.split('|').map(x => x.trim());
  return {
    name: parts[0] ?? 'Carschek Ltd',
    bank: parts[1] ?? 'GTBank',
    account: parts[2] ?? '—',
    sort: (parts[3] ?? '').replace(/^Sort:\s*/i, '') || '—',
  };
}

export function InvoicePrintTemplate({ invoice }: { invoice: PrintableInvoice }) {
  const pay = parsePaymentAccount(invoice.paymentAccount);
  const qrUrl = `https://carschek.com/invoice/${encodeURIComponent(invoice.invoiceNumber)}`;
  const vatPct = Math.round(invoice.vatRate * 1000) / 10;

  return (
    <div
      id="invoice-print-target"
      className="box-border bg-white text-[#1F2937]"
      style={{ width: 794, fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, lineHeight: 1.45 }}
    >
      <div className="bg-[#ff5722] px-8 py-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="brightness-0 invert">
              <AppLogo size={48} src="/assets/images/app_logo.png" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-wide">INVOICE</p>
              <p className="font-mono text-sm font-semibold text-white/95">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="flex flex-wrap justify-between gap-6 border-b border-[#E5E7EB] pb-6">
          <div>
            <p className="font-semibold text-[#ff5722]">Carschek Automotive Platform</p>
            <p className="text-[#6B7280]">info@carschek.com</p>
            <p className="text-[#6B7280]">+234 817 362 4953</p>
            <p className="text-[#6B7280]">Lagos, Nigeria</p>
          </div>
          <div className="text-right">
            <p>
              <span className="text-[#6B7280]">Date: </span>
              <span className="font-medium">{formatDisplayDate(invoice.invoiceDate)}</span>
            </p>
            <p>
              <span className="text-[#6B7280]">Due: </span>
              <span className="font-medium">{formatDisplayDate(invoice.dueDate)}</span>
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-8 border-b border-[#E5E7EB] pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#ff5722]">Bill To</p>
            <p className="mt-2 font-semibold text-[#1F2937]">{invoice.clientName}</p>
            {invoice.company ? <p className="text-[#6B7280]">{invoice.company}</p> : null}
            <p className="text-[#6B7280]">{invoice.email}</p>
            <p className="text-[#6B7280]">{invoice.phone}</p>
            <p className="mt-1 whitespace-pre-wrap text-[#6B7280]">{invoice.billingAddress}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#ff5722]">Invoice For</p>
            <p className="mt-2 font-semibold text-[#1F2937]">{invoice.invoiceFor}</p>
          </div>
        </div>

        <table className="mt-6 w-full border-collapse">
          <thead>
            <tr className="bg-[#ff5722] text-left text-white">
              <th className="px-3 py-2 text-xs font-bold uppercase">Description</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Qty</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Unit Price</th>
              <th className="px-3 py-2 text-right text-xs font-bold uppercase">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line, i) => (
              <tr key={i} className="border-b border-[#E5E7EB]">
                <td className="px-3 py-2.5 align-top text-[#374151]">{line.description}</td>
                <td className="px-3 py-2.5 align-top tabular-nums">{line.qty}</td>
                <td className="px-3 py-2.5 align-top tabular-nums">{formatInvoiceMoney(line.unitPrice)}</td>
                <td className="px-3 py-2.5 align-top text-right font-medium tabular-nums">
                  {formatInvoiceMoney(line.qty * line.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end border-b border-[#E5E7EB] pb-6">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Subtotal</span>
              <span className="tabular-nums">{formatInvoiceMoney(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Discount</span>
              <span className="tabular-nums">{formatInvoiceMoney(invoice.discountAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">VAT ({vatPct}%)</span>
              <span className="tabular-nums">{formatInvoiceMoney(invoice.vat)}</span>
            </div>
            <div className="mt-2 flex justify-between bg-[#ff5722] px-3 py-2 text-white">
              <span className="font-bold">TOTAL</span>
              <span className="font-bold tabular-nums">{formatInvoiceMoney(invoice.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 border-b border-[#E5E7EB] pb-6">
          <p className="text-xs font-bold uppercase tracking-wide text-[#ff5722]">Payment Details</p>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-[#374151]">
            <p>
              <span className="text-[#6B7280]">Bank: </span>
              {pay.bank}
            </p>
            <p>
              <span className="text-[#6B7280]">Account Name: </span>
              {pay.name}
            </p>
            <p>
              <span className="text-[#6B7280]">Account Number: </span>
              {pay.account}
            </p>
            <p>
              <span className="text-[#6B7280]">Sort: </span>
              {pay.sort}
            </p>
            <p className="col-span-2 mt-1">
              <span className="text-[#6B7280]">Reference: </span>
              <span className="font-mono font-semibold">{invoice.invoiceNumber}</span>
            </p>
          </div>
        </div>

        {invoice.notes ? (
          <div className="mt-6 border-b border-[#E5E7EB] pb-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[#ff5722]">Notes</p>
            <p className="mt-2 text-sm text-[#6B7280]">{invoice.notes}</p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="rounded border border-[#E5E7EB] bg-white p-1">
            <QRCodeSVG value={qrUrl} size={64} level="M" />
          </div>
          <div className="text-sm text-[#6B7280]">
            <p className="font-medium text-[#1F2937]">Verify this invoice</p>
            <p className="break-all font-mono text-xs text-[#ff8a65]">{qrUrl.replace('https://', '')}</p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-[#6B7280]">Thank you for your business. — Carschek Automotive</p>
      </div>
    </div>
  );
}
