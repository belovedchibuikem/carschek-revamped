'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, ChevronDown, ChevronUp, Download, Search, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { downloadCsv } from '@/lib/csv';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  MOCK_SETTINGS_AUDITS,
  diffAuditValues,
  formatAuditWhen,
  humanizeAuditKey,
  summarizeChanges,
  type SettingsAuditRow,
} from '@/lib/settings/auditFormat';

type ActivityFallback = {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  ip?: string;
  role?: string;
};

type Props = {
  audits: Array<Record<string, unknown>>;
  activityFallback?: ActivityFallback[];
};

function normalizeAudits(raw: Array<Record<string, unknown>>): SettingsAuditRow[] {
  return raw.map((a, i) => ({
    id: (a.id as string | number) ?? `audit-${i}`,
    key: String(a.key ?? ''),
    before: a.before,
    after: a.after,
    ip: (a.ip as string) ?? null,
    actor: (a.actor as SettingsAuditRow['actor']) ?? null,
    created_at: (a.created_at as string) ?? null,
  }));
}

function fromActivity(rows: ActivityFallback[]): SettingsAuditRow[] {
  return rows.map(a => ({
    id: a.id,
    key: a.action,
    before: null,
    after: { target: a.target, role: a.role },
    ip: a.ip ?? null,
    actor: { name: a.actor },
    created_at: a.timestamp,
  }));
}

export default function SettingsAuditPanel({ audits, activityFallback = [] }: Props) {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 250);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [category, setCategory] = useState<'all' | 'templates' | 'integrations' | 'security'>('all');

  const rows = useMemo(() => {
    const fromApi = normalizeAudits(audits).filter(r => r.key);
    if (fromApi.length) return fromApi;
    if (activityFallback.length) return fromActivity(activityFallback);
    return MOCK_SETTINGS_AUDITS;
  }, [audits, activityFallback]);

  const filtered = useMemo(() => {
    const q = debounced.toLowerCase().trim();
    return rows.filter(r => {
      const label = humanizeAuditKey(r.key);
      const hay = `${r.key} ${label.title} ${label.detail ?? ''} ${r.actor?.name ?? ''} ${r.actor?.email ?? ''}`.toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (category === 'templates' && !r.key.includes('template') && !r.key.includes('notification')) return false;
      if (category === 'integrations' && !/(mail|sms|simplybook)/i.test(r.key)) return false;
      if (category === 'security' && !/(security|permission|2fa|session)/i.test(r.key)) return false;
      return true;
    });
  }, [rows, debounced, category]);

  const exportCsv = () => {
    const out: (string | undefined)[][] = [['When', 'Actor', 'Setting', 'Summary', 'IP', 'Key']];
    filtered.forEach(r => {
      const label = humanizeAuditKey(r.key);
      const when = formatAuditWhen(r.created_at);
      const changes = diffAuditValues(r.before, r.after);
      out.push([
        when.absolute,
        r.actor?.name || 'System',
        `${label.title}${label.detail ? ` · ${label.detail}` : ''}`,
        summarizeChanges(changes),
        r.ip || '',
        r.key,
      ]);
    });
    downloadCsv('settings-audit.csv', out);
    toast.success('Settings audit exported');
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
      <div className="p-5 border-b border-[#E5E7EB] space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-heading font-semibold text-[#1F2937] flex items-center gap-2">
              <Shield size={18} className="text-[#ff5722]" />
              Settings audit trail
            </h2>
            <p className="text-sm text-[#6B7280] mt-1">
              Who changed platform configuration, templates, and integrations — with before/after detail.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8]"
            >
              <Download size={15} /> Export
            </button>
            <Link href="/activity" className="text-sm font-semibold text-[#ff5722] hover:underline whitespace-nowrap">
              Platform activity →
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search actor, setting, template…"
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
            />
          </div>
          {(
            [
              ['all', 'All'],
              ['templates', 'Templates'],
              ['integrations', 'Integrations'],
              ['security', 'Security'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(id)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border ${
                category === id
                  ? 'bg-[#ff5722] text-white border-[#ff5722]'
                  : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F9FAFB]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <Activity size={28} className="mx-auto text-[#D1D5DB] mb-2" />
          <p className="text-sm font-medium text-[#1F2937]">No audit events match</p>
          <p className="text-xs text-[#6B7280] mt-1">Try another filter, or save a setting to generate a new entry.</p>
        </div>
      ) : (
        <ul className="divide-y divide-[#F4F6F8]">
          {filtered.map(row => {
            const id = String(row.id);
            const label = humanizeAuditKey(row.key);
            const when = formatAuditWhen(row.created_at);
            const changes = diffAuditValues(row.before, row.after);
            const open = expandedId === id;
            const initials = (row.actor?.name || 'SY')
              .split(/\s+/)
              .map(p => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <li key={id} className="px-5 py-3.5 hover:bg-[#F9FAFB]/60 transition-colors">
                <button type="button" className="w-full text-left" onClick={() => setExpandedId(open ? null : id)}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1E3A5F] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-sm font-semibold text-[#1F2937]">{label.title}</p>
                        {label.detail ? (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F4F6F8] text-[#6B7280] border border-[#E5E7EB]">
                            {label.detail}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-[#6B7280] mt-0.5 truncate">{summarizeChanges(changes)}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-[11px] text-[#9CA3AF]">
                        <span className="font-medium text-[#6B7280]">{row.actor?.name || 'System'}</span>
                        {row.actor?.email ? <span>{row.actor.email}</span> : null}
                        <span title={row.created_at || undefined}>
                          {when.absolute}
                          {when.relative ? ` · ${when.relative}` : ''}
                        </span>
                        {row.ip ? <span className="font-mono">IP {row.ip}</span> : null}
                      </div>
                    </div>
                    <span className="text-[#9CA3AF] shrink-0 mt-1">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                  </div>
                </button>

                {open && (
                  <div className="mt-3 ml-12 rounded-lg border border-[#E5E7EB] bg-white overflow-hidden">
                    <div className="px-3 py-2 bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                      Change detail
                    </div>
                    {changes.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-[#6B7280]">No structured before/after payload for this event.</p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-[#F4F6F8] text-[#6B7280]">
                            <th className="text-left font-semibold px-3 py-2">Field</th>
                            <th className="text-left font-semibold px-3 py-2">Before</th>
                            <th className="text-left font-semibold px-3 py-2">After</th>
                          </tr>
                        </thead>
                        <tbody>
                          {changes.map(c => (
                            <tr key={c.field} className="border-b border-[#F4F6F8] last:border-0">
                              <td className="px-3 py-2 font-mono text-[#374151] align-top">{c.field}</td>
                              <td className="px-3 py-2 text-[#9CA3AF] align-top break-all">{c.from}</td>
                              <td className="px-3 py-2 text-[#1A7A4A] font-medium align-top break-all">{c.to}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    <div className="px-3 py-2 border-t border-[#F4F6F8] text-[10px] font-mono text-[#9CA3AF]">
                      key: {row.key}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
