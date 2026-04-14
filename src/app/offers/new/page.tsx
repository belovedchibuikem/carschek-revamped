'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { CARS, CRM_CONTACTS, formatNaira } from '@/lib/mockData';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function NewOfferPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [form, setForm] = useState({
    carId: '', contactId: '', offerPrice: '', validDays: '7',
    sendEmail: true, sendSMS: false, notes: '',
  });
  const [saving, setSaving] = useState(false);

  const selectedCar = CARS.find(c => c.id === form.carId);
  const selectedContact = CRM_CONTACTS.find(c => c.id === form.contactId);
  const expiryDate = form.validDays ? new Date(Date.now() + parseInt(form.validDays) * 86400000).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  const set = (key: string, val: string | boolean) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSend = async () => {
    if (!form.carId || !form.contactId || !form.offerPrice) { toast.error('Car, contact, and offer price are required'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    toast.success('Offer sent successfully!');
    router.push('/offers');
  };

  const handleDraft = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success('Offer saved as draft');
    router.push('/offers');
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/offers" className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8] transition-colors">
            <ArrowLeft size={16} className="text-[#6B7280]" />
          </Link>
          <h1 className="text-xl font-heading font-bold text-[#1F2937]">Create Offer</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
              <h2 className="text-sm font-heading font-semibold text-[#1F2937]">Offer Details</h2>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Car *</label>
                <select value={form.carId} onChange={e => set('carId', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30">
                  <option value="">Select car…</option>
                  {CARS.map(c => <option key={c.id} value={c.id}>{c.id} — {c.brand} {c.model} {c.year}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Contact *</label>
                <select value={form.contactId} onChange={e => set('contactId', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30">
                  <option value="">Select contact…</option>
                  {CRM_CONTACTS.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Offer Price (₦) *</label>
                <input type="number" value={form.offerPrice} onChange={e => set('offerPrice', e.target.value)} placeholder="e.g. 5000000"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
                {selectedCar && (
                  <p className="text-xs text-[#6B7280] mt-1">Market reference: {formatNaira(selectedCar.purchasePrice)} (purchase price)</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Valid for (days)</label>
                <input type="number" value={form.validDays} onChange={e => set('validDays', e.target.value)} min="1" max="90"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
                {expiryDate && <p className="text-xs text-[#6B7280] mt-1">Expires: {expiryDate}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Additional notes for the offer…"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-2">Send via</label>
                <div className="flex gap-3">
                  {[{ key: 'sendEmail', label: 'Email' }, { key: 'sendSMS', label: 'SMS' }].map(opt => (
                    <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form[opt.key as keyof typeof form] as boolean} onChange={e => set(opt.key, e.target.checked)} className="w-4 h-4 rounded" />
                      <span className="text-sm text-[#1F2937]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleDraft} disabled={saving} className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] disabled:opacity-50 transition-colors">
                Save Draft
              </button>
              <button onClick={handleSend} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] disabled:opacity-50 transition-all">
                <Send size={14} /> {saving ? 'Sending…' : 'Send Offer'}
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h2 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Live Preview</h2>
            <div className="border border-[#E5E7EB] rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5E7EB]">
                <div className="w-8 h-8 bg-[#1E3A5F] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">CK</span>
                </div>
                <span className="font-heading font-bold text-[#1E3A5F]">CARSCHEK</span>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Dear {selectedContact?.name || '[Contact Name]'},</p>
                <p className="text-sm text-[#1F2937] mt-2">We are pleased to present you with the following vehicle offer:</p>
              </div>
              <div className="bg-[#F4F6F8] rounded-xl p-4">
                <p className="text-sm font-semibold text-[#1F2937]">{selectedCar ? `${selectedCar.brand} ${selectedCar.model} ${selectedCar.year}` : '[Vehicle Name]'}</p>
                {selectedCar && <p className="text-xs text-[#6B7280] mt-0.5">Carschek Score: {selectedCar.score}/100</p>}
                <p className="text-2xl font-heading font-bold text-[#1E3A5F] mt-3">
                  {form.offerPrice ? formatNaira(parseInt(form.offerPrice)) : '₦0'}
                </p>
                {expiryDate && <p className="text-xs text-[#6B7280] mt-1">Valid until: {expiryDate}</p>}
              </div>
              {form.notes && <p className="text-xs text-[#6B7280] italic">{form.notes}</p>}
              <p className="text-xs text-[#9CA3AF]">Carschek Technologies Ltd · admin.carschek.com</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
