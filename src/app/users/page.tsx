'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Search, Copy, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { usersApi, type StaffUserRow } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { EmptyState } from '@/components/shared/TableSkeleton';
import { getCarschekRole } from '@/lib/auth/session';
import {
  assignableRoles,
  generateTempPassword,
  nameFromEmail,
  roleMeta,
  STAFF_ROLES,
  type StaffRole,
} from '@/lib/staff/roles';

type FormState = {
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: 'Active' | 'Inactive';
  password: string;
  zones: string;
  certBadge: string;
};

const emptyForm = (): FormState => ({
  name: '',
  email: '',
  phone: '',
  role: 'ops-manager',
  status: 'Active',
  password: '',
  zones: '',
  certBadge: 'Standard',
});

export default function UsersPage() {
  const pathname = usePathname();
  const [actorRole, setActorRole] = useState<string | null>(null);
  const roles = assignableRoles(actorRole);
  const { data: users, loading, error, refresh } = useApiList(() => usersApi.list());
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<StaffUserRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    setActorRole(getCarschekRole());
  }, []);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return users.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q)
      );
    });
  }, [users, debouncedSearch, roleFilter, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm(), role: (roles[0] || 'ops-manager') as StaffRole, password: generateTempPassword() });
    setCreatedCreds(null);
    setModal('create');
  };

  const openEdit = (user: StaffUserRow) => {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: (user.role as StaffRole) || 'support',
      status: user.status === 'Inactive' ? 'Inactive' : 'Active',
      password: '',
      zones: '',
      certBadge: 'Standard',
    });
    setCreatedCreds(null);
    setModal('edit');
  };

  const payloadFromForm = () => {
    const zones = form.zones
      .split(',')
      .map(z => z.trim())
      .filter(Boolean);
    return {
      name: form.name.trim() || nameFromEmail(form.email),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      role: form.role,
      status: form.status,
      ...(form.password ? { password: form.password } : {}),
      ...(form.role === 'inspector'
        ? { zones, certBadge: form.certBadge.trim() || 'Standard' }
        : {}),
    };
  };

  const handleSave = async () => {
    if (!form.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (modal === 'create' && !form.password) {
      toast.error('Password is required');
      return;
    }
    if (!roles.includes(form.role) && form.role !== editing?.role) {
      toast.error('You cannot assign that role');
      return;
    }
    setSubmitting(true);
    try {
      if (modal === 'create') {
        const created = await usersApi.create(payloadFromForm());
        setCreatedCreds({ email: form.email.trim().toLowerCase(), password: form.password });
        toast.success(`Created ${created.name} (${created.id})`);
        setModal(null);
        refresh();
      } else if (editing) {
        await usersApi.update(editing.id, payloadFromForm());
        toast.success(`Updated ${form.name || editing.name}`);
        setModal(null);
        refresh();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save user');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAccess = async (user: StaffUserRow) => {
    try {
      if (user.status === 'Active') {
        if (!confirm(`Block access for ${user.name}? They will be signed out immediately.`)) return;
        await usersApi.block(user.id);
        toast.success(`${user.name} blocked`);
      } else {
        await usersApi.unblock(user.id);
        toast.success(`${user.name} restored`);
      }
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update access');
    }
  };

  const handleResetPassword = async (user: StaffUserRow) => {
    if (!confirm(`Reset password for ${user.name}?`)) return;
    try {
      const res = await usersApi.resetPassword(user.id);
      setCreatedCreds({ email: user.email, password: res.temporaryPassword });
      toast.success('Temporary password generated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not reset password');
    }
  };

  const handleDelete = async (user: StaffUserRow) => {
    if (!confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;
    try {
      await usersApi.remove(user.id);
      toast.success(`Deleted ${user.name}`);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete user');
    }
  };

  const copyCreds = async () => {
    if (!createdCreds) return;
    try {
      await navigator.clipboard.writeText(`${createdCreds.email}\n${createdCreds.password}`);
      toast.success('Credentials copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <AppLayout currentPath={pathname}>
      {createdCreds && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCreatedCreds(null)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-base font-heading font-semibold text-[#1F2937]">Login credentials</h3>
            <p className="mb-4 text-xs text-[#6B7280]">Share securely — this password is shown once.</p>
            <div className="space-y-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 font-mono text-sm">
              <p>
                <span className="text-[#6B7280]">Email:</span> {createdCreds.email}
              </p>
              <p>
                <span className="text-[#6B7280]">Password:</span> {createdCreds.password}
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => void copyCreds()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium"
              >
                <Copy size={14} /> Copy
              </button>
              <button
                type="button"
                onClick={() => setCreatedCreds(null)}
                className="flex-1 rounded-lg bg-[#ff5722] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !submitting && setModal(null)} />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-base font-heading font-semibold text-[#1F2937]">
              {modal === 'create' ? 'Create staff user' : `Edit ${editing?.name}`}
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-[#374151]">Full name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Auto from email if empty"
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-[#374151]">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#374151]">Phone</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#374151]">Role</label>
                  <select
                    value={form.role}
                    onChange={e => setForm(p => ({ ...p, role: e.target.value as StaffRole }))}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  >
                    {(roles.length ? roles : STAFF_ROLES).map(r => (
                      <option key={r} value={r}>
                        {roleMeta(r).label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#374151]">Access</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value as 'Active' | 'Inactive' }))}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Blocked</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#374151]">
                    {modal === 'create' ? 'Password *' : 'New password (optional)'}
                  </label>
                  <input
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  />
                </div>
              </div>
              {form.role === 'inspector' && (
                <div className="grid grid-cols-1 gap-3 rounded-lg border border-teal-100 bg-teal-50/40 p-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-[#374151]">Zones (comma-separated)</label>
                    <input
                      value={form.zones}
                      onChange={e => setForm(p => ({ ...p, zones: e.target.value }))}
                      placeholder="Lagos Island, Lagos Mainland"
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#374151]">Cert badge</label>
                    <select
                      value={form.certBadge}
                      onChange={e => setForm(p => ({ ...p, certBadge: e.target.value }))}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm"
                    >
                      <option>Standard</option>
                      <option>Senior</option>
                      <option>Lead</option>
                    </select>
                  </div>
                  <p className="sm:col-span-2 text-[11px] text-teal-800">
                    Creating an inspector login also creates a linked inspector profile for job assignment.
                  </p>
                </div>
              )}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setModal(null)}
                className="flex-1 rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleSave()}
                className="flex-1 rounded-lg bg-[#ff5722] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting ? 'Saving…' : modal === 'create' ? 'Create user' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Staff &amp; Users</h1>
            <p className="text-sm text-[#6B7280]">
              {loading ? '…' : `${users.length} accounts`} · roles, access control, inspector linking
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex min-h-[44px] items-center gap-2 rounded-lg bg-[#ff5722] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e64a19]"
          >
            <Plus size={16} /> Create user
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, ID…"
              className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm"
          >
            <option value="all">All roles</option>
            {STAFF_ROLES.map(r => (
              <option key={r} value={r}>
                {roleMeta(r).label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm"
          >
            <option value="all">All access</option>
            <option value="Active">Active</option>
            <option value="Inactive">Blocked</option>
          </select>
        </div>

        {error && (
          <div className="flex justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
            <button type="button" onClick={() => void refresh()} className="text-sm font-semibold text-red-700 underline">
              Retry
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
          {loading ? (
            <div className="p-8 text-sm text-[#6B7280]">Loading staff…</div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No users found" hint="Adjust filters or create a staff account." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    {['User', 'Role', 'Access', 'Last Login', 'Actions'].map(h => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => {
                    const roleConfig = roleMeta(user.role);
                    const blocked = user.status !== 'Active';
                    return (
                      <tr key={user.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff5722] text-xs font-bold text-white">
                              {user.avatar || (user.name || user.email || 'U').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <Link href={`/users/${user.id}`} className="font-medium text-[#1F2937] hover:text-[#ff5722]">
                                {user.name}
                              </Link>
                              <p className="text-xs text-[#6B7280]">{user.email}</p>
                              <p className="font-mono text-[10px] text-[#9CA3AF]">{user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleConfig.color}`}>
                            {roleConfig.label}
                          </span>
                          {user.inspectorId ? (
                            <Link
                              href={`/inspectors/${user.inspectorId}`}
                              className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-teal-700 hover:underline"
                            >
                              <Shield size={10} /> {user.inspectorId}
                            </Link>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              blocked ? 'bg-red-100 text-[#C0392B]' : 'bg-green-100 text-[#1A7A4A]'
                            }`}
                          >
                            {blocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#6B7280]">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleString('en-NG', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(user)}
                              className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:bg-[#F4F6F8]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void toggleAccess(user)}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                                blocked
                                  ? 'border-[#1A7A4A] text-[#1A7A4A] hover:bg-green-50'
                                  : 'border-[#C0392B] text-[#C0392B] hover:bg-red-50'
                              }`}
                            >
                              {blocked ? 'Unblock' : 'Block'}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleResetPassword(user)}
                              className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:bg-[#F4F6F8]"
                            >
                              Reset PW
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(user)}
                              className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-[#C0392B] hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
