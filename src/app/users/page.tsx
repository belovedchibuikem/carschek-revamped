'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';

import { Plus, Search } from 'lucide-react';

import { toast } from 'sonner';
import { usersApi } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  'super-admin': { label: 'Super Admin', color: 'bg-amber-100 text-amber-800' },
  'ops-manager': { label: 'Ops Manager', color: 'bg-blue-100 text-blue-800' },
  'inspector': { label: 'Inspector', color: 'bg-teal-100 text-teal-800' },
  'finance': { label: 'Finance', color: 'bg-green-100 text-green-800' },
  'support': { label: 'Support', color: 'bg-gray-100 text-gray-700' },
};

export default function UsersPage() {
  const pathname = usePathname();
  const { data: users, loading, error, refresh } = useApiList(() => usersApi.list());
  const [search, setSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'ops-manager' });

  const filtered = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteForm.email) { toast.error('Email is required'); return; }
    try {
      const local = inviteForm.email.split('@')[0] || 'user';
      const name = local
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      const tempPassword = `Invite@${Math.random().toString(36).slice(2, 10)}A1`;
      await usersApi.create({
        email: inviteForm.email,
        name,
        role: inviteForm.role,
        status: 'Active',
        password: tempPassword,
      });
      toast.success(`User created for ${inviteForm.email} (temp password set)`);
      setShowInviteModal(false);
      setInviteForm({ email: '', role: 'ops-manager' });
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not invite user');
    }
  };

  return (
    <AppLayout currentPath={pathname}>
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowInviteModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-fade-in">
            <h3 className="text-base font-heading font-semibold text-[#1F2937] mb-4">Invite Team Member</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Email *</label>
                <input type="email" value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Role</label>
                <select value={inviteForm.role} onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30">
                  {Object.entries(ROLE_LABELS).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={handleInvite} className="flex-1 px-4 py-2.5 bg-[#ff5722] text-white rounded-lg text-sm font-semibold hover:bg-[#e64a19]">Send Invite</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Users</h1>
            <p className="text-sm text-[#6B7280]">{users.length} team members</p>
          </div>
          <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all min-h-[44px]">
            <Plus size={16} /> Invite Member
          </button>
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {['User', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const roleConfig = ROLE_LABELS[user.role] || { label: user.role, color: 'bg-gray-100 text-gray-700' };
                return (
                  <tr key={user.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-xs font-bold">{user.avatar}</div>
                        <div>
                          <p className="font-medium text-[#1F2937]">{user.name}</p>
                          <p className="text-xs text-[#6B7280]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleConfig.color}`}>{roleConfig.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-[#1A7A4A] bg-green-100 px-2.5 py-1 rounded-full">{user.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">
                      {new Date(user.lastLogin).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toast.success(`Editing ${user.name}`)} className="px-3 py-1.5 border border-[#E5E7EB] text-xs font-medium text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-colors">Edit</button>
                        <button onClick={() => toast.success(`${user.name} suspended`)} className="px-3 py-1.5 border border-[#C0392B] text-xs font-medium text-[#C0392B] rounded-lg hover:bg-red-50 transition-colors">Suspend</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
