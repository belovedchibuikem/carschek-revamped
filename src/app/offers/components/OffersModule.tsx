'use client';
import React, { useState } from 'react';
import { Plus, Search, MoreHorizontal, X, Check, Send } from 'lucide-react';
import { OfferRow, OfferStatus } from '@/types/domain';

const MOCK_OFFERS: OfferRow[] = [
  { id: 'o1', carId: '1', ckId: 'CK-41', carName: 'Toyota Camry 2011', contactId: 'c1', contactName: 'Adaeze Mensah', amount: 4800000, validUntil: '2025-04-27', status: 'sent', createdBy: 'Promise Ndem', createdAt: '2025-04-13' },
  { id: 'o2', carId: '2', ckId: 'CK-40', carName: 'Honda Accord 2015', contactId: 'c3', contactName: 'Chidi Okafor', amount: 4000000, validUntil: '2025-04-20', status: 'accepted', createdBy: 'Adaeze Mensah', createdAt: '2025-04-06' },
  { id: 'o3', carId: '6', ckId: 'CK-36', carName: 'Lexus RX350 2020', contactId: 'c5', contactName: 'Tunde Bakare', amount: 17500000, validUntil: '2025-04-15', status: 'draft', createdBy: 'Promise Ndem', createdAt: '2025-04-12' },
  { id: 'o4', carId: '5', ckId: 'CK-37', carName: 'Ford Explorer 2019', contactId: 'c2', contactName: 'Emeka Obi', amount: 8200000, validUntil: '2025-04-01', status: 'expired', createdBy: 'Chidi Okafor', createdAt: '2025-03-25' },
  { id: 'o5', carId: '3', ckId: 'CK-39', carName: 'Mercedes-Benz C300 2018', contactId: 'c4', contactName: 'Ngozi Eze', amount: 11500000, validUntil: '2025-04-10', status: 'rejected', createdBy: 'Adaeze Mensah', createdAt: '2025-04-03' },
];

const STATUS_CONFIG: Record<OfferStatus, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  sent: { label: 'Sent', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  accepted: { label: 'Accepted', cls: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-600 border-red-200' },
  expired: { label: 'Expired', cls: 'bg-gray-100 text-gray-400 border-gray-200' },
};

type View = 'list' | 'create';

function fmt(n: number) { return '₦' + n.toLocaleString('en-NG'); }

export default function OffersModule() {
  const [view, setView] = useState<View>('list');
  const [offers] = useState<OfferRow[]>(MOCK_OFFERS);
  const [responseModal, setResponseModal] = useState<OfferRow | null>(null);
  const [responseType, setResponseType] = useState<'accepted' | 'rejected'>('accepted');

  // Create form state
  const [carSearch, setCarSearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [validDays, setValidDays] = useState('14');
  const [notes, setNotes] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSms, setSendSms] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const expiryDate = validDays ? new Date(Date.now() + parseInt(validDays) * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-5">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check size={32} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-[#1F2937]">Offer Sent!</h2>
          <p className="text-[#6B7280] mt-1 text-sm">Offer sent to Adaeze Mensah via Email & SMS</p>
        </div>
        <button onClick={() => { setSubmitted(false); setView('list'); }} className="px-6 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-xl hover:bg-[#16304F] transition-all">Back to Offers</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Offers</h1>
          <span className="bg-[#1E3A5F] text-white text-xs font-bold px-2.5 py-1 rounded-full">{offers.length} offers</span>
        </div>
        <div className="flex items-center gap-2">
          {view === 'create' && (
            <button onClick={() => setView('list')} className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] text-sm font-medium text-[#6B7280] rounded-lg hover:bg-[#F4F6F8]">
              ← Back
            </button>
          )}
          {view === 'list' && (
            <button onClick={() => setView('create')} className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">
              <Plus size={15} /> Create Offer
            </button>
          )}
        </div>
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(['draft','sent','accepted','rejected','expired'] as OfferStatus[]).map(s => (
              <div key={s} className="bg-white rounded-xl border border-[#E5E7EB] p-3 text-center">
                <p className="text-xs text-[#9CA3AF] font-medium capitalize">{s}</p>
                <p className="text-xl font-bold mt-0.5 text-[#1F2937]">{offers.filter(o => o.status === s).length}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  {['Offer #','Car','Offered To','Amount','Valid Until','Status','Created By','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {offers.map(offer => (
                  <tr key={offer.id} className="hover:bg-[#F8FAFC] transition-all">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[#1E3A5F]">#{offer.id.toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">{offer.ckId}</span>
                        <span className="text-sm text-[#374151]">{offer.carName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#1F2937]">{offer.contactName}</td>
                    <td className="px-4 py-3 font-bold text-[#1F2937]">{fmt(offer.amount)}</td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">{offer.validUntil}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_CONFIG[offer.status].cls}`}>{STATUS_CONFIG[offer.status].label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">{offer.createdBy}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {offer.status === 'sent' && (
                          <button onClick={() => setResponseModal(offer)} className="px-2.5 py-1.5 bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg hover:bg-[#16304F] transition-all">Record Response</button>
                        )}
                        <button className="p-1.5 rounded-lg hover:bg-[#F4F6F8] text-[#6B7280]"><MoreHorizontal size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* CREATE VIEW */}
      {view === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Form */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
              <h2 className="text-lg font-heading font-bold text-[#1F2937]">Offer Details</h2>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Link to Car *</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input value={carSearch} onChange={e => setCarSearch(e.target.value)} placeholder="Type CK- or car name..." className="w-full pl-9 pr-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
                </div>
                {carSearch && (
                  <div className="mt-1 border border-[#E5E7EB] rounded-lg overflow-hidden shadow-sm">
                    {[{ ckId: 'CK-41', name: 'Toyota Camry 2011', score: 73, status: 'At Buyer' }].map(car => (
                      <button key={car.ckId} onClick={() => setCarSearch(`${car.ckId} — ${car.name}`)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F4F6F8] text-left">
                        <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">{car.ckId}</span>
                        <span className="text-sm text-[#374151] flex-1">{car.name}</span>
                        <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">{car.score}</span>
                        <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{car.status}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Offer To (Contact) *</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input value={contactSearch} onChange={e => setContactSearch(e.target.value)} placeholder="Search CRM contacts..." className="w-full pl-9 pr-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
                </div>
                {contactSearch && (
                  <div className="mt-1 border border-[#E5E7EB] rounded-lg overflow-hidden shadow-sm">
                    {[{ name: 'Adaeze Mensah', type: 'Buyer', avatar: 'AM' }].map(c => (
                      <button key={c.name} onClick={() => setContactSearch(c.name)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F4F6F8] text-left">
                        <div className="w-7 h-7 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-[10px] font-bold">{c.avatar}</div>
                        <span className="text-sm text-[#374151] flex-1">{c.name}</span>
                        <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">{c.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Offer Price (₦) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] font-semibold text-sm">₦</span>
                  <input value={offerPrice} onChange={e => setOfferPrice(e.target.value)} placeholder="4,800,000" className="w-full pl-8 pr-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
                </div>
                <p className="text-xs text-[#9CA3AF] mt-1">Market range: ₦4,200,000 – ₦4,800,000</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Validity Period *</label>
                <div className="flex items-center gap-2">
                  <input value={validDays} onChange={e => setValidDays(e.target.value)} type="number" min={1} max={90} className="w-24 px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
                  <span className="text-sm text-[#6B7280]">days</span>
                </div>
                {expiryDate && <p className="text-xs text-[#9CA3AF] mt-1">Expires: {expiryDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Notes / Terms</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Any special terms or notes..." className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none resize-none" />
              </div>
            </div>

            {/* Send Options */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-3">
              <h3 className="font-heading font-bold text-[#1F2937]">Send Options</h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} className="rounded border-[#D1D5DB] text-[#1E3A5F]" />
                <span className="text-sm text-[#374151]">Send via Email <span className="text-[#9CA3AF]">(adaeze@email.com)</span></span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={sendSms} onChange={e => setSendSms(e.target.checked)} className="rounded border-[#D1D5DB] text-[#1E3A5F]" />
                <span className="text-sm text-[#374151]">Send via SMS <span className="text-[#9CA3AF]">(+2348012345678)</span></span>
              </label>
              <div className="flex gap-3 pt-2">
                <button className="flex-1 py-2.5 border border-[#E5E7EB] text-sm font-semibold text-[#374151] rounded-xl hover:bg-[#F4F6F8]">Save as Draft</button>
                <button onClick={() => setSubmitted(true)} className="flex-1 py-2.5 bg-[#1E3A5F] text-white text-sm font-bold rounded-xl hover:bg-[#16304F] flex items-center justify-center gap-2">
                  <Send size={14} /> Send Offer
                </button>
              </div>
            </div>
          </div>

          {/* Right — Preview */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 h-fit">
            <h3 className="font-heading font-bold text-[#1F2937] mb-4">Offer Preview</h3>
            <div className="border border-[#E5E7EB] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-4">
                <div>
                  <p className="text-lg font-bold text-[#1E3A5F]">CARSCHEK</p>
                  <p className="text-xs text-[#9CA3AF]">Vehicle Purchase Offer</p>
                </div>
                <p className="text-xs text-[#9CA3AF]">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] font-medium">OFFERED TO</p>
                <p className="text-sm font-semibold text-[#1F2937] mt-0.5">{contactSearch || 'Contact Name'}</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] font-medium">VEHICLE</p>
                <p className="text-sm font-semibold text-[#1F2937] mt-0.5">{carSearch || 'Car Details'}</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-4">
                <p className="text-xs text-[#9CA3AF] font-medium">OFFER PRICE</p>
                <p className="text-2xl font-bold text-[#1E3A5F] mt-1">{offerPrice ? `₦${parseInt(offerPrice.replace(/,/g, '')).toLocaleString('en-NG')}` : '₦—'}</p>
              </div>
              {expiryDate && (
                <div>
                  <p className="text-xs text-[#9CA3AF] font-medium">VALID UNTIL</p>
                  <p className="text-sm font-semibold text-[#1F2937] mt-0.5">{expiryDate}</p>
                </div>
              )}
              {notes && (
                <div>
                  <p className="text-xs text-[#9CA3AF] font-medium">TERMS & NOTES</p>
                  <p className="text-sm text-[#374151] mt-0.5">{notes}</p>
                </div>
              )}
              <div className="border-t border-[#F3F4F6] pt-4">
                <p className="text-xs text-[#9CA3AF]">Authorised by: Promise Ndem</p>
                <div className="mt-3 border-t border-[#D1D5DB] pt-2">
                  <p className="text-[10px] text-[#9CA3AF]">Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Response Modal */}
      {responseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-[#1F2937]">Record Response</h2>
              <button onClick={() => setResponseModal(null)} className="p-2 rounded-lg hover:bg-[#F4F6F8] text-[#6B7280]"><X size={16} /></button>
            </div>
            <p className="text-sm text-[#6B7280]">Offer #{responseModal.id.toUpperCase()} — {responseModal.carName}</p>
            <div className="flex gap-3">
              <button onClick={() => setResponseType('accepted')} className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${responseType === 'accepted' ? 'border-green-500 bg-green-50 text-green-700' : 'border-[#E5E7EB] text-[#6B7280]'}`}>
                <Check size={15} /> Accepted
              </button>
              <button onClick={() => setResponseType('rejected')} className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${responseType === 'rejected' ? 'border-red-500 bg-red-50 text-red-600' : 'border-[#E5E7EB] text-[#6B7280]'}`}>
                <X size={15} /> Rejected
              </button>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Response Date</label>
              <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Notes</label>
              <textarea rows={3} placeholder="Any notes about the response..." className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none resize-none" />
            </div>
            {responseType === 'accepted' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm font-semibold text-green-800">Offer accepted! Create a deal?</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setResponseModal(null)} className="flex-1 py-2.5 border border-[#E5E7EB] text-sm font-semibold text-[#374151] rounded-xl hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={() => setResponseModal(null)} className="flex-1 py-2.5 bg-[#1E3A5F] text-white text-sm font-bold rounded-xl hover:bg-[#16304F]">Save Response</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
