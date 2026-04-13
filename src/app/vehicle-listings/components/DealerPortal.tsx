'use client';
import React, { useState } from 'react';
import { ArrowLeft, Building2, CheckCircle, Star, Upload, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { Listing } from './VehicleListingsModule';
import { toast } from 'sonner';

interface Props { onBack: () => void; listings: Listing[]; }

const DEALERS = [
  {
    id: 'dlr-001', name: 'Lagos Premium Motors', logo: 'LPM', verified: true, zone: 'Lagos Island',
    totalListings: 24, activeListings: 18, soldThisMonth: 6, totalRevenue: 142500000,
    featuredSlots: ['Home Page', 'Category Top'],
    contact: 'Chidi Okeke', phone: '+234 803 441 9921', email: 'info@lagospremium.com',
  },
  {
    id: 'dlr-002', name: 'Abuja Auto Hub', logo: 'AAH', verified: true, zone: 'Abuja',
    totalListings: 15, activeListings: 12, soldThisMonth: 3, totalRevenue: 87000000,
    featuredSlots: ['Category Top'],
    contact: 'Emeka Nwosu', phone: '+234 901 667 4432', email: 'sales@abujaautohub.com',
  },
  {
    id: 'dlr-003', name: 'PH Motors Ltd', logo: 'PHM', verified: false, zone: 'Port Harcourt',
    totalListings: 8, activeListings: 7, soldThisMonth: 1, totalRevenue: 38500000,
    featuredSlots: [],
    contact: 'Ngozi Ike', phone: '+234 706 881 2234', email: 'info@phmotors.com',
  },
];

const FEATURED_SLOTS = ['Home Page', 'Category Top', 'Email Blast'];

const CSV_PREVIEW = [
  { vin: '4T1BF1FK5KU123456', make: 'Toyota', model: 'Camry', year: '2019', date: '14 Apr 2026', time: '09:00' },
  { vin: 'WDDWF4HB5MR123789', make: 'Mercedes-Benz', model: 'C300', year: '2021', date: '14 Apr 2026', time: '11:00' },
  { vin: '2HKRW2H83JH123456', make: 'Honda', model: 'CR-V', year: '2018', date: '15 Apr 2026', time: '09:00' },
];

export default function DealerPortal({ onBack, listings }: Props) {
  const [selectedDealer, setSelectedDealer] = useState(DEALERS[0]);
  const [featuredToggles, setFeaturedToggles] = useState<Record<string, boolean>>({
    'Home Page': true, 'Category Top': true, 'Email Blast': false,
  });
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);

  const dealerListings = listings.filter((_, i) => i < selectedDealer.activeListings);

  const toggleBulk = (id: string) => setBulkSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors">
        <ArrowLeft size={16} /> Back to Listings
      </button>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
          <Building2 size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-heading font-bold text-[#1F2937]">Dealer Portal</h1>
          <p className="text-sm text-[#6B7280]">Manage dealer profiles, fleet listings, and featured slots</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Dealer list sidebar */}
        <div className="xl:col-span-1 space-y-3">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Dealers</h3>
          {DEALERS.map(dealer => (
            <button
              key={dealer.id}
              onClick={() => setSelectedDealer(dealer)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${selectedDealer.id === dealer.id ? 'border-[#1E3A5F] bg-[#EEF2FF]' : 'border-[#E5E7EB] bg-white hover:bg-[#F4F6F8]'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {dealer.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-[#1F2937] truncate">{dealer.name}</p>
                    {dealer.verified && <CheckCircle size={12} className="text-[#1A7A4A] flex-shrink-0" />}
                  </div>
                  <p className="text-[10px] text-[#6B7280]">{dealer.activeListings} active · {dealer.zone}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Dealer detail */}
        <div className="xl:col-span-3 space-y-5">
          {/* Dealer profile card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F] flex items-center justify-center text-white text-xl font-bold">
                  {selectedDealer.logo}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-heading font-bold text-[#1F2937]">{selectedDealer.name}</h2>
                    {selectedDealer.verified ? (
                      <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
                        <CheckCircle size={10} /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">Unverified</span>
                    )}
                  </div>
                  <p className="text-sm text-[#6B7280]">{selectedDealer.contact} · {selectedDealer.phone}</p>
                  <p className="text-xs text-[#6B7280]">{selectedDealer.email} · {selectedDealer.zone}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Listings', value: selectedDealer.totalListings },
                { label: 'Active', value: selectedDealer.activeListings, color: '#1A7A4A' },
                { label: 'Sold This Month', value: selectedDealer.soldThisMonth, color: '#2E75B6' },
                { label: 'Total Revenue', value: `₦${(selectedDealer.totalRevenue / 1000000).toFixed(1)}M`, color: '#1E3A5F' },
              ].map(stat => (
                <div key={stat.label} className="p-3 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB] text-center">
                  <p className="text-xl font-heading font-bold tabular-nums" style={{ color: stat.color || '#1F2937' }}>{stat.value}</p>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fleet listings table */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Fleet Listings ({selectedDealer.activeListings})</h3>
              <div className="flex gap-2">
                {bulkSelected.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg">
                    <span>{bulkSelected.length} selected</span>
                    <button onClick={() => { toast.success(`${bulkSelected.length} listings approved`); setBulkSelected([]); }} className="hover:underline">Approve</button>
                    <button onClick={() => { toast.error(`${bulkSelected.length} listings rejected`); setBulkSelected([]); }} className="hover:underline">Reject</button>
                    <button onClick={() => setBulkSelected([])} className="hover:underline"><X size={12} /></button>
                  </div>
                )}
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] text-xs font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-colors"
                >
                  <Upload size={13} /> Bulk Inspection Booking
                </button>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-[#F4F6F8] text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  <th className="px-4 py-3 text-left w-10"><input type="checkbox" onChange={e => e.target.checked ? setBulkSelected(dealerListings.map(l => l.id)) : setBulkSelected([])} /></th>
                  <th className="px-4 py-3 text-left">Vehicle</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Price</th>
                  <th className="px-4 py-3 text-center hidden md:table-cell">Score</th>
                  <th className="px-4 py-3 text-center hidden lg:table-cell">Views</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Featured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F6F8]">
                {dealerListings.slice(0, 6).map(listing => (
                  <tr key={listing.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={bulkSelected.includes(listing.id)} onChange={() => toggleBulk(listing.id)} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-[#1F2937]">{listing.year} {listing.make} {listing.model}</p>
                      <p className="text-[10px] font-mono text-[#6B7280]">{listing.plate}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-[#1F2937] tabular-nums hidden sm:table-cell">₦{listing.askingPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <span className={`text-xs font-bold ${listing.score >= 71 ? 'text-[#1A7A4A]' : 'text-[#D35400]'}`}>{listing.score}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-[#6B7280] hidden lg:table-cell">{listing.views}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        listing.status === 'active' ? 'bg-green-50 text-green-700' :
                        listing.status === 'featured' ? 'bg-purple-50 text-purple-700' :
                        listing.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                        listing.status === 'sold' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>{listing.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {listing.status === 'featured' ? (
                        <span className="flex items-center gap-1 text-[10px] text-purple-700"><Star size={10} className="fill-purple-500" /> Featured</span>
                      ) : (
                        <button onClick={() => toast.info(`${listing.id} featured`)} className="text-[10px] text-[#2E75B6] hover:underline">Feature</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Featured listing slots */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
              <Star size={15} className="text-[#D35400]" /> Featured Listing Slots
            </h3>
            <div className="space-y-3">
              {FEATURED_SLOTS.map(slot => {
                const isActive = featuredToggles[slot];
                const isCurrentlyFeatured = selectedDealer.featuredSlots.includes(slot);
                return (
                  <div key={slot} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isActive && isCurrentlyFeatured ? 'bg-purple-50 border-purple-200' : 'bg-[#F4F6F8] border-[#E5E7EB]'}`}>
                    <div>
                      <p className="text-sm font-semibold text-[#1F2937]">{slot}</p>
                      <p className="text-[10px] text-[#6B7280]">
                        {slot === 'Home Page' ? 'Top banner on marketplace homepage' :
                         slot === 'Category Top'? 'First result in vehicle category search' : 'Included in next customer email blast'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isCurrentlyFeatured && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Active</span>
                      )}
                      <button
                        onClick={() => {
                          setFeaturedToggles(prev => ({ ...prev, [slot]: !prev[slot] }));
                          toast.info(`${slot} slot ${isActive ? 'disabled' : 'enabled'} for ${selectedDealer.name}`);
                        }}
                        className="transition-colors"
                      >
                        {isActive && isCurrentlyFeatured
                          ? <ToggleRight size={28} className="text-[#7C3AED]" />
                          : <ToggleLeft size={28} className="text-[#6B7280]" />
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk inspection booking modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBulkModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-[#1F2937]">Bulk Inspection Booking</h3>
              <button onClick={() => setShowBulkModal(false)} className="p-1.5 rounded-lg hover:bg-[#F4F6F8]"><X size={16} className="text-[#6B7280]" /></button>
            </div>
            <p className="text-sm text-[#6B7280] mb-4">Upload a CSV with VIN numbers to schedule bulk inspections. Date and time will be auto-assigned based on inspector availability.</p>

            {/* CSV upload area */}
            <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 flex flex-col items-center justify-center text-center mb-4 hover:border-[#2E75B6] transition-colors cursor-pointer">
              <Upload size={24} className="text-[#6B7280] mb-2" />
              <p className="text-sm font-semibold text-[#1F2937]">Drop CSV file here or click to upload</p>
              <p className="text-xs text-[#6B7280] mt-1">Required columns: VIN, Make, Model, Year</p>
            </div>

            {/* Preview table */}
            <div className="bg-[#F4F6F8] rounded-xl overflow-hidden border border-[#E5E7EB] mb-5">
              <div className="px-4 py-3 border-b border-[#E5E7EB]">
                <p className="text-xs font-semibold text-[#1F2937]">Preview ({CSV_PREVIEW.length} vehicles)</p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    <th className="px-4 py-2 text-left">VIN</th>
                    <th className="px-4 py-2 text-left">Vehicle</th>
                    <th className="px-4 py-2 text-left">Scheduled Date</th>
                    <th className="px-4 py-2 text-left">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {CSV_PREVIEW.map((row, i) => (
                    <tr key={`csv-${i}`} className="bg-white">
                      <td className="px-4 py-2 font-mono text-[10px] text-[#6B7280]">{row.vin.slice(0, 12)}…</td>
                      <td className="px-4 py-2 text-xs text-[#1F2937]">{row.year} {row.make} {row.model}</td>
                      <td className="px-4 py-2 text-xs text-[#6B7280]">{row.date}</td>
                      <td className="px-4 py-2 text-xs text-[#6B7280]">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowBulkModal(false)} className="flex-1 py-2.5 border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={() => { setShowBulkModal(false); toast.success(`${CSV_PREVIEW.length} inspection bookings created successfully`); }} className="flex-1 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F]">
                Confirm Bookings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
