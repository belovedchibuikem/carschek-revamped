'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Diamond, FileText, Copy, Phone, Save, MoreHorizontal, Check, Clock, ArrowLeft, X, ExternalLink } from 'lucide-react';

const PIPELINE_STEPS = ['Acquired', 'Inspection Linked', 'At Buyer', 'Listed', 'Sold'];

const CAR_DATA = {
  id: 'CK-41',
  make: 'Toyota', model: 'Camry', year: 2011, transmission: 'Automatic',
  body: 'Sedan', colour: 'Silver', vin: 'JT2BF22K1W0123456', plate: 'LSD260JE',
  engineNumber: 'ENG-2AZ-FE-001', city: 'Lekki', state: 'Lagos',
  currentStatus: 'At Buyer', currentStep: 2,
  score: 73, warnings: 2, docs: { uploaded: 6, required: 8 },
  contact: { type: 'Individual', name: 'Adaeze Mensah', email: 'adaeze@example.com', phone: '+2348012345678', address: '14 Adeola Odeku, VI', city: 'Lagos', state: 'Lagos' },
  purchase: { channel: 'Auction', date: '2024-12-01', salesPerson: 'Promise Ndem', location: 'Lagos', price: 5000000 },
  sales: { channel: 'Market Place', soldTo: 'Emeka Okafor', soldDate: '2025-01-15', salesPerson: 'Adaeze Mensah', location: 'Lagos', invoiceNo: 'INV-2025-001', sellingPrice: 5100000 },
};

const DOCUMENTS_LIST = [
  { name: 'Custom Clearance', status: 'Approved' },
  { name: 'Insurance Clearance', status: 'Approved' },
  { name: 'Means of Identification', status: 'Approved' },
  { name: 'Number Plate', status: 'Approved' },
  { name: 'Road Worthiness', status: 'Approved' },
  { name: 'Proof of Ownership', status: 'Approved' },
  { name: 'Plate Number Allocation', status: 'Missing' },
  { name: 'Purchase Receipt', status: 'Missing' },
];

const DOC_STATUS_STYLE: Record<string, string> = {
  'Approved': 'bg-green-50 text-green-700',
  'Missing': 'bg-red-50 text-red-600',
  'Under Review': 'bg-amber-50 text-amber-700',
  'Rejected': 'bg-red-100 text-red-700',
};

export default function CarDetailModule({ carId }: { carId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('main');
  const [unsaved, setUnsaved] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [auctionPrice, setAuctionPrice] = useState('');
  const [platformFee, setPlatformFee] = useState(15);
  const [marketplaceVisible, setMarketplaceVisible] = useState<'Not Visible' | 'Visible' | 'Featured'>('Visible');
  const [newMarketPrice, setNewMarketPrice] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [addingPrice, setAddingPrice] = useState(false);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const car = CAR_DATA;
  const margin = (((car.sales.sellingPrice - car.purchase.price) / car.purchase.price) * 100).toFixed(2);

  const handleEdit = (card: string) => {
    setEditingCard(card);
    setUnsaved(true);
  };

  const handleSave = () => {
    setUnsaved(false);
    setEditingCard(null);
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(car.contact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 1500);
  };

  const TABS = [
    { id: 'main', label: 'Main Data' },
    { id: 'purchase', label: 'Purchase' },
    { id: 'sales', label: 'Sales' },
    { id: 'channel', label: 'Channel' },
  ];

  return (
    <div className="space-y-0">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 py-3 flex flex-wrap items-center gap-4">
          {/* Back + Left */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={() => router.push('/cars')} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#ff5722]">
              <ArrowLeft size={16} />
            </button>
            <span className="font-mono text-sm font-bold bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg">{car.id}</span>
            <div>
              <p className="font-bold text-[#ff5722] text-base leading-tight">{car.make} {car.model} {car.transmission} {car.year}</p>
              <p className="text-xs text-gray-400">📍 Current Location: {car.currentStatus} (Lekki)</p>
            </div>
          </div>

          {/* Pipeline Stepper */}
          <div className="flex-1 hidden lg:flex items-center justify-center gap-0 min-w-0">
            {PIPELINE_STEPS.map((s, i) => {
              const done = i < car.currentStep;
              const active = i === car.currentStep;
              return (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setShowStatusModal(s)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer hover:scale-110 ${done ? 'bg-[#ff5722] text-white' : active ? 'bg-amber-400 text-white ring-2 ring-amber-200 ring-offset-1' : 'bg-gray-100 text-gray-400 border-2 border-gray-200'}`}
                    >
                      {done ? <Check size={12} /> : i + 1}
                    </button>
                    <span className={`text-[9px] font-medium whitespace-nowrap ${active ? 'text-amber-600' : done ? 'text-[#ff5722]' : 'text-gray-400'}`}>{s}</span>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 mb-3 ${i < car.currentStep ? 'bg-[#ff5722]' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            {car.warnings > 0 && (
              <button className="flex items-center gap-1 bg-amber-50 text-amber-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
                <Diamond size={11} fill="currentColor" /> Potential Duplicate (1)
              </button>
            )}
            <button className="flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-orange-100 transition-colors">
              <AlertTriangle size={11} /> {car.warnings} Warnings
            </button>
            <button
              onClick={() => router.push('/offers?view=documents')}
              className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
            >
              <FileText size={11} /> Docs: {car.docs.uploaded}/{car.docs.required}
            </button>
            <button
              onClick={() => router.push('/inspector-app')}
              className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Grade Car
            </button>
            {unsaved && (
              <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors animate-pulse">
                <Save size={12} /> Save Changes
              </button>
            )}
            {draftSaved && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} /> Draft saved</span>}
            <div className="relative">
              <button
                onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
              >
                <MoreHorizontal size={16} />
              </button>
              {showOverflowMenu && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1">
                  <button
                    onClick={() => { setShowOverflowMenu(false); router.push('/inspection-orders-management'); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Link / View Inspection
                  </button>
                  <button
                    onClick={() => { setShowOverflowMenu(false); setShowAuctionModal(true); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Start Auction
                  </button>
                  <button
                    onClick={() => { setShowOverflowMenu(false); router.push('/vehicle-listings'); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Push to Marketplace
                  </button>
                  <button
                    onClick={() => { setShowOverflowMenu(false); router.push('/offers?view=create'); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Create Offer
                  </button>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      Delete Car
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-gray-100 px-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-[#ff5722] border-b-2 border-[#ff5722]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
              {tab.id === 'main' && unsaved && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-400 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'main' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Car Details Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#ff5722] text-sm">Car Details</h3>
                <button onClick={() => handleEdit('details')} className="text-xs text-[#ff5722] hover:underline">{editingCard === 'details' ? 'Editing…' : 'Edit'}</button>
              </div>
              <div className="space-y-3">
                {[
                  ['Brand', car.make], ['Model', car.model], ['Year', car.year],
                  ['Transmission', car.transmission], ['Body Type', car.body],
                  ['Colour', car.colour], ['Mileage', '85,000 km'],
                  ['VIN', car.vin], ['Licence Plate', car.plate],
                  ['Engine Number', car.engineNumber], ['Registered City', car.city],
                  ['Registered State', car.state],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex flex-col gap-0.5 pb-2 border-b border-gray-50 last:border-0">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                    {editingCard === 'details' ? (
                      <input defaultValue={value as string} className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#ff5722]/20" />
                    ) : (
                      <span className="text-sm text-gray-800 font-medium">{value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#ff5722] text-sm">Contact (Seller)</h3>
                <button onClick={() => handleEdit('contact')} className="text-xs text-[#ff5722] hover:underline">Edit</button>
              </div>
              <div className="space-y-3">
                {[
                  ['Type', car.contact.type], ['Name', car.contact.name],
                  ['Email', car.contact.email], ['Phone', car.contact.phone],
                  ['Address', car.contact.address], ['City', car.contact.city],
                  ['State', car.contact.state],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex flex-col gap-0.5 pb-2 border-b border-gray-50 last:border-0">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-800 font-medium flex-1">{value}</span>
                      {label === 'Email' && (
                        <button onClick={copyEmail} className="text-gray-300 hover:text-teal-600 transition-colors" title="Copy email">
                          <Copy size={12} />
                          {copiedEmail && <span className="text-[10px] text-teal-600 ml-1">Copied!</span>}
                        </button>
                      )}
                      {label === 'Phone' && (
                        <a href={`tel:${value}`} className="text-gray-300 hover:text-green-600 transition-colors" title="Call">
                          <Phone size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push('/crm')}
                className="mt-4 w-full py-2 border border-[#ff5722]/20 text-[#ff5722] text-xs font-semibold rounded-lg hover:bg-[#ff5722]/5 transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink size={12} /> View in CRM
              </button>
            </div>

            {/* Documents Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#ff5722] text-sm">Car Documents</h3>
              </div>
              <div className="mb-3">
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Handover From Seller Date</label>
                <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
              </div>
              <div className="space-y-2">
                {DOCUMENTS_LIST.map(doc => (
                  <div key={doc.name} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <FileText size={13} className="text-gray-400" />
                      <span className="text-xs text-gray-700">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${DOC_STATUS_STYLE[doc.status]}`}>{doc.status}</span>
                      {doc.status === 'Approved' && <button className="text-[10px] text-teal-600 hover:underline">View</button>}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push('/offers?view=documents')}
                className="mt-4 w-full py-2 border border-[#ff5722]/20 text-[#ff5722] text-xs font-semibold rounded-lg hover:bg-[#ff5722]/5 transition-colors"
              >
                Open Document Review
              </button>
            </div>
          </div>
        )}

        {activeTab === 'purchase' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-[#ff5722] text-sm mb-4">Purchase Details</h3>
              <div className="space-y-3">
                {[['Channel', car.purchase.channel], ['Date', car.purchase.date], ['Sales Person', car.purchase.salesPerson], ['Location', car.purchase.location]].map(([l, v]) => (
                  <div key={l as string} className="flex flex-col gap-0.5 pb-2 border-b border-gray-50 last:border-0">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{l}</span>
                    <span className="text-sm text-gray-800 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#ff5722] text-sm">Purchase Prices</h3>
                <button onClick={() => setAddingPrice(!addingPrice)} className="text-xs text-[#ff5722] hover:underline">+ Add Price</button>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">₦5,000,000</p>
                    <p className="text-[10px] text-gray-400">Final • 2024-12-01 • Promise Ndem</p>
                  </div>
                  <button className="text-gray-300 hover:text-red-500 transition-colors text-xs">×</button>
                </div>
              </div>
              {addingPrice && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <input type="number" placeholder="Amount (₦)" className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none" />
                  <select className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none">
                    <option>Ear</option><option>Final</option>
                  </select>
                  <input type="date" className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none" />
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 bg-[#ff5722] text-white text-xs rounded-md">Save</button>
                    <button onClick={() => setAddingPrice(false)} className="flex-1 py-1.5 border border-gray-200 text-xs rounded-md">Cancel</button>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-[#ff5722] text-sm mb-4">Purchase Payments</h3>
              <p className="text-2xl font-bold text-[#ff5722]">₦5,000,000.00</p>
              <span className="inline-block mt-1 bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Done</span>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <p>Payment Date: 2024-12-03</p>
                <p>Method: Bank Transfer</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-[#ff5722] text-sm mb-4">Sales Details</h3>
              <div className="space-y-3">
                {[['Channel', car.sales.channel], ['Sold To', car.sales.soldTo], ['Sold Date', car.sales.soldDate], ['Sales Person', car.sales.salesPerson], ['Location', car.sales.location], ['Invoice #', car.sales.invoiceNo]].map(([l, v]) => (
                  <div key={l as string} className="flex flex-col gap-0.5 pb-2 border-b border-gray-50 last:border-0">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{l}</span>
                    <span className="text-sm text-gray-800 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-[#ff5722] text-sm mb-4">Selling Price</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Purchase Price (Reference)</p>
                  <p className="text-sm text-gray-400">₦{car.purchase.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Selling Price</p>
                  <input type="number" defaultValue={car.sales.sellingPrice} onChange={() => setUnsaved(true)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Margin (Auto-calculated)</p>
                  <p className={`text-lg font-bold ${parseFloat(margin) > 0 ? 'text-green-600' : 'text-red-500'}`}>{margin}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-[#ff5722] text-sm mb-4">Selling Payments</h3>
              <p className="text-2xl font-bold text-[#ff5722]">₦{car.sales.sellingPrice.toLocaleString()}.00</p>
              <span className="inline-block mt-1 bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Done</span>
              <p className="mt-3 text-xs text-gray-500">Payment by Buyer: ₦{car.sales.sellingPrice.toLocaleString()}</p>
            </div>
          </div>
        )}

        {activeTab === 'channel' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Auction Panel */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#ff5722] text-sm">Auction Settings</h3>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">No Active Auction</span>
              </div>
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🔨</span>
                </div>
                <p className="text-sm text-gray-500">No auction has been started for this vehicle.</p>
                <button onClick={() => setShowAuctionModal(true)} className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors text-sm">Start Auction</button>
                <button onClick={() => router.push('/auctions')} className="w-full py-2 border border-orange-200 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors text-sm">View All Auctions</button>
              </div>
            </div>

            {/* Marketplace Panel */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-[#ff5722] text-sm mb-4">Marketplace Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Visibility</label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {(['Not Visible', 'Visible', 'Featured'] as const).map(v => (
                      <button key={v} onClick={() => setMarketplaceVisible(v)} className={`flex-1 py-2 text-xs font-medium transition-colors ${marketplaceVisible === v ? 'bg-[#ff5722] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Current Marketplace Price</label>
                  <p className="text-2xl font-bold text-[#ff5722]">₦5,200,000</p>
                  <p className="text-xs text-gray-400 mt-0.5">Previous: ₦5,100,000</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">New Price (₦)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₦</span>
                    <input type="number" value={newMarketPrice} onChange={e => { setNewMarketPrice(e.target.value); setUnsaved(true); }} placeholder="Enter new price" className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
                  </div>
                </div>
                <button onClick={handleSave} className="w-full py-2.5 bg-[#ff5722] text-white font-semibold rounded-xl hover:bg-[#e64a19] transition-colors text-sm">Update Marketplace Listing</button>
                <button onClick={() => router.push('/vehicle-listings')} className="w-full py-2 border border-[#ff5722]/20 text-[#ff5722] font-semibold rounded-xl hover:bg-[#ff5722]/5 transition-colors text-sm">View Marketplace Listings</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auction Modal */}
      {showAuctionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#ff5722]">Start Auction</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Toyota Camry Automatic 2011 — CK-41</p>
                </div>
                <button onClick={() => setShowAuctionModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 text-xl leading-none">×</button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Auction Starting Price (₦) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₦</span>
                  <input type="number" value={auctionPrice} onChange={e => setAuctionPrice(e.target.value)} placeholder="0" className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Platform Fee %</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {[1, 5, 10, 15, 20].map(f => (
                    <button key={f} onClick={() => setPlatformFee(f)} className={`flex-1 py-2 text-xs font-bold transition-colors ${platformFee === f ? 'bg-[#ff5722] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{f}%</button>
                  ))}
                </div>
                {auctionPrice && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">₦{parseInt(auctionPrice).toLocaleString()} × (1 - {platformFee}%) = <span className="font-bold text-[#ff5722]">₦{(parseInt(auctionPrice) * (1 - platformFee / 100)).toLocaleString()}</span></p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Amount after platform fee (visible to bidders)</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Auction End Date & Time</label>
                <input type="datetime-local" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
              </div>
              {auctionPrice && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs font-bold text-amber-700 mb-1">Auction Summary</p>
                  <p className="text-xs text-amber-600">Starting Bid: ₦{parseInt(auctionPrice).toLocaleString()} | Platform Fee: {platformFee}% | Bidders See: ₦{(parseInt(auctionPrice) * (1 - platformFee / 100)).toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowAuctionModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Close</button>
              <button className="flex-1 py-2.5 border border-[#ff5722] text-[#ff5722] rounded-xl text-sm font-semibold hover:bg-[#ff5722]/5 transition-colors">Save Draft</button>
              <button
                onClick={() => { setShowAuctionModal(false); router.push('/auctions'); }}
                className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors"
              >
                Push to Auction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#ff5722]">Change Status</h3>
              <button onClick={() => setShowStatusModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"><X size={16} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Move <span className="font-semibold">{car.id}</span> to <span className="font-semibold text-[#ff5722]">{showStatusModal}</span>?</p>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Note (optional)</label>
              <textarea rows={2} placeholder="Add a note about this status change..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowStatusModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => setShowStatusModal(null)} className="flex-1 py-2.5 bg-[#ff5722] text-white rounded-xl text-sm font-bold hover:bg-[#e64a19] transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
