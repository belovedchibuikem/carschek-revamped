'use client';
import React, { Suspense, useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Shield, Users, Activity, Mail, MessageSquare, Settings, Lock, Database, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { settingsApi, usersApi, activityApi } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';

const SETTINGS_NAV = [
  { id: 'roles', label: 'Roles & Permissions', icon: Shield },
  { id: 'team', label: 'Team Members', icon: Users },
  { id: 'audit', label: 'Audit Log', icon: Activity },
  { id: 'email', label: 'Email Templates', icon: Mail },
  { id: 'sms', label: 'SMS Settings', icon: MessageSquare },
  { id: 'general', label: 'General', icon: Settings },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'migration', label: 'Data Migration', icon: Database },
];

const DEFAULT_PERMISSIONS = [
  { module: 'Dashboard', superAdmin: true, opsManager: true, finance: false, support: false },
  { module: 'Orders', superAdmin: true, opsManager: true, finance: false, support: true },
  { module: 'Inspectors', superAdmin: true, opsManager: true, finance: false, support: false },
  { module: 'Reports', superAdmin: true, opsManager: true, finance: true, support: true },
  { module: 'Finance', superAdmin: true, opsManager: false, finance: true, support: false },
  { module: 'Settings', superAdmin: true, opsManager: false, finance: false, support: false },
  { module: 'Cars', superAdmin: true, opsManager: true, finance: false, support: false },
  { module: 'Customers', superAdmin: true, opsManager: true, finance: false, support: true },
];

type PermRow = (typeof DEFAULT_PERMISSIONS)[number];

function SettingsPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('roles');
  const [permissions, setPermissions] = useState<PermRow[]>(DEFAULT_PERMISSIONS);
  const [generalForm, setGeneralForm] = useState({
    companyName: 'Carschek Technologies Ltd',
    timezone: 'Africa/Lagos',
    currency: 'NGN',
  });
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [enforce2fa, setEnforce2fa] = useState<Record<string, boolean>>({
    'Super Admin': true,
    'Ops Manager': false,
    Finance: false,
  });
  const [saving, setSaving] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState({
    bookingConfirm: 'Your Carschek inspection is confirmed for {{date}}.',
    reportReady: 'Your inspection report {{reportId}} is ready.',
  });
  const [smsSender, setSmsSender] = useState('Carschek');

  const { data: users } = useApiList(() => usersApi.list());
  const { data: activity } = useApiList(() => activityApi.list());

  useEffect(() => {
    const s = searchParams.get('section');
    if (s && SETTINGS_NAV.some(x => x.id === s)) setActiveSection(s);
  }, [searchParams]);

  useEffect(() => {
    void settingsApi
      .get()
      .then(raw => {
        const settings = raw as Record<string, unknown>;
        const company = (settings.company ?? {}) as Record<string, unknown>;
        if (company.companyName || company.name || company.timezone || company.currency) {
          setGeneralForm(prev => ({
            companyName: String(company.companyName ?? company.name ?? prev.companyName),
            timezone: String(company.timezone ?? prev.timezone),
            currency: String(company.currency ?? prev.currency),
          }));
        }
        if (Array.isArray(settings.permissions) && settings.permissions.length) {
          setPermissions(settings.permissions as PermRow[]);
        }
        const all = (settings.all ?? {}) as Record<string, unknown>;
        const security = (all.security ?? settings.security ?? {}) as Record<string, unknown>;
        if (typeof security.sessionTimeout === 'number') setSessionTimeout(security.sessionTimeout);
        if (security.enforce2fa && typeof security.enforce2fa === 'object') {
          setEnforce2fa(security.enforce2fa as Record<string, boolean>);
        }
        const templates = (settings.templates ?? {}) as Record<string, unknown>;
        if (templates.bookingConfirm || templates.reportReady) {
          setEmailTemplates(prev => ({
            bookingConfirm: String(templates.bookingConfirm ?? prev.bookingConfirm),
            reportReady: String(templates.reportReady ?? prev.reportReady),
          }));
        }
        if (typeof templates.smsSender === 'string') setSmsSender(templates.smsSender);
      })
      .catch(() => undefined);
  }, []);

  const goSection = (id: string) => {
    setActiveSection(id);
    router.replace(`${pathname}?section=${encodeURIComponent(id)}`, { scroll: false });
  };

  const togglePermission = (moduleIdx: number, role: string) => {
    setPermissions(prev => prev.map((p, i) => (i === moduleIdx ? { ...p, [role]: !p[role as keyof typeof p] } : p)));
  };

  const saveSettings = async (payload: Record<string, unknown>, okMessage: string) => {
    setSaving(true);
    try {
      await settingsApi.update(payload);
      toast.success(okMessage);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Settings</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-2">
              {SETTINGS_NAV.map(item => (
                <button key={item.id} type="button" onClick={() => goSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${activeSection === item.id ? 'bg-[#ff5722] text-white' : 'text-[#6B7280] hover:bg-[#F4F6F8] hover:text-[#1F2937]'}`}>
                  <item.icon size={16} className="flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            {activeSection === 'roles' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-heading font-semibold text-[#1F2937]">Roles & Permissions</h2>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void saveSettings({ permissions }, 'Permission changes saved')}
                    className="px-4 py-2 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E7EB]">
                        <th className="text-left py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Module</th>
                        {['Super Admin', 'Ops Manager', 'Finance', 'Support'].map(r => (
                          <th key={r} className="text-center py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide px-4">{r}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map((perm, i) => (
                        <tr key={perm.module} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB]">
                          <td className="py-3 font-medium text-[#1F2937]">{perm.module}</td>
                          {(['superAdmin', 'opsManager', 'finance', 'support'] as const).map(role => (
                            <td key={role} className="py-3 text-center px-4">
                              <button type="button" onClick={() => togglePermission(i, role)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all ${perm[role] ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}>
                                {perm[role] ? <Check size={14} /> : <X size={14} />}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeSection === 'team' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-heading font-semibold text-[#1F2937]">Team Members</h2>
                  <Link href="/users" className="text-sm font-semibold text-[#ff5722] hover:underline">
                    Manage users →
                  </Link>
                </div>
                <ul className="divide-y divide-[#F4F6F8]">
                  {users.slice(0, 8).map(u => (
                    <li key={u.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#1F2937]">{u.name}</p>
                        <p className="text-xs text-[#6B7280]">{u.email}</p>
                      </div>
                      <span className="text-xs font-semibold text-[#6B7280] capitalize">{String(u.role).replace(/-/g, ' ')}</span>
                    </li>
                  ))}
                  {users.length === 0 && <li className="py-6 text-sm text-[#6B7280]">No team members loaded.</li>}
                </ul>
              </div>
            )}

            {activeSection === 'audit' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-heading font-semibold text-[#1F2937]">Audit Log</h2>
                  <Link href="/activity" className="text-sm font-semibold text-[#ff5722] hover:underline">
                    Full activity →
                  </Link>
                </div>
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                  {activity.slice(0, 20).map(a => (
                    <li key={a.id} className="text-sm border border-[#F4F6F8] rounded-lg px-3 py-2">
                      <p className="font-medium text-[#1F2937]">{a.action}</p>
                      <p className="text-xs text-[#6B7280]">{a.actor} · {a.target} · {a.timestamp}</p>
                    </li>
                  ))}
                  {activity.length === 0 && <li className="text-sm text-[#6B7280]">No audit events yet.</li>}
                </ul>
              </div>
            )}

            {activeSection === 'email' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4 max-w-xl">
                <h2 className="text-base font-heading font-semibold text-[#1F2937]">Email Templates</h2>
                {([
                  { key: 'bookingConfirm', label: 'Booking confirmation' },
                  { key: 'reportReady', label: 'Report ready' },
                ] as const).map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-[#374151] mb-1.5">{f.label}</label>
                    <textarea
                      value={emailTemplates[f.key]}
                      onChange={e => setEmailTemplates(p => ({ ...p, [f.key]: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    void saveSettings(
                      { templates: { ...emailTemplates, smsSender } },
                      'Email templates saved'
                    )
                  }
                  className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save Templates'}
                </button>
              </div>
            )}

            {activeSection === 'sms' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4 max-w-md">
                <h2 className="text-base font-heading font-semibold text-[#1F2937]">SMS Settings</h2>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Sender ID</label>
                  <input
                    value={smsSender}
                    onChange={e => setSmsSender(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                  />
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    void saveSettings({ templates: { ...emailTemplates, smsSender } }, 'SMS settings saved')
                  }
                  className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save SMS Settings'}
                </button>
              </div>
            )}

            {activeSection === 'general' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <h2 className="text-base font-heading font-semibold text-[#1F2937] mb-5">General Settings</h2>
                <div className="space-y-4 max-w-md">
                  {[
                    { label: 'Company Name', key: 'companyName' },
                    { label: 'Timezone', key: 'timezone' },
                    { label: 'Currency', key: 'currency' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-[#374151] mb-1.5">{f.label}</label>
                      <input value={generalForm[f.key as keyof typeof generalForm]} onChange={e => setGeneralForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void saveSettings({ company: generalForm }, 'Settings saved')}
                    className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save Settings'}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <h2 className="text-base font-heading font-semibold text-[#1F2937] mb-5">Security Settings</h2>
                <div className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-2">Enforce 2FA for roles</label>
                    <div className="space-y-2">
                      {(['Super Admin', 'Ops Manager', 'Finance'] as const).map(role => (
                        <label key={role} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!enforce2fa[role]}
                            onChange={e => setEnforce2fa(p => ({ ...p, [role]: e.target.checked }))}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm text-[#1F2937]">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-2">Session Timeout: {sessionTimeout} minutes</label>
                    <input type="range" min="5" max="120" value={sessionTimeout} onChange={e => setSessionTimeout(parseInt(e.target.value))}
                      className="w-full accent-[#ff5722]" />
                    <div className="flex justify-between text-xs text-[#9CA3AF] mt-1">
                      <span>5 min</span><span>120 min</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      void saveSettings(
                        { settings: { security: { sessionTimeout, enforce2fa } } },
                        'Security settings saved'
                      )
                    }
                    className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save Security Settings'}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'migration' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <h2 className="text-base font-heading font-semibold text-[#1F2937] mb-2">Data Migration</h2>
                <p className="text-sm text-[#6B7280] mb-5">
                  Run the full five-step wizard: connect to the legacy system, select entities, validate, migrate, and download a report.
                </p>
                <Link
                  href="/settings/migration"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-[#D35400] text-white text-sm font-bold rounded-xl hover:bg-orange-700 transition-colors"
                >
                  Open full migration wizard
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <AppLayout currentPath="/settings">
        <div className="p-8 text-sm text-[#6B7280]">Loading settings…</div>
      </AppLayout>
    }>
      <SettingsPageContent />
    </Suspense>
  );
}
