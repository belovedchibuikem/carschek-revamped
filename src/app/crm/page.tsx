'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, MessageSquare, Phone } from 'lucide-react';
import { CRM_CONTACTS, STATUS_COLORS } from '@/lib/mockData';
import { toast } from 'sonner';

const STAGES = ['Lead', 'Hot Lead', 'Qualified', 'Negotiation', 'Offer Sent', 'Closed Won', 'Cold'];

export default function CRMPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', type: 'Individual', stage: 'Lead' });

  const filtered = CRM_CONTACTS.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newContact.name || !newContact.email) { toast.error('Name and email are required'); return; }
    toast.success(`Contact "${newContact.name}" added to CRM`);
    setShowAddModal(false);
    setNewContact({ name: '', email: '', phone: '', type: 'Individual', stage: 'Lead' });
  };

  return (
    <AppLayout currentPath={pathname}>
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-fade-in">
            <h3 className="text-base font-heading font-semibold text-[#1F2937] mb-4">Add CRM Contact</h3>
            <div className="space-y-3">
              {[
                { label: 'Full Name *', key: 'name', type: 'text' },
                { label: 'Email *', key: 'email', type: 'email' },
                { label: 'Phone', key: 'phone', type: 'tel' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">{f.label}</label>
                  <input type={f.type} value={newContact[f.key as keyof typeof newContact]} onChange={e => setNewContact(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Type</label>
                  <select value={newContact.type} onChange={e => setNewContact(p => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30">
                    {['Individual', 'Dealer', 'Corporate'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Stage</label>
                  <select value={newContact.stage} onChange={e => setNewContact(p => ({ ...p, stage: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30">
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={handleAdd} className="flex-1 px-4 py-2.5 bg-[#1E3A5F] text-white rounded-lg text-sm font-semibold hover:bg-[#16304F]">Add Contact</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">CRM</h1>
            <p className="text-sm text-[#6B7280]">{CRM_CONTACTS.length} contacts in pipeline</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#F4F6F8] rounded-lg p-1">
              <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-[#1F2937]' : 'text-[#6B7280]'}`}>Table</button>
              <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-[#1F2937]' : 'text-[#6B7280]'}`}>Kanban</button>
            </div>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all min-h-[44px]">
              <Plus size={16} /> Add Contact
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: CRM_CONTACTS.length, color: '#1E3A5F' },
            { label: 'Hot Leads', value: CRM_CONTACTS.filter(c => c.stage === 'Hot Lead').length, color: '#C0392B' },
            { label: 'In Negotiation', value: CRM_CONTACTS.filter(c => c.stage === 'Negotiation').length, color: '#D35400' },
            { label: 'Closed Won', value: CRM_CONTACTS.filter(c => c.stage === 'Closed Won').length, color: '#1A7A4A' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4 text-center">
              <p className="text-2xl font-heading font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-[#6B7280]">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
        </div>

        {viewMode === 'table' ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  {['Contact', 'Type', 'Stage', 'Assigned To', 'Last Contact', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(contact => (
                  <tr key={contact.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold">{contact.avatar}</div>
                        <div>
                          <Link href={`/crm/${contact.id}`} className="font-medium text-[#1F2937] hover:text-[#2E75B6] transition-colors">{contact.name}</Link>
                          <p className="text-xs text-[#6B7280]">{contact.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-[#F4F6F8] text-[#6B7280] px-2 py-0.5 rounded-full">{contact.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[contact.stage] || 'bg-gray-100 text-gray-700'}`}>{contact.stage}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">{contact.assignedTo}</td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">{contact.lastContact}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/crm/${contact.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors">
                          <MessageSquare size={14} className="text-[#6B7280]" />
                        </Link>
                        <button onClick={() => toast.success(`Calling ${contact.name}…`)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors">
                          <Phone size={14} className="text-[#6B7280]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {STAGES.map(stage => {
                const stageContacts = CRM_CONTACTS.filter(c => c.stage === stage);
                return (
                  <div key={stage} className="w-56 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{stage}</span>
                      <span className="text-xs bg-[#F4F6F8] text-[#6B7280] px-2 py-0.5 rounded-full font-semibold">{stageContacts.length}</span>
                    </div>
                    <div className="space-y-3">
                      {stageContacts.map(c => (
                        <Link key={c.id} href={`/crm/${c.id}`}
                          className="block bg-white rounded-xl border border-[#E5E7EB] p-3 hover:shadow-md transition-all hover:border-[#2E75B6]/30">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-[10px] font-bold">{c.avatar}</div>
                            <p className="text-xs font-medium text-[#1F2937] truncate">{c.name}</p>
                          </div>
                          <p className="text-[10px] text-[#6B7280]">{c.type}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
