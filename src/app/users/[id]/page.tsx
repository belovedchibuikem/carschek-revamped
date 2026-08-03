'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Shield, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { usersApi } from '@/lib/api/services';
import { useApiResource } from '@/hooks/useApiResource';
import { getCarschekRole } from '@/lib/auth/session';
import { assignableRoles, roleMeta, type StaffRole } from '@/lib/staff/roles';

export default function UserDetailPage() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const actorRole = getCarschekRole();
  const roles = assignableRoles(actorRole);
  const { data: user, loading, error, refresh } = useApiResource(() => usersApi.get(id), [id]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole>('support');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setRole((user.role as StaffRole) || 'support');
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await usersApi.update(user.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        role,
      });
      toast.success('User updated');
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const toggleAccess = async () => {
    if (!user) return;
    try {
      if (user.status === 'Active') {
        if (!confirm(`Block ${user.name}?`)) return;
        await usersApi.block(user.id);
        toast.success('Access blocked');
      } else {
        await usersApi.unblock(user.id);
        toast.success('Access restored');
      }
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update access');
    }
  };

  const resetPassword = async () => {
    if (!user) return;
    try {
      const res = await usersApi.resetPassword(user.id);
      try {
        await navigator.clipboard.writeText(res.temporaryPassword);
        toast.success(`Temp password copied: ${res.temporaryPassword}`);
      } catch {
        toast.success(`Temp password: ${res.temporaryPassword}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not reset password');
    }
  };

  const remove = async () => {
    if (!user) return;
    if (!confirm(`Delete ${user.name} permanently?`)) return;
    try {
      await usersApi.remove(user.id);
      toast.success('User deleted');
      router.push('/users');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete');
    }
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link
            href="/users"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8]"
          >
            <ArrowLeft size={16} className="text-[#6B7280]" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <Link href="/users" className="hover:text-[#ff5722]">
                Users
              </Link>
              <span>/</span>
              <span className="font-mono text-[#1F2937]">{id}</span>
            </div>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-heading font-bold text-[#1F2937]">
              <UserCircle className="text-[#ff5722]" size={26} />
              {loading ? 'Loading…' : user?.name || 'User'}
            </h1>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {user && (
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-4 rounded-xl border border-[#E5E7EB] bg-white p-5 lg:col-span-2">
              <h2 className="text-sm font-heading font-semibold text-[#1F2937]">Profile</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-[#374151]">Name</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#374151]">Email</label>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#374151]">Phone</label>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#374151]">Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as StaffRole)}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm"
                  >
                    {(roles.includes(role) ? roles : [role, ...roles]).map(r => (
                      <option key={r} value={r}>
                        {roleMeta(r).label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => void save()}
                className="rounded-lg bg-[#ff5722] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <h2 className="mb-3 text-sm font-heading font-semibold text-[#1F2937]">Access</h2>
                <p className="mb-3 text-sm text-[#6B7280]">
                  Status:{' '}
                  <span
                    className={`font-semibold ${user.status === 'Active' ? 'text-[#1A7A4A]' : 'text-[#C0392B]'}`}
                  >
                    {user.status === 'Active' ? 'Active' : 'Blocked'}
                  </span>
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleAccess()}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium ${
                      user.status === 'Active'
                        ? 'border-[#C0392B] text-[#C0392B] hover:bg-red-50'
                        : 'border-[#1A7A4A] text-[#1A7A4A] hover:bg-green-50'
                    }`}
                  >
                    {user.status === 'Active' ? 'Block access' : 'Restore access'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void resetPassword()}
                    className="flex items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#F4F6F8]"
                  >
                    <Copy size={14} /> Reset password
                  </button>
                  {user.inspectorId ? (
                    <Link
                      href={`/inspectors/${user.inspectorId}`}
                      className="flex items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-800"
                    >
                      <Shield size={14} /> Inspector profile
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="rounded-xl border border-red-100 bg-white p-5">
                <h2 className="mb-2 text-sm font-semibold text-[#C0392B]">Danger zone</h2>
                <p className="mb-3 text-xs text-[#6B7280]">Deletes the login. Inspector history may remain if linked jobs exist.</p>
                <button
                  type="button"
                  onClick={() => void remove()}
                  className="rounded-lg bg-[#C0392B] px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                >
                  Delete user
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
