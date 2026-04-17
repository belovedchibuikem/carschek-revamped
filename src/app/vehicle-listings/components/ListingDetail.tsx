'use client';
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Star, Eye, TrendingUp, MessageSquare, Calendar, Camera, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { Listing } from './VehicleListingsModule';
import { toast } from 'sonner';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useRechartsTheme } from '@/lib/charts/rechartsTheme';
import { CarschekScore } from '@/components/shared/CarschekScore';

const VIEWS_DATA = [
  { day: 'Mon', views: 42 }, { day: 'Tue', views: 67 }, { day: 'Wed', views: 55 },
  { day: 'Thu', views: 89 }, { day: 'Fri', views: 103 }, { day: 'Sat', views: 78 }, { day: 'Sun', views: 61 },
];

const INTERESTED_BUYERS = [
  { id: 'b1', name: 'Adaeze Mbah', phone: '+234 803 441 9921', date: '10 Apr 2026' },
  { id: 'b2', name: 'Tunde Babs', phone: '+234 705 334 8821', date: '09 Apr 2026' },
  { id: 'b3', name: 'Ngozi Ike', phone: '+234 901 667 4432', date: '08 Apr 2026' },
];

const PRICE_HISTORY = [
  { date: '01 Mar 2026', price: 5500000, note: 'Initial listing' },
  { date: '15 Mar 2026', price: 5350000, note: 'Price reduced' },
  { date: '01 Apr 2026', price: 5200000, note: 'Price reduced' },
];

const SCORE_BG = (s: number) => s >= 71 ? 'bg-green-50 text-green-700' : s >= 41 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700';

interface Props { listing: Listing; onBack: () => void; }

export default function ListingDetail({ listing, onBack }: Props) {
  const chartTheme = useRechartsTheme();
  const [featured, setFeatured] = useState(listing.status === 'featured');
  const [activePhoto, setActivePhoto] = useState(0);
  const isSold = listing.status === 'sold';

  const suggestedMin = Math.round(listing.askingPrice * 0.92);
  const suggestedMax = Math.round(listing.askingPrice * 1.08);
  const commission = listing.finalSalePrice ? Math.round(listing.finalSalePrice * listing.commissionRate / 100) : Math.round(listing.askingPrice * listing.commissionRate / 100);
  const sellerPayout = listing.finalSalePrice ? listing.finalSalePrice - commission : 0;

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors">
        <ArrowLeft size={16} /> Back to Listings
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-14 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB] flex items-center justify-center">
              <span className="text-lg font-bold text-[#6B7280]">{listing.make[0]}{listing.model[0]}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-heading font-bold text-[#1F2937]">{listing.year} {listing.make} {listing.model}</h1>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                  listing.status === 'active' ? 'bg-green-50 text-green-700' :
                  listing.status === 'featured' ? 'bg-purple-50 text-purple-700' :
                  listing.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                  listing.status === 'sold' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>{listing.status}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SCORE_BG(listing.score)}`}>Score: {listing.score}</span>
              </div>
              <p className="text-sm text-[#6B7280] mt-0.5 font-mono">{listing.plate} · {listing.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isSold && (
              <>
                <button onClick={() => { toast.success(`${listing.id} approved`); }} className="flex items-center gap-1.5 px-4 py-2 bg-[#1A7A4A] text-white text-sm font-semibold rounded-lg hover:bg-[#155F3A] transition-all">
                  <CheckCircle size={15} /> Approve
                </button>
                <button onClick={() => { toast.error(`${listing.id} rejected`); }} className="flex items-center gap-1.5 px-4 py-2 bg-[#C0392B] text-white text-sm font-semibold rounded-lg hover:bg-[#A93226] transition-all">
                  <XCircle size={15} /> Reject
                </button>
              </>
            )}
          </div>
        </div>
        {/* Price */}
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <div>
            <p className="text-xs text-[#6B7280]">Asking Price</p>
            <p className="text-2xl font-heading font-bold text-[#1F2937]">₦{listing.askingPrice.toLocaleString()}</p>
          </div>
          <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-[10px] text-green-600 font-semibold">Suggested Range (Carschek Engine)</p>
            <p className="text-sm font-bold text-green-700">₦{suggestedMin.toLocaleString()} – ₦{suggestedMax.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-13 gap-5">
        {/* Left: Listing Content */}
        <div className="xl:col-span-8 space-y-5">
          {/* Photo Gallery */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] flex items-center gap-2"><Camera size={15} className="text-[#2E75B6]" /> Photo Gallery</h3>
              <button onClick={() => toast.info('Request sent to seller for new photos')} className="text-xs text-[#2E75B6] hover:underline">Request new photos</button>
            </div>
            {/* Main photo */}
            <div className="w-full h-48 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB] flex items-center justify-center mb-3">
              <div className="text-center">
                <Camera size={32} className="text-[#6B7280] mx-auto mb-2" />
                <p className="text-xs text-[#6B7280]">Photo {activePhoto + 1} of 4</p>
              </div>
            </div>
            {/* Thumbnails */}
            <div className="flex gap-2">
              {[0, 1, 2, 3].map(i => (
                <button
                  key={`thumb-${i}`}
                  onClick={() => setActivePhoto(i)}
                  className={`w-16 h-12 rounded-lg border-2 flex items-center justify-center bg-[#F4F6F8] transition-all ${activePhoto === i ? 'border-[#1E3A5F]' : 'border-[#E5E7EB] hover:border-[#2E75B6]'}`}
                >
                  <Camera size={14} className="text-[#6B7280]" />
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Vehicle Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'VIN', value: listing.vin, mono: true },
                { label: 'Plate', value: listing.plate, mono: true },
                { label: 'Make', value: listing.make },
                { label: 'Model', value: listing.model },
                { label: 'Year', value: String(listing.year) },
                { label: 'Colour', value: listing.colour },
                { label: 'Mileage', value: `${listing.mileage.toLocaleString()} km` },
                { label: 'Transmission', value: listing.transmission },
                { label: 'Fuel Type', value: listing.fuelType },
                { label: 'Engine', value: listing.engineSize },
                { label: 'Zone', value: listing.zone },
                { label: 'Days on Market', value: `${listing.daysOnMarket} days` },
              ].map(d => (
                <div key={d.label} className="p-3 bg-[#F4F6F8] rounded-lg">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wide font-semibold">{d.label}</p>
                  <p className={`text-sm font-semibold text-[#1F2937] mt-0.5 ${d.mono ? 'font-mono text-xs' : ''}`}>{d.value}</p>
                </div>
              ))}
            </div>
            {/* Features */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Features</p>
              <div className="flex flex-wrap gap-2">
                {['Leather Seats', 'Sunroof', 'Reverse Camera', 'Bluetooth', 'Navigation', 'Keyless Entry', 'Push Start', 'Alloy Wheels'].map(f => (
                  <span key={f} className="text-xs px-2.5 py-1 bg-[#EEF2FF] text-[#2E75B6] rounded-full font-medium">{f}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Seller Description */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Seller Description</h3>
              <button className="text-xs text-[#2E75B6] hover:underline">Edit</button>
            </div>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Well-maintained {listing.year} {listing.make} {listing.model} in excellent condition. Single owner, full service history available. No accident history. All papers complete and up to date. Reason for sale: relocating abroad. Serious buyers only, price is slightly negotiable.
            </p>
          </div>

          {/* Attached Inspection Report */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-3 flex items-center gap-2"><FileText size={15} className="text-[#2E75B6]" /> Attached Inspection Report</h3>
            <div className="flex items-center gap-4 p-4 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB]">
              <CarschekScore score={listing.score} size={48} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1F2937]">Carschek Inspection Report</p>
                <p className="text-xs text-[#6B7280]">Inspected: 28 Mar 2026 · Score: {listing.score}/100</p>
              </div>
              <button className="text-xs text-[#2E75B6] hover:underline font-semibold">View Full Report →</button>
            </div>
          </div>

          {/* SOLD: Final sale details */}
          {isSold && listing.finalSalePrice && (
            <div className="bg-white rounded-xl border-l-4 border-l-[#1A7A4A] border border-[#E5E7EB] p-5 shadow-sm">
              <h3 className="text-sm font-heading font-semibold text-[#1A7A4A] mb-4">Sale Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">Final Sale Price</p>
                  <p className="text-lg font-bold text-[#1A7A4A]">₦{listing.finalSalePrice.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-[#F4F6F8] rounded-lg">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">Listed Price</p>
                  <p className="text-lg font-bold text-[#1F2937]">₦{listing.askingPrice.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-[#F4F6F8] rounded-lg">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">Time on Market</p>
                  <p className="text-lg font-bold text-[#1F2937]">{listing.daysOnMarket} days</p>
                </div>
                <div className="p-3 bg-[#F4F6F8] rounded-lg">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">Buyer</p>
                  <p className="text-sm font-bold text-[#1F2937]">{listing.buyerName} (Admin only)</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">Carschek Commission ({listing.commissionRate}%)</p>
                  <p className="text-lg font-bold text-[#D35400]">₦{commission.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">Seller Payout</p>
                  <p className="text-lg font-bold text-[#1A7A4A]">₦{sellerPayout.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Analytics */}
        <div className="xl:col-span-5 space-y-5">
          {/* Views sparkline */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] flex items-center gap-2"><Eye size={14} className="text-[#2E75B6]" /> Views This Week</h3>
              <span className="text-lg font-bold text-[#1F2937]">{VIEWS_DATA.reduce((a, d) => a + d.views, 0)}</span>
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={VIEWS_DATA} margin={{ top: 2, right: 4, left: -18, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: chartTheme.tickFill }} tickLine={false} axisLine={false} />
                <Line type="monotone" dataKey="views" stroke="#2E75B6" strokeWidth={2} dot={false} />
                <Tooltip contentStyle={{ ...chartTheme.tooltipContentStyle, fontSize: 11 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Inquiries */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] flex items-center gap-2"><MessageSquare size={14} className="text-[#2E75B6]" /> Inquiries ({listing.inquiries})</h3>
            </div>
            <div className="space-y-2">
              {INTERESTED_BUYERS.slice(0, 3).map(b => (
                <div key={b.id} className="flex items-center gap-3 p-2.5 bg-[#F4F6F8] rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-[#2E75B6] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {b.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1F2937] truncate">{b.name}</p>
                    <p className="text-[10px] text-[#6B7280]">{b.date}</p>
                  </div>
                  <button type="button" onClick={() => toast.message('Contact (demo)', { description: `${b.name} · ${b.phone}` })} className="text-[10px] text-[#2E75B6] hover:underline">Contact</button>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-3 flex items-center gap-2"><TrendingUp size={14} className="text-[#2E75B6]" /> Listing Stats</h3>
            <div className="space-y-2">
              {[
                { label: 'Days on Market', value: `${listing.daysOnMarket} days`, color: listing.daysOnMarket > 30 ? 'text-[#C0392B]' : 'text-[#1F2937]' },
                { label: 'Total Views', value: listing.views.toLocaleString(), color: 'text-[#1F2937]' },
                { label: 'Total Inquiries', value: String(listing.inquiries), color: 'text-[#1F2937]' },
                { label: 'Conversion Rate', value: `${((listing.inquiries / listing.views) * 100).toFixed(1)}%`, color: 'text-[#1F2937]' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-[#F4F6F8] last:border-0">
                  <span className="text-xs text-[#6B7280]">{s.label}</span>
                  <span className={`text-xs font-semibold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price History */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-3 flex items-center gap-2"><Calendar size={14} className="text-[#2E75B6]" /> Price History</h3>
            <div className="space-y-2">
              {PRICE_HISTORY.map((p, i) => (
                <div key={`ph-${i}`} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2E75B6] flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#1F2937]">₦{p.price.toLocaleString()}</p>
                    <p className="text-[10px] text-[#6B7280]">{p.date} · {p.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature toggle */}
          {!isSold && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-3 flex items-center gap-2"><Star size={14} className="text-purple-600" /> Feature This Listing</h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#6B7280]">Featured status</span>
                <button
                  onClick={() => { setFeatured(f => !f); toast.info(featured ? 'Listing unfeatured' : 'Listing featured on homepage'); }}
                  className="flex items-center gap-1.5 text-xs font-semibold"
                >
                  {featured ? <ToggleRight size={20} className="text-purple-600" /> : <ToggleLeft size={20} className="text-[#6B7280]" />}
                  <span className={featured ? 'text-purple-600' : 'text-[#6B7280]'}>{featured ? 'Featured' : 'Not Featured'}</span>
                </button>
              </div>
              <div className="space-y-1.5">
                {['Home Page', 'Category Top', 'Email Blast'].map(slot => (
                  <label key={slot} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={slot === 'Home Page' && featured} className="w-3.5 h-3.5 rounded border-[#E5E7EB] text-purple-600" />
                    <span className="text-xs text-[#6B7280]">{slot}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
