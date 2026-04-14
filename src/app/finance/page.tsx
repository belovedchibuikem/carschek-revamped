'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';

import { Download, TrendingUp, DollarSign, CreditCard, Users, FileText, RefreshCw } from 'lucide-react';
import { FINANCE_SUMMARY, formatNaira } from '@/lib/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';

const TABS = ['Revenue', 'Payments', 'Inspector Payouts', 'Invoices', 'Refunds'];

const REVENUE_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  revenue: Math.floor(Math.random() * 8000000) + 4000000,
  expenses: Math.floor(Math.random() * 3000000) + 1000000,
}));

const PAYMENTS = [
  { id: 'PAY-001', customer: 'Adaeze Madu', amount: 5100000, method: 'Paystack', status: 'Success', date: '2026-04-13' },
  { id: 'PAY-002', customer: 'Tunde Fashola', amount: 24000000, method: 'Bank Transfer', status: 'Success', date: '2026-04-12' },
  { id: 'PAY-003', customer: 'Ibrahim Musa', amount: 15000, method: 'Flutterwave', status: 'Failed', date: '2026-04-11' },
  { id: 'PAY-004', customer: 'Ngozi Chukwu', amount: 7500, method: 'Paystack', status: 'Pending', date: '2026-04-10' },
];

const PAYOUTS = [
  { inspector: 'Emeka Okonkwo', jobs: 12, amount: 180000, period: 'Apr 2026', status: 'Pending', bank: 'GTBank' },
  { inspector: 'Chidinma Eze', jobs: 9, amount: 135000, period: 'Apr 2026', status: 'Pending', bank: 'Access Bank' },
  { inspector: 'Ngozi Obi', jobs: 11, amount: 165000, period: 'Apr 2026', status: 'Paid', bank: 'First Bank' },
];

const INVOICES = [
  { id: 'INV-023', customer: 'AutoDeals Nigeria', amount: 45000, status: 'Overdue', date: '2026-04-01', dueDate: '2026-04-10' },
  { id: 'INV-024', customer: 'Tunde Fashola', amount: 24000000, status: 'Paid', date: '2026-04-12', dueDate: '2026-04-19' },
  { id: 'INV-025', customer: 'Adaeze Madu', amount: 15000, status: 'Sent', date: '2026-04-13', dueDate: '2026-04-20' },
];

export default function FinancePage() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('Revenue');

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Finance</h1>
            <p className="text-sm text-[#6B7280]">Financial overview and management</p>
          </div>
          <button onClick={() => toast.success('CSV exported')} className="flex items-center gap-2 px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
            <Download size={15} /> Export
          </button>
        </div>

        <div className="flex gap-1 border-b border-[#E5E7EB] overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Revenue' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {[
                { label: 'Revenue MTD', value: formatNaira(FINANCE_SUMMARY.revenueMTD), icon: TrendingUp, color: '#1A7A4A' },
                { label: 'Revenue YTD', value: formatNaira(FINANCE_SUMMARY.revenueYTD), icon: DollarSign, color: '#1E3A5F' },
                { label: 'Monthly Target', value: formatNaira(FINANCE_SUMMARY.revenueTarget), icon: TrendingUp, color: '#2E75B6' },
                { label: 'Pending Payments', value: String(FINANCE_SUMMARY.pendingPayments), icon: CreditCard, color: '#D35400' },
                { label: 'Pending Amount', value: formatNaira(FINANCE_SUMMARY.pendingAmount), icon: DollarSign, color: '#D35400' },
                { label: 'Inspector Payouts', value: formatNaira(FINANCE_SUMMARY.inspectorPayouts), icon: Users, color: '#2E75B6' },
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#F4F6F8" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={v => `₦${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(v: number) => formatNaira(v)} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#1A7A4A" strokeWidth={2} fill="url(#rev)" name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="#C0392B" strokeWidth={2} fill="url(#exp)" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'Payments' && (
          <div className="space-y-4">
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
                  {PAYMENTS.map(p => (
                    <tr key={p.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-[#2E75B6]">{p.id}</td>
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
              <button onClick={() => toast.success('Bulk payouts processing…')} className="px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">
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
                  {PAYOUTS.map((p, i) => (
                    <tr key={i} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
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
                            <button onClick={() => toast.success(`${p.inspector} marked as paid`)} className="px-3 py-1.5 bg-[#1A7A4A] text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-all">
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
              <button onClick={() => toast.success('Invoice creation form — coming soon')} className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">
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
                  {INVOICES.map(inv => (
                    <tr key={inv.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-[#2E75B6]">{inv.id}</td>
                      <td className="px-4 py-3 font-medium text-[#1F2937]">{inv.customer}</td>
                      <td className="px-4 py-3 font-semibold text-[#1F2937]">{formatNaira(inv.amount)}</td>
                      <td className="px-4 py-3 text-xs text-[#6B7280]">{inv.date}</td>
                      <td className="px-4 py-3 text-xs text-[#6B7280]">{inv.dueDate}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : inv.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toast.success('Invoice sent via email')} className="px-3 py-1.5 border border-[#E5E7EB] text-xs font-medium text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-colors">
                          Send
                        </button>
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
