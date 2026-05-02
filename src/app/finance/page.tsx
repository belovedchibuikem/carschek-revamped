'use client';
import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Download, TrendingUp, DollarSign, CreditCard, Users, FileText, RefreshCw } from 'lucide-react';
import { CreateInvoiceModal } from '@/components/finance/CreateInvoiceModal';
import { InvoicePrintTemplate } from '@/components/finance/InvoicePrintTemplate';
import type { FinanceInvoiceListRow } from '@/lib/finance/invoiceTypes';
import { getAllFinanceInvoiceRows, upsertFinanceInvoiceRow } from '@/lib/finance/seedFinanceInvoices';
import { generateInvoicePDF } from '@/lib/pdf/generateInvoice';
import { FINANCE_SUMMARY, formatNaira } from '@/lib/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';
import { downloadCsv } from '@/lib/csv';
import { useTheme } from 'next-themes';

const TABS = ['Revenue', 'Payments', 'Inspector Payouts', 'Invoices', 'Refunds'];

const REVENUE_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  revenue: 4000000 + ((i * 577 + 13) % 7500000),
  expenses: 1000000 + ((i * 311 + 7) % 2800000),
}));

const PAYMENTS = [
  { id: 'PAY-001', customer: 'Adaeze Madu', amount: 5100000, method: 'Paystack', status: 'Success', date: '2026-04-13' },
  { id: 'PAY-002', customer: 'Tunde Fashola', amount: 24000000, method: 'Bank Transfer', status: 'Success', date: '2026-04-12' },
  { id: 'PAY-003', customer: 'Ibrahim Musa', amount: 15000, method: 'Flutterwave', status: 'Failed', date: '2026-04-11' },
  { id: 'PAY-004', customer: 'Ngozi Chukwu', amount: 7500, method: 'Paystack', status: 'Pending', date: '2026-04-10' },
];

type PayoutRow = {
  id: string;
  inspector: string;
  jobs: number;
  amount: number;
  period: string;
  status: 'Pending' | 'Paid';
  bank: string;
  bankRef?: string;
};

const PAYOUTS_SEED: PayoutRow[] = [
  { id: 'pay-1', inspector: 'Emeka Okonkwo', jobs: 12, amount: 180000, period: 'Apr 2026', status: 'Pending', bank: 'GTBank' },
  { id: 'pay-2', inspector: 'Chidinma Eze', jobs: 9, amount: 135000, period: 'Apr 2026', status: 'Pending', bank: 'Access Bank' },
  { id: 'pay-3', inspector: 'Ngozi Obi', jobs: 11, amount: 165000, period: 'Apr 2026', status: 'Paid', bank: 'First Bank' },
];

function inDateRange(isoDate: string, from: string, to: string): boolean {
  if (!from && !to) return true;
  const d = isoDate.slice(0, 10);
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

export default function FinancePage() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { resolvedTheme } = useTheme();
  const isDark = mounted && resolvedTheme === 'dark';
  const chartMuted = isDark ? '#94a3b8' : '#9CA3AF';
  const chartGrid = isDark ? '#334155' : '#F4F6F8';
  const [activeTab, setActiveTab] = useState('Revenue');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [invoices, setInvoices] = useState<FinanceInvoiceListRow[]>(() => getAllFinanceInvoiceRows());
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [renderPdfInvoice, setRenderPdfInvoice] = useState<FinanceInvoiceListRow['printable'] | null>(null);
  const [payouts, setPayouts] = useState<PayoutRow[]>(PAYOUTS_SEED);
  const [markPaidTarget, setMarkPaidTarget] = useState<PayoutRow | null>(null);
  const [markPaidRef, setMarkPaidRef] = useState('');

  const refreshInvoices = () => setInvoices(getAllFinanceInvoiceRows());

  const downloadInvoicePdf = async (row: FinanceInvoiceListRow) => {
    setRenderPdfInvoice(row.printable);
    await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    await new Promise(r => setTimeout(r, 150));
    try {
      await generateInvoicePDF(row.printable);
    } catch {
      toast.error('Could not generate PDF');
    } finally {
      setRenderPdfInvoice(null);
    }
  };

  const paymentsFiltered = useMemo(
    () => PAYMENTS.filter(p => inDateRange(p.date, dateFrom, dateTo)),
    [dateFrom, dateTo]
  );

  const exportFinance = () => {
    try {
      if (activeTab === 'Revenue') {
        downloadCsv(
          'finance-revenue-2026.csv',
          [['Month', 'Revenue', 'Expenses'], ...REVENUE_DATA.map(r => [r.month, r.revenue, r.expenses])]
        );
      } else if (activeTab === 'Payments') {
        downloadCsv(
          'finance-payments.csv',
          [
            ['Payment ID', 'Customer', 'Amount', 'Method', 'Status', 'Date'],
            ...paymentsFiltered.map(p => [p.id, p.customer, p.amount, p.method, p.status, p.date]),
          ]
        );
      } else if (activeTab === 'Inspector Payouts') {
        downloadCsv(
          'finance-inspector-payouts.csv',
          [
            ['Inspector', 'Jobs', 'Amount', 'Period', 'Bank', 'Status'],
            ...payouts.map(p => [p.inspector, p.jobs, p.amount, p.period, p.bank, p.status]),
          ]
        );
      } else if (activeTab === 'Invoices') {
        downloadCsv(
          'finance-invoices.csv',
          [
            ['Invoice ID', 'Customer', 'Amount', 'Date', 'Due Date', 'Status'],
            ...invoices.map(i => [i.id, i.customer, i.amount, i.date, i.dueDate, i.status]),
          ]
        );
      } else {
        downloadCsv('finance-refunds.csv', [['Note'], ['No pending refunds — export placeholder']]);
      }
      toast.success('CSV exported');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <AppLayout currentPath={pathname}>
      {renderPdfInvoice ? (
        <div className="pointer-events-none fixed left-[-12000px] top-0 z-0 overflow-hidden" aria-hidden>
          <InvoicePrintTemplate invoice={renderPdfInvoice} />
        </div>
      ) : null}
      <CreateInvoiceModal
        open={createInvoiceOpen}
        onClose={() => setCreateInvoiceOpen(false)}
        onCreated={row => {
          upsertFinanceInvoiceRow(row);
          refreshInvoices();
        }}
      />
      {markPaidTarget && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" aria-hidden onClick={() => setMarkPaidTarget(null)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mark-paid-title"
            className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,400px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <h2 id="mark-paid-title" className="text-base font-heading font-semibold text-[#1F2937] dark:text-slate-100">
              Mark payout as paid
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              {markPaidTarget.inspector} — {formatNaira(markPaidTarget.amount)} ({markPaidTarget.period})
            </p>
            <label className="mt-4 block text-xs font-medium text-[#6B7280]">
              Bank reference / transfer ID
              <input
                value={markPaidRef}
                onChange={e => setMarkPaidRef(e.target.value)}
                placeholder="e.g. NIP-TRF-20260416-88421"
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setMarkPaidTarget(null);
                  setMarkPaidRef('');
                }}
                className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] dark:border-slate-600 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const ref = markPaidRef.trim();
                  if (!ref) {
                    toast.error('Enter a bank reference');
                    return;
                  }
                  setPayouts(prev =>
                    prev.map(p =>
                      p.id === markPaidTarget.id ? { ...p, status: 'Paid' as const, bankRef: ref } : p
                    )
                  );
                  toast.success(`Recorded paid for ${markPaidTarget.inspector} (ref: ${ref})`);
                  setMarkPaidTarget(null);
                  setMarkPaidRef('');
                }}
                className="rounded-lg bg-[#1A7A4A] px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Confirm paid
              </button>
            </div>
          </div>
        </>
      )}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Finance</h1>
            <p className="text-sm text-[#6B7280]">Financial overview and management</p>
          </div>
          <button
            onClick={exportFinance}
            className="flex items-center gap-2 px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors"
          >
            <Download size={15} /> Export
          </button>
        </div>

        <div className="flex gap-1 border-b border-[#E5E7EB] overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-[#ff5722] text-[#ff5722]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Revenue' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {[
                { label: 'Revenue MTD', value: formatNaira(FINANCE_SUMMARY.revenueMTD), icon: TrendingUp, color: '#1A7A4A' },
                { label: 'Revenue YTD', value: formatNaira(FINANCE_SUMMARY.revenueYTD), icon: DollarSign, color: '#ff5722' },
                { label: 'Monthly Target', value: formatNaira(FINANCE_SUMMARY.revenueTarget), icon: TrendingUp, color: '#ff8a65' },
                { label: 'Pending Payments', value: String(FINANCE_SUMMARY.pendingPayments), icon: CreditCard, color: '#D35400' },
                { label: 'Pending Amount', value: formatNaira(FINANCE_SUMMARY.pendingAmount), icon: DollarSign, color: '#D35400' },
                { label: 'Inspector Payouts', value: formatNaira(FINANCE_SUMMARY.inspectorPayouts), icon: Users, color: '#ff8a65' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                  <kpi.icon size={18} style={{ color: kpi.color }} className="mb-2" />
                  <p className="text-lg font-heading font-bold text-[#1F2937]">{kpi.value}</p>
                  <p className="text-xs text-[#6B7280]">{kpi.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h2 className="text-base font-heading font-semibold text-[#1F2937] mb-4">Revenue vs Expenses (2026)</h2>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A7A4A" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1A7A4A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C0392B" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#C0392B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartMuted }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: chartMuted }} tickLine={false} axisLine={false} tickFormatter={v => `₦${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(v: number) => formatNaira(v)} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, background: isDark ? '#1e293b' : '#fff', color: isDark ? '#e2e8f0' : '#1F2937' }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: isDark ? '#e2e8f0' : '#1F2937' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#1A7A4A" strokeWidth={2} fill="url(#rev)" name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="#C0392B" strokeWidth={2} fill="url(#exp)" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'Payments' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs text-[#6B7280]">
                From
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="mt-1 block px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white"
                />
              </label>
              <label className="text-xs text-[#6B7280]">
                To
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="mt-1 block px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white"
                />
              </label>
              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="text-sm text-[#C0392B] hover:underline"
                >
                  Clear dates
                </button>
              )}
            </div>
            {PAYMENTS.some(p => p.status === 'Failed') && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <span className="text-[#C0392B] text-lg">⚠</span>
                <p className="text-sm text-[#C0392B] font-medium">{PAYMENTS.filter(p => p.status === 'Failed').length} failed payment(s) require attention</p>
              </div>
            )}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    {['Payment ID', 'Customer', 'Amount', 'Method', 'Date', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paymentsFiltered.map(p => (
                    <tr key={p.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-[#ff8a65]">{p.id}</td>
                      <td className="px-4 py-3 font-medium text-[#1F2937]">{p.customer}</td>
                      <td className="px-4 py-3 font-semibold text-[#1F2937]">{formatNaira(p.amount)}</td>
                      <td className="px-4 py-3 text-[#6B7280]">{p.method}</td>
                      <td className="px-4 py-3 text-xs text-[#6B7280]">{p.date}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.status === 'Success' ? 'bg-green-100 text-green-700' : p.status === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Inspector Payouts' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => toast.success('Bulk payouts processing…')} className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all">
                Bulk Process Payouts
              </button>
            </div>
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    {['Inspector', 'Jobs', 'Amount', 'Period', 'Bank', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(p => (
                    <tr key={p.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-4 py-3 font-medium text-[#1F2937]">{p.inspector}</td>
                      <td className="px-4 py-3 text-[#6B7280]">{p.jobs}</td>
                      <td className="px-4 py-3 font-semibold text-[#1F2937]">{formatNaira(p.amount)}</td>
                      <td className="px-4 py-3 text-xs text-[#6B7280]">{p.period}</td>
                      <td className="px-4 py-3 text-xs text-[#6B7280]">{p.bank}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => toast.success('Payslip generated')} className="px-3 py-1.5 border border-[#E5E7EB] text-xs font-medium text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-colors">
                            Payslip
                          </button>
                          {p.status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => {
                                setMarkPaidTarget(p);
                                setMarkPaidRef('');
                              }}
                              className="px-3 py-1.5 bg-[#1A7A4A] text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-all"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Invoices' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setCreateInvoiceOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all"
              >
                <FileText size={15} /> Create Invoice
              </button>
            </div>
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    {['Invoice ID', 'Customer', 'Amount', 'Date', 'Due Date', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-[#ff8a65]">{inv.id}</td>
                      <td className="px-4 py-3 font-medium text-[#1F2937]">{inv.customer}</td>
                      <td className="px-4 py-3 font-semibold text-[#1F2937]">{formatNaira(inv.amount)}</td>
                      <td className="px-4 py-3 text-xs text-[#6B7280]">{inv.date}</td>
                      <td className="px-4 py-3 text-xs text-[#6B7280]">{inv.dueDate}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            inv.status === 'Paid' ?'bg-green-100 text-green-700'
                              : inv.status === 'Overdue' ?'bg-red-100 text-red-700'
                                : inv.status === 'Draft' ?'bg-slate-100 text-slate-700' :'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <Link
                            href={`/finance/invoices/${encodeURIComponent(inv.id)}`}
                            className="px-3 py-1.5 border border-[#E5E7EB] text-xs font-medium text-[#ff8a65] rounded-lg hover:bg-[#F4F6F8] transition-colors"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={() => void downloadInvoicePdf(inv)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#E5E7EB] text-xs font-medium text-[#ff5722] rounded-lg hover:bg-[#F4F6F8] transition-colors"
                          >
                            <Download size={12} /> Download
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              toast.success('Invoice emailed (simulated)', {
                                description: `${inv.printable.email} · ${inv.id} · ${formatNaira(inv.amount)}`,
                              })
                            }
                            className="px-3 py-1.5 border border-[#E5E7EB] text-xs font-medium text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-colors"
                          >
                            Send
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Refunds' && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
            <RefreshCw size={40} className="mx-auto mb-3 text-[#E5E7EB]" />
            <p className="font-medium text-[#1F2937]">No pending refunds</p>
            <p className="text-sm text-[#6B7280] mt-1">All refund requests have been processed</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
