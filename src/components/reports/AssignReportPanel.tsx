'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { reportsApi } from '@/lib/api/services';

type PortalUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  isDealer?: boolean;
};

type Assignee = { user: PortalUser; assignedAt?: string };

export function AssignReportPanel({ reportId }: { reportId: string }) {
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: '', email: '', phone: '', isDealer: false });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await reportsApi.assignees(reportId);
      setAssignees(
        (rows as Assignee[]).filter(r => r?.user?.id)
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load assignees');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void reportsApi
        .searchPortalUsers(query)
        .then(rows => setResults((rows as PortalUser[]) ?? []))
        .catch(() => setResults([]));
    }, 250);
    return () => window.clearTimeout(handle);
  }, [query]);

  const assignExisting = async (user: PortalUser) => {
    setBusy(true);
    try {
      await reportsApi.assignUser(reportId, { userId: user.id });
      toast.success(`${user.name} can now open this report`);
      setQuery('');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not assign');
    } finally {
      setBusy(false);
    }
  };

  const createAndAssign = async () => {
    if (!draft.name.trim() || !draft.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setBusy(true);
    try {
      const res = (await reportsApi.assignUser(reportId, {
        name: draft.name.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim() || null,
        isDealer: draft.isDealer,
      })) as { temporaryPassword?: string | null };
      toast.success(
        res.temporaryPassword
          ? `User created and linked. Temporary password: ${res.temporaryPassword}`
          : 'User linked to this report'
      );
      setCreating(false);
      setDraft({ name: '', email: '', phone: '', isDealer: false });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not create user');
    } finally {
      setBusy(false);
    }
  };

  const unassign = async (user: PortalUser) => {
    setBusy(true);
    try {
      await reportsApi.unassignUser(reportId, user.id);
      toast.success(`Removed ${user.name}`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not unassign');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-[#1E3A5F]">Assign report</h2>
          <p className="text-xs text-[#6B7280]">
            Search customers and dealers by name, email, or phone. They see this live report on their dashboard.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(v => !v)}
          className="inline-flex items-center gap-1 rounded-lg border border-[#1E3A5F] px-3 py-1.5 text-xs font-semibold text-[#1E3A5F]"
        >
          <UserPlus size={14} /> Create user
        </button>
      </div>

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Filter by name, email, or phone"
        className="mb-2 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
      />
      {query.trim() ? (
        <ul className="mb-3 max-h-40 overflow-auto rounded-lg border border-[#F4F6F8]">
          {results.length === 0 ? (
            <li className="px-3 py-2 text-xs text-[#9CA3AF]">No matching users. Create one and link it.</li>
          ) : (
            results.map(u => (
              <li key={u.id} className="flex items-center justify-between gap-2 border-t border-[#F4F6F8] px-3 py-2 text-sm first:border-t-0">
                <span>
                  <span className="font-semibold text-[#1F2937]">{u.name}</span>
                  <span className="ml-2 text-xs text-[#6B7280]">{u.email}</span>
                  {u.phone ? <span className="ml-2 text-xs text-[#6B7280]">{u.phone}</span> : null}
                  {u.isDealer ? (
                    <span className="ml-2 rounded bg-[#E8F1FB] px-1.5 text-[10px] font-bold text-[#1E3A5F]">Dealer</span>
                  ) : null}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void assignExisting(u)}
                  className="rounded-md bg-[#1E3A5F] px-2 py-1 text-[11px] font-bold text-white disabled:opacity-60"
                >
                  Assign
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}

      {creating ? (
        <div className="mb-3 grid gap-2 rounded-lg bg-[#F9FAFB] p-3 sm:grid-cols-2">
          <input
            value={draft.name}
            onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
            placeholder="Full name"
            className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
          />
          <input
            value={draft.email}
            onChange={e => setDraft(d => ({ ...d, email: e.target.value }))}
            placeholder="Email"
            className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
          />
          <input
            value={draft.phone}
            onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))}
            placeholder="Phone"
            className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-xs text-[#374151]">
            <input
              type="checkbox"
              checked={draft.isDealer}
              onChange={e => setDraft(d => ({ ...d, isDealer: e.target.checked }))}
            />
            Dealer (is_dealer)
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void createAndAssign()}
            className="rounded-lg bg-[#ff5722] px-3 py-2 text-sm font-bold text-white disabled:opacity-60 sm:col-span-2"
          >
            Create and link
          </button>
        </div>
      ) : null}

      {loading ? (
        <p className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Loader2 size={14} className="animate-spin" /> Loading assignees…
        </p>
      ) : assignees.length === 0 ? (
        <p className="text-xs text-[#9CA3AF]">Nobody is linked yet.</p>
      ) : (
        <ul className="space-y-2">
          {assignees.map(row => (
            <li key={row.user.id} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm">
              <span>
                <span className="font-semibold">{row.user.name}</span>
                <span className="ml-2 text-xs text-[#6B7280]">{row.user.email}</span>
                {row.user.isDealer ? (
                  <span className="ml-2 text-[10px] font-bold text-[#1E3A5F]">Dealer</span>
                ) : null}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => void unassign(row.user)}
                className="rounded p-1 text-[#C0392B] hover:bg-red-50"
                aria-label={`Unassign ${row.user.name}`}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
