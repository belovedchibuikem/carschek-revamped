'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, RefreshCw, Download, AlertTriangle, CheckCircle, Clock, XCircle, Eye, Printer, Send, Plus, Trash2, Check, X } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


// ─── Mock Data ────────────────────────────────────────────────────────────────
const revenueByService = [
  { month: 'Nov', inspection: 3200000, commission: 800000, auction: 620000, carSales: 1800000, offers: 180000 },
  { month: 'Dec', inspection: 3800000, commission: 950000, auction: 740000, carSales: 2200000, offers: 210000 },
  { month: 'Jan', inspection: 4100000, commission: 1020000, auction: 890000, carSales: 2600000, offers: 240000 },
  { month: 'Feb', inspection: 3600000, commission: 900000, auction: 710000, carSales: 2100000, offers: 195000 },
  { month: 'Mar', inspection: 4400000, commission: 1100000, auction: 980000, carSales: 3100000, offers: 270000 },
  { month: 'Apr', inspection: 4800000, commission: 1200000, auction: 1150000, carSales: 3800000, offers: 310000 },
];

const dailyRevenue = [
  { day: '1', revenue: 380000 }, { day: '3', revenue: 420000 }, { day: '5', revenue: 510000 },
  { day: '7', revenue: 390000 }, { day: '9', revenue: 480000 }, { day: '11', revenue: 620000 },
  { day: '13', revenue: 540000 }, { day: '15', revenue: 710000 }, { day: '17', revenue: 490000 },
  { day: '19', revenue: 580000 }, { day: '21', revenue: 650000 }, { day: '23', revenue: 720000 },
  { day: '25', revenue: 680000 }, { day: '27', revenue: 590000 }, { day: '29', revenue: 640000 },
];

const revenueByZone = [
  { zone: 'Lagos', amount: 5800000 },
  { zone: 'Abuja', amount: 2900000 },
  { zone: 'Port Harcourt', amount: 1800000 },
  { zone: 'Ibadan', amount: 1100000 },
  { zone: 'Others', amount: 850000 },
];

const carSalesMetrics = [
  { label: 'Cars Acquired', value: '33', trend: '+8 this month', color: 'text-[#1E3A5F]' },
  { label: 'Cars Sold', value: '21', trend: '+5 this month', color: 'text-[#1A7A4A]' },
  { label: 'Active Auctions', value: '4', trend: '2 ending soon', color: 'text-[#D35400]' },
  { label: 'Offers Sent', value: '12', trend: '5 accepted', color: 'text-[#2E75B6]' },
];

const payments = [
  { id: 'PAY-001', date: '2026-04-10', customer: 'Adaeze Mensah', service: 'Inspection', amount: 45000, method: 'Paystack', reference: 'PSK-8821-XZ', paystackStatus: 'success', carschekStatus: 'Confirmed', webhook: '{"event":"charge.success","data":{"reference":"PSK-8821-XZ","amount":4500000,"currency":"NGN","status":"success"}}' },
  { id: 'PAY-002', date: '2026-04-10', customer: 'Emeka Okafor', service: 'Re-inspection', amount: 25000, method: 'Flutterwave', reference: 'FLW-9934-AB', paystackStatus: 'failed', carschekStatus: 'Failed', webhook: '{"event":"charge.failed","data":{"reference":"FLW-9934-AB","amount":2500000,"currency":"NGN","status":"failed"}}' },
  { id: 'PAY-003', date: '2026-04-09', customer: 'Chidi Nwosu', service: 'Car Sale — CK-38 Toyota Camry', amount: 5100000, method: 'Paystack', reference: 'PSK-7712-CD', paystackStatus: 'success', carschekStatus: 'Confirmed', webhook: '{"event":"charge.success","data":{"reference":"PSK-7712-CD","amount":510000000,"currency":"NGN","status":"success"}}' },
  { id: 'PAY-004', date: '2026-04-09', customer: 'Fatima Bello', service: 'Auction Winning Bid — CK-41', amount: 5400000, method: 'Paystack', reference: 'PSK-6601-EF', paystackStatus: 'pending', carschekStatus: 'Pending', webhook: '{"event":"charge.pending","data":{"reference":"PSK-6601-EF","amount":540000000,"currency":"NGN","status":"pending"}}' },
  { id: 'PAY-005', date: '2026-04-08', customer: 'Tunde Adeyemi', service: 'Platform Fee — Auction CK-39', amount: 120000, method: 'Flutterwave', reference: 'FLW-5590-GH', paystackStatus: 'success', carschekStatus: 'Refunded', webhook: '{"event":"charge.success","data":{"reference":"FLW-5590-GH","amount":12000000,"currency":"NGN","status":"success"}}' },
];

const inspectors = [
  { id: 'INS-001', name: 'Emeka Okonkwo', jobs: 18, gross: 162000, deductions: 16200, net: 145800, bank: '****4521', status: 'Pending' },
  { id: 'INS-002', name: 'Chukwudi Eze', jobs: 22, gross: 198000, deductions: 19800, net: 178200, bank: '****8834', status: 'Processing' },
  { id: 'INS-003', name: 'Amaka Obi', jobs: 15, gross: 135000, deductions: 13500, net: 121500, bank: '****2267', status: 'Paid' },
  { id: 'INS-004', name: 'Seun Adebayo', jobs: 20, gross: 180000, deductions: 18000, net: 162000, bank: '****9901', status: 'Pending' },
  { id: 'INS-005', name: 'Ngozi Okafor', jobs: 19, gross: 171000, deductions: 17100, net: 153900, bank: '****3345', status: 'Pending' },
];

const invoices = [
  { id: 'INV-2026-001', client: 'AutoMart Nigeria Ltd', date: '2026-04-01', amount: 850000, status: 'Paid' },
  { id: 'INV-2026-002', client: 'Lagos Motors Group', date: '2026-04-05', amount: 1200000, status: 'Sent' },
  { id: 'INV-2026-003', client: 'Abuja Car Hub', date: '2026-04-08', amount: 650000, status: 'Draft' },
  { id: 'INV-2026-004', client: 'PH Auto Dealers', date: '2026-03-20', amount: 980000, status: 'Overdue' },
];

const refunds = [
  { id: 'REF-001', order: '#1234', customer: 'Adaeze Mensah', amount: 45000, reason: 'Inspection cancelled by customer', date: '2026-04-09', status: 'Pending' },
  { id: 'REF-002', order: '#1198', customer: 'Tunde Adeyemi', amount: 120000, reason: 'Duplicate payment', date: '2026-04-08', status: 'Pending' },
  { id: 'REF-003', order: '#1102', customer: 'Kemi Adesanya', amount: 45000, reason: 'Inspector no-show', date: '2026-04-07', status: 'Approved' },
  { id: 'REF-004', order: '#1089', customer: 'Bola Ogundimu', amount: 25000, reason: 'Service not rendered', date: '2026-04-06', status: 'Rejected' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function SummaryCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs sm:text-sm text-[#6B7280]">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-lg sm:text-2xl font-bold text-[#1F2937]">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    success: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    pending: 'bg-amber-100 text-amber-700',
    Confirmed: 'bg-green-100 text-green-700',
    Failed: 'bg-red-100 text-red-700',
    Pending: 'bg-amber-100 text-amber-700',
    Refunded: 'bg-purple-100 text-purple-700',
    Processing: 'bg-blue-100 text-blue-700',
    Paid: 'bg-green-100 text-green-700',
    Draft: 'bg-gray-100 text-gray-600',
    Sent: 'bg-blue-100 text-blue-700',
    Overdue: 'bg-red-100 text-red-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

// ─── View 1: Revenue Dashboard ────────────────────────────────────────────────
function RevenueDashboard() {
  const [period, setPeriod] = useState('This Month');
  const periods = ['This Month', 'Last Month', 'This Quarter', 'This Year', 'Custom'];
  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2 flex-wrap">
        {periods.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[40px] ${period === p ? 'bg-[#1E3A5F] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#2E75B6]'}`}>
            {p}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard label="Gross Revenue" value="₦18,260,000" icon={TrendingUp} color="bg-[#1E3A5F]" />
        <SummaryCard label="Refunds" value="₦320,000" icon={TrendingDown} color="bg-[#C0392B]" />
        <SummaryCard label="Net Revenue" value="₦17,940,000" icon={DollarSign} color="bg-[#1A7A4A]" />
        <SummaryCard label="Commission" value="₦1,200,000" icon={TrendingUp} color="bg-[#2E75B6]" />
      </div>

      {/* Cars & Auctions metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {carSalesMetrics.map(m => (
          <div key={m.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <p className="text-xs text-[#6B7280] mb-1">{m.label}</p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-[11px] text-[#6B7280] mt-1">{m.trend}</p>
          </div>
        ))}
      </div>

      {/* Revenue breakdown chart */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 sm:p-6">
        <h3 className="font-semibold text-[#1F2937] mb-4">Revenue by Service Type</h3>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[320px]">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueByService} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => `₦${(v/1000000).toFixed(1)}M`} tick={{ fontSize: 10 }} width={52} />
                <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="inspection" name="Inspection" stackId="a" fill="#1E3A5F" />
                <Bar dataKey="commission" name="Commission" stackId="a" fill="#2E75B6" />
                <Bar dataKey="auction" name="Auction Fees" stackId="a" fill="#D35400" />
                <Bar dataKey="carSales" name="Car Sales" stackId="a" fill="#1A7A4A" />
                <Bar dataKey="offers" name="Offers" stackId="a" fill="#7C3AED" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily revenue trend */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 sm:p-6">
        <h3 className="font-semibold text-[#1F2937] mb-4">Daily Revenue Trend</h3>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[300px]">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} label={{ value: 'Day of Month', position: 'insideBottom', offset: -2, fontSize: 11 }} />
                <YAxis tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }} width={48} />
                <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="#2E75B6" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Revenue by zone */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 sm:p-6">
        <h3 className="font-semibold text-[#1F2937] mb-4">Revenue by Zone</h3>
        <div className="space-y-3">
          {revenueByZone.map(z => {
            const pct = Math.round((z.amount / revenueByZone[0].amount) * 100);
            return (
              <div key={z.zone} className="flex items-center gap-3">
                <span className="w-24 sm:w-28 text-xs sm:text-sm text-[#6B7280] text-right flex-shrink-0">{z.zone}</span>
                <div className="flex-1 bg-[#F4F6F8] rounded-full h-7 overflow-hidden">
                  <div className="h-full bg-[#1E3A5F] rounded-full flex items-center px-2 sm:px-3 transition-all" style={{ width: `${pct}%`, minWidth: '60px' }}>
                    <span className="text-white text-[10px] sm:text-xs font-medium whitespace-nowrap">₦{(z.amount/1000000).toFixed(1)}M</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── View 2: Payment Records ──────────────────────────────────────────────────
function PaymentRecords() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const hasFailed = payments.some(p => p.paystackStatus === 'failed');

  return (
    <div className="space-y-4">
      {hasFailed && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-[#C0392B] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#C0392B] text-sm">Failed Payments Detected</p>
            <p className="text-xs text-red-600">1 recent payment failure requires attention. Review and retry if needed.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex gap-1.5 flex-wrap">
            {['All', 'Successful', 'Failed', 'Refunded', 'Pending'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[36px] ${statusFilter === s ? 'bg-[#1E3A5F] text-white' : 'bg-[#F4F6F8] text-[#6B7280] hover:bg-[#E5E7EB]'}`}>
                {s}
              </button>
            ))}
          </div>
          <button className="ml-auto flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#1A7A4A] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#15623c] transition-colors min-h-[36px]">
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                {['Date', 'Customer', 'Service', 'Amount', 'Method', 'Reference', 'Gateway', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <React.Fragment key={p.id}>
                  <tr className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-3 text-[#6B7280] whitespace-nowrap text-xs">{p.date}</td>
                    <td className="py-3 px-3 font-medium text-[#1F2937] whitespace-nowrap">{p.customer}</td>
                    <td className="py-3 px-3 text-[#6B7280] whitespace-nowrap">{p.service}</td>
                    <td className="py-3 px-3 font-semibold text-[#1F2937] whitespace-nowrap">₦{p.amount.toLocaleString()}</td>
                    <td className="py-3 px-3 text-[#6B7280] whitespace-nowrap">{p.method}</td>
                    <td className="py-3 px-3 font-mono text-xs text-[#6B7280] whitespace-nowrap">{p.reference}</td>
                    <td className="py-3 px-3"><StatusBadge status={p.paystackStatus} /></td>
                    <td className="py-3 px-3"><StatusBadge status={p.carschekStatus} /></td>
                    <td className="py-3 px-3">
                      <button onClick={() => setExpandedRow(expandedRow === p.id ? null : p.id)}
                        className="flex items-center gap-1 text-[#2E75B6] text-xs hover:underline whitespace-nowrap min-h-[32px]">
                        <Eye size={12} /> {expandedRow === p.id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === p.id && (
                    <tr className="bg-[#F9FAFB]">
                      <td colSpan={9} className="px-4 py-4">
                        <p className="text-xs font-semibold text-[#6B7280] mb-2">Webhook Payload</p>
                        <pre className="bg-[#1F2937] text-green-400 text-xs p-4 rounded-lg overflow-x-auto font-mono leading-relaxed">
                          {JSON.stringify(JSON.parse(p.webhook), null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── View 3: Inspector Payouts ────────────────────────────────────────────────
function InspectorPayouts() {
  const [period, setPeriod] = useState('Weekly');
  const [bulkModal, setBulkModal] = useState(false);
  const [payslipModal, setPayslipModal] = useState<typeof inspectors[0] | null>(null);
  const [markPaidModal, setMarkPaidModal] = useState<typeof inspectors[0] | null>(null);
  const [bankRef, setBankRef] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {['Weekly', 'Biweekly', 'Monthly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[40px] ${period === p ? 'bg-[#1E3A5F] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280]'}`}>
              {p}
            </button>
          ))}
        </div>
        <button onClick={() => setBulkModal(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#2E75B6] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#1E3A5F] transition-colors min-h-[40px]">
          <RefreshCw size={14} /> <span className="hidden sm:inline">Bulk Process</span><span className="sm:hidden">Bulk</span>
        </button>
      </div>

      <div className="bg-[#1E3A5F] rounded-xl p-4 sm:p-5 text-white">
        <p className="text-white/70 text-xs sm:text-sm mb-1">This Period Summary</p>
        <p className="text-base sm:text-xl font-bold">15 inspectors eligible — Total: <span className="text-[#2E75B6]">₦2,340,000</span></p>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {['Inspector', 'Jobs', 'Gross', 'Deductions', 'Net Payout', 'Bank', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inspectors.map(ins => (
                <tr key={ins.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {ins.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[#1F2937] truncate">{ins.name}</p>
                        <p className="text-xs text-[#6B7280]">{ins.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#1F2937]">{ins.jobs}</td>
                  <td className="py-3 px-4 text-[#1F2937] whitespace-nowrap">₦{ins.gross.toLocaleString()}</td>
                  <td className="py-3 px-4 text-[#C0392B] whitespace-nowrap">-₦{ins.deductions.toLocaleString()}</td>
                  <td className="py-3 px-4 font-semibold text-[#1A7A4A] whitespace-nowrap">₦{ins.net.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[#6B7280]">{ins.bank}</td>
                  <td className="py-3 px-4"><StatusBadge status={ins.status} /></td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5">
                      {ins.status === 'Pending' && (
                        <button onClick={() => setMarkPaidModal(ins)}
                          className="px-2 py-1.5 bg-[#1A7A4A] text-white text-xs rounded-lg hover:bg-[#15623c] transition-colors min-h-[32px]">
                          Mark Paid
                        </button>
                      )}
                      <button onClick={() => setPayslipModal(ins)}
                        className="px-2 py-1.5 bg-[#F4F6F8] text-[#6B7280] text-xs rounded-lg hover:bg-[#E5E7EB] transition-colors flex items-center gap-1 min-h-[32px]">
                        <Printer size={11} /> Payslip
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Process Modal */}
      {bulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-[#1F2937] mb-2">Bulk Process Payouts</h3>
            <p className="text-[#6B7280] text-sm mb-4">You are about to process payouts for:</p>
            <div className="bg-[#F4F6F8] rounded-xl p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[#6B7280]">Eligible Inspectors</span>
                <span className="font-bold text-[#1F2937]">15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6B7280]">Total Amount</span>
                <span className="font-bold text-[#1A7A4A]">₦2,340,000</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setBulkModal(false)} className="flex-1 py-3 border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#6B7280] min-h-[48px]">Cancel</button>
              <button onClick={() => setBulkModal(false)} className="flex-1 py-3 bg-[#1E3A5F] text-white rounded-xl text-sm font-medium min-h-[48px]">Confirm & Process</button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Paid Modal */}
      {markPaidModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-[#1F2937] mb-1">Mark as Paid — {markPaidModal.name}</h3>
            <p className="text-[#6B7280] text-sm mb-4">Net payout: <strong>₦{markPaidModal.net.toLocaleString()}</strong></p>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">Bank Transfer Reference</label>
            <input value={bankRef} onChange={e => setBankRef(e.target.value)} placeholder="e.g. NIP-20260410-001234"
              className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 min-h-[48px]" />
            <div className="flex gap-3">
              <button onClick={() => setMarkPaidModal(null)} className="flex-1 py-3 border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#6B7280] min-h-[48px]">Cancel</button>
              <button onClick={() => { setMarkPaidModal(null); setBankRef(''); }} className="flex-1 py-3 bg-[#1A7A4A] text-white rounded-xl text-sm font-medium min-h-[48px]">Confirm Paid</button>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {payslipModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-[#1E3A5F] p-5 sm:p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-widest mb-1">CARSCHEK PAYSLIP</p>
                  <h3 className="text-lg sm:text-xl font-bold">{payslipModal.name}</h3>
                  <p className="text-white/70 text-sm">{payslipModal.id} · {period} Period</p>
                </div>
                <button onClick={() => setPayslipModal(null)} className="min-w-[40px] min-h-[40px] flex items-center justify-center text-white/60 hover:text-white"><X size={20} /></button>
              </div>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-[#F4F6F8] rounded-xl p-3 sm:p-4">
                  <p className="text-xs text-[#6B7280] mb-1">Jobs Completed</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#1F2937]">{payslipModal.jobs}</p>
                </div>
                <div className="bg-[#F4F6F8] rounded-xl p-3 sm:p-4">
                  <p className="text-xs text-[#6B7280] mb-1">Gross Earnings</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#1F2937]">₦{payslipModal.gross.toLocaleString()}</p>
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                <div className="flex justify-between px-4 py-3 border-b border-[#E5E7EB]">
                  <span className="text-sm text-[#6B7280]">Gross Earnings</span>
                  <span className="font-medium text-[#1F2937]">₦{payslipModal.gross.toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-4 py-3 border-b border-[#E5E7EB]">
                  <span className="text-sm text-[#6B7280]">Deduction (10%)</span>
                  <span className="font-medium text-[#C0392B]">-₦{payslipModal.deductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-4 py-3 bg-[#F4F6F8]">
                  <span className="text-sm font-bold text-[#1F2937]">Net Payout</span>
                  <span className="font-bold text-[#1A7A4A]">₦{payslipModal.net.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Bank Account</span>
                <span className="font-mono font-medium text-[#1F2937]">{payslipModal.bank}</span>
              </div>
              <button
                onClick={() => {
                  const ins = payslipModal;
                  const printWindow = window.open('', '_blank');
                  if (!printWindow) return;
                  printWindow.document.write(`<!DOCTYPE html><html><head><title>Carschek Payslip — ${ins.name}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#1F2937;max-width:600px;margin:0 auto}.header{background:#1E3A5F;color:white;padding:24px;border-radius:8px;margin-bottom:24px}.label{color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:1px}.name{font-size:22px;font-weight:700;margin:4px 0}.sub{color:rgba(255,255,255,0.7);font-size:13px}table{width:100%;border-collapse:collapse;margin:16px 0}td{padding:10px 12px;border-bottom:1px solid #E5E7EB;font-size:14px}.total-row{background:#F4F6F8;font-weight:700}.green{color:#1A7A4A}.red{color:#C0392B}.footer{font-size:11px;color:#6B7280;margin-top:32px;border-top:1px solid #E5E7EB;padding-top:12px}</style></head><body><div class="header"><p class="label">CARSCHEK PAYSLIP</p><p class="name">${ins.name}</p><p class="sub">${ins.id} · ${period} Period · Apr 2026</p></div><table><tr><td>Jobs Completed</td><td style="text-align:right;font-weight:600">${ins.jobs}</td></tr><tr><td>Gross Earnings</td><td style="text-align:right;font-weight:600">₦${ins.gross.toLocaleString()}</td></tr><tr><td>Platform Deduction (10%)</td><td style="text-align:right" class="red">-₦${ins.deductions.toLocaleString()}</td></tr><tr class="total-row"><td>Net Payout</td><td style="text-align:right" class="green">₦${ins.net.toLocaleString()}</td></tr></table><p><strong>Bank Account:</strong> ${ins.bank}</p><p><strong>Status:</strong> ${ins.status}</p><p class="footer">Carschek · info@carschek.com · +234 817 362 4953<br/>This payslip was generated on ${new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p><script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}<\/script></body></html>`);
                  printWindow.document.close();
                }}
                className="w-full py-3 bg-[#1E3A5F] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#16304F] transition-colors min-h-[48px]">
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── View 4: Invoices ─────────────────────────────────────────────────────────
function Invoices() {
  const [createModal, setCreateModal] = useState(false);
  const [lineItems, setLineItems] = useState([{ desc: '', qty: 1, price: 0 }]);

  const addLine = () => setLineItems(l => [...l, { desc: '', qty: 1, price: 0 }]);
  const removeLine = (i: number) => setLineItems(l => l.filter((_, idx) => idx !== i));
  const subtotal = lineItems.reduce((s, l) => s + l.qty * l.price, 0);
  const vat = subtotal * 0.075;
  const total = subtotal + vat;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-[#1F2937]">Invoice List</h3>
        <button onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#1E3A5F] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#2E75B6] transition-colors min-h-[40px]">
          <Plus size={14} /> <span className="hidden sm:inline">Create Invoice</span><span className="sm:hidden">Create</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {['Invoice #', 'Client', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
                  <td className="py-3 px-4 font-mono text-xs font-medium text-[#2E75B6] whitespace-nowrap">{inv.id}</td>
                  <td className="py-3 px-4 font-medium text-[#1F2937]">{inv.client}</td>
                  <td className="py-3 px-4 text-[#6B7280] whitespace-nowrap">{inv.date}</td>
                  <td className="py-3 px-4 font-semibold text-[#1F2937] whitespace-nowrap">₦{inv.amount.toLocaleString()}</td>
                  <td className="py-3 px-4"><StatusBadge status={inv.status} /></td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5">
                      <button className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg bg-[#F4F6F8] hover:bg-[#E5E7EB] text-[#6B7280]"><Eye size={13} /></button>
                      <button className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg bg-[#F4F6F8] hover:bg-[#E5E7EB] text-[#6B7280]"><Send size={13} /></button>
                      <button className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg bg-[#F4F6F8] hover:bg-[#E5E7EB] text-[#6B7280]"><Download size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 sm:p-6 border-b border-[#E5E7EB] flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-[#1F2937]">Create Invoice</h3>
              <button onClick={() => setCreateModal(false)} className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#6B7280]"><X size={20} /></button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1">Client</label>
                  <select className="w-full border border-[#E5E7EB] rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 min-h-[48px]">
                    <option>AutoMart Nigeria Ltd</option>
                    <option>Lagos Motors Group</option>
                    <option>Abuja Car Hub</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1">Due Date</label>
                  <input type="date" className="w-full border border-[#E5E7EB] rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 min-h-[48px]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-[#1F2937]">Line Items</label>
                  <button onClick={addLine} className="text-xs text-[#2E75B6] hover:underline flex items-center gap-1 min-h-[32px]"><Plus size={12} /> Add Item</button>
                </div>
                <div className="space-y-2">
                  {lineItems.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input placeholder="Service description" value={item.desc}
                        onChange={e => setLineItems(l => l.map((x, idx) => idx === i ? { ...x, desc: e.target.value } : x))}
                        className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 min-h-[44px]" />
                      <input type="number" placeholder="Qty" value={item.qty}
                        onChange={e => setLineItems(l => l.map((x, idx) => idx === i ? { ...x, qty: +e.target.value } : x))}
                        className="w-16 border border-[#E5E7EB] rounded-lg px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 min-h-[44px]" />
                      <input type="number" placeholder="Price" value={item.price}
                        onChange={e => setLineItems(l => l.map((x, idx) => idx === i ? { ...x, price: +e.target.value } : x))}
                        className="w-24 border border-[#E5E7EB] rounded-lg px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 min-h-[44px]" />
                      <button onClick={() => removeLine(i)} className="min-w-[40px] min-h-[40px] flex items-center justify-center text-[#C0392B] hover:text-red-700"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#F4F6F8] rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-[#6B7280]">Subtotal</span><span className="font-medium">₦{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#6B7280]">VAT (7.5%)</span><span className="font-medium">₦{vat.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold border-t border-[#E5E7EB] pt-2"><span>Total</span><span className="text-[#1A7A4A]">₦{total.toLocaleString()}</span></div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setCreateModal(false)} className="flex-1 py-3 border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#6B7280] min-h-[48px]">Save as Draft</button>
                <button onClick={() => setCreateModal(false)} className="flex-1 py-3 bg-[#1E3A5F] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 min-h-[48px]">
                  <Send size={14} /> Send Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── View 5: Refunds ──────────────────────────────────────────────────────────
function Refunds() {
  const [rejectModal, setRejectModal] = useState<typeof refunds[0] | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const auditTrail = [
    { id: 'REF-003', action: 'Approved', by: 'Promise Ndem', time: '2026-04-07 14:23', note: 'Inspector confirmed no-show' },
    { id: 'REF-004', action: 'Rejected', by: 'Promise Ndem', time: '2026-04-06 11:05', note: 'Service was rendered per GPS logs' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="p-4 border-b border-[#E5E7EB]">
          <h3 className="font-semibold text-[#1F2937]">Refund Queue</h3>
          <p className="text-sm text-[#6B7280]">2 pending refund requests</p>
        </div>
        <div className="divide-y divide-[#F3F4F6]">
          {refunds.map(r => (
            <div key={r.id} className="p-4 hover:bg-[#F9FAFB] transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-[#2E75B6]">{r.id}</span>
                    <span className="text-xs text-[#6B7280]">Order {r.order}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="font-medium text-[#1F2937]">{r.customer}</p>
                  <p className="text-sm text-[#6B7280]">{r.reason}</p>
                  <p className="text-xs text-[#6B7280] mt-1">{r.date}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold text-[#1F2937]">₦{r.amount.toLocaleString()}</p>
                  {r.status === 'Pending' && (
                    <div className="flex gap-2 mt-2">
                      <button className="px-3 py-2 bg-[#1A7A4A] text-white text-xs rounded-lg hover:bg-[#15623c] flex items-center gap-1 min-h-[36px]">
                        <Check size={12} /> Approve
                      </button>
                      <button onClick={() => setRejectModal(r)} className="px-3 py-2 bg-[#C0392B] text-white text-xs rounded-lg hover:bg-red-700 flex items-center gap-1 min-h-[36px]">
                        <X size={12} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Trail */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 sm:p-5">
        <h3 className="font-semibold text-[#1F2937] mb-4">Refund Audit Trail</h3>
        <div className="space-y-3">
          {auditTrail.map(a => (
            <div key={a.id} className="flex items-start gap-3 sm:gap-4 p-3 bg-[#F9FAFB] rounded-xl">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${a.action === 'Approved' ? 'bg-green-100' : 'bg-red-100'}`}>
                {a.action === 'Approved' ? <CheckCircle size={16} className="text-[#1A7A4A]" /> : <XCircle size={16} className="text-[#C0392B]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[#2E75B6]">{a.id}</span>
                  <span className={`text-xs font-semibold ${a.action === 'Approved' ? 'text-[#1A7A4A]' : 'text-[#C0392B]'}`}>{a.action}</span>
                  <span className="text-xs text-[#6B7280]">by {a.by}</span>
                </div>
                <p className="text-sm text-[#6B7280] mt-0.5">{a.note}</p>
                <p className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-1"><Clock size={10} /> {a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-[#1F2937] mb-1">Reject Refund — {rejectModal.id}</h3>
            <p className="text-sm text-[#6B7280] mb-4">Amount: ₦{rejectModal.amount.toLocaleString()}</p>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">Rejection Reason <span className="text-[#C0392B]">*</span></label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
              placeholder="Explain why this refund is being rejected..."
              className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 resize-none" />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 py-3 border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#6B7280] min-h-[48px]">Cancel</button>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-3 bg-[#C0392B] text-white rounded-xl text-sm font-medium min-h-[48px]">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FinancePage() {
  const [activeView, setActiveView] = useState('Revenue Dashboard');
  const views = ['Revenue Dashboard', 'Payment Records', 'Inspector Payouts', 'Invoices', 'Refunds'];

  return (
    <AppLayout currentPath="/finance">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937]">Finance & Payments</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">Revenue management, payouts, invoices, and refunds</p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Finance Role</span>
        </div>

        {/* View tabs — scrollable on mobile */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-1 bg-[#F4F6F8] p-1 rounded-xl w-max sm:w-fit">
            {views.map(v => (
              <button key={v} onClick={() => setActiveView(v)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap min-h-[36px] ${activeView === v ? 'bg-white text-[#1E3A5F] shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {activeView === 'Revenue Dashboard' && <RevenueDashboard />}
        {activeView === 'Payment Records' && <PaymentRecords />}
        {activeView === 'Inspector Payouts' && <InspectorPayouts />}
        {activeView === 'Invoices' && <Invoices />}
        {activeView === 'Refunds' && <Refunds />}
      </div>
    </AppLayout>
  );
}
