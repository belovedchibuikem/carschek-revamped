'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';

import { Plus, Search, Calendar, Clock, MapPin } from 'lucide-react';
import { APPOINTMENTS, STATUS_COLORS } from '@/lib/mockData';
import { toast } from 'sonner';

export default function AppointmentsPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ customerName: '', type: 'Inspection', vehicle: '', date: '', time: '', location: '' });

  const filtered = APPOINTMENTS.filter(a =>
    !search || a.customerName.toLowerCase().includes(search.toLowerCase()) || a.vehicle.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.customerName || !form.date) { toast.error('Customer name and date are required'); return; }
    toast.success('Appointment created successfully');
    setShowModal(false);
    setForm({ customerName: '', type: 'Inspection', vehicle: '', date: '', time: '', location: '' });
  };

  return (
    <AppLayout currentPath={pathname}>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-fade-in">
            <h3 className="text-base font-heading font-semibold text-[#1F2937] mb-4">New Appointment</h3>
            <div className="space-y-3">
              {[
                { label: 'Customer Name *', key: 'customerName', type: 'text' },
                { label: 'Vehicle', key: 'vehicle', type: 'text' },
                { label: 'Date *', key: 'date', type: 'date' },
                { label: 'Time', key: 'time', type: 'time' },
                { label: 'Location', key: 'location', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">{f.label}</label>
                  <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30">
                  <option>Inspection</option>
                  <option>Test Drive</option>
                  <option>Consultation</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={handleCreate} className="flex-1 px-4 py-2.5 bg-[#1E3A5F] text-white rounded-lg text-sm font-semibold hover:bg-[#16304F]">Create</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Appointments</h1>
            <p className="text-sm text-[#6B7280]">{APPOINTMENTS.length} appointments</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all min-h-[44px]">
            <Plus size={16} /> New Appointment
          </button>
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search appointments…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(apt => (
            <div key={apt.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{apt.type}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[apt.status]}`}>{apt.status}</span>
              </div>
              <h3 className="text-sm font-semibold text-[#1F2937] mb-1">{apt.customerName}</h3>
              <p className="text-xs text-[#6B7280] mb-3">{apt.vehicle}</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <Calendar size={12} /> {apt.date}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <Clock size={12} /> {apt.time}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <MapPin size={12} /> {apt.location}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => toast.success('Appointment confirmed')} className="flex-1 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg hover:bg-[#16304F] transition-all">
                  Confirm
                </button>
                <button onClick={() => toast.success('Appointment cancelled')} className="flex-1 py-2 border border-[#E5E7EB] text-xs font-medium text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
