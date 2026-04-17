'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { FileText, Mail, Printer, Download } from 'lucide-react';
import { formatNaira } from '@/lib/mockData';
import { toast } from 'sonner';
import { downloadCsv } from '@/lib/csv';
import { getInvoiceDetailPagePayload } from '@/lib/finance/seedFinanceInvoices';

export default function InvoiceDetailPage() {
  const pathname = usePathname();
  const params = useParams();
  const id = decodeURIComponent(params.id as string);
  const inv = getInvoiceDetailPagePayload(id);

  const total = inv?.amount ?? 0;

  if (!inv) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center">
          <p className="font-medium text-[#1F2937]">Invoice not found</p>
          <Link href="/finance" className="mt-3 inline-block text-sm text-[#2E75B6] hover:underline">
            Back to finance
          </Link>
        </div>
      </AppLayout>
    );
  }

  const exportLines = () => {
    downloadCsv(
      `${id}-lines.csv`,
      [['Description', 'Qty', 'Unit ₦', 'Line total'], ...inv.lines.map(l => [l.desc, l.qty, l.unit, l.qty * l.unit])]
    );
    toast.success('Line items exported');
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-2 text-[#6B7280] text-sm">
          <Link href="/finance" className="hover:text-[#1E3A5F]">
            Finance
          </Link>
          <span>/</span>
          <span>Invoices</span>
          <span>/</span>
          <span className="font-mono text-[#1F2937]">{id}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937] flex items-center gap-2">
              <FileText className="text-[#1E3A5F]" size={26} />
              Invoice {id}
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">{inv.customer}</p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              inv.status === 'Paid'
                ? 'bg-green-100 text-green-700'
                : inv.status === 'Overdue'
                  ? 'bg-red-100 text-red-700'
                  : inv.status === 'Draft'
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-blue-100 text-blue-700'
            }`}
          >
            {inv.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toast.success('Invoice emailed (simulated)')}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#1F2937] hover:bg-[#F4F6F8]"
          >
            <Mail size={16} /> Send
          </button>
          <button
            type="button"
            onClick={() => {
              window.print();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#1F2937] hover:bg-[#F4F6F8]"
          >
            <Printer size={16} /> Print
          </button>
          <button
            type="button"
            onClick={exportLines}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white rounded-lg text-sm font-semibold hover:bg-[#16304F]"
          >
            <Download size={16} /> Export lines (CSV)
          </button>
          {inv.status !== 'Paid' && (
            <button
              type="button"
              onClick={() => toast.success('Marked as paid')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A7A4A] text-white rounded-lg text-sm font-semibold hover:bg-green-700"
            >
              Mark paid
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden print:shadow-none">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex flex-wrap justify-between gap-2 text-sm">
            <span className="text-[#6B7280]">Issued {inv.date}</span>
            <span className="text-[#6B7280]">Due {inv.dueDate}</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#6B7280]">Description</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#6B7280]">Qty</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#6B7280]">Unit</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#6B7280]">Line</th>
              </tr>
            </thead>
            <tbody>
              {inv.lines.map((l, i) => (
                <tr key={i} className="border-b border-[#F4F6F8]">
                  <td className="px-5 py-3 text-[#1F2937]">{l.desc}</td>
                  <td className="px-5 py-3 text-right text-[#6B7280]">{l.qty}</td>
                  <td className="px-5 py-3 text-right">{formatNaira(l.unit)}</td>
                  <td className="px-5 py-3 text-right font-medium">{formatNaira(l.qty * l.unit)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#F9FAFB]">
                <td colSpan={3} className="px-5 py-4 text-right font-semibold text-[#1F2937]">
                  Total
                </td>
                <td className="px-5 py-4 text-right font-heading font-bold text-[#1E3A5F]">{formatNaira(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
