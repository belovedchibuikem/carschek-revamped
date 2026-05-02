'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, MessageSquare, Car } from 'lucide-react';
import { CRM_CONTACTS, OFFERS } from '@/lib/mockData';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

const TABS = ['Overview', 'Cars', 'Offers', 'Communications', 'Notes'];

export default function CRMContactPage() {
  const pathname = usePathname();
  const params = useParams();
  const contactId = params.id as string;
  const contact = CRM_CONTACTS.find(c => c.id === contactId) || CRM_CONTACTS[0];
  const [activeTab, setActiveTab] = useState(0);
  const [notes, setNotes] = useState<string[]>(['Interested in Toyota Camry 2015. Budget around ₦5M.']);
  const [newNote, setNewNote] = useState('');

  const contactOffers = OFFERS.filter(o => o.contactId === contact.id);

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/crm" className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8] transition-colors">
            <ArrowLeft size={16} className="text-[#6B7280]" />
          </Link>
          <h1 className="text-xl font-heading font-bold text-[#1F2937]">CRM Contact</h1>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex flex-wrap items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ff5722] flex items-center justify-center text-white font-bold text-lg">{contact.avatar}</div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-lg font-heading font-bold text-[#1F2937]">{contact.name}</h2>
                <span className="text-xs bg-[#F4F6F8] text-[#6B7280] px-2 py-0.5 rounded-full">{contact.type}</span>
              </div>
              <p className="text-sm text-[#6B7280]">{contact.email} · {contact.phone}</p>
              <div className="flex items-center gap-2 mt-2">
                <select defaultValue={contact.stage} onChange={e => toast.success(`Stage updated to ${e.target.value}`)}
                  className="text-xs border border-[#E5E7EB] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30">
                  {['Lead', 'Hot Lead', 'Qualified', 'Negotiation', 'Offer Sent', 'Closed Won', 'Cold'].map(s => <option key={s}>{s}</option>)}
                </select>
                <span className="text-xs text-[#6B7280]">Assigned: {contact.assignedTo}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 border-b border-[#E5E7EB] overflow-x-auto">
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === i ? 'border-[#ff5722] text-[#ff5722]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Contact Overview</h3>
            <div className="space-y-3">
              {[
                { label: 'Last Contact', value: contact.lastContact },
                { label: 'Stage', value: contact.stage },
                { label: 'Assigned To', value: contact.assignedTo },
              ].map(f => (
                <div key={f.label} className="flex justify-between py-2 border-b border-[#F4F6F8] last:border-0">
                  <span className="text-xs text-[#6B7280]">{f.label}</span>
                  <span className="text-sm font-medium text-[#1F2937]">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Linked Cars</h3>
              <button onClick={() => toast.success('Car search modal')} className="text-xs text-[#ff8a65] hover:underline flex items-center gap-1">
                <Plus size={12} /> Link Car
              </button>
            </div>
            <p className="text-sm text-[#6B7280]">No cars linked yet</p>
          </div>
        )}

        {activeTab === 2 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Offers</h3>
              <Link href={`/offers/new?contact=${contact.id}`} className="text-xs text-[#ff8a65] hover:underline flex items-center gap-1">
                <Plus size={12} /> Create Offer
              </Link>
            </div>
            {contactOffers.length > 0 ? (
              <div className="space-y-2">
                {contactOffers.map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-[#1F2937]">{o.carName}</p>
                      <p className="text-xs text-[#6B7280]">{o.offerPrice.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}</p>
                    </div>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{o.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6B7280]">No offers sent yet</p>
            )}
          </div>
        )}

        {activeTab === 3 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Communications</h3>
              <button onClick={() => toast.success('Communication logged')} className="text-xs text-[#ff8a65] hover:underline flex items-center gap-1">
                <Plus size={12} /> Log Communication
              </button>
            </div>
            <div className="space-y-3">
              {[
                { type: 'Call', note: 'Discussed budget and preferences', date: '2026-04-10' },
                { type: 'Email', note: 'Sent offer for Toyota Camry', date: '2026-04-13' },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-[#F9FAFB] rounded-lg">
                  <MessageSquare size={14} className="text-[#ff8a65] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#1F2937]">{c.type}</p>
                    <p className="text-xs text-[#6B7280]">{c.note}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">{c.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 4 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Notes</h3>
            <div className="space-y-3 mb-4">
              {notes.map((note, i) => (
                <div key={i} className="p-3 bg-[#F9FAFB] rounded-lg">
                  <p className="text-sm text-[#1F2937]">{note}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">Added by Promise Ndem</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note…"
                className="flex-1 px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
              <button onClick={() => { if (newNote) { setNotes(prev => [...prev, newNote]); setNewNote(''); toast.success('Note added'); } }}
                className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all">
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
