'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { toast } from 'sonner';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import {
  brandOptionsByName,
  modelOptionsByName,
  yearOptionsForModelName,
} from '@/lib/reference/carCascade';
import { ordersApi } from '@/lib/api/services';

export default function NewOrderPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [form, setForm] = React.useState({
    customerName: '', customerPhone: '', brand: '', model: '', year: '', plate: '',
    zone: '', scheduledDate: '', scheduledTime: '', notes: '',
  });
  const [saving, setSaving] = React.useState(false);

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.customerName || !form.brand || !form.model || !form.year || !form.scheduledDate) {
      toast.error('Customer name, vehicle (brand/model/year), and date are required');
      return;
    }
    setSaving(true);
    try {
      const scheduledAt = form.scheduledTime
        ? `${form.scheduledDate}T${form.scheduledTime}:00`
        : `${form.scheduledDate}T09:00:00`;
      const created = await ordersApi.create({
        customerName: form.customerName,
        customerPhone: form.customerPhone || undefined,
        vehicle: `${form.brand} ${form.model} ${form.year}`,
        plate: form.plate || undefined,
        zone: form.zone || undefined,
        scheduledAt,
        notes: form.notes || undefined,
        status: 'New',
      });
      toast.success(`Order ${created.id} created successfully!`);
      router.push(`/orders/${created.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not create order');
    } finally {
      setSaving(false);
    }
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
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Customer Name *</label>
              <input type="text" value={form.customerName} onChange={e => set('customerName', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Customer Phone</label>
              <input type="tel" value={form.customerPhone} onChange={e => set('customerPhone', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Brand *</label>
              <SearchableSelect
                value={form.brand}
                onChange={v => setForm(prev => ({ ...prev, brand: v, model: '', year: '' }))}
                options={brandOptionsByName()}
                placeholder="Search or select brand…"
                searchPlaceholder="Search brands…"
                aria-label="Brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Model *</label>
              <SearchableSelect
                value={form.model}
                onChange={v => setForm(prev => ({ ...prev, model: v, year: '' }))}
                options={modelOptionsByName(form.brand)}
                disabled={!form.brand}
                placeholder={form.brand ? 'Search or select model…' : 'Select brand first'}
                searchPlaceholder="Search models…"
                aria-label="Model"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Year *</label>
              <SearchableSelect
                value={form.year}
                onChange={v => set('year', v)}
                options={yearOptionsForModelName(form.brand, form.model)}
                disabled={!form.model}
                placeholder={form.model ? 'Search or select year…' : 'Select model first'}
                searchPlaceholder="Search years…"
                aria-label="Year"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Plate Number</label>
              <input type="text" value={form.plate} onChange={e => set('plate', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Zone / Location</label>
              <input type="text" value={form.zone} onChange={e => set('zone', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
            </div>
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
