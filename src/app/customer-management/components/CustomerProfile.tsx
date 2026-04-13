'use client';
import React, { useState } from 'react';
import { ArrowLeft, Phone, Mail, Shield, Car, AlertTriangle, Download, Trash2 } from 'lucide-react';
import { Customer } from './CustomerModule';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BOOKING_HISTORY = [
  { id: 'bk-001', orderId: 'ORD-1892', date: '10 Apr 2026', vehicle: 'Toyota Camry 2019', service: 'Pre-purchase Inspection', inspector: 'Emeka Okonkwo', score: 76, amount: 54000, status: 'in-progress' },
  { id: 'bk-002', orderId: 'ORD-1812', date: '15 Mar 2026', vehicle: 'Honda Accord 2020', service: 'Pre-purchase Inspection', inspector: 'Adaora Nwosu', score: 83, amount: 54000, status: 'closed' },
  { id: 'bk-003', orderId: 'ORD-1744', date: '22 Feb 2026', vehicle: 'Ford Escape 2018', service: 'Pre-purchase Inspection', inspector: 'Emeka Okonkwo', score: 61, amount: 54000, status: 'closed' },
  { id: 'bk-004', orderId: 'ORD-1690', date: '10 Jan 2026', vehicle: 'Lexus RX350 2017', service: 'Pre-purchase Inspection', inspector: 'Chukwudi Eze', score: 88, amount: 54000, status: 'closed' },
  { id: 'bk-005', orderId: 'ORD-1611', date: '03 Dec 2025', vehicle: 'Toyota Highlander 2016', service: 'Re-inspection', inspector: 'Emeka Okonkwo', score: 55, amount: 27000, status: 'closed' },
];

const BOOKING_FREQ = [
  { month: 'Nov', bookings: 1 },
  { month: 'Dec', bookings: 2 },
  { month: 'Jan', bookings: 1 },
  { month: 'Feb', bookings: 1 },
  { month: 'Mar', bookings: 1 },
  { month: 'Apr', bookings: 1 },
];

const VEHICLES = [
  { id: 'veh-001', plate: 'LSD-421-KJ', make: 'Toyota', model: 'Camry', year: 2019, lastInspected: '10 Apr 2026', score: 76 },
  { id: 'veh-002', plate: 'LND-334-AB', make: 'Honda', model: 'Accord', year: 2020, lastInspected: '15 Mar 2026', score: 83 },
  { id: 'veh-003', plate: 'LSD-881-XZ', make: 'Ford', model: 'Escape', year: 2018, lastInspected: '22 Feb 2026', score: 61 },
];

const PAYMENTS = [
  { id: 'pay-001', date: '10 Apr 2026', description: 'Pre-purchase Inspection — Toyota Camry 2019', amount: 54000, method: 'Card', reference: 'PAY-2026041001', status: 'completed' },
  { id: 'pay-002', date: '15 Mar 2026', description: 'Pre-purchase Inspection — Honda Accord 2020', amount: 54000, method: 'Transfer', reference: 'PAY-2026031501', status: 'completed' },
  { id: 'pay-003', date: '22 Feb 2026', description: 'Pre-purchase Inspection — Ford Escape 2018', amount: 54000, method: 'Card', reference: 'PAY-2026022201', status: 'completed' },
  { id: 'pay-004', date: '10 Jan 2026', description: 'Pre-purchase Inspection — Lexus RX350 2017', amount: 54000, method: 'Transfer', reference: 'PAY-2026011001', status: 'completed' },
  { id: 'pay-005', date: '03 Dec 2025', description: 'Re-inspection — Toyota Highlander 2016', amount: 27000, method: 'Card', reference: 'PAY-2025120301', status: 'refunded' },
];

const COMMUNICATIONS = [
  { id: 'comm-001', timestamp: '10 Apr 2026, 10:05', channel: 'sms', icon: '📱', content: 'SMS: "Your inspection for Toyota Camry has started. Inspector Emeka is on-site."', actor: 'System' },
  { id: 'comm-002', timestamp: '10 Apr 2026, 09:58', channel: 'email', icon: '✉️', content: 'Email: Order confirmation and inspector details sent', actor: 'System' },
  { id: 'comm-003', timestamp: '09 Apr 2026, 16:30', channel: 'note', icon: '📝', content: 'Admin note: Customer called to confirm tomorrow\'s appointment. Confirmed for 10:00 WAT.', actor: 'Promise Ndem' },
  { id: 'comm-004', timestamp: '15 Mar 2026, 14:12', channel: 'email', icon: '✉️', content: 'Email: Inspection report delivered — Honda Accord 2020 (Score: 83/100)', actor: 'System' },
  { id: 'comm-005', timestamp: '15 Mar 2026, 14:10', channel: 'sms', icon: '📱', content: 'SMS: "Your Carschek report is ready. Score: 83/100. View: carschek.com/r/RPT-388"', actor: 'System' },
];

interface Props { customer: Customer; onBack: () => void; }

export default function CustomerProfile({ customer, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'vehicles' | 'payments' | 'communications' | 'actions'>('bookings');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);
  const [noteText, setNoteText] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');

  const TABS = [
    { id: 'bookings' as const, label: 'Booking History' },
    { id: 'vehicles' as const, label: 'Vehicles' },
    { id: 'payments' as const, label: 'Payments' },
    { id: 'communications' as const, label: 'Communications' },
    { id: 'actions' as const, label: 'Account Actions' },
  ];

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors">
        <ArrowLeft size={16} /> Back to Customers
      </button>

      {/* Hero */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-[#2E75B6] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {customer.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h1 className="text-xl font-heading font-bold text-[#1F2937]">{customer.name}</h1>
                <p className="text-xs text-[#6B7280] mt-0.5">Member since {customer.memberSince}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${customer.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : customer.status === 'flagged' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
              </span>
            </div>
            {/* Verification badges */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {[
                { label: 'Phone', verified: customer.phoneVerified, icon: Phone },
                { label: 'Email', verified: customer.emailVerified, icon: Mail },
                { label: 'BVN', verified: customer.bvnVerified, icon: Shield },
              ].map(badge => (
                <div key={`badge-${badge.label}`} className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.verified ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  <badge.icon size={10} />
                  {badge.label} {badge.verified ? '✓' : '✗'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lifetime stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[#F4F6F8]">
          {[
            { label: 'Total Bookings', value: customer.totalBookings.toString(), color: 'text-[#2E75B6]' },
            { label: 'Vehicles Inspected', value: customer.vehiclesInspected.toString(), color: 'text-[#2E75B6]' },
            { label: 'Total Spent', value: `₦${customer.lifetimeValue.toLocaleString()}`, color: 'text-[#1A7A4A]' },
            { label: 'Last Active', value: customer.lastActive, color: 'text-[#1F2937]' },
          ].map(stat => (
            <div key={`cstat-${stat.label}`} className="text-center p-3 bg-[#F4F6F8] rounded-xl">
              <p className={`text-lg font-heading font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-[#6B7280] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E5E7EB] overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 min-w-max">
          {TABS.map(tab => (
            <button
              key={`ctab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === tab.id ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: Booking History */}
      {activeTab === 'bookings' && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Booking Frequency (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={BOOKING_FREQ} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                <Bar dataKey="bookings" fill="#1E3A5F" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937]">All Bookings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-[#F4F6F8] text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    <th className="px-5 py-3 text-left">Order #</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Vehicle</th>
                    <th className="px-4 py-3 text-left">Service</th>
                    <th className="px-4 py-3 text-left">Inspector</th>
                    <th className="px-4 py-3 text-right">Score</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F6F8]">
                  {BOOKING_HISTORY.map(bk => (
                    <tr key={bk.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-[#1E3A5F]">{bk.orderId}</td>
                      <td className="px-4 py-3 text-xs text-[#6B7280]">{bk.date}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-[#1F2937]">{bk.vehicle}</td>
                      <td className="px-4 py-3 text-xs text-[#6B7280]">{bk.service}</td>
                      <td className="px-4 py-3 text-xs text-[#1F2937]">{bk.inspector}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-bold tabular-nums ${bk.score >= 71 ? 'text-[#1A7A4A]' : bk.score >= 41 ? 'text-[#D35400]' : 'text-[#C0392B]'}`}>{bk.score}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-[#1F2937] tabular-nums">₦{bk.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${bk.status === 'closed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                          {bk.status === 'closed' ? 'Closed' : 'In Progress'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Vehicles */}
      {activeTab === 'vehicles' && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {VEHICLES.map(veh => (
              <div key={veh.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-all">
                <div className="w-full h-28 bg-[#F4F6F8] rounded-lg flex items-center justify-center mb-4 border border-[#E5E7EB]">
                  <Car size={36} className="text-[#E5E7EB]" />
                </div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-heading font-semibold text-[#1F2937]">{veh.year} {veh.make} {veh.model}</h3>
                    <p className="font-mono text-xs text-[#6B7280] mt-0.5">{veh.plate}</p>
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${veh.score >= 71 ? 'text-[#1A7A4A]' : veh.score >= 41 ? 'text-[#D35400]' : 'text-[#C0392B]'}`}>
                    {veh.score}<span className="text-[10px] text-[#6B7280] font-normal">/100</span>
                  </span>
                </div>
                <p className="text-[10px] text-[#6B7280] mb-3">Last inspected: {veh.lastInspected}</p>
                <button className="w-full py-1.5 text-xs font-semibold text-[#2E75B6] border border-[#2E75B6]/30 rounded-lg hover:bg-blue-50 transition-colors">
                  Book Inspection
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Payments */}
      {activeTab === 'payments' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Spent', value: `₦${customer.lifetimeValue.toLocaleString()}`, sub: `${customer.totalBookings} transactions` },
              { label: 'Avg per Booking', value: `₦${Math.round(customer.lifetimeValue / customer.totalBookings).toLocaleString()}`, sub: 'Per inspection' },
              { label: 'Refunds', value: '₦27,000', sub: '1 refund processed' },
            ].map(s => (
              <div key={`psum-${s.label}`} className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
                <p className="text-xs font-semibold text-[#6B7280] mb-1">{s.label}</p>
                <p className="text-xl font-heading font-bold text-[#1F2937] tabular-nums">{s.value}</p>
                <p className="text-[10px] text-[#6B7280] mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Payment History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-[#F4F6F8] text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-left">Method</th>
                    <th className="px-4 py-3 text-left">Reference</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F6F8]">
                  {PAYMENTS.map(pay => (
                    <tr key={pay.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                      <td className="px-5 py-3 text-xs text-[#6B7280]">{pay.date}</td>
                      <td className="px-4 py-3 text-xs text-[#1F2937] max-w-[200px] truncate">{pay.description}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-[#1F2937]">₦{pay.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-[#6B7280]">{pay.method}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-[#6B7280]">{pay.reference}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pay.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                          {pay.status === 'completed' ? 'Completed' : 'Refunded'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Communications */}
      {activeTab === 'communications' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Add Admin Note</h3>
            <textarea
              rows={3}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Add a note about this customer visible to admin team only…"
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] resize-none transition-all"
            />
            <button
              onClick={() => { if (noteText.trim()) { toast.success('Note added successfully'); setNoteText(''); } }}
              className="mt-2 px-4 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg hover:bg-[#16304F] transition-all active:scale-[0.98]"
            >
              Add Note
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Communication Log</h3>
            </div>
            <div className="divide-y divide-[#F4F6F8]">
              {COMMUNICATIONS.map(comm => (
                <div key={comm.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#F4F6F8]/40 transition-colors">
                  <span className="text-xl flex-shrink-0">{comm.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#1F2937] leading-relaxed">{comm.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[#6B7280]">{comm.timestamp}</span>
                      <span className="text-[10px] text-[#6B7280]">·</span>
                      <span className="text-[10px] font-semibold text-[#2E75B6]">{comm.actor}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${comm.channel === 'sms' ? 'bg-green-50 text-green-700' : comm.channel === 'email' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                    {comm.channel.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Account Actions */}
      {activeTab === 'actions' && (
        <div className="space-y-4 animate-fade-in">
          {/* Flag */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Account Management</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB]">
                <div>
                  <p className="text-sm font-semibold text-[#1F2937]">Flag Account</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">Mark for review due to suspicious activity or dispute</p>
                </div>
                <button onClick={() => setShowFlagModal(true)} className="px-4 py-2 border border-[#D35400] text-[#D35400] text-xs font-semibold rounded-lg hover:bg-amber-50 transition-colors">
                  Flag Account
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB]">
                <div>
                  <p className="text-sm font-semibold text-[#1F2937]">
                    {customer.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {customer.status === 'suspended' ? 'Restore access to this account' : 'Temporarily block access to this account'}
                  </p>
                </div>
                <button
                  onClick={() => customer.status === 'suspended' ? toast.success('Account reactivated') : setShowSuspendModal(true)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${customer.status === 'suspended' ? 'border-[#1A7A4A] text-[#1A7A4A] hover:bg-green-50' : 'border-[#C0392B] text-[#C0392B] hover:bg-red-50'}`}
                >
                  {customer.status === 'suspended' ? 'Reactivate' : 'Suspend Account'}
                </button>
              </div>
            </div>
          </div>

          {/* NDPC Export */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-2">Data Export (NDPC Compliance)</h3>
            <p className="text-xs text-[#6B7280] mb-4">Download all data associated with this customer as required by the Nigeria Data Protection Commission (NDPC).</p>
            <button onClick={() => toast.info('Generating NDPC data export…')} className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-colors">
              <Download size={15} /> Export Customer Data (JSON/PDF)
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl border border-red-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-[#C0392B]" />
              <h3 className="text-sm font-heading font-semibold text-[#C0392B]">Danger Zone</h3>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl border border-red-100">
              <div>
                <p className="text-sm font-semibold text-[#1F2937]">Delete Account</p>
                <p className="text-xs text-[#6B7280] mt-0.5">Permanently delete all customer data. This action cannot be undone.</p>
              </div>
              <button onClick={() => { setDeleteStep(0); setShowDeleteModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#C0392B] text-white text-xs font-semibold rounded-lg hover:bg-[#A93226] transition-colors">
                <Trash2 size={13} /> Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFlagModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in p-6">
            <h3 className="font-heading font-semibold text-[#1F2937] mb-4">Flag Account</h3>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Reason for flagging</label>
            <select value={flagReason} onChange={e => setFlagReason(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 mb-4">
              <option value="">Select a reason…</option>
              <option value="suspicious">Suspicious Activity</option>
              <option value="dispute">Dispute / Complaint</option>
              <option value="payment">Payment Issues</option>
              <option value="fraud">Potential Fraud</option>
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowFlagModal(false)} className="flex-1 py-2 border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={() => { setShowFlagModal(false); toast.warning(`${customer.name}'s account has been flagged`); }} className="flex-1 py-2 bg-[#D35400] text-white text-sm font-semibold rounded-lg hover:bg-[#B84600]">Flag Account</button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSuspendModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in p-6">
            <h3 className="font-heading font-semibold text-[#1F2937] mb-4">Suspend Account</h3>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Reason for suspension (required)</label>
            <textarea rows={3} value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Provide a clear reason for suspending this account…" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowSuspendModal(false)} className="flex-1 py-2 border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8]">Cancel</button>
              <button
                onClick={() => { if (!suspendReason.trim()) { toast.error('Please provide a reason for suspension'); return; } setShowSuspendModal(false); toast.error(`${customer.name}'s account has been suspended`); }}
                className="flex-1 py-2 bg-[#C0392B] text-white text-sm font-semibold rounded-lg hover:bg-[#A93226]"
              >
                Suspend Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal — 3-step */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in p-6">
            {deleteStep === 0 && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 size={18} className="text-[#C0392B]" />
                  </div>
                  <h3 className="font-heading font-semibold text-[#1F2937]">Delete Account</h3>
                </div>
                <p className="text-sm text-[#6B7280] mb-4">You are about to permanently delete <span className="font-semibold text-[#1F2937]">{customer.name}</span>&apos;s account and all associated data. This cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8]">Cancel</button>
                  <button onClick={() => setDeleteStep(1)} className="flex-1 py-2 bg-[#C0392B] text-white text-sm font-semibold rounded-lg hover:bg-[#A93226]">Continue</button>
                </div>
              </>
            )}
            {deleteStep === 1 && (
              <>
                <h3 className="font-heading font-semibold text-[#1F2937] mb-3">Are you absolutely sure?</h3>
                <p className="text-sm text-[#6B7280] mb-4">Type <span className="font-mono font-bold text-[#C0392B]">DELETE</span> to confirm permanent deletion.</p>
                <input type="text" placeholder="Type DELETE to confirm" className="w-full px-3 py-2 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400/30 mb-4 font-mono" onChange={e => { if (e.target.value === 'DELETE') setDeleteStep(2); }} />
                <button onClick={() => setShowDeleteModal(false)} className="w-full py-2 border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8]">Cancel</button>
              </>
            )}
            {deleteStep === 2 && (
              <>
                <h3 className="font-heading font-semibold text-[#C0392B] mb-3">Final Confirmation</h3>
                <p className="text-sm text-[#6B7280] mb-4">This will permanently delete {customer.name}&apos;s account, all bookings, payment history, and associated data from Carschek systems.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8]">Cancel</button>
                  <button onClick={() => { setShowDeleteModal(false); toast.error(`${customer.name}'s account has been permanently deleted`); onBack(); }} className="flex-1 py-2 bg-[#C0392B] text-white text-sm font-semibold rounded-lg hover:bg-[#A93226] flex items-center justify-center gap-2">
                    <Trash2 size={14} /> Delete Permanently
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}