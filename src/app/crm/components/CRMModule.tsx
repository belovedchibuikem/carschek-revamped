'use client';
import React, { useState } from 'react';
import { Search, Plus, Phone, Mail, MoreHorizontal, Car } from 'lucide-react';
import { CrmContact, CrmStage, CrmContactType } from '@/types/domain';

const MOCK_CONTACTS: CrmContact[] = [
  { id: 'c1', name: 'Adaeze Mensah', type: 'buyer', phone: '+2348012345678', email: 'adaeze@email.com', stage: 'negotiating', lastContact: '2025-04-10', carsLinked: 2, assignedTo: 'Promise Ndem', avatar: 'AM', followUpDate: '2025-04-20', totalDeals: 3, carsBought: 2, carsSold: 0, transactionValue: 10200000, notes: [], communications: [], cars: [], offers: [] },
  { id: 'c2', name: 'Emeka Obi', type: 'seller', phone: '+2348098765432', email: 'emeka@email.com', stage: 'offer_sent', lastContact: '2025-04-08', carsLinked: 1, assignedTo: 'Adaeze Mensah', avatar: 'EO', totalDeals: 1, carsBought: 0, carsSold: 1, transactionValue: 5000000, notes: [], communications: [], cars: [], offers: [] },
  { id: 'c3', name: 'Chidi Okafor', type: 'dealer', phone: '+2348055555555', email: 'chidi@dealer.com', stage: 'interested', lastContact: '2025-04-05', carsLinked: 5, assignedTo: 'Promise Ndem', avatar: 'CO', totalDeals: 8, carsBought: 5, carsSold: 3, transactionValue: 42000000, notes: [], communications: [], cars: [], offers: [] },
  { id: 'c4', name: 'Ngozi Eze', type: 'lead', phone: '+2348011111111', email: 'ngozi@email.com', stage: 'new', lastContact: '2025-04-12', carsLinked: 0, assignedTo: 'Adaeze Mensah', avatar: 'NE', totalDeals: 0, carsBought: 0, carsSold: 0, transactionValue: 0, notes: [], communications: [], cars: [], offers: [] },
  { id: 'c5', name: 'Tunde Bakare', type: 'buyer', phone: '+2348022222222', email: 'tunde@email.com', stage: 'closed_won', lastContact: '2025-03-28', carsLinked: 3, assignedTo: 'Promise Ndem', avatar: 'TB', totalDeals: 5, carsBought: 3, carsSold: 0, transactionValue: 18500000, notes: [], communications: [], cars: [], offers: [] },
  { id: 'c6', name: 'Fatima Aliyu', type: 'seller', phone: '+2348033333333', email: 'fatima@email.com', stage: 'contacted', lastContact: '2025-04-11', carsLinked: 1, assignedTo: 'Chidi Okafor', avatar: 'FA', totalDeals: 1, carsBought: 0, carsSold: 1, transactionValue: 8500000, notes: [], communications: [], cars: [], offers: [] },
];

const STAGE_CONFIG: Record<CrmStage, { label: string; cls: string }> = {
  new: { label: 'New', cls: 'bg-[#1E3A5F] text-white' },
  contacted: { label: 'Contacted', cls: 'bg-blue-100 text-blue-700 border border-blue-200' },
  interested: { label: 'Interested', cls: 'bg-teal-100 text-teal-700 border border-teal-200' },
  offer_sent: { label: 'Offer Sent', cls: 'bg-purple-100 text-purple-700 border border-purple-200' },
  negotiating: { label: 'Negotiating', cls: 'bg-amber-100 text-amber-700 border border-amber-200' },
  closed_won: { label: 'Closed Won', cls: 'bg-green-100 text-green-700 border border-green-200' },
  closed_lost: { label: 'Closed Lost', cls: 'bg-red-100 text-red-500 border border-red-200' },
};

const TYPE_CONFIG: Record<CrmContactType, { label: string; cls: string }> = {
  buyer: { label: 'Buyer', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  seller: { label: 'Seller', cls: 'bg-teal-50 text-teal-700 border border-teal-200' },
  dealer: { label: 'Dealer', cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
  lead: { label: 'Lead', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
};

const KANBAN_STAGES: CrmStage[] = ['new','contacted','interested','offer_sent','negotiating','closed_won','closed_lost'];

type View = 'list' | 'detail' | 'kanban';

function fmt(n: number) { return '₦' + n.toLocaleString('en-NG'); }

export default function CRMModule() {
  const [view, setView] = useState<View>('list');
  const [contacts] = useState<CrmContact[]>(MOCK_CONTACTS);
  const [selected, setSelected] = useState<CrmContact | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [detailTab, setDetailTab] = useState('Overview');

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
    const matchType = !typeFilter || c.type === typeFilter;
    const matchStage = !stageFilter || c.stage === stageFilter;
    return matchSearch && matchType && matchStage;
  });

  const openDetail = (c: CrmContact) => { setSelected(c); setView('detail'); };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-heading font-bold text-[#1F2937]">CRM — Contacts</h1>
          <span className="bg-[#1E3A5F] text-white text-xs font-bold px-2.5 py-1 rounded-full">{contacts.length} contacts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[#E5E7EB] overflow-hidden">
            {(['list','kanban'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-2 text-xs font-semibold capitalize transition-all ${view === v ? 'bg-[#1E3A5F] text-white' : 'bg-white text-[#6B7280] hover:bg-[#F4F6F8]'}`}>{v === 'list' ? 'List' : 'Pipeline'}</button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">
            <Plus size={15} /> Add Contact
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: contacts.length, cls: 'text-[#1E3A5F]' },
          { label: 'Leads', value: contacts.filter(c => c.type === 'lead').length, cls: 'text-amber-600' },
          { label: 'Active', value: contacts.filter(c => !['closed_won','closed_lost'].includes(c.stage)).length, cls: 'text-teal-600' },
          { label: 'Closed Won', value: contacts.filter(c => c.stage === 'closed_won').length, cls: 'text-green-600' },
          { label: 'Cold', value: contacts.filter(c => c.stage === 'closed_lost').length, cls: 'text-[#9CA3AF]' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] p-3 text-center">
            <p className="text-xs text-[#9CA3AF] font-medium">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, email..." className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none bg-white text-[#374151]">
              <option value="">All Types</option>
              {(['buyer','seller','dealer','lead'] as CrmContactType[]).map(t => <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>)}
            </select>
            <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none bg-white text-[#374151]">
              <option value="">All Stages</option>
              {(Object.keys(STAGE_CONFIG) as CrmStage[]).map(s => <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  {['Contact','Type','Phone','Email','Stage','Last Contact','Cars','Assigned To','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filtered.map(contact => (
                  <tr key={contact.id} className="hover:bg-[#F8FAFC] transition-all cursor-pointer" onClick={() => openDetail(contact)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{contact.avatar}</div>
                        <span className="font-semibold text-[#1F2937]">{contact.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TYPE_CONFIG[contact.type].cls}`}>{TYPE_CONFIG[contact.type].label}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#374151]">{contact.phone}</span>
                        <a href={`tel:${contact.phone}`} onClick={e => e.stopPropagation()} className="text-[#9CA3AF] hover:text-green-600"><Phone size={12} /></a>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#374151] truncate max-w-[140px]">{contact.email}</span>
                        <a href={`mailto:${contact.email}`} onClick={e => e.stopPropagation()} className="text-[#9CA3AF] hover:text-[#1E3A5F]"><Mail size={12} /></a>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STAGE_CONFIG[contact.stage].cls}`}>{STAGE_CONFIG[contact.stage].label}</span></td>
                    <td className="px-4 py-3 text-xs text-[#9CA3AF]">{contact.lastContact}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#374151]">{contact.carsLinked}</td>
                    <td className="px-4 py-3 text-xs text-[#374151]">{contact.assignedTo}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <button className="p-1.5 rounded-lg hover:bg-[#F4F6F8] text-[#6B7280]"><MoreHorizontal size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* KANBAN VIEW */}
      {view === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {KANBAN_STAGES.map(stage => {
              const stageContacts = contacts.filter(c => c.stage === stage);
              return (
                <div key={stage} className="w-64 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STAGE_CONFIG[stage].cls}`}>{STAGE_CONFIG[stage].label}</span>
                    <span className="text-xs text-[#9CA3AF] font-semibold">{stageContacts.length}</span>
                  </div>
                  <div className="space-y-2">
                    {stageContacts.map(contact => (
                      <div key={contact.id} onClick={() => openDetail(contact)} className="bg-white rounded-xl border border-[#E5E7EB] p-3.5 cursor-pointer hover:border-[#1E3A5F]/30 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">{contact.avatar}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1F2937] truncate">{contact.name}</p>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${TYPE_CONFIG[contact.type].cls}`}>{TYPE_CONFIG[contact.type].label}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-[#9CA3AF] mb-2">Last activity: {contact.lastContact}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <a href={`tel:${contact.phone}`} onClick={e => e.stopPropagation()} className="p-1 rounded bg-[#F4F6F8] text-[#6B7280] hover:text-green-600"><Phone size={11} /></a>
                            <a href={`mailto:${contact.email}`} onClick={e => e.stopPropagation()} className="p-1 rounded bg-[#F4F6F8] text-[#6B7280] hover:text-[#1E3A5F]"><Mail size={11} /></a>
                          </div>
                          {contact.carsLinked > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-[#9CA3AF]"><Car size={10} />{contact.carsLinked}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAIL VIEW */}
      {view === 'detail' && selected && (
        <div className="space-y-5">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm text-[#2E75B6] font-semibold hover:underline">
            ← Back to Contacts
          </button>

          {/* Header Card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-16 h-16 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">{selected.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-heading font-bold text-[#1F2937]">{selected.name}</h2>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${TYPE_CONFIG[selected.type].cls}`}>{TYPE_CONFIG[selected.type].label}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-1.5 text-sm text-[#374151] hover:text-green-600"><Phone size={14} />{selected.phone}</a>
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 text-sm text-[#374151] hover:text-[#1E3A5F]"><Mail size={14} />{selected.email}</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-xs text-[#9CA3AF] mb-1">Stage</label>
                  <select defaultValue={selected.stage} className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-xs font-semibold bg-white focus:outline-none">
                    {(Object.keys(STAGE_CONFIG) as CrmStage[]).map(s => <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#9CA3AF] mb-1">Assigned To</label>
                  <select defaultValue={selected.assignedTo} className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-xs bg-white focus:outline-none">
                    <option>Promise Ndem</option><option>Adaeze Mensah</option><option>Chidi Okafor</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Tabs */}
          <div className="flex border-b border-[#E5E7EB] overflow-x-auto">
            {['Overview','Cars','Offers','Communications','Notes'].map(tab => (
              <button key={tab} onClick={() => setDetailTab(tab)} className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${detailTab === tab ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}>{tab}</button>
            ))}
          </div>

          {detailTab === 'Overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Deals', value: selected.totalDeals, cls: 'text-[#1E3A5F]' },
                  { label: 'Cars Bought', value: selected.carsBought, cls: 'text-blue-600' },
                  { label: 'Cars Sold', value: selected.carsSold, cls: 'text-teal-600' },
                  { label: 'Transaction Value', value: fmt(selected.transactionValue), cls: 'text-green-600' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                    <p className="text-xs text-[#9CA3AF]">{s.label}</p>
                    <p className={`text-lg font-bold mt-1 ${s.cls}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <h3 className="font-heading font-bold text-[#1F2937] mb-3">Set Follow-up Reminder</h3>
                <input type="date" defaultValue={selected.followUpDate} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none mb-3" />
                <textarea placeholder="Note for follow-up..." rows={3} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none resize-none" />
                <button className="mt-3 w-full py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-xl hover:bg-[#16304F] transition-all">Set Reminder</button>
              </div>
            </div>
          )}

          {detailTab === 'Communications' && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-[#1F2937]">Communication Log</h3>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg hover:bg-[#16304F]"><Plus size={12} /> Log Communication</button>
              </div>
              <div className="space-y-3">
                {[
                  { channel: 'email', icon: '✉️', content: 'Sent offer for CK-41 Toyota Camry 2011', at: '2025-04-10 14:32', by: 'Promise Ndem' },
                  { channel: 'call', icon: '📞', content: 'Discussed pricing — interested in negotiation', at: '2025-04-08 11:15', by: 'Promise Ndem' },
                  { channel: 'sms', icon: '📱', content: 'Follow-up SMS sent regarding inspection report', at: '2025-04-05 09:00', by: 'System' },
                  { channel: 'note', icon: '📝', content: 'Client prefers automatic transmission vehicles only', at: '2025-04-01 16:45', by: 'Adaeze Mensah' },
                ].map((comm, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 bg-[#F8FAFC] rounded-xl">
                    <span className="text-lg">{comm.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm text-[#374151]">{comm.content}</p>
                      <p className="text-[10px] text-[#9CA3AF] mt-1">{comm.at} • {comm.by}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detailTab === 'Notes' && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-[#1F2937]">Notes</h3>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg hover:bg-[#16304F]"><Plus size={12} /> Add Note</button>
              </div>
              <textarea placeholder="Write a note about this contact..." rows={3} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none resize-none" />
              <div className="space-y-3">
                {[
                  { text: 'Very serious buyer, has budget ready. Prefers SUVs and sedans from 2015 onwards.', author: 'Promise Ndem', at: '2025-04-10' },
                  { text: 'Called twice this week. Interested in CK-41 but wants a price reduction.', author: 'Adaeze Mensah', at: '2025-04-08' },
                ].map((note, i) => (
                  <div key={i} className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                    <p className="text-sm text-[#374151]">{note.text}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-2">{note.at} • {note.author}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detailTab === 'Cars' && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-[#1F2937]">Linked Cars</h3>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg hover:bg-[#16304F]"><Plus size={12} /> Link a Car</button>
              </div>
              {selected.carsLinked === 0 ? (
                <p className="text-sm text-[#9CA3AF] text-center py-8">No cars linked to this contact yet.</p>
              ) : (
                <div className="space-y-2">
                  {[{ ckId: 'CK-41', title: 'Toyota Camry 2011', role: 'Buyer', price: 5100000, date: '2025-01-15', status: 'sold' }].map((car, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">{car.ckId}</span>
                        <div>
                          <p className="text-sm font-semibold text-[#1F2937]">{car.title}</p>
                          <p className="text-[10px] text-[#9CA3AF]">{car.role} • {car.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#1F2937]">{fmt(car.price)}</p>
                        <span className="text-[10px] font-semibold text-green-600 capitalize">{car.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {detailTab === 'Offers' && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
              <h3 className="font-heading font-bold text-[#1F2937]">Offers</h3>
              <p className="text-sm text-[#9CA3AF] text-center py-8">No offers linked to this contact yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
