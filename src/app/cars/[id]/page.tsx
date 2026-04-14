'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Save, X, AlertTriangle, Check, MoreHorizontal, ChevronRight } from 'lucide-react';
import { CARS, formatNaira, getScoreColor, getScoreLabel } from '@/lib/mockData';
import { toast } from 'sonner';

const PIPELINE_STAGES = ['Acquired', 'Inspection Linked', 'At Buyer', 'Listed', 'Sold'];
const TABS = ['Main Data', 'Purchase', 'Sales', 'Channel'];

export default function CarDetailPage() {
  const pathname = usePathname();
  const params = useParams();
  const carId = params.id as string;
  const car = CARS.find(c => c.id === carId) || CARS[0];

  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ ...car });
  const [currentStage, setCurrentStage] = useState(PIPELINE_STAGES.indexOf(car.status));
  const [stageModal, setStageModal] = useState<number | null>(null);
  const [marketplaceVisibility, setMarketplaceVisibility] = useState<'Not Visible' | 'Visible' | 'Featured'>('Visible');
  const [marketplacePrice, setMarketplacePrice] = useState(car.salePrice || car.purchasePrice);
  const [priceDiscount, setPriceDiscount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const margin = car.salePrice ? ((car.salePrice - car.purchasePrice) / car.purchasePrice * 100).toFixed(2) : null;

  const handleSave = () => {
    setEditing(false);
    toast.success('Car details updated successfully');
  };

  const advanceStage = (idx: number) => {
    setCurrentStage(idx);
    setStageModal(null);
    toast.success(`Status updated to ${PIPELINE_STAGES[idx]}`);
  };

  const discountedPrice = marketplacePrice * (1 - priceDiscount / 100);

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-0">
        {/* Sticky header */}
        <div className="sticky top-0 z-20 bg-white border-b border-[#E5E7EB] -mx-4 md:-mx-6 xl:-mx-8 px-4 md:px-6 xl:px-8 py-4 mb-6">
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex flex-wrap items-start gap-3 mb-4">
              <Link href="/cars" className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8] transition-colors flex-shrink-0">
                <ArrowLeft size={16} className="text-[#6B7280]" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-[#2E75B6] bg-blue-50 px-2.5 py-1 rounded-lg">{car.id}</span>
                  <h1 className="text-lg font-heading font-bold text-[#1F2937]">{car.brand} {car.model} {car.year}</h1>
                  <span className="text-xs text-[#6B7280] bg-[#F4F6F8] px-2 py-1 rounded-full">📍 {car.city}, {car.state}</span>
                  {car.hasDuplicate && (
                    <button className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full hover:bg-amber-200 transition-colors">
                      <AlertTriangle size={11} /> Potential Duplicate
                    </button>
                  )}
                  {car.warnings > 0 && (
                    <button className="flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full hover:bg-orange-200 transition-colors">
                      ⚠ {car.warnings} Warnings
                    </button>
                  )}
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${car.docs >= 6 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Docs: {car.docs}/8
                  </span>
                </div>
                {margin && (
                  <p className="text-xs text-[#6B7280]">
                    Purchased {formatNaira(car.purchasePrice)} · Sold {formatNaira(car.salePrice!)} ·
                    <span className={`font-semibold ml-1 ${parseFloat(margin) >= 0 ? 'text-[#1A7A4A]' : 'text-[#C0392B]'}`}>
                      Margin {parseFloat(margin) >= 0 ? '+' : ''}{margin}%
                    </span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {editing && (
                  <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-[#1A7A4A] text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-all shadow-sm">
                    <Save size={14} /> Save Changes
                  </button>
                )}
                <div className="relative">
                  <button onClick={() => setMenuOpen(o => !o)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8] transition-colors">
                    <MoreHorizontal size={16} className="text-[#6B7280]" />
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-[#E5E7EB] z-50 py-1 animate-fade-in">
                        {['Grade Car', 'Start Auction', 'Push to Marketplace', 'Delete'].map(a => (
                          <button key={a} onClick={() => { toast.success(`${a} — ${car.id}`); setMenuOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F4F6F8] transition-colors ${a === 'Delete' ? 'text-[#C0392B] hover:bg-red-50' : 'text-[#1F2937]'}`}>
                            {a}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Pipeline stepper */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {PIPELINE_STAGES.map((stage, i) => (
                <React.Fragment key={stage}>
                  <button
                    onClick={() => i > currentStage ? setStageModal(i) : undefined}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${i === currentStage ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300' : i < currentStage ? 'bg-[#1E3A5F] text-white' : 'bg-[#F4F6F8] text-[#9CA3AF] hover:bg-[#E5E7EB] cursor-pointer'}`}>
                    {i < currentStage ? <Check size={11} /> : i === currentStage ? <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> : null}
                    {stage}
                  </button>
                  {i < PIPELINE_STAGES.length - 1 && <ChevronRight size={12} className="text-[#E5E7EB] flex-shrink-0" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Stage advance modal */}
        {stageModal !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setStageModal(null)} />
            <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-fade-in">
              <h3 className="text-base font-heading font-semibold text-[#1F2937] mb-2">Advance to {PIPELINE_STAGES[stageModal]}?</h3>
              <p className="text-sm text-[#6B7280] mb-5">This will update the car status and log an audit entry.</p>
              <div className="flex gap-3">
                <button onClick={() => setStageModal(null)} className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F4F6F8] transition-colors">Cancel</button>
                <button onClick={() => advanceStage(stageModal)} className="flex-1 px-4 py-2.5 bg-[#1E3A5F] text-white rounded-lg text-sm font-semibold hover:bg-[#16304F] transition-colors">Confirm</button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#E5E7EB] mb-6 overflow-x-auto">
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === i ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Car Details */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Car Details</h3>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs text-[#2E75B6] hover:underline">
                    <Edit size={12} /> Edit
                  </button>
                ) : (
                  <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#C0392B]">
                    <X size={12} /> Cancel
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Brand', value: car.brand, key: 'brand' },
                  { label: 'Model', value: car.model, key: 'model' },
                  { label: 'Year', value: String(car.year), key: 'year' },
                  { label: 'Colour', value: car.colour, key: 'colour' },
                  { label: 'Mileage', value: `${car.mileage.toLocaleString()} km`, key: 'mileage' },
                  { label: 'VIN', value: car.vin, key: 'vin', mono: true },
                  { label: 'Plate', value: car.plate, key: 'plate', mono: true },
                ].map(field => (
                  <div key={field.key} className="flex items-center justify-between py-2 border-b border-[#F4F6F8] last:border-0">
                    <span className="text-xs text-[#6B7280] w-24 flex-shrink-0">{field.label}</span>
                    {editing ? (
                      <input
                        value={editData[field.key as keyof typeof editData] as string}
                        onChange={e => setEditData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="flex-1 text-sm px-2 py-1 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 text-right"
                      />
                    ) : (
                      <span className={`text-sm font-medium text-[#1F2937] ${field.mono ? 'font-mono text-xs' : ''}`}>{field.value}</span>
                    )}
                  </div>
                ))}
              </div>
              {editing && (
                <button onClick={handleSave} className="mt-4 w-full py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">
                  Save Changes
                </button>
              )}
            </div>

            {/* Score + Documents */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Carschek Score</h3>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20">
                    <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#F4F6F8" strokeWidth="8" />
                      <circle cx="40" cy="40" r="32" fill="none" stroke={getScoreColor(car.score)} strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - car.score / 100)}`}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold" style={{ color: getScoreColor(car.score) }}>{car.score}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-heading font-bold" style={{ color: getScoreColor(car.score) }}>{getScoreLabel(car.score)}</p>
                    <p className="text-xs text-[#6B7280]">Based on 27-section inspection</p>
                    <Link href={`/reports`} className="text-xs text-[#2E75B6] hover:underline mt-1 block">View full report →</Link>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Car Documents</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${car.docs >= 6 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{car.docs}/8</span>
                </div>
                {car.docs < 6 && (
                  <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                    ⚠ Minimum 6 documents required for marketplace listing
                  </div>
                )}
                <div className="space-y-2">
                  {['Vehicle Registration', 'Proof of Ownership', 'Insurance Certificate', 'Road Worthiness', 'Customs Papers', 'Service History', 'Inspection Report', 'Sales Agreement'].map((doc, i) => (
                    <div key={doc} className="flex items-center gap-2 text-xs">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${i < car.docs ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {i < car.docs ? <Check size={9} /> : <X size={9} />}
                      </span>
                      <span className={i < car.docs ? 'text-[#1F2937]' : 'text-[#9CA3AF]'}>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Purchase Details</h3>
              <div className="space-y-3">
                {[
                  { label: 'Channel', value: car.channel },
                  { label: 'Date', value: car.createdAt },
                  { label: 'City', value: car.city },
                  { label: 'State', value: car.state },
                ].map(f => (
                  <div key={f.label} className="flex items-center justify-between py-2 border-b border-[#F4F6F8] last:border-0">
                    <span className="text-xs text-[#6B7280]">{f.label}</span>
                    <span className="text-sm font-medium text-[#1F2937]">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Purchase Price</h3>
              <div className="text-2xl font-heading font-bold text-[#1F2937] mb-1">{formatNaira(car.purchasePrice)}</div>
              <p className="text-xs text-[#6B7280]">Final purchase price</p>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Sales Details</h3>
              {car.salePrice ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-[#F4F6F8]">
                    <span className="text-xs text-[#6B7280]">Purchase Price</span>
                    <span className="text-sm text-[#6B7280]">{formatNaira(car.purchasePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#F4F6F8]">
                    <span className="text-xs text-[#6B7280]">Selling Price</span>
                    <span className="text-sm font-bold text-[#1F2937]">{formatNaira(car.salePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-[#6B7280]">Margin</span>
                    <span className={`text-sm font-bold ${parseFloat(margin!) >= 0 ? 'text-[#1A7A4A]' : 'text-[#C0392B]'}`}>
                      {parseFloat(margin!) >= 0 ? '+' : ''}{margin}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#6B7280]">No sale recorded yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Auction panel */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Auction</h3>
              <div className="text-center py-8">
                <p className="text-sm text-[#6B7280] mb-4">No active auction for this vehicle</p>
                <button onClick={() => toast.success('Auction setup modal — coming soon')}
                  className="px-5 py-2.5 bg-[#D35400] text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-all">
                  Start Auction
                </button>
              </div>
            </div>

            {/* Marketplace panel */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Marketplace</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-2">Visibility</label>
                  <div className="flex gap-2">
                    {(['Not Visible', 'Visible', 'Featured'] as const).map(v => (
                      <button key={v} onClick={() => { setMarketplaceVisibility(v); toast.success(`Visibility set to ${v}`); }}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${marketplaceVisibility === v ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#2E75B6]'}`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Price (₦)</label>
                  <input type="number" value={marketplacePrice} onChange={e => setMarketplacePrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-2">Discount</label>
                  <div className="flex gap-2">
                    {[0, 5, 10, 15, 20].map(d => (
                      <button key={d} onClick={() => setPriceDiscount(d)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${priceDiscount === d ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#2E75B6]'}`}>
                        {d}%
                      </button>
                    ))}
                  </div>
                </div>
                {priceDiscount > 0 && (
                  <div className="p-3 bg-[#F4F6F8] rounded-lg">
                    <p className="text-xs text-[#6B7280]">Marketplace Price</p>
                    <p className="text-lg font-bold text-[#1A7A4A]">{formatNaira(Math.round(discountedPrice))}</p>
                    <p className="text-xs text-[#9CA3AF] line-through">{formatNaira(marketplacePrice)}</p>
                  </div>
                )}
                <button onClick={() => toast.success('Marketplace listing updated')}
                  className="w-full py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">
                  Update Marketplace Listing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
