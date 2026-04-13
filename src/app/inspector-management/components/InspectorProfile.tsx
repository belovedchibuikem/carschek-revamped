'use client';
import React, { useState } from 'react';
import { ArrowLeft, Star, Briefcase, Clock, DollarSign, Phone, Shield, Upload, AlertTriangle } from 'lucide-react';
import { Inspector } from './InspectorModule';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const WEEKLY_JOBS = [
  { week: 'W1', jobs: 6, turnaround: 9.2 },
  { week: 'W2', jobs: 7, turnaround: 8.8 },
  { week: 'W3', jobs: 5, turnaround: 9.5 },
  { week: 'W4', jobs: 8, turnaround: 8.3 },
  { week: 'W5', jobs: 6, turnaround: 10.1 },
  { week: 'W6', jobs: 9, turnaround: 8.1 },
  { week: 'W7', jobs: 7, turnaround: 9.0 },
  { week: 'W8', jobs: 8, turnaround: 8.6 },
  { week: 'W9', jobs: 10, turnaround: 7.9 },
  { week: 'W10', jobs: 9, turnaround: 8.4 },
  { week: 'W11', jobs: 11, turnaround: 8.0 },
  { week: 'W12', jobs: 9, turnaround: 8.2 },
];

const RECENT_JOBS = [
  { id: 'ORD-1892', vehicle: 'Toyota Camry 2019', date: '10 Apr 2026', score: 76, status: 'in-progress' },
  { id: 'ORD-1885', vehicle: 'Toyota Highlander 2016', date: '09 Apr 2026', score: 55, status: 'closed' },
  { id: 'ORD-1878', vehicle: 'Honda CR-V 2020', date: '08 Apr 2026', score: 83, status: 'closed' },
  { id: 'ORD-1871', vehicle: 'Ford Ranger 2018', date: '07 Apr 2026', score: 61, status: 'closed' },
  { id: 'ORD-1862', vehicle: 'Nissan Altima 2021', date: '06 Apr 2026', score: 91, status: 'closed' },
];

const EARNINGS = [
  { id: 'earn-001', date: '10 Apr 2026', orderId: 'ORD-1892', vehicle: 'Toyota Camry 2019', amount: 7500, status: 'pending' },
  { id: 'earn-002', date: '09 Apr 2026', orderId: 'ORD-1885', vehicle: 'Toyota Highlander 2016', amount: 7500, status: 'paid' },
  { id: 'earn-003', date: '08 Apr 2026', orderId: 'ORD-1878', vehicle: 'Honda CR-V 2020', amount: 7500, status: 'paid' },
  { id: 'earn-004', date: '07 Apr 2026', orderId: 'ORD-1871', vehicle: 'Ford Ranger 2018', amount: 7500, status: 'paid' },
  { id: 'earn-005', date: '06 Apr 2026', orderId: 'ORD-1862', vehicle: 'Nissan Altima 2021', amount: 7500, status: 'paid' },
];

const DOCS = [
  { id: 'doc-nin', label: 'National ID (NIN)', status: 'approved', expiry: 'N/A' },
  { id: 'doc-dl', label: "Driver\'s License", status: 'approved', expiry: 'Mar 2028' },
  { id: 'doc-ins', label: 'Insurance Certificate', status: 'pending', expiry: 'Dec 2026' },
];

const SCHEDULE_SLOTS: Record<string, { customer: string; vehicle: string; zone: string; status: 'confirmed' | 'completed' | 'cancelled' }[]> = {
  '08:00': [{ customer: 'Adaeze Mbah', vehicle: 'Toyota Camry', zone: 'Lekki', status: 'completed' }],
  '10:00': [{ customer: 'Tunde Babs', vehicle: 'Honda Accord', zone: 'VI', status: 'confirmed' }],
  '12:00': [],
  '14:00': [{ customer: 'Ngozi Ike', vehicle: 'Ford Escape', zone: 'Lagos Island', status: 'confirmed' }],
  '16:00': [],
  '18:00': [],
};

const SLOT_COLORS = {
  confirmed: 'bg-[#2E75B6] text-white',
  completed: 'bg-[#1A7A4A] text-white',
  cancelled: 'bg-[#C0392B] text-white',
};

interface Props { inspector: Inspector; onBack: () => void; }

export default function InspectorProfile({ inspector, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'earnings' | 'account'>('overview');

  const TABS = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'schedule' as const, label: 'Schedule' },
    { id: 'earnings' as const, label: 'Earnings & Payouts' },
    { id: 'account' as const, label: 'Account & Docs' },
  ];

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors">
        <ArrowLeft size={16} /> Back to Inspectors
      </button>

      {/* Hero card */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-2xl font-bold">{inspector.avatar}</div>
            <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${inspector.status === 'available' ? 'bg-[#1A7A4A]' : inspector.status === 'busy' ? 'bg-[#D35400]' : 'bg-gray-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h1 className="text-xl font-heading font-bold text-[#1F2937]">{inspector.name}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs bg-[#1E3A5F] text-white px-2.5 py-0.5 rounded-full font-semibold">{inspector.certification}</span>
                  <span className="text-xs text-[#6B7280]">Joined {inspector.joinedDate}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {inspector.zones.map(z => (
                <span key={`pzone-${inspector.id}-${z}`} className="text-[10px] bg-blue-50 text-[#2E75B6] border border-blue-100 px-2 py-0.5 rounded-full font-medium">{z}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[#F4F6F8]">
          {[
            { icon: Star, label: 'Rating', value: `${inspector.rating} ★`, color: 'text-amber-500' },
            { icon: Briefcase, label: 'Jobs Completed', value: inspector.totalJobs.toString(), color: 'text-[#2E75B6]' },
            { icon: Clock, label: 'On-Time Rate', value: `${inspector.onTimeRate}%`, color: 'text-[#1A7A4A]' },
            { icon: DollarSign, label: 'Earned This Month', value: `₦${inspector.earningsMTD.toLocaleString()}`, color: 'text-[#1A7A4A]' },
          ].map(stat => (
            <div key={`stat-${stat.label}`} className="text-center p-3 bg-[#F4F6F8] rounded-xl">
              <stat.icon size={18} className={`mx-auto mb-1 ${stat.color}`} />
              <p className={`text-lg font-heading font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-[#6B7280] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E5E7EB]">
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${activeTab === tab.id ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Jobs per week */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Jobs Completed (Last 12 Weeks)</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={WEEKLY_JOBS} margin={{ top: 4, right: 4, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                  <Line type="monotone" dataKey="jobs" stroke="#1E3A5F" strokeWidth={2} dot={{ fill: '#1E3A5F', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Turnaround */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Avg Turnaround (min) — Target: 10 min</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={WEEKLY_JOBS} margin={{ top: 4, right: 4, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[7, 11]} tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                  <ReferenceLine y={10} stroke="#C0392B" strokeDasharray="4 4" label={{ value: 'Target', fontSize: 10, fill: '#C0392B' }} />
                  <Line type="monotone" dataKey="turnaround" stroke="#2E75B6" strokeWidth={2} dot={{ fill: '#2E75B6', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Recent jobs */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Recent Jobs</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-[#F4F6F8] text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  <th className="px-5 py-3 text-left">Order #</th>
                  <th className="px-4 py-3 text-left">Vehicle</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Score</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F6F8]">
                {RECENT_JOBS.map(job => (
                  <tr key={job.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-[#1E3A5F]">{job.id}</td>
                    <td className="px-4 py-3 text-sm text-[#1F2937]">{job.vehicle}</td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">{job.date}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-bold tabular-nums ${job.score >= 71 ? 'text-[#1A7A4A]' : job.score >= 41 ? 'text-[#D35400]' : 'text-[#C0392B]'}`}>{job.score}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${job.status === 'closed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {job.status === 'closed' ? 'Closed' : 'In Progress'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Schedule */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Weekly Schedule — Fri 10 Apr 2026</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-[#F4F6F8] border border-[#E5E7EB] px-3 py-1.5 rounded-lg text-[#6B7280]">5/8 slots filled today</span>
              <button className="px-3 py-1.5 text-xs font-semibold text-[#2E75B6] border border-[#2E75B6]/30 rounded-lg hover:bg-blue-50 transition-colors">
                + Add Block
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {Object.entries(SCHEDULE_SLOTS).map(([time, slots]) => (
              <div key={`slot-${time}`} className="flex gap-3 items-start">
                <span className="text-xs font-mono text-[#6B7280] w-14 flex-shrink-0 pt-2">{time}</span>
                <div className="flex-1 min-h-[44px] border-l-2 border-[#E5E7EB] pl-3">
                  {slots.length > 0 ? slots.map((slot, si) => (
                    <div key={`slot-${time}-${si}`} className={`px-3 py-2 rounded-lg text-xs font-medium ${SLOT_COLORS[slot.status]} mb-1`}>
                      <span className="font-semibold">{slot.customer}</span> · {slot.vehicle} · {slot.zone}
                    </div>
                  )) : (
                    <div className="h-9 border-2 border-dashed border-[#E5E7EB] rounded-lg flex items-center px-3">
                      <span className="text-[10px] text-[#6B7280]">Available</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            {[{ color: 'bg-[#2E75B6]', label: 'Confirmed' }, { color: 'bg-[#1A7A4A]', label: 'Completed' }, { color: 'bg-[#C0392B]', label: 'Cancelled' }].map(l => (
              <div key={`sched-legend-${l.label}`} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded ${l.color}`} />
                <span className="text-[10px] text-[#6B7280]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Earnings */}
      {activeTab === 'earnings' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Current Period (Apr)', value: `₦${inspector.earningsMTD.toLocaleString()}`, sub: '28 completed jobs' },
              { label: 'Last Period (Mar)', value: '₦162,000', sub: '24 completed jobs' },
              { label: 'Total YTD', value: '₦521,000', sub: 'Jan–Apr 2026' },
            ].map(s => (
              <div key={`earn-sum-${s.label}`} className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
                <p className="text-xs font-semibold text-[#6B7280] mb-1">{s.label}</p>
                <p className="text-2xl font-heading font-bold text-[#1A7A4A] tabular-nums">{s.value}</p>
                <p className="text-[10px] text-[#6B7280] mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Earnings Breakdown</h3>
              <div className="flex gap-2">
                <button onClick={() => toast.info('Generating payslip PDF…')} className="px-3 py-1.5 text-xs font-semibold text-[#2E75B6] border border-[#2E75B6]/30 rounded-lg hover:bg-blue-50 transition-colors">
                  Generate Payslip
                </button>
                <button onClick={() => toast.success('Period marked as paid')} className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1A7A4A] rounded-lg hover:bg-[#155F3A] transition-colors">
                  Mark as Paid
                </button>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-[#F4F6F8] text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Order #</th>
                  <th className="px-4 py-3 text-left">Vehicle</th>
                  <th className="px-4 py-3 text-right">Commission</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F6F8]">
                {EARNINGS.map(e => (
                  <tr key={e.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                    <td className="px-5 py-3 text-xs text-[#6B7280]">{e.date}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1E3A5F]">{e.orderId}</td>
                    <td className="px-4 py-3 text-sm text-[#1F2937]">{e.vehicle}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-[#1F2937] tabular-nums">₦{e.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${e.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {e.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Account */}
      {activeTab === 'account' && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', value: inspector.name, type: 'text' },
                { label: 'Phone Number', value: inspector.phone, type: 'tel' },
                { label: 'Email Address', value: inspector.email, type: 'email' },
                { label: 'Bank Account', value: '0123456789 — GTBank', type: 'text' },
              ].map(field => (
                <div key={`field-${field.label}`}>
                  <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">{field.label}</label>
                  <input type={field.type} defaultValue={field.value} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all" />
                </div>
              ))}
            </div>
            <button onClick={() => toast.success('Profile updated successfully')} className="mt-4 px-5 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all active:scale-[0.98]">
              Save Changes
            </button>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Documents</h3>
            <div className="space-y-3">
              {DOCS.map(doc => (
                <div key={doc.id} className="flex items-center gap-4 p-3 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB]">
                  <Shield size={18} className={doc.status === 'approved' ? 'text-[#1A7A4A]' : 'text-[#D35400]'} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1F2937]">{doc.label}</p>
                    <p className="text-[10px] text-[#6B7280]">Expiry: {doc.expiry}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${doc.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {doc.status === 'approved' ? 'Approved' : 'Pending Review'}
                  </span>
                  <button className="flex items-center gap-1 text-xs text-[#2E75B6] hover:underline">
                    <Upload size={12} /> Upload
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl border border-red-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-[#C0392B]" />
              <h3 className="text-sm font-heading font-semibold text-[#C0392B]">Danger Zone</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => toast.warning('Account suspended — inspector notified')} className="px-4 py-2 border border-[#D35400] text-[#D35400] text-sm font-semibold rounded-lg hover:bg-amber-50 transition-colors">
                Suspend Account
              </button>
              <button onClick={() => toast.error('Account deactivated')} className="px-4 py-2 border border-[#C0392B] text-[#C0392B] text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors">
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}