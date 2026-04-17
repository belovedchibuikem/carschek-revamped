'use client';
import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Eye, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { CUSTOMERS } from '@/lib/mockData';
import { toast } from 'sonner';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { EmptyState } from '@/components/shared/TableSkeleton';

export default function CustomersPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [rows, setRows] = useState(CUSTOMERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', type: 'Individual', city: '', state: '' });

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return rows.filter(
      c =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [rows, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const handleAdd = () => {
    if (!newCustomer.name || !newCustomer.email) {
      toast.error('Name and email are required');
      return;
    }
    const emailLower = newCustomer.email.trim().toLowerCase();
    if (rows.some(c => c.email.toLowerCase() === emailLower)) {
      toast.error('Duplicate email — a customer with this address already exists');
      return;
    }
    const id = `CUS-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    setRows(prev => [
      ...prev,
      {
        id,
        name: newCustomer.name.trim(),
        email: emailLower,
        phone: newCustomer.phone.trim() || '—',
        type: newCustomer.type as 'Individual' | 'Dealer' | 'Corporate',
        city: newCustomer.city.trim() || 'Lagos',
        state: newCustomer.state.trim() || 'Lagos',
        status: 'Active' as const,
        orders: 0,
        createdAt: new Date().toISOString().slice(0, 10),
        avatar: newCustomer.name.trim().slice(0, 2).toUpperCase(),
      },
    ]);
    toast.success(`Customer "${newCustomer.name}" added`);
    setShowAddModal(false);
    setNewCustomer({ name: '', email: '', phone: '', type: 'Individual', city: '', state: '' });
  };

  return (
    <AppLayout currentPath={pathname}>
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-fade-in">
            <h3 className="text-base font-heading font-semibold text-[#1F2937] mb-4">Add Customer</h3>
            <div className="space-y-3">
              {[
                { label: 'Full Name *', key: 'name', type: 'text' },
                { label: 'Email *', key: 'email', type: 'email' },
                { label: 'Phone', key: 'phone', type: 'tel' },
                { label: 'City', key: 'city', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">{f.label}</label>
                  <input type={f.type} value={newCustomer[f.key as keyof typeof newCustomer]} onChange={e => setNewCustomer(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Type</label>
                <select value={newCustomer.type} onChange={e => setNewCustomer(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30">
                  {['Individual', 'Dealer', 'Corporate'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F4F6F8]">Cancel</button>
              <button type="button" onClick={handleAdd} className="flex-1 px-4 py-2.5 bg-[#1E3A5F] text-white rounded-lg text-sm font-semibold hover:bg-[#16304F]">Add Customer</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Customers</h1>
            <p className="text-sm text-[#6B7280]">{rows.length} customers</p>
          </div>
          <button type="button" onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all min-h-[44px]">
            <Plus size={16} /> Add Customer
          </button>
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
          {search !== debouncedSearch && (
            <p className="text-[11px] text-[#6B7280] mt-1.5">Filtering…</p>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <EmptyState title="No customers match" hint="Try another search or add a customer." />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  {['Customer', 'Type', 'Location', 'Orders', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(customer => (
                  <tr key={customer.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold">{customer.avatar}</div>
                        <div>
                          <Link href={`/customers/${customer.id}`} className="font-medium text-[#1F2937] hover:text-[#2E75B6] transition-colors">{customer.name}</Link>
                          <p className="text-xs text-[#6B7280]">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-[#F4F6F8] text-[#6B7280] px-2 py-0.5 rounded-full">{customer.type}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">{customer.city}, {customer.state}</td>
                    <td className="px-4 py-3 text-[#1F2937]">{customer.orders}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${customer.status === 'VIP' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{customer.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">{customer.createdAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/customers/${customer.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors">
                          <Eye size={14} className="text-[#6B7280]" />
                        </Link>
                        <button type="button" onClick={() => toast.success(`${customer.name} flagged`)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors">
                          <Flag size={14} className="text-[#6B7280]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
                <span>
                  Page {page} of {totalPages} · {filtered.length} shown
                </span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] disabled:opacity-40">
                    <ChevronLeft size={16} />
                  </button>
                  <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] disabled:opacity-40">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
