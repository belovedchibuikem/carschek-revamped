'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, FileText, MoreHorizontal, Check, Phone, Copy, Edit, Save, X, Plus, Trash2, ShoppingCart, Bell } from 'lucide-react';
import { CarDetail, PipelineStep } from '@/types/domain';

const MOCK_CAR: CarDetail = {
  id: '1', ckId: 'CK-41', brand: 'Toyota', model: 'Camry', year: 2011,
  transmission: 'Automatic', bodyType: 'Sedan', colour: 'Silver',
  vin: 'JTDBE32K913012345', plate: 'LSD260JE',
  physicalStatus: 'at_buyer', purchaseChannel: 'auction', salesChannel: 'market_place',
  purchasePrice: 5000000, purchaseDate: '2024-12-01',
  soldPrice: 5100000, marginPct: 1.96, score: 73,
  warningCount: 2, potentialDuplicate: true, duplicateOfCkId: 'CK-38',
  docsUploaded: 6, docsTotal: 8, createdAt: '2024-12-02', createdBy: 'Promise Ndem',
  locationLabel: 'Lekki', engineNumber: 'ENG123456', registeredCity: 'Lagos',
  registeredState: 'Lagos', mileage: 85000,
  pipelineStep: 'at_buyer', inspectionLinked: true, graded: true,
  inAuction: false, docsCompleteForListing: false,
  contact: { contactType: 'individual', salutation: 'Mr', firstName: 'Emeka', lastName: 'Obi', email: 'emeka.obi@email.com', phone: '+2348012345678', address: '12 Broad Street', city: 'Lagos', state: 'Lagos' },
  purchase: {
    channel: 'auction', date: '2024-12-01', salesPerson: 'Promise Ndem', location: 'Lagos',
    prices: [
      { id: 'p1', amount: 5000000, type: 'final', effectiveDate: '2024-12-01', createdBy: 'Promise Ndem' },
      { id: 'p2', amount: 4800000, type: 'ear', effectiveDate: '2024-11-28', createdBy: 'Promise Ndem' },
    ],
    payment: { totalAmount: 5000000, status: 'done', paymentDate: '2024-12-03', method: 'Bank Transfer' },
  },
  sales: {
    channel: 'market_place', soldDate: '2025-01-15', salesPerson: 'Adaeze Mensah', location: 'Lagos',
    invoiceNo: 'INV-2025-001', invoiceDate: '2025-01-15',
    sellingPrice: 5100000, purchasePriceRef: 5000000,
    payment: { totalAmount: 5100000, status: 'done', paymentDate: '2025-01-16', method: 'Bank Transfer' },
  },
  auction: { hasAuction: false },
  marketplace: { visibility: 'visible', featured: false, currentPrice: 5100000 },
  documents: [
    { key: 'custom_clearance', name: 'Custom Clearance', required: true, status: 'approved', fileName: 'custom_clearance.pdf', fileSize: 245000, uploadedAt: '2024-12-05', uploadedBy: 'Promise Ndem' },
    { key: 'insurance_clearance', name: 'Insurance Clearance', required: true, status: 'approved', fileName: 'insurance.pdf', fileSize: 180000, uploadedAt: '2024-12-05', uploadedBy: 'Promise Ndem' },
    { key: 'means_of_id', name: 'Means of Identification', required: true, status: 'approved' },
    { key: 'number_plate', name: 'Number Plate', required: true, status: 'uploaded_pending' },
    { key: 'road_worthiness', name: 'Road Worthiness', required: true, status: 'missing' },
    { key: 'proof_of_ownership', name: 'Proof of Ownership', required: true, status: 'approved' },
    { key: 'plate_allocation', name: 'Plate Number Allocation', required: false, status: 'missing' },
    { key: 'purchase_receipt', name: 'Purchase Receipt', required: false, status: 'approved' },
  ],
};

const PIPELINE_STEPS: { key: PipelineStep; label: string }[] = [
  { key: 'acquired', label: 'Acquired' },
  { key: 'inspection_linked', label: 'Inspection Linked' },
  { key: 'at_buyer', label: 'At Buyer' },
  { key: 'listed', label: 'Listed' },
  { key: 'sold', label: 'Sold' },
];

const TABS = ['Main Data', 'Purchase', 'Sales', 'Channel'] as const;
type Tab = typeof TABS[number];

const DOC_STATUS_CONFIG = {
  missing: { label: 'Missing', cls: 'bg-red-100 text-red-700 border-red-200' },
  uploaded_pending: { label: 'Awaiting Review', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  approved: { label: 'Approved', cls: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 border-red-200' },
};

export default function CarDetailPage() {
  const [car] = useState<CarDetail>(MOCK_CAR);
  const [activeTab, setActiveTab] = useState<Tab>('Main Data');
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [showDocPanel, setShowDocPanel] = useState(false);
  const [draftSaved, setDraftSaved] = useState('');
  const [addingPrice, setAddingPrice] = useState(false);
  const [newPriceAmount, setNewPriceAmount] = useState('');
  const [newPriceType, setNewPriceType] = useState('final');
  const [newPriceDate, setNewPriceDate] = useState('');
  const [visibility, setVisibility] = useState(car.marketplace.visibility);
  const [auctionModal, setAuctionModal] = useState(false);

  useEffect(() => {
    if (!hasUnsaved) return;
    const t = setTimeout(() => setDraftSaved('Draft saved just now'), 60000);
    return () => clearTimeout(t);
  }, [hasUnsaved]);

  const currentStepIdx = PIPELINE_STEPS.findIndex(s => s.key === car.pipelineStep);

  const fmt = (n: number) => '₦' + n.toLocaleString('en-NG');

  if (showDocPanel) {
    return <DocumentCompliancePanel car={car} onClose={() => setShowDocPanel(false)} />;
  }

  return (
    <div className="space-y-0 -mt-4 md:-mt-6 -mx-4 md:-mx-6 xl:-mx-8">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#E5E7EB] shadow-sm">
        <div className="px-4 md:px-6 xl:px-8 py-3">
          <div className="flex items-start gap-4 flex-wrap">
            {/* Left */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">{car.ckId}</span>
                <h1 className="text-lg font-heading font-bold text-[#1F2937]">{car.brand} {car.model} {car.transmission} {car.year}</h1>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">📍 Current Location: {car.physicalStatus === 'at_buyer' ? 'At Buyer' : car.physicalStatus} ({car.locationLabel})</p>
            </div>

            {/* Centre — Pipeline Stepper */}
            <div className="hidden lg:flex items-center gap-0 flex-shrink-0">
              {PIPELINE_STEPS.map((s, i) => {
                const done = i < currentStepIdx;
                const active = i === currentStepIdx;
                return (
                  <React.Fragment key={s.key}>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all cursor-pointer ${done ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white' : active ? 'bg-amber-500 border-amber-500 text-white ring-2 ring-amber-200' : 'bg-white border-[#D1D5DB] text-[#9CA3AF]'}`}>
                        {done ? <Check size={12} /> : i + 1}
                      </div>
                      <span className={`text-[9px] font-medium whitespace-nowrap ${active ? 'text-amber-600' : done ? 'text-[#1E3A5F]' : 'text-[#9CA3AF]'}`}>{s.label}</span>
                    </div>
                    {i < PIPELINE_STEPS.length - 1 && <div className={`w-8 h-0.5 mb-4 ${i < currentStepIdx ? 'bg-[#1E3A5F]' : 'bg-[#E5E7EB]'}`} />}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              {car.potentialDuplicate && (
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-all">
                  <AlertTriangle size={12} /> Potential Duplicate (1)
                </button>
              )}
              {car.warningCount > 0 && (
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold rounded-lg hover:bg-orange-100 transition-all">
                  <Bell size={12} /> {car.warningCount} Warnings
                </button>
              )}
              <button onClick={() => setShowDocPanel(true)} className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${car.docsUploaded === car.docsTotal ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                <FileText size={12} /> Docs: {car.docsUploaded}/{car.docsTotal}
              </button>
              {!car.inspectionLinked && <button className="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg hover:bg-[#16304F] transition-all">Link Inspection</button>}
              {car.inspectionLinked && !car.graded && <button className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-all">Grade Car</button>}
              {car.graded && !car.inAuction && <button onClick={() => setAuctionModal(true)} className="px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-all">Push to Auction</button>}
              {hasUnsaved && (
                <button onClick={() => { setHasUnsaved(false); setDraftSaved('Saved!'); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all animate-pulse">
                  <Save size={12} /> Save Changes
                </button>
              )}
              <button className="p-1.5 border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F4F6F8]"><MoreHorizontal size={16} /></button>
            </div>
          </div>
          {draftSaved && <p className="text-[10px] text-[#9CA3AF] mt-1">{draftSaved}</p>}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-[#F3F4F6] px-4 md:px-6 xl:px-8">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === tab ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 md:p-6 xl:p-8 space-y-5">
        {/* TAB 1 — MAIN DATA */}
        {activeTab === 'Main Data' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Car Details Card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-[#1F2937]">Car Details</h3>
                <button onClick={() => { setEditingCard(editingCard === 'details' ? null : 'details'); setHasUnsaved(true); }} className="p-1.5 rounded-lg hover:bg-[#F4F6F8] text-[#6B7280]">
                  {editingCard === 'details' ? <Save size={15} className="text-green-600" /> : <Edit size={15} />}
                </button>
              </div>
              <div className="space-y-3">
                {[
                  ['Brand', car.brand], ['Model', car.model], ['Year', String(car.year)],
                  ['Transmission', car.transmission], ['Body Type', car.bodyType],
                  ['Colour', car.colour], ['Mileage', `${car.mileage?.toLocaleString()} km`],
                  ['VIN', car.vin], ['Plate', car.plate],
                  ['Engine No.', car.engineNumber || '—'],
                  ['Reg. City', car.registeredCity || '—'], ['Reg. State', car.registeredState || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                    <span className="text-xs text-[#9CA3AF] font-medium w-28 flex-shrink-0">{label}</span>
                    {editingCard === 'details' ? (
                      <input defaultValue={value} onChange={() => setHasUnsaved(true)} className="flex-1 text-xs text-right border-b border-[#1E3A5F] focus:outline-none bg-transparent text-[#1F2937] font-medium" />
                    ) : (
                      <span className="text-xs font-semibold text-[#1F2937] text-right font-mono">{value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-[#1F2937]">Contact (Seller)</h3>
                <button onClick={() => { setEditingCard(editingCard === 'contact' ? null : 'contact'); setHasUnsaved(true); }} className="p-1.5 rounded-lg hover:bg-[#F4F6F8] text-[#6B7280]">
                  {editingCard === 'contact' ? <Save size={15} className="text-green-600" /> : <Edit size={15} />}
                </button>
              </div>
              <div className="space-y-3">
                {[
                  ['Type', car.contact.contactType],
                  ['Name', `${car.contact.salutation} ${car.contact.firstName} ${car.contact.lastName}`],
                  ['Email', car.contact.email],
                  ['Phone', car.contact.phone],
                  ['Address', car.contact.address || '—'],
                  ['City', car.contact.city || '—'],
                  ['State', car.contact.state || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                    <span className="text-xs text-[#9CA3AF] font-medium w-20 flex-shrink-0">{label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#1F2937] text-right">{value}</span>
                      {label === 'Email' && <button onClick={() => navigator.clipboard.writeText(value)} className="text-[#9CA3AF] hover:text-[#1E3A5F]"><Copy size={11} /></button>}
                      {label === 'Phone' && <a href={`tel:${value}`} className="text-[#9CA3AF] hover:text-green-600"><Phone size={11} /></a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents Card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-[#1F2937]">Car Documents</h3>
                <button onClick={() => setShowDocPanel(true)} className="text-xs text-[#2E75B6] font-semibold hover:underline">Open Review</button>
              </div>
              <div className="space-y-2">
                {car.documents.map(doc => (
                  <div key={doc.key} className="flex items-center justify-between py-1.5 border-b border-[#F3F4F6] last:border-0">
                    <div className="flex items-center gap-2">
                      <FileText size={13} className="text-[#9CA3AF]" />
                      <span className="text-xs text-[#374151] font-medium">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${DOC_STATUS_CONFIG[doc.status].cls}`}>{DOC_STATUS_CONFIG[doc.status].label}</span>
                      {doc.status === 'approved' && <button className="text-[10px] text-[#2E75B6] hover:underline">View</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 — PURCHASE */}
        {activeTab === 'Purchase' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="font-heading font-bold text-[#1F2937] mb-4">Purchase</h3>
              <div className="space-y-3">
                {[
                  ['Channel', car.purchase.channel],
                  ['Date', car.purchase.date],
                  ['Sales Person', car.purchase.salesPerson],
                  ['Location', car.purchase.location],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                    <span className="text-xs text-[#9CA3AF]">{l}</span>
                    <span className="text-xs font-semibold text-[#1F2937] capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-[#1F2937]">Purchase Prices</h3>
                <button onClick={() => setAddingPrice(true)} className="flex items-center gap-1 text-xs text-[#2E75B6] font-semibold hover:underline"><Plus size={12} /> Add</button>
              </div>
              <div className="space-y-2">
                {car.purchase.prices.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 bg-[#F8FAFC] rounded-lg">
                    <div>
                      <p className="text-sm font-bold text-[#1F2937]">{fmt(p.amount)}</p>
                      <p className="text-[10px] text-[#9CA3AF]">{p.type.toUpperCase()} • {p.effectiveDate}</p>
                    </div>
                    <button className="text-[#9CA3AF] hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                ))}
                {addingPrice && (
                  <div className="p-3 border border-[#1E3A5F]/20 rounded-lg space-y-2 bg-[#F8FAFC]">
                    <input value={newPriceAmount} onChange={e => setNewPriceAmount(e.target.value)} placeholder="Amount (₦)" className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded text-xs focus:outline-none" />
                    <select value={newPriceType} onChange={e => setNewPriceType(e.target.value)} className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded text-xs bg-white focus:outline-none">
                      <option value="ear">EAR</option><option value="final">Final</option><option value="adjustment">Adjustment</option>
                    </select>
                    <input type="date" value={newPriceDate} onChange={e => setNewPriceDate(e.target.value)} className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded text-xs focus:outline-none" />
                    <div className="flex gap-2">
                      <button onClick={() => { setAddingPrice(false); setHasUnsaved(true); }} className="flex-1 py-1.5 bg-[#1E3A5F] text-white text-xs font-semibold rounded">Save</button>
                      <button onClick={() => setAddingPrice(false)} className="flex-1 py-1.5 border border-[#E5E7EB] text-xs text-[#6B7280] rounded">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="font-heading font-bold text-[#1F2937] mb-4">Purchase Payment</h3>
              <div className="text-center py-4">
                <p className="text-2xl font-bold text-[#1F2937]">{fmt(car.purchase.payment.totalAmount)}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${car.purchase.payment.status === 'done' ? 'bg-green-100 text-green-700' : car.purchase.payment.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  {car.purchase.payment.status === 'done' ? 'Done' : car.purchase.payment.status === 'pending' ? 'Pending' : 'Overdue'}
                </span>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-xs"><span className="text-[#9CA3AF]">Date</span><span className="font-semibold text-[#1F2937]">{car.purchase.payment.paymentDate}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#9CA3AF]">Method</span><span className="font-semibold text-[#1F2937]">{car.purchase.payment.method}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3 — SALES */}
        {activeTab === 'Sales' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="font-heading font-bold text-[#1F2937] mb-4">Sellings</h3>
              <div className="space-y-3">
                {[
                  ['Channel', car.sales.channel],
                  ['Sold Date', car.sales.soldDate || '—'],
                  ['Sales Person', car.sales.salesPerson || '—'],
                  ['Location', car.sales.location || '—'],
                  ['Invoice #', car.sales.invoiceNo || '—'],
                  ['Invoice Date', car.sales.invoiceDate || '—'],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                    <span className="text-xs text-[#9CA3AF]">{l}</span>
                    <span className="text-xs font-semibold text-[#1F2937] capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="font-heading font-bold text-[#1F2937] mb-4">Selling Price</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-[#F3F4F6]">
                  <span className="text-xs text-[#9CA3AF]">Purchase Price</span>
                  <span className="text-xs text-[#9CA3AF] line-through">{fmt(car.sales.purchasePriceRef)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F3F4F6]">
                  <span className="text-xs text-[#9CA3AF]">Selling Price</span>
                  <span className="text-sm font-bold text-[#1F2937]">{fmt(car.sales.sellingPrice)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-xs text-[#9CA3AF]">Margin</span>
                  <span className={`text-sm font-bold ${(car.marginPct ?? 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>{car.marginPct?.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="font-heading font-bold text-[#1F2937] mb-4">Selling Payment</h3>
              <div className="text-center py-4">
                <p className="text-2xl font-bold text-[#1F2937]">{fmt(car.sales.payment.totalAmount)}</p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Done</span>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-xs"><span className="text-[#9CA3AF]">Date</span><span className="font-semibold text-[#1F2937]">{car.sales.payment.paymentDate}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#9CA3AF]">Method</span><span className="font-semibold text-[#1F2937]">{car.sales.payment.method}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4 — CHANNEL */}
        {activeTab === 'Channel' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Auction Panel */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-[#1F2937]">Car Auction</h3>
                <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full font-semibold">No Auction</span>
              </div>
              {!car.auction.hasAuction ? (
                <div className="text-center py-8">
                  <ShoppingCart size={32} className="text-[#D1D5DB] mx-auto mb-3" />
                  <p className="text-sm text-[#6B7280] mb-4">No auction has been started for this car.</p>
                  <button onClick={() => setAuctionModal(true)} className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all">Start Auction</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-xs text-[#9CA3AF]">Current Bid</span><span className="font-bold text-[#1F2937]">{fmt(car.auction.currentBid ?? 0)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-[#9CA3AF]">Bid Count</span><span className="font-bold text-[#1F2937]">{car.auction.bidCount}</span></div>
                </div>
              )}
            </div>

            {/* Marketplace Panel */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="font-heading font-bold text-[#1F2937] mb-4">Market Place</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-2">Visibility</label>
                  <div className="flex rounded-lg border border-[#E5E7EB] overflow-hidden">
                    {(['not_visible','visible','featured'] as const).map(v => (
                      <button key={v} onClick={() => { setVisibility(v); setHasUnsaved(true); }} className={`flex-1 py-2 text-xs font-semibold capitalize transition-all ${visibility === v ? 'bg-[#1E3A5F] text-white' : 'bg-white text-[#6B7280] hover:bg-[#F4F6F8]'}`}>
                        {v.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">Current Price</label>
                  <p className="text-2xl font-bold text-[#1F2937]">{fmt(car.marketplace.currentPrice)}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">New Price (₦)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm">₦</span>
                    <input placeholder="Enter new price" onChange={() => setHasUnsaved(true)} className="w-full pl-7 pr-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
                  </div>
                </div>
                <button onClick={() => setHasUnsaved(false)} className="w-full py-2.5 bg-[#1E3A5F] text-white text-sm font-bold rounded-xl hover:bg-[#16304F] transition-all">Update Marketplace Listing</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auction Modal */}
      {auctionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-lg font-heading font-bold text-[#1F2937]">Start Auction</h2>
                <p className="text-sm text-[#6B7280] mt-0.5">{car.brand} {car.model} {car.year} — {car.ckId}</p>
              </div>
              <button onClick={() => setAuctionModal(false)} className="p-2 rounded-lg hover:bg-[#F4F6F8] text-[#6B7280]"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Auction Starting Price (₦) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] font-semibold">₦</span>
                  <input placeholder="5,000,000" className="w-full pl-8 pr-3 py-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] text-lg font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2">Platform Fee %</label>
                <div className="flex rounded-lg border border-[#E5E7EB] overflow-hidden">
                  {['1%','5%','10%','15%','20%'].map(f => (
                    <button key={f} className="flex-1 py-2 text-sm font-semibold text-[#6B7280] hover:bg-[#F4F6F8] transition-all first:rounded-l-lg last:rounded-r-lg">{f}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Auction Start</label>
                  <input type="datetime-local" className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Auction End</label>
                  <input type="datetime-local" className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-6 border-t border-[#E5E7EB]">
              <button onClick={() => setAuctionModal(false)} className="flex-1 py-2.5 border border-[#E5E7EB] text-sm font-semibold text-[#374151] rounded-xl hover:bg-[#F4F6F8]">Close</button>
              <button className="flex-1 py-2.5 border border-[#1E3A5F] text-sm font-semibold text-[#1E3A5F] rounded-xl hover:bg-[#EFF6FF]">Save Draft</button>
              <button className="flex-1 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600">Push to Auction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentCompliancePanel({ car, onClose }: { car: CarDetail; onClose: () => void }) {
  const approvedCount = car.documents.filter(d => d.status === 'approved').length;
  const missingRequired = car.documents.filter(d => d.required && (d.status === 'missing' || d.status === 'rejected'));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onClose} className="p-2 rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8] text-[#6B7280]"><X size={16} /></button>
        <div>
          <h2 className="text-lg font-heading font-bold text-[#1F2937]">Document Compliance — {car.ckId}</h2>
          <p className="text-sm text-[#6B7280]">{car.brand} {car.model} {car.year}</p>
        </div>
      </div>

      {missingRequired.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">⚠ This car cannot be pushed to Marketplace or Auction until all required documents are approved.</p>
            <p className="text-sm text-amber-700 mt-0.5">Missing: {missingRequired.map(d => d.name).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#1F2937]">{approvedCount} / {car.documents.length} Documents Complete</h3>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${approvedCount === car.documents.length ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {approvedCount === car.documents.length ? '✓ Ready for Listing' : '⚠ Not Ready for Listing'}
          </span>
        </div>
        <div className="w-full bg-[#F4F6F8] rounded-full h-2.5">
          <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${(approvedCount / car.documents.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {car.documents.map(doc => (
          <div key={doc.key} className={`bg-white rounded-xl border-2 p-5 space-y-3 ${doc.status === 'missing' || doc.status === 'rejected' ? 'border-red-200' : doc.status === 'approved' ? 'border-green-200' : 'border-amber-200'}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1F2937] text-sm">{doc.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.required ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{doc.required ? 'Required' : 'Optional'}</span>
            </div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${DOC_STATUS_CONFIG[doc.status].cls}`}>{DOC_STATUS_CONFIG[doc.status].label}</span>
            {doc.status === 'approved' && doc.fileName && (
              <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-green-600" />
                  <div>
                    <p className="text-xs font-semibold text-green-700">{doc.fileName}</p>
                    <p className="text-[10px] text-[#9CA3AF]">Uploaded {doc.uploadedAt} by {doc.uploadedBy}</p>
                  </div>
                </div>
                <button className="text-xs text-[#2E75B6] font-semibold hover:underline">View</button>
              </div>
            )}
            {(doc.status === 'missing' || doc.status === 'rejected') && (
              <label className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-[#D1D5DB] rounded-lg cursor-pointer hover:border-[#1E3A5F] hover:bg-[#F8FAFC] transition-all">
                <Upload size={18} className="text-[#9CA3AF]" />
                <span className="text-xs text-[#6B7280]">Drag & drop or <span className="text-[#1E3A5F] font-semibold">Select File</span></span>
                <input type="file" className="hidden" />
              </label>
            )}
            {doc.status === 'uploaded_pending' && (
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 flex items-center justify-center gap-1"><Check size={12} /> Approve</button>
                <button className="flex-1 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 flex items-center justify-center gap-1"><X size={12} /> Reject</button>
              </div>
            )}
            <textarea placeholder="Add note about this document..." rows={2} className="w-full px-2.5 py-2 border border-[#E5E7EB] rounded-lg text-xs focus:outline-none resize-none text-[#6B7280]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Upload({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}
