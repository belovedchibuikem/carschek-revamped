'use client';
import React, { useState } from 'react';
import { Plus, MoreHorizontal, X, Check, AlertTriangle, Upload, FileText } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const OFFER_STATUS_STYLES: Record<string, string> = {
  'Draft': 'bg-gray-100 text-gray-500',
  'Sent': 'bg-blue-50 text-blue-700',
  'Accepted': 'bg-green-50 text-green-700',
  'Rejected': 'bg-red-50 text-red-600',
  'Expired': 'bg-gray-50 text-gray-400',
};

const MOCK_OFFERS = [
  { id: 'OFF-001', car: 'CK-41 — Toyota Camry 2011', contact: 'Adaeze Mensah', amount: 5100000, validUntil: '2025-02-15', status: 'Accepted', createdBy: 'Promise Ndem' },
  { id: 'OFF-002', car: 'CK-40 — Honda Accord 2015', contact: 'Emeka Okafor', amount: 6200000, validUntil: '2025-02-20', status: 'Sent', createdBy: 'Adaeze Mensah' },
  { id: 'OFF-003', car: 'CK-39 — Mercedes-Benz C300 2018', contact: 'Fatima Bello', amount: 18500000, validUntil: '2025-01-30', status: 'Expired', createdBy: 'Promise Ndem' },
  { id: 'OFF-004', car: 'CK-38 — Toyota Corolla 2019', contact: 'Chukwuemeka Obi', amount: 4500000, validUntil: '2025-03-01', status: 'Draft', createdBy: 'Promise Ndem' },
  { id: 'OFF-005', car: 'CK-36 — Lexus RX350 2020', contact: 'Ngozi Eze', amount: 27000000, validUntil: '2025-02-28', status: 'Rejected', createdBy: 'Adaeze Mensah' },
];

const DOCUMENTS_LIST = [
  { name: 'Custom Clearance', required: true, status: 'Approved' },
  { name: 'Insurance Clearance', required: true, status: 'Approved' },
  { name: 'Means of Identification', required: true, status: 'Approved' },
  { name: 'Number Plate', required: true, status: 'Approved' },
  { name: 'Road Worthiness', required: true, status: 'Approved' },
  { name: 'Proof of Ownership', required: true, status: 'Approved' },
  { name: 'Plate Number Allocation', required: false, status: 'Missing' },
  { name: 'Purchase Receipt', required: false, status: 'Missing' },
];

type View = 'list' | 'create' | 'documents';

export default function OffersModule() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>(() => {
    const v = searchParams?.get('view');
    if (v === 'create') return 'create';
    if (v === 'documents') return 'documents';
    return 'list';
  });
  const [offerPrice, setOfferPrice] = useState('');
  const [validDays, setValidDays] = useState('14');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSMS, setSendSMS] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState<string | null>(null);
  const [responseType, setResponseType] = useState<'Accepted' | 'Rejected'>('Accepted');
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [docComments, setDocComments] = useState<Record<string, string>>({});
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [docStatuses, setDocStatuses] = useState<Record<string, string>>(
    Object.fromEntries(DOCUMENTS_LIST.map(d => [d.name, d.status]))
  );

  const expiryDate = validDays ? new Date(Date.now() + parseInt(validDays) * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const approvedCount = Object.values(docStatuses).filter(s => s === 'Approved').length;
  const missingRequired = DOCUMENTS_LIST.filter(d => d.required && docStatuses[d.name] !== 'Approved');

  const toggleDoc = (name: string) => {
    setUploadedDocs(prev => ({ ...prev, [name]: !prev[name] }));
    if (!uploadedDocs[name]) setDocStatuses(prev => ({ ...prev, [name]: 'Under Review' }));
    else setDocStatuses(prev => ({ ...prev, [name]: 'Missing' }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#1E3A5F]">
            {view === 'documents' ? 'Document Compliance Panel' : 'Offers'}
          </h1>
          {view === 'list' && <span className="bg-[#1E3A5F]/10 text-[#1E3A5F] text-sm font-semibold px-2.5 py-0.5 rounded-full">{MOCK_OFFERS.length}</span>}
        </div>
        <div className="flex items-center gap-2">
          {view !== 'list' && (
            <button onClick={() => setView('list')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">← Back</button>
          )}
          {view === 'list' && (
            <>
              <button onClick={() => setView('documents')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5"><FileText size={14} /> Document Review</button>
              <button onClick={() => setView('create')} className="flex items-center gap-1.5 px-3 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-semibold hover:bg-[#162d4a] transition-colors"><Plus size={14} /> Create Offer</button>
            </>
          )}
        </div>
      </div>

      {view === 'list' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[['Draft', 'bg-gray-100 text-gray-600'], ['Sent', 'bg-blue-50 text-blue-700'], ['Accepted', 'bg-green-50 text-green-700'], ['Rejected', 'bg-red-50 text-red-600'], ['Expired', 'bg-gray-50 text-gray-400']].map(([status, style]) => (
              <div key={status} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
                <p className={`text-2xl font-bold`}>{MOCK_OFFERS.filter(o => o.status === status).length}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style}`}>{status}</span>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Offer #', 'Car', 'Offered To', 'Amount', 'Valid Until', 'Status', 'Created By', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MOCK_OFFERS.map(offer => (
                    <tr key={offer.id} className="hover:bg-gray-50/80 transition-colors cursor-pointer" onClick={() => setView('create')}>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-[#1E3A5F]">{offer.id}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={e => { e.stopPropagation(); router.push(`/cars/${offer.car.split(' — ')[0]}`); }}
                          className="text-sm text-[#1E3A5F] hover:underline font-medium"
                        >
                          {offer.car}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={e => { e.stopPropagation(); router.push('/crm'); }}
                          className="text-sm text-gray-700 hover:text-[#1E3A5F] hover:underline transition-colors"
                        >
                          {offer.contact}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">₦{offer.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{offer.validUntil}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${OFFER_STATUS_STYLES[offer.status]}`}>{offer.status}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{offer.createdBy}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          {offer.status === 'Sent' && (
                            <button onClick={() => setShowResponseModal(offer.id)} className="text-xs px-2 py-1 bg-[#1E3A5F]/10 text-[#1E3A5F] rounded-md hover:bg-[#1E3A5F]/20 transition-colors font-medium">Record Response</button>
                          )}
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"><MoreHorizontal size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left — Form */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-[#1E3A5F]">Offer Details</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Link to Car *</label>
              <div className="relative">
                <input type="text" placeholder="Type CK- or car name..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20" />
              </div>
              <div className="mt-2 p-2 border border-gray-100 rounded-lg flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md">CK-41</span>
                <span className="text-sm text-gray-700">Toyota Camry 2011</span>
                <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full font-semibold ml-auto">73</span>
                <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">At Buyer</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Offer To (Contact) *</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20">
                <option value="">Search contact...</option>
                {['Adaeze Mensah', 'Emeka Okafor', 'Fatima Bello', 'Chukwuemeka Obi'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Offer Price (₦) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">₦</span>
                <input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} placeholder="0" className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Market range: ₦4,200,000 – ₦4,800,000</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Validity Period *</label>
              <div className="flex items-center gap-2">
                <input type="number" value={validDays} onChange={e => setValidDays(e.target.value)} className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20" />
                <span className="text-sm text-gray-500">days</span>
              </div>
              {expiryDate && <p className="text-xs text-gray-400 mt-1">Expires: {expiryDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Notes / Terms</label>
              <textarea rows={3} placeholder="Add any special terms or notes..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 resize-none" />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} className="rounded" />
                Send via Email (adaeze@example.com)
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={sendSMS} onChange={e => setSendSMS(e.target.checked)} className="rounded" />
                Send via SMS (+2348012345678)
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Save as Draft</button>
              <button className="flex-1 py-2.5 bg-[#1E3A5F] text-white rounded-xl text-sm font-bold hover:bg-[#162d4a] transition-colors">Send Offer</button>
            </div>
          </div>

          {/* Right — Preview */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-[#1E3A5F] mb-4">Offer Preview</h2>
            <div className="border border-gray-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <p className="font-bold text-[#1E3A5F] text-lg">CARSCHEK</p>
                  <p className="text-xs text-gray-400">Vehicle Purchase Offer</p>
                </div>
                <p className="text-xs text-gray-400">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">To</p>
                <p className="text-sm font-semibold text-gray-800">Adaeze Mensah</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Vehicle</p>
                <p className="text-sm font-semibold text-gray-800">Toyota Camry 2011 (CK-41)</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Offer Price</p>
                <p className="text-2xl font-bold text-[#1E3A5F]">{offerPrice ? `₦${parseInt(offerPrice).toLocaleString()}` : '₦—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Valid Until</p>
                <p className="text-sm text-gray-700">{expiryDate || '—'}</p>
              </div>
              <div className="border-t border-gray-100 pt-3 mt-3">
                <p className="text-xs text-gray-400">Authorised by: Promise Ndem</p>
                <div className="mt-3 border-t border-gray-300 w-32 pt-1">
                  <p className="text-[10px] text-gray-400">Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'documents' && (
        <div className="space-y-4">
          {/* Compliance Gate Banner */}
          {missingRequired.length > 0 && (
            <div className="sticky top-0 z-10 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-700">⚠ This car cannot be pushed to Marketplace or Auction until all required documents are approved.</p>
                <p className="text-xs text-amber-600 mt-0.5">Missing: {missingRequired.map(d => d.name).join(', ')}</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">Toyota Camry 2011 — CK-41</p>
                <p className="text-lg font-bold text-[#1E3A5F]">{approvedCount} / {DOCUMENTS_LIST.length} Documents Complete</p>
              </div>
              <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${missingRequired.length === 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                {missingRequired.length === 0 ? '✓ Ready for Listing' : `⚠ Not Ready — ${missingRequired.length} required missing`}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${(approvedCount / DOCUMENTS_LIST.length) * 100}%` }} />
            </div>
          </div>

          {/* Document Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOCUMENTS_LIST.map(doc => {
              const status = docStatuses[doc.name];
              const uploaded = uploadedDocs[doc.name];
              return (
                <div key={doc.name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                  {/* Top */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800">{doc.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.required ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{doc.required ? 'Required' : 'Optional'}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        status === 'Approved' ? 'bg-green-50 text-green-700' :
                        status === 'Under Review' ? 'bg-amber-50 text-amber-700' :
                        status === 'Rejected'? 'bg-red-100 text-red-700' : 'bg-red-50 text-red-600'
                      }`}>{status}</span>
                    </div>
                  </div>

                  {/* Middle */}
                  {uploaded ? (
                    <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-green-600" />
                        <div>
                          <p className="text-xs font-medium text-green-700">{doc.name.replace(/ /g, '_')}.pdf</p>
                          <p className="text-[10px] text-green-500">245 KB • Uploaded just now</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-teal-600 hover:underline">View</button>
                        <button onClick={() => toggleDoc(doc.name)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={12} /></button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => toggleDoc(doc.name)} className="w-full border-2 border-dashed border-gray-200 rounded-lg py-4 text-xs text-gray-400 hover:border-[#1E3A5F]/30 hover:text-[#1E3A5F] transition-all flex flex-col items-center gap-1.5">
                      <Upload size={16} />
                      <span>Drag & drop or <span className="text-[#1E3A5F] font-medium">Select File(s)</span></span>
                    </button>
                  )}

                  {/* Comment */}
                  <textarea
                    value={docComments[doc.name] || ''}
                    onChange={e => setDocComments(prev => ({ ...prev, [doc.name]: e.target.value }))}
                    placeholder="Add note about this document..."
                    rows={2}
                    className="w-full border border-gray-100 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]/20 resize-none bg-gray-50"
                  />

                  {/* Rejection reason */}
                  {status === 'Rejected' && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
                      <p className="text-xs text-amber-700 font-semibold">Rejection reason:</p>
                      <p className="text-xs text-amber-600 mt-0.5">{rejectionReasons[doc.name] || 'Document is unclear or incomplete.'}</p>
                    </div>
                  )}

                  {/* Admin Review Controls */}
                  {status === 'Under Review' && (
                    <div className="flex gap-2">
                      <button onClick={() => setDocStatuses(prev => ({ ...prev, [doc.name]: 'Approved' }))} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors">
                        <Check size={12} /> Approve ✓
                      </button>
                      <button onClick={() => { setDocStatuses(prev => ({ ...prev, [doc.name]: 'Rejected' })); setRejectionReasons(prev => ({ ...prev, [doc.name]: 'Document is unclear or incomplete.' })); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors">
                        <X size={12} /> Reject ✗
                      </button>
                    </div>
                  )}
                  {status === 'Rejected' && (
                    <button className="w-full py-2 border border-amber-200 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-50 transition-colors">Request Re-upload (SMS/Email)</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Record Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#1E3A5F]">Record Response</h3>
              <button onClick={() => setShowResponseModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"><X size={16} /></button>
            </div>
            <div className="flex gap-3">
              {(['Accepted', 'Rejected'] as const).map(r => (
                <button key={r} onClick={() => setResponseType(r)} className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${responseType === r ? (r === 'Accepted' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-400 bg-red-50 text-red-600') : 'border-gray-200 text-gray-500'}`}>{r}</button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Response Date</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
              <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
            </div>
            {responseType === 'Accepted' && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-xs font-semibold text-green-700">Create a Deal for this offer?</p>
                <button className="mt-2 w-full py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors">Yes — Create Deal</button>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowResponseModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => setShowResponseModal(null)} className="flex-1 py-2 bg-[#1E3A5F] text-white rounded-xl text-sm font-bold hover:bg-[#162d4a] transition-colors">Save Response</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
