'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { toast } from 'sonner';

export default function NewOrderPage() {
  const pathname = usePathname();
  const [form, setForm] = React.useState({
    customerName: '', customerPhone: '', vehicle: '', plate: '',
    zone: '', scheduledDate: '', scheduledTime: '', notes: '',
  });
  const [saving, setSaving] = React.useState(false);
  const router = require('next/navigation').useRouter();

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.customerName || !form.vehicle || !form.scheduledDate) {
      toast.error('Customer name, vehicle, and date are required');
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    toast.success('Order ORD-1898 created successfully!');
    router.push('/orders');
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/orders" className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8] transition-colors">
            <ArrowLeft size={16} className="text-[#6B7280]" />
          </Link>
          <h1 className="text-xl font-heading font-bold text-[#1F2937]">New Inspection Order</h1>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
          <h2 className="text-sm font-heading font-semibold text-[#1F2937]">Customer & Vehicle</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Customer Name *', key: 'customerName', type: 'text' },
              { label: 'Customer Phone', key: 'customerPhone', type: 'tel' },
              { label: 'Vehicle *', key: 'vehicle', type: 'text', placeholder: 'e.g. Toyota Camry 2015' },
              { label: 'Plate Number', key: 'plate', type: 'text' },
              { label: 'Zone / Location', key: 'zone', type: 'text' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">{f.label}</label>
                <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
              </div>
            ))}
          </div>

          <h2 className="text-sm font-heading font-semibold text-[#1F2937] pt-2">Schedule</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Date *</label>
              <input type="date" value={form.scheduledDate} onChange={e => set('scheduledDate', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Time</label>
              <input type="time" value={form.scheduledTime} onChange={e => set('scheduledTime', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Special instructions…"
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/orders" className="flex-1 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors text-center">
            Cancel
          </Link>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] disabled:opacity-60 transition-all">
            {saving ? 'Creating…' : 'Create Order'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
