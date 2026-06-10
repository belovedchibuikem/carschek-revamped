'use client';
import React, { useState } from 'react';
import { Car, User, Receipt, FileText, Check, AlertTriangle, Upload, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import {
  brandOptionsByName,
  modelOptionsByName,
  yearOptionsForModelName,
} from '@/lib/reference/carCascade';

const STEPS = [
  { label: 'Vehicle Details', icon: Car },
  { label: 'Seller Contact', icon: User },
  { label: 'Purchase Details', icon: Receipt },
  { label: 'Documents', icon: FileText },
];

const COLOURS = [
  { name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#1a1a1a' }, { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Grey', hex: '#808080' }, { name: 'Red', hex: '#DC2626' }, { name: 'Blue', hex: '#2563EB' },
  { name: 'Navy', hex: '#ff5722' }, { name: 'Green', hex: '#16A34A' }, { name: 'Yellow', hex: '#EAB308' },
  { name: 'Orange', hex: '#EA580C' }, { name: 'Brown', hex: '#92400E' }, { name: 'Beige', hex: '#D4B896' },
  { name: 'Gold', hex: '#B8860B' }, { name: 'Maroon', hex: '#7F1D1D' }, { name: 'Purple', hex: '#7C3AED' }, { name: 'Pearl', hex: '#F0EAD6' },
];

const NIGERIAN_STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];

const DOCUMENTS = [
  { name: 'Custom Clearance', required: true },
  { name: 'Insurance Clearance', required: true },
  { name: 'Means of Identification', required: true },
  { name: 'Number Plate', required: true },
  { name: 'Road Worthiness', required: true },
  { name: 'Proof of Ownership', required: true },
  { name: 'Plate Number Allocation', required: false },
  { name: 'Purchase Receipt', required: false },
];

export default function CarRegistrationWizard() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [vinDuplicate, setVinDuplicate] = useState(false);
  const [vinChecking, setVinChecking] = useState(false);
  const [selectedColour, setSelectedColour] = useState('Silver');
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState({
    brand: '', model: '', year: '', transmission: 'Automatic', body: 'Sedan',
    mileage: '', vin: '', plate: '', engineNumber: '', city: '', state: '',
    contactType: 'Individual', salutation: 'Mr', firstName: '', lastName: '',
    company: '', email: '', phone: '', address: '', contactCity: '', contactState: '',
    purchaseChannel: '', purchaseDate: '', salesPerson: '', agent: '', location: '',
    purchasePrice: '', comment: '',
  });

  const handleVinBlur = () => {
    if (form.vin.length >= 10) {
      setVinChecking(true);
      setTimeout(() => {
        setVinChecking(false);
        setVinDuplicate(form.vin === 'JT2BF22K1W0123456');
      }, 1200);
    }
  };

  const toggleDoc = (name: string) => setUploadedDocs(prev => ({ ...prev, [name]: !prev[name] }));

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <Check size={36} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#ff5722]">Car Registered!</h2>
          <p className="text-gray-500 mt-1">CK-42 has been created successfully</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: 'View Car Details', href: '/cars/CK-42', color: 'bg-[#ff5722] text-white' },
            { label: 'Link Inspection', href: '/inspection-orders-management', color: 'bg-purple-600 text-white' },
            { label: 'Register Another', href: '/cars/register', color: 'bg-gray-100 text-gray-700' },
          ].map(a => (
            <a key={a.label} href={a.href} className={`${a.color} rounded-xl p-4 text-sm font-semibold text-center hover:opacity-90 transition-opacity`}>{a.label}</a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-xl font-bold text-[#ff5722] mb-6">Register New Car</h1>
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const idx = i + 1;
            const done = step > idx;
            const active = step === idx;
            return (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${done ? 'bg-green-500 text-white' : active ? 'bg-[#ff5722] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {done ? <Check size={16} /> : idx}
                  </div>
                  <span className={`text-[10px] font-medium whitespace-nowrap ${active ? 'text-[#ff5722]' : done ? 'text-green-600' : 'text-gray-400'}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${step > idx ? 'bg-green-400' : 'bg-gray-100'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-[#ff5722]">Step 1 — Vehicle Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Brand *</label>
                  <SearchableSelect
                    value={form.brand}
                    onChange={v => setForm(f => ({ ...f, brand: v, model: '', year: '' }))}
                    options={brandOptionsByName()}
                    placeholder="Search or select brand…"
                    searchPlaceholder="Search brands…"
                    buttonClassName="border-gray-200 focus:ring-2 focus:ring-[#ff5722]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Car Model *</label>
                  <SearchableSelect
                    value={form.model}
                    onChange={v => setForm(f => ({ ...f, model: v, year: '' }))}
                    options={modelOptionsByName(form.brand)}
                    disabled={!form.brand}
                    placeholder={form.brand ? 'Search or select model…' : 'Select brand first'}
                    searchPlaceholder="Search models…"
                    buttonClassName="border-gray-200 focus:ring-2 focus:ring-[#ff5722]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Year *</label>
                  <SearchableSelect
                    value={form.year}
                    onChange={v => setForm(f => ({ ...f, year: v }))}
                    options={yearOptionsForModelName(form.brand, form.model)}
                    disabled={!form.model}
                    placeholder={form.model ? 'Search or select year…' : 'Select model first'}
                    searchPlaceholder="Search years…"
                    buttonClassName="border-gray-200 focus:ring-2 focus:ring-[#ff5722]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Transmission *</label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {['Automatic', 'Manual', 'CVT'].map(t => (
                      <button key={t} onClick={() => setForm(f => ({ ...f, transmission: t }))} className={`flex-1 py-2 text-xs font-medium transition-colors ${form.transmission === t ? 'bg-[#ff5722] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Body Type</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Other'].map(b => (
                      <button key={b} onClick={() => setForm(f => ({ ...f, body: b }))} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.body === b ? 'bg-[#ff5722] text-white border-[#ff5722]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{b}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Colour *</label>
                  <div className="grid grid-cols-8 gap-1.5">
                    {COLOURS.map(c => (
                      <button key={c.name} title={c.name} onClick={() => setSelectedColour(c.name)} className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColour === c.name ? 'border-[#ff5722] scale-110' : 'border-transparent hover:border-gray-300'}`} style={{ backgroundColor: c.hex }} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Selected: {selectedColour}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Mileage (km) *</label>
                  <input type="number" value={form.mileage} onChange={e => setForm(f => ({ ...f, mileage: e.target.value }))} placeholder="e.g. 85000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">VIN * <span className="font-normal text-gray-400">(17 characters)</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.vin}
                      onChange={e => setForm(f => ({ ...f, vin: e.target.value.toUpperCase() }))}
                      onBlur={handleVinBlur}
                      maxLength={17}
                      placeholder="e.g. JT2BF22K1W0123456"
                      className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 ${vinDuplicate ? 'border-amber-400' : 'border-gray-200'}`}
                    />
                    {vinChecking && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 animate-pulse">Checking…</span>}
                  </div>
                  {vinDuplicate && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5"><AlertTriangle size={13} /> Potential Duplicate Detected</p>
                      <p className="text-xs text-amber-600 mt-0.5">A car with this VIN already exists: CK-41 — Toyota Camry 2011</p>
                      <div className="flex gap-2 mt-2">
                        <a href="/cars/CK-41" className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors">View Existing Car</a>
                        <button onClick={() => setVinDuplicate(false)} className="text-xs px-2 py-1 bg-white border border-amber-200 text-amber-600 rounded-md hover:bg-amber-50 transition-colors">Continue Anyway</button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Licence Plate *</label>
                  <input type="text" value={form.plate} onChange={e => setForm(f => ({ ...f, plate: e.target.value.toUpperCase() }))} placeholder="e.g. LSD260JE" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Engine Number</label>
                  <input type="text" value={form.engineNumber} onChange={e => setForm(f => ({ ...f, engineNumber: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Registered City</label>
                  <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Registered State</label>
                  <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20">
                    <option value="">Select state...</option>
                    {NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-[#ff5722]">Step 2 — Seller Contact</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Contact Type *</label>
              <div className="flex gap-3">
                {['Individual', 'Dealer', 'Corporate'].map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, contactType: t }))} className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${form.contactType === t ? 'border-[#ff5722] bg-[#ff5722]/5 text-[#ff5722]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Salutation</label>
                <select value={form.salutation} onChange={e => setForm(f => ({ ...f, salutation: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20">
                  {['Mr', 'Mrs', 'Dr', 'Engr', 'Other'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">First Name *</label>
                <input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name *</label>
                <input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
              </div>
              {(form.contactType === 'Dealer' || form.contactType === 'Corporate') && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Company</label>
                  <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone * <span className="font-normal text-gray-400">(+234)</span></label>
                <div className="flex">
                  <span className="px-3 py-2 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg text-sm text-gray-500">+234</span>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} maxLength={10} className="flex-1 border border-gray-200 rounded-r-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
                <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                <input type="text" value={form.contactCity} onChange={e => setForm(f => ({ ...f, contactCity: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">State</label>
                <select value={form.contactState} onChange={e => setForm(f => ({ ...f, contactState: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20">
                  <option value="">Select state...</option>
                  {NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-[#ff5722]">Step 3 — Purchase Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Purchase Channel *</label>
                  <select value={form.purchaseChannel} onChange={e => setForm(f => ({ ...f, purchaseChannel: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20">
                    <option value="">Select channel...</option>
                    {['Auction', 'Market Place', 'Offline', 'B2B', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Purchase Date *</label>
                  <input type="date" value={form.purchaseDate} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Sales Person *</label>
                  <select value={form.salesPerson} onChange={e => setForm(f => ({ ...f, salesPerson: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20">
                    <option value="">Select person...</option>
                    {['Promise Ndem', 'Adaeze Mensah', 'Chukwuemeka Obi', 'Fatima Bello'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Partner / Agent</label>
                  <input type="text" value={form.agent} onChange={e => setForm(f => ({ ...f, agent: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Location *</label>
                  <select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20">
                    <option value="">Select location...</option>
                    {['Lagos', 'Abuja', 'Port Harcourt', 'Other'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Purchase Price (₦) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">₦</span>
                    <input type="number" value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: e.target.value }))} placeholder="0" className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Comment</label>
                  <textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 resize-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#ff5722]">Step 4 — Documents</h2>
              <span className="text-sm text-gray-500">Upload Mandatory Documents</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${(Object.values(uploadedDocs).filter(Boolean).length / DOCUMENTS.length) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-500">{Object.values(uploadedDocs).filter(Boolean).length} / {DOCUMENTS.length} documents uploaded</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DOCUMENTS.map(doc => (
                <div key={doc.name} className="border border-gray-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">{doc.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.required ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{doc.required ? 'Required' : 'Optional'}</span>
                  </div>
                  <textarea placeholder="Add note about this document..." rows={2} className="w-full border border-gray-100 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#ff5722]/20 resize-none bg-gray-50" />
                  {uploadedDocs[doc.name] ? (
                    <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-green-600" />
                        <span className="text-xs text-green-700 font-medium">{doc.name.replace(/ /g, '_')}.pdf</span>
                        <span className="text-[10px] text-green-600">Uploaded ✓</span>
                      </div>
                      <button onClick={() => toggleDoc(doc.name)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={13} /></button>
                    </div>
                  ) : (
                    <button onClick={() => toggleDoc(doc.name)} className="w-full border-2 border-dashed border-gray-200 rounded-lg py-4 text-xs text-gray-400 hover:border-[#ff5722]/30 hover:text-[#ff5722] transition-all flex flex-col items-center gap-1.5">
                      <Upload size={16} />
                      <span>Drag & drop or <span className="text-[#ff5722] font-medium">Select File(s)</span></span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 rounded-xl shadow-lg px-6 py-4 flex items-center justify-between gap-4">
        <span className="text-sm text-gray-500 font-medium">Step {step} of {STEPS.length}</span>
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <ChevronLeft size={15} /> Back
            </button>
          )}
          <button className="text-sm text-[#ff5722] hover:underline transition-colors">Save as Draft</button>
          {step < 4 ? (
            <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-1.5 px-5 py-2 bg-[#ff5722] text-white rounded-lg text-sm font-semibold hover:bg-[#e64a19] transition-colors">
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button onClick={() => setSubmitted(true)} className="flex items-center gap-1.5 px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors">
              <Check size={15} /> Submit & Register Car
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
