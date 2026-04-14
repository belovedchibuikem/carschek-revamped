'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, ChevronRight, AlertTriangle, Upload } from 'lucide-react';
import { BRANDS, MODELS, YEARS, NIGERIAN_STATES } from '@/lib/mockData';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const STEPS = ['Vehicle Identity', 'Seller Contact', 'Purchase', 'Documents'];
const COLOURS = ['White', 'Black', 'Silver', 'Grey', 'Red', 'Blue', 'Navy Blue', 'Green', 'Brown', 'Gold', 'Beige', 'Orange', 'Yellow', 'Purple', 'Maroon', 'Pearl White'];
const BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Convertible', 'Bus'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT', 'Electric'];
const CHANNELS = ['Auction', 'Market Place', 'Offline', 'B2B', 'Other'];
const DOCUMENTS = ['Vehicle Registration', 'Proof of Ownership', 'Insurance Certificate', 'Road Worthiness', 'Customs Papers', 'Service History', 'Inspection Report', 'Sales Agreement'];

export default function NewCarPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const [form, setForm] = useState({
    brandId: '', modelId: '', year: '', transmission: 'Automatic', bodyType: 'Sedan',
    mileage: '', colour: '', vin: '', plate: '', engineNumber: '', city: '', state: '',
    contactType: 'Individual', firstName: '', lastName: '', email: '', phone: '',
    channel: '', purchaseDate: '', salesPerson: '', purchasePrice: '',
    docs: DOCUMENTS.map(d => ({ name: d, comment: '', file: null as File | null })),
  });

  const [vinDuplicate, setVinDuplicate] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredModels = MODELS.filter(m => m.brandId === form.brandId);

  const set = (key: string, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const checkVin = () => {
    if (form.vin.length === 17 && form.vin === 'JTDBE32K413012345') {
      setVinDuplicate(true);
    } else {
      setVinDuplicate(false);
    }
  };

  const validateStep = () => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!form.brandId) errs.brandId = 'Brand is required';
      if (!form.modelId) errs.modelId = 'Model is required';
      if (!form.year) errs.year = 'Year is required';
      if (!form.mileage) errs.mileage = 'Mileage is required';
      if (!form.colour) errs.colour = 'Colour is required';
      if (!form.vin || form.vin.length !== 17) errs.vin = 'VIN must be 17 characters';
      if (!form.plate) errs.plate = 'Plate number is required';
    }
    if (step === 1) {
      if (!form.firstName) errs.firstName = 'First name is required';
      if (!form.phone || form.phone.length < 10) errs.phone = 'Valid phone number required';
    }
    if (step === 2) {
      if (!form.channel) errs.channel = 'Purchase channel is required';
      if (!form.purchaseDate) errs.purchaseDate = 'Purchase date is required';
      if (!form.purchasePrice) errs.purchasePrice = 'Purchase price is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep(s => Math.min(3, s + 1));
  };

  const saveDraft = () => {
    setDraftSaved(true);
    toast.success('Draft saved');
    setTimeout(() => setDraftSaved(false), 3000);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1500));
    setSaving(false);
    toast.success('CK-49 Created Successfully! Car registered in the system.');
    router.push('/cars/CK-49');
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/cars" className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8] transition-colors">
            <ArrowLeft size={16} className="text-[#6B7280]" />
          </Link>
          <div>
            <h1 className="text-xl font-heading font-bold text-[#1F2937]">Register New Car</h1>
            <p className="text-sm text-[#6B7280]">4-step registration wizard</p>
          </div>
          <button onClick={saveDraft} className="ml-auto text-xs text-[#6B7280] hover:text-[#1F2937] flex items-center gap-1.5 px-3 py-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F8] transition-colors">
            {draftSaved ? <><Check size={12} className="text-[#1A7A4A]" /> Draft saved</> : 'Save as Draft'}
          </button>
        </div>

        {/* Step indicator */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <button
                  onClick={() => { if (i < step) setStep(i); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${i === step ? 'bg-[#1E3A5F] text-white' : i < step ? 'text-[#1A7A4A] hover:bg-green-50 cursor-pointer' : 'text-[#9CA3AF] cursor-default'}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i === step ? 'bg-white text-[#1E3A5F]' : i < step ? 'bg-[#1A7A4A] text-white' : 'bg-[#E5E7EB] text-[#9CA3AF]'}`}>
                    {i < step ? <Check size={10} /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s}</span>
                </button>
                {i < STEPS.length - 1 && <ChevronRight size={14} className="text-[#E5E7EB] flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-5">
          {step === 0 && (
            <>
              <h2 className="text-base font-heading font-semibold text-[#1F2937]">Vehicle Identity</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Brand *</label>
                  <select value={form.brandId} onChange={e => { set('brandId', e.target.value); set('modelId', ''); }}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 ${errors.brandId ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`}>
                    <option value="">Select brand…</option>
                    {BRANDS.filter(b => b.active).map(b => <option key={b.id} value={b.id}>{b.logo} {b.name}</option>)}
                  </select>
                  {errors.brandId && <p className="text-xs text-[#C0392B] mt-1">{errors.brandId}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Model *</label>
                  <select value={form.modelId} onChange={e => set('modelId', e.target.value)} disabled={!form.brandId}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 disabled:opacity-50 ${errors.modelId ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`}>
                    <option value="">Select model…</option>
                    {filteredModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  {errors.modelId && <p className="text-xs text-[#C0392B] mt-1">{errors.modelId}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Year *</label>
                  <select value={form.year} onChange={e => set('year', e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 ${errors.year ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`}>
                    <option value="">Select year…</option>
                    {YEARS.map(y => <option key={y.id} value={y.year}>{y.year}</option>)}
                  </select>
                  {errors.year && <p className="text-xs text-[#C0392B] mt-1">{errors.year}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Mileage (km) *</label>
                  <input type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} placeholder="e.g. 145000"
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 ${errors.mileage ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`} />
                  {errors.mileage && <p className="text-xs text-[#C0392B] mt-1">{errors.mileage}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-2">Transmission</label>
                <div className="flex flex-wrap gap-2">
                  {TRANSMISSIONS.map(t => (
                    <button key={t} onClick={() => set('transmission', t)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all ${form.transmission === t ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#2E75B6]'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-2">Body Type</label>
                <div className="flex flex-wrap gap-2">
                  {BODY_TYPES.map(t => (
                    <button key={t} onClick={() => set('bodyType', t)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all ${form.bodyType === t ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#2E75B6]'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-2">Colour *</label>
                <div className="flex flex-wrap gap-2">
                  {COLOURS.map(c => (
                    <button key={c} onClick={() => set('colour', c)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${form.colour === c ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#2E75B6]'}`}>
                      {c}
                    </button>
                  ))}
                </div>
                {errors.colour && <p className="text-xs text-[#C0392B] mt-1">{errors.colour}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">VIN * (17 characters)</label>
                  <input type="text" value={form.vin} onChange={e => set('vin', e.target.value.toUpperCase())} onBlur={checkVin}
                    maxLength={17} placeholder="e.g. JTDBE32K413012345"
                    className={`w-full px-3 py-2.5 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 ${errors.vin ? 'border-[#C0392B]' : vinDuplicate ? 'border-amber-400' : 'border-[#E5E7EB]'}`} />
                  <div className="flex items-center justify-between mt-1">
                    {errors.vin && <p className="text-xs text-[#C0392B]">{errors.vin}</p>}
                    <p className="text-xs text-[#9CA3AF] ml-auto">{form.vin.length}/17</p>
                  </div>
                  {vinDuplicate && (
                    <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                      <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">Duplicate VIN detected! <Link href="/cars/CK-41" className="underline font-medium">View existing record CK-41</Link></p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Licence Plate *</label>
                  <input type="text" value={form.plate} onChange={e => set('plate', e.target.value.toUpperCase())} placeholder="e.g. LND-234-KJ"
                    className={`w-full px-3 py-2.5 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 ${errors.plate ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`} />
                  {errors.plate && <p className="text-xs text-[#C0392B] mt-1">{errors.plate}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Engine Number</label>
                  <input type="text" value={form.engineNumber} onChange={e => set('engineNumber', e.target.value)} placeholder="Optional"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">State</label>
                  <select value={form.state} onChange={e => set('state', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30">
                    <option value="">Select state…</option>
                    {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-base font-heading font-semibold text-[#1F2937]">Seller Contact</h2>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-2">Contact Type</label>
                <div className="flex gap-3">
                  {['Individual', 'Dealer', 'Corporate'].map(t => (
                    <button key={t} onClick={() => set('contactType', t)}
                      className={`flex-1 py-3 text-sm rounded-xl border-2 transition-all ${form.contactType === t ? 'border-[#1E3A5F] bg-[#1E3A5F]/5 text-[#1E3A5F] font-semibold' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#2E75B6]'}`}>
                      {t === 'Individual' ? '👤' : t === 'Dealer' ? '🏢' : '🏭'} {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">First Name *</label>
                  <input type="text" value={form.firstName} onChange={e => set('firstName', e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 ${errors.firstName ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`} />
                  {errors.firstName && <p className="text-xs text-[#C0392B] mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Last Name</label>
                  <input type="text" value={form.lastName} onChange={e => set('lastName', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Phone * (+234)</label>
                  <div className="flex">
                    <span className="px-3 py-2.5 bg-[#F4F6F8] border border-r-0 border-[#E5E7EB] rounded-l-lg text-sm text-[#6B7280]">+234</span>
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} maxLength={10}
                      className={`flex-1 px-3 py-2.5 text-sm border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 ${errors.phone ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`} />
                  </div>
                  {errors.phone && <p className="text-xs text-[#C0392B] mt-1">{errors.phone}</p>}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-base font-heading font-semibold text-[#1F2937]">Purchase Details</h2>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-2">Purchase Channel *</label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map(c => (
                    <button key={c} onClick={() => set('channel', c)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all ${form.channel === c ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#2E75B6]'}`}>
                      {c}
                    </button>
                  ))}
                </div>
                {errors.channel && <p className="text-xs text-[#C0392B] mt-1">{errors.channel}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Purchase Date *</label>
                  <input type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 ${errors.purchaseDate ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`} />
                  {errors.purchaseDate && <p className="text-xs text-[#C0392B] mt-1">{errors.purchaseDate}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Purchase Price (₦) *</label>
                  <input type="number" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} placeholder="e.g. 5000000"
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 ${errors.purchasePrice ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`} />
                  {errors.purchasePrice && <p className="text-xs text-[#C0392B] mt-1">{errors.purchasePrice}</p>}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-base font-heading font-semibold text-[#1F2937]">Documents</h2>
              <p className="text-sm text-[#6B7280]">Upload supporting documents. At least 6 of 8 required for listing.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {form.docs.map((doc, i) => (
                  <div key={doc.name} className="border border-[#E5E7EB] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#1F2937]">{doc.name}</p>
                      {doc.file && <span className="text-xs text-[#1A7A4A] font-semibold flex items-center gap-1"><Check size={12} /> Uploaded</span>}
                    </div>
                    <textarea
                      placeholder="Add comment…"
                      value={doc.comment}
                      onChange={e => {
                        const newDocs = [...form.docs];
                        newDocs[i] = { ...newDocs[i], comment: e.target.value };
                        setForm(prev => ({ ...prev, docs: newDocs }));
                      }}
                      rows={2}
                      className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30"
                    />
                    <label className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-[#E5E7EB] rounded-lg text-xs text-[#6B7280] hover:border-[#2E75B6] hover:text-[#2E75B6] cursor-pointer transition-colors">
                      <Upload size={14} /> {doc.file ? doc.file.name : 'Upload file'}
                      <input type="file" className="hidden" onChange={e => {
                        const file = e.target.files?.[0] || null;
                        const newDocs = [...form.docs];
                        newDocs[i] = { ...newDocs[i], file };
                        setForm(prev => ({ ...prev, docs: newDocs }));
                      }} />
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] disabled:opacity-40 transition-colors">
            <ArrowLeft size={15} /> Back
          </button>
          {step < 3 ? (
            <button onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1A7A4A] text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60 transition-all">
              {saving ? 'Registering…' : 'Submit & Register Car'}
              {!saving && <Check size={15} />}
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
