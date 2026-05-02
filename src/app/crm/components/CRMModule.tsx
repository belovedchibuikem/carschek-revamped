'use client';
import React, { useState } from 'react';
import { Plus, Search, Phone, Mail, MoreHorizontal, ChevronDown, Clock, Car, X } from 'lucide-react';

const STAGE_STYLES: Record<string, string> = {
  'New': 'bg-[#ff5722]/10 text-[#ff5722]',
  'Contacted': 'bg-blue-50 text-blue-700',
  'Interested': 'bg-teal-50 text-teal-700',
  'Offer Sent': 'bg-purple-50 text-purple-700',
  'Negotiating': 'bg-amber-50 text-amber-700',
  'Closed Won': 'bg-green-50 text-green-700',
  'Closed Lost': 'bg-red-50 text-red-600',
};

const TYPE_STYLES: Record<string, string> = {
  'Buyer': 'bg-blue-50 text-blue-700',
  'Seller': 'bg-teal-50 text-teal-700',
  'Dealer': 'bg-purple-50 text-purple-700',
  'Lead': 'bg-amber-50 text-amber-700',
};

const MOCK_CONTACTS = [
  { id: 1, name: 'Adaeze Mensah', type: 'Buyer', phone: '+2348012345678', email: 'adaeze@example.com', stage: 'Negotiating', lastContact: '2 days ago', carsLinked: 2, assignedTo: 'Promise Ndem', initials: 'AM' },
  { id: 2, name: 'Emeka Okafor', type: 'Seller', phone: '+2348023456789', email: 'emeka@example.com', stage: 'Interested', lastContact: '5 days ago', carsLinked: 1, assignedTo: 'Adaeze Mensah', initials: 'EO' },
  { id: 3, name: 'Fatima Bello', type: 'Dealer', phone: '+2348034567890', email: 'fatima@example.com', stage: 'Offer Sent', lastContact: '1 day ago', carsLinked: 5, assignedTo: 'Promise Ndem', initials: 'FB' },
  { id: 4, name: 'Chukwuemeka Obi', type: 'Lead', phone: '+2348045678901', email: 'chukwu@example.com', stage: 'New', lastContact: '1 week ago', carsLinked: 0, assignedTo: 'Chukwuemeka Obi', initials: 'CO' },
  { id: 5, name: 'Ngozi Eze', type: 'Buyer', phone: '+2348056789012', email: 'ngozi@example.com', stage: 'Closed Won', lastContact: '3 days ago', carsLinked: 3, assignedTo: 'Adaeze Mensah', initials: 'NE' },
  { id: 6, name: 'Tunde Adesanya', type: 'Seller', phone: '+2348067890123', email: 'tunde@example.com', stage: 'Contacted', lastContact: '4 days ago', carsLinked: 1, assignedTo: 'Promise Ndem', initials: 'TA' },
];

const KANBAN_STAGES = ['New Lead', 'Contacted', 'Interested', 'Offer Sent', 'Negotiating', 'Closed Won', 'Closed Lost'];

const KANBAN_STAGE_MAP: Record<string, string> = {
  'New': 'New Lead', 'Contacted': 'Contacted', 'Interested': 'Interested',
  'Offer Sent': 'Offer Sent', 'Negotiating': 'Negotiating',
  'Closed Won': 'Closed Won', 'Closed Lost': 'Closed Lost',
};

type View = 'list' | 'detail' | 'kanban';

export default function CRMModule() {
  const [view, setView] = useState<View>('list');
  const [selectedContact, setSelectedContact] = useState<typeof MOCK_CONTACTS[0] | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [contacts, setContacts] = useState(MOCK_CONTACTS);
  const [dragging, setDragging] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<{ text: string; time: string; author: string }[]>([]);
  const [showLogComm, setShowLogComm] = useState(false);
  const [commType, setCommType] = useState<'SMS' | 'Email' | 'Call' | 'Note'>('Call');
  const [commContent, setCommContent] = useState('');
  const [communications, setCommunications] = useState([
    { icon: '📱', type: 'SMS', content: 'Sent offer details for CK-41', time: '2 days ago', by: 'Promise Ndem' },
    { icon: '✉️', type: 'Email', content: 'Follow-up on inspection report', time: '4 days ago', by: 'Adaeze Mensah' },
    { icon: '📞', type: 'Call', content: 'Discussed pricing — interested at ₦5.1M', time: '1 week ago', by: 'Promise Ndem' },
  ]);

  const COMM_ICONS: Record<string, string> = { SMS: '📱', Email: '✉️', Call: '📞', Note: '📝' };

  const addCommunication = () => {
    if (commContent.trim()) {
      setCommunications(prev => [{ icon: COMM_ICONS[commType], type: commType, content: commContent, time: 'Just now', by: 'Promise Ndem' }, ...prev]);
      setCommContent('');
      setShowLogComm(false);
    }
  };

  const filtered = contacts.filter(c =>
    !search || [c.name, c.phone, c.email].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDrop = (stage: string) => {
    if (dragging !== null) {
      const contactStage = Object.entries(KANBAN_STAGE_MAP).find(([, v]) => v === stage)?.[0] || stage;
      setContacts(prev => prev.map(c => c.id === dragging ? { ...c, stage: contactStage } : c));
      setDragging(null);
      setDragOver(null);
    }
  };

  const addNote = () => {
    if (noteText.trim()) {
      setNotes(prev => [{ text: noteText, time: 'Just now', author: 'Promise Ndem' }, ...prev]);
      setNoteText('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#ff5722]">CRM — Contacts</h1>
          <span className="bg-[#ff5722]/10 text-[#ff5722] text-sm font-semibold px-2.5 py-0.5 rounded-full">{contacts.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['list', 'kanban'] as View[]).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${view === v ? 'bg-[#ff5722] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{v}</button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-[#ff5722] text-white rounded-lg text-sm font-semibold hover:bg-[#e64a19] transition-colors">
            <Plus size={14} /> Add Contact
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[['Total', contacts.length, 'text-[#ff5722]'], ['Leads', contacts.filter(c => c.type === 'Lead').length, 'text-amber-600'], ['Active', contacts.filter(c => !['Closed Won', 'Closed Lost'].includes(c.stage)).length, 'text-teal-600'], ['Closed Won', contacts.filter(c => c.stage === 'Closed Won').length, 'text-green-600'], ['Cold', contacts.filter(c => c.stage === 'Closed Lost').length, 'text-red-500']].map(([label, count, color]) => (
          <div key={label as string} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {view === 'list' && (
        <>
          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, email..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20" />
            </div>
            {['Type', 'Stage', 'Assigned To'].map(f => (
              <button key={f} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">{f} <ChevronDown size={13} /></button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Contact', 'Type', 'Phone', 'Email', 'Stage', 'Last Contact', 'Cars', 'Assigned To', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(contact => (
                    <tr key={contact.id} className="hover:bg-gray-50/80 transition-colors cursor-pointer" onClick={() => { setSelectedContact(contact); setView('detail'); }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#ff5722] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{contact.initials}</div>
                          <span className="font-semibold text-gray-800">{contact.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_STYLES[contact.type]}`}>{contact.type}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-600">{contact.phone}</span>
                          <a href={`tel:${contact.phone}`} onClick={e => e.stopPropagation()} className="text-gray-300 hover:text-green-600 transition-colors"><Phone size={12} /></a>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-600 truncate max-w-[140px]">{contact.email}</span>
                          <a href={`mailto:${contact.email}`} onClick={e => e.stopPropagation()} className="text-gray-300 hover:text-blue-600 transition-colors"><Mail size={12} /></a>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STAGE_STYLES[contact.stage]}`}>{contact.stage}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{contact.lastContact}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{contact.carsLinked}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{contact.assignedTo}</td>
                      <td className="px-4 py-3"><button onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"><MoreHorizontal size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {KANBAN_STAGES.map(stage => {
              const stageContacts = contacts.filter(c => KANBAN_STAGE_MAP[c.stage] === stage);
              return (
                <div
                  key={stage}
                  className={`w-60 flex-shrink-0 rounded-xl border-2 transition-all ${dragOver === stage ? 'border-[#ff5722]/40 bg-[#ff5722]/5' : 'border-gray-100 bg-gray-50/50'}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(stage); }}
                  onDrop={() => handleDrop(stage)}
                  onDragLeave={() => setDragOver(null)}
                >
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700">{stage}</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-semibold">{stageContacts.length}</span>
                    </div>
                  </div>
                  <div className="p-2 space-y-2 min-h-[120px]">
                    {stageContacts.map(contact => (
                      <div
                        key={contact.id}
                        draggable
                        onDragStart={() => setDragging(contact.id)}
                        onClick={() => { setSelectedContact(contact); setView('detail'); }}
                        className="bg-white rounded-xl border border-gray-100 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-[#ff5722] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">{contact.initials}</div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{contact.name}</p>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${TYPE_STYLES[contact.type]}`}>{contact.type}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={9} /> {contact.lastContact}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <a href={`tel:${contact.phone}`} onClick={e => e.stopPropagation()} className="text-gray-300 hover:text-green-600 transition-colors"><Phone size={11} /></a>
                          <a href={`mailto:${contact.email}`} onClick={e => e.stopPropagation()} className="text-gray-300 hover:text-blue-600 transition-colors"><Mail size={11} /></a>
                          {contact.carsLinked > 0 && <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Car size={9} /> {contact.carsLinked}</span>}
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

      {/* Contact Detail */}
      {view === 'detail' && selectedContact && (
        <div className="space-y-4">
          <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-sm text-[#ff5722] hover:underline">← Back to Contacts</button>

          {/* Header Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-[#ff5722] text-white flex items-center justify-center text-xl font-bold flex-shrink-0">{selectedContact.initials}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-[#ff5722]">{selectedContact.name}</h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_STYLES[selectedContact.type]}`}>{selectedContact.type}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <a href={`tel:${selectedContact.phone}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition-colors"><Phone size={14} /> {selectedContact.phone}</a>
                  <a href={`mailto:${selectedContact.email}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"><Mail size={14} /> {selectedContact.email}</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Stage</label>
                  <select defaultValue={selectedContact.stage} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                    {Object.keys(STAGE_STYLES).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Assigned To</label>
                  <select defaultValue={selectedContact.assignedTo} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                    {['Promise Ndem', 'Adaeze Mensah', 'Chukwuemeka Obi'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex border-b border-gray-100 px-4 overflow-x-auto">
              {['overview', 'cars', 'offers', 'communications', 'notes'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab ? 'text-[#ff5722] border-b-2 border-[#ff5722]' : 'text-gray-500 hover:text-gray-700'}`}>{tab}</button>
              ))}
            </div>
            <div className="p-5">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[['Total Deals', '3'], ['Cars Bought', '2'], ['Cars Sold', '1'], ['Total Value', '₦15.2M']].map(([l, v]) => (
                      <div key={l} className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-[#ff5722]">{v}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border border-gray-100 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Set Follow-up Reminder</h4>
                    <div className="flex gap-3">
                      <input type="date" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                      <input type="text" placeholder="Note..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                      <button className="px-4 py-2 bg-[#ff5722] text-white rounded-lg text-sm font-semibold hover:bg-[#e64a19] transition-colors">Set</button>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'cars' && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <a href="/cars" className="flex items-center gap-1.5 px-3 py-2 bg-[#ff5722] text-white rounded-lg text-sm font-semibold hover:bg-[#e64a19] transition-colors"><Plus size={14} /> Link a Car</a>
                  </div>
                  {[{ ckId: 'CK-41', name: 'Toyota Camry 2011', role: 'Buyer', price: '₦5,100,000', date: '2025-01-15', status: 'Sold' }].map(car => (
                    <div key={car.ckId} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <a href={`/cars/${car.ckId}`} className="font-mono text-xs font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md hover:bg-teal-100 transition-colors">{car.ckId}</a>
                        <div>
                          <a href={`/cars/${car.ckId}`} className="text-sm font-semibold text-gray-800 hover:text-[#ff5722] hover:underline transition-colors">{car.name}</a>
                          <p className="text-xs text-gray-400">{car.role} • {car.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-700">{car.price}</p>
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{car.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'communications' && (
                <div className="space-y-3">
                  <button onClick={() => setShowLogComm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#ff5722] text-white rounded-lg text-sm font-semibold hover:bg-[#e64a19] transition-colors"><Plus size={14} /> Log Communication</button>
                  {communications.map((comm, i) => (
                    <div key={i} className="flex gap-3 p-3 border border-gray-100 rounded-xl">
                      <span className="text-lg">{comm.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-700">{comm.type}</span>
                          <span className="text-[10px] text-gray-400">{comm.time} • {comm.by}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{comm.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'offers' && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <a href="/offers?view=create" className="flex items-center gap-1.5 px-3 py-2 bg-[#ff5722] text-white rounded-lg text-sm font-semibold hover:bg-[#e64a19] transition-colors"><Plus size={14} /> Create Offer</a>
                  </div>
                  <a href="/offers" className="block p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">OFF-001 — Toyota Camry 2011</p>
                        <p className="text-xs text-gray-400">₦5,100,000 • Valid until 2025-02-15</p>
                      </div>
                      <span className="text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full">Accepted</span>
                    </div>
                  </a>
                </div>
              )}
              {activeTab === 'notes' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note..." rows={2} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 resize-none" />
                    <button onClick={addNote} className="px-4 py-2 bg-[#ff5722] text-white rounded-lg text-sm font-semibold hover:bg-[#e64a19] transition-colors self-start">Add Note</button>
                  </div>
                  {notes.map((note, i) => (
                    <div key={i} className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                      <p className="text-sm text-gray-700">{note.text}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{note.time} • {note.author}</p>
                    </div>
                  ))}
                  {notes.length === 0 && <p className="text-center text-gray-400 text-sm py-6">No notes yet. Add the first note above.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Log Communication Modal */}
      {showLogComm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#ff5722]">Log Communication</h3>
              <button onClick={() => setShowLogComm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"><X size={16} /></button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Type</label>
              <div className="flex gap-2">
                {(['SMS', 'Email', 'Call', 'Note'] as const).map(t => (
                  <button key={t} onClick={() => setCommType(t)} className={`flex-1 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${commType === t ? 'border-[#ff5722] bg-[#ff5722]/5 text-[#ff5722]' : 'border-gray-200 text-gray-500'}`}>
                    {COMM_ICONS[t]} {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Content</label>
              <textarea value={commContent} onChange={e => setCommContent(e.target.value)} rows={3} placeholder="Describe the communication..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
              <input type="datetime-local" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowLogComm(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={addCommunication} className="flex-1 py-2 bg-[#ff5722] text-white rounded-xl text-sm font-bold hover:bg-[#e64a19] transition-colors">Log</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
