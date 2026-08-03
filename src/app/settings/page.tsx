'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Shield, Users, Activity, Mail, MessageSquare, Settings, Lock, Database, Check, X, Server, BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { settingsApi, usersApi, activityApi } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';
import EmailTemplatesPanel from '@/components/settings/EmailTemplatesPanel';
import SmsTemplatesPanel from '@/components/settings/SmsTemplatesPanel';
import SettingsAuditPanel from '@/components/settings/SettingsAuditPanel';

const SETTINGS_NAV = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'smtp', label: 'Email / SMTP', icon: Server },
  { id: 'email', label: 'Email Templates', icon: Mail },
  { id: 'sms', label: 'SMS Settings', icon: MessageSquare },
  { id: 'sms-templates', label: 'SMS Templates', icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', icon: Activity },
  { id: 'simplybook', label: 'Simplybook', icon: BookOpen },
  { id: 'operations', label: 'Operations', icon: Settings },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'roles', label: 'Roles & Permissions', icon: Shield },
  { id: 'team', label: 'Team Members', icon: Users },
  { id: 'audit', label: 'Audit Log', icon: Activity },
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

const inputClass =
  'w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30';

function SettingsPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('general');
  const [permissions, setPermissions] = useState<PermRow[]>(DEFAULT_PERMISSIONS);
  const [generalForm, setGeneralForm] = useState({
    companyName: 'Carschek Technologies Ltd',
    email: '',
    phone: '',
    address: '',
    timezone: 'Africa/Lagos',
    currency: 'NGN',
    brand_color: '#ff5722',
    logo_url: '',
  });
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [enforce2fa, setEnforce2fa] = useState<Record<string, boolean>>({
    'Super Admin': true,
    'Ops Manager': false,
    Finance: false,
  });
  const [saving, setSaving] = useState(false);
  const [mail, setMail] = useState({
    enabled: false,
    host: '',
    port: 587,
    encryption: 'tls',
    username: '',
    password: '',
    from_address: '',
    from_name: 'Carschek',
    password_set: false,
  });
  const [mailTestTo, setMailTestTo] = useState('');
  const [sms, setSms] = useState({
    provider: 'termii',
    sender_id: 'Carschek',
    enabled: false,
    test_mode: false,
    api_key: '',
    api_secret: '',
    api_key_set: false,
    api_secret_set: false,
  });
  const [smsTestTo, setSmsTestTo] = useState('');
  const [notifications, setNotifications] = useState<Record<string, { email: boolean; sms: boolean }>>({
    login_otp: { email: true, sms: false },
    booking_confirmed: { email: true, sms: true },
    inspection_assigned: { email: true, sms: true },
    report_ready: { email: true, sms: true },
  });
  const [simplybook, setSimplybook] = useState({
    company_login: '',
    api_key: '',
    enabled: false,
    sync_interval_minutes: 15,
    webhook_url: '',
    last_sync_at: '',
    last_sync_error: '',
    last_sync_count: 0,
    api_key_set: false,
  });
  const [templates, setTemplates] = useState<Array<Record<string, unknown>>>([]);
  const [checklistRules, setChecklistRules] = useState<Record<string, { mode?: string }>>({});
  const [opsMeta, setOpsMeta] = useState({ stalled_hours: 4, sla_hours: 8 });
  const [audits, setAudits] = useState<Array<Record<string, unknown>>>([]);
  const [signals, setSignals] = useState<Record<string, unknown> | null>(null);

  const { data: users } = useApiList(() => usersApi.list());
  const { data: activity } = useApiList(() => activityApi.list());

  const loadPlatform = useCallback(async () => {
    try {
      const [settings, mailCfg, smsCfg, sb, tpls, rules, auditRows, sig] = await Promise.all([
        settingsApi.get(),
        settingsApi.getMail().catch((): Record<string, unknown> => ({})),
        settingsApi.getSms().catch((): Record<string, unknown> => ({})),
        settingsApi.getSimplybook().catch((): Record<string, unknown> => ({})),
        settingsApi.listTemplates().catch((): { data: Array<Record<string, unknown>> } => ({ data: [] })),
        settingsApi.getChecklistRules().catch((): { rules: Record<string, unknown> } => ({ rules: {} })),
        settingsApi.audits().catch((): { data: Array<Record<string, unknown>> } => ({ data: [] })),
        settingsApi.inspectionSignals().catch((): Record<string, unknown> | null => null),
      ]);

      const company = (settings.company ?? {}) as Record<string, unknown>;
      setGeneralForm(prev => ({
        companyName: String(company.companyName ?? company.name ?? prev.companyName),
        email: String(company.email ?? prev.email),
        phone: String(company.phone ?? prev.phone),
        address: String(company.address ?? prev.address),
        timezone: String(company.timezone ?? prev.timezone),
        currency: String(company.currency ?? prev.currency),
        brand_color: String(company.brand_color ?? prev.brand_color),
        logo_url: String(company.logo_url ?? prev.logo_url),
      }));
      if (Array.isArray(settings.permissions) && settings.permissions.length) {
        setPermissions(settings.permissions as PermRow[]);
      }
      const security = (settings.security ?? {}) as Record<string, unknown>;
      if (typeof security.sessionTimeout === 'number') setSessionTimeout(security.sessionTimeout);
      if (security.enforce2fa && typeof security.enforce2fa === 'object') {
        setEnforce2fa(security.enforce2fa as Record<string, boolean>);
      }
      if (settings.notifications && typeof settings.notifications === 'object') {
        setNotifications(prev => ({ ...prev, ...(settings.notifications as typeof notifications) }));
      }
      const operations = (settings.operations ?? {}) as Record<string, unknown>;
      setOpsMeta({
        stalled_hours: Number(operations.stalled_hours ?? 4),
        sla_hours: Number(operations.sla_hours ?? 8),
      });

      setMail(m => ({
        ...m,
        ...mailCfg,
        port: Number(mailCfg.port ?? 587),
        password: '',
      }));
      setSms(s => ({ ...s, ...smsCfg, api_key: '', api_secret: '' }));
      setSimplybook(sbState => ({
        ...sbState,
        ...sb,
        api_key: '',
        last_sync_at: String(sb.last_sync_at ?? ''),
        last_sync_error: String(sb.last_sync_error ?? ''),
        last_sync_count: Number(sb.last_sync_count ?? 0),
        webhook_url: String(sb.webhook_url ?? ''),
      }));
      setTemplates(tpls.data ?? []);
      setChecklistRules((rules.rules ?? {}) as Record<string, { mode?: string }>);
      setAudits(auditRows.data ?? []);
      setSignals(sig);
    } catch {
      /* ignore load errors for partial mock */
    }
  }, []);

  useEffect(() => {
    const s = searchParams.get('section');
    if (s && SETTINGS_NAV.some(x => x.id === s)) setActiveSection(s);
  }, [searchParams]);

  useEffect(() => {
    void loadPlatform();
  }, [loadPlatform]);

  const goSection = (id: string) => {
    setActiveSection(id);
    router.replace(`${pathname}?section=${encodeURIComponent(id)}`, { scroll: false });
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

  const sectionKeys = useMemo(() => Object.keys(checklistRules).sort(), [checklistRules]);

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Settings</h1>
          {signals && (
            <div className="flex gap-2 text-[11px]">
              {Object.entries((signals.counts as Record<string, number>) || {}).map(([k, v]) => (
                <span key={k} className="px-2 py-1 rounded-full bg-[#F4F6F8] border border-[#E5E7EB] text-[#6B7280]">
                  {k.replace(/_/g, ' ')}: <strong className="text-[#1F2937]">{v}</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-2">
              {SETTINGS_NAV.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                    activeSection === item.id ? 'bg-[#ff5722] text-white' : 'text-[#6B7280] hover:bg-[#F4F6F8] hover:text-[#1F2937]'
                  }`}
                >
                  <item.icon size={16} className="flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {activeSection === 'general' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4 max-w-2xl">
                <h2 className="text-base font-heading font-semibold text-[#1F2937]">Company</h2>
                {([
                  ['companyName', 'Company name'],
                  ['email', 'Support email'],
                  ['phone', 'Phone'],
                  ['address', 'Address'],
                  ['timezone', 'Timezone'],
                  ['currency', 'Currency'],
                  ['brand_color', 'Brand color'],
                  ['logo_url', 'Logo URL'],
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-[#374151] mb-1.5">{label}</label>
                    <input
                      className={inputClass}
                      value={generalForm[key]}
                      onChange={e => setGeneralForm(p => ({ ...p, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    void saveSettings(
                      {
                        company: {
                          name: generalForm.companyName,
                          companyName: generalForm.companyName,
                          email: generalForm.email,
                          phone: generalForm.phone,
                          address: generalForm.address,
                          timezone: generalForm.timezone,
                          currency: generalForm.currency,
                          brand_color: generalForm.brand_color,
                          logo_url: generalForm.logo_url,
                        },
                      },
                      'Company settings saved'
                    )
                  }
                  className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save Company'}
                </button>
              </div>
            )}

            {activeSection === 'smtp' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4 max-w-2xl">
                <h2 className="text-base font-heading font-semibold text-[#1F2937]">SMTP</h2>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Login OTP emails need a real SMTP provider. These settings are saved in the database and override the API
                  <code className="mx-1 rounded bg-[#F4F6F8] px-1">.env</code> at runtime — the
                  <code className="mx-1 rounded bg-[#F4F6F8] px-1">.env</code> file itself is not rewritten.
                  Enable SMTP, enter your password once, click Save SMTP, then Test connection.
                </p>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={mail.enabled} onChange={e => setMail(p => ({ ...p, enabled: e.target.checked }))} />
                  Enable SMTP (required for login emails)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Host</label>
                    <input className={inputClass} value={mail.host} onChange={e => setMail(p => ({ ...p, host: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Port</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={mail.port}
                      onChange={e => setMail(p => ({ ...p, port: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Encryption</label>
                    <select className={inputClass} value={mail.encryption} onChange={e => setMail(p => ({ ...p, encryption: e.target.value }))}>
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Username</label>
                    <input className={inputClass} value={mail.username} onChange={e => setMail(p => ({ ...p, username: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Password {mail.password_set ? '(set)' : ''}</label>
                    <input
                      type="password"
                      className={inputClass}
                      placeholder={mail.password_set ? 'Leave blank to keep' : ''}
                      value={mail.password}
                      onChange={e => setMail(p => ({ ...p, password: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">From address</label>
                    <input className={inputClass} value={mail.from_address} onChange={e => setMail(p => ({ ...p, from_address: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">From name</label>
                    <input className={inputClass} value={mail.from_name} onChange={e => setMail(p => ({ ...p, from_name: e.target.value }))} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      setSaving(true);
                      settingsApi
                        .updateMail(mail)
                        .then(() => toast.success('SMTP saved'))
                        .catch(e => toast.error(e instanceof Error ? e.message : 'Save failed'))
                        .finally(() => setSaving(false));
                    }}
                    className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg"
                  >
                    Save SMTP
                  </button>
                </div>
                <div className="pt-2 border-t border-[#F4F6F8] flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1.5">Test recipient</label>
                    <input className={inputClass} value={mailTestTo} onChange={e => setMailTestTo(e.target.value)} placeholder="you@company.com" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!mailTestTo.trim()) {
                        toast.error('Enter a test recipient email');
                        return;
                      }
                      if (!mail.enabled) {
                        toast.error('Enable SMTP and save before testing');
                        return;
                      }
                      if (!mail.host.trim()) {
                        toast.error('SMTP host is required');
                        return;
                      }
                      if (!mail.password && !mail.password_set) {
                        toast.error('Enter the SMTP password, then Save / Test');
                        return;
                      }
                      void settingsApi
                        .testMail(mailTestTo, {
                          save: true,
                          enabled: mail.enabled,
                          host: mail.host,
                          port: mail.port,
                          encryption: mail.encryption,
                          username: mail.username,
                          password: mail.password || undefined,
                          from_address: mail.from_address,
                          from_name: mail.from_name,
                        })
                        .then(r => {
                          toast.success(r.message);
                          if (mail.password) setMail(p => ({ ...p, password: '', password_set: true }));
                        })
                        .catch(e => toast.error(e instanceof Error ? e.message : 'SMTP test failed'));
                    }}
                    className="px-4 py-2.5 border border-[#ff5722] text-[#ff5722] text-sm font-semibold rounded-lg"
                  >
                    Test connection
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'email' && <EmailTemplatesPanel initialTemplates={templates} />}

            {activeSection === 'sms' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4 max-w-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-heading font-semibold">SMS provider</h2>
                    <p className="text-sm text-[#6B7280] mt-1">
                      Connect Termii or Twilio. Edit message copy under{' '}
                      <button type="button" className="text-[#ff5722] font-semibold" onClick={() => goSection('sms-templates')}>
                        SMS Templates
                      </button>
                      .
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={sms.enabled} onChange={e => setSms(p => ({ ...p, enabled: e.target.checked }))} />
                  Enable SMS
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={sms.test_mode} onChange={e => setSms(p => ({ ...p, test_mode: e.target.checked }))} />
                  Test mode (log only)
                </label>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Provider</label>
                  <select className={inputClass} value={sms.provider} onChange={e => setSms(p => ({ ...p, provider: e.target.value }))}>
                    <option value="termii">Termii</option>
                    <option value="twilio">Twilio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Sender ID / From</label>
                  <input className={inputClass} value={sms.sender_id} onChange={e => setSms(p => ({ ...p, sender_id: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">API key {sms.api_key_set ? '(set)' : ''}</label>
                  <input type="password" className={inputClass} value={sms.api_key} onChange={e => setSms(p => ({ ...p, api_key: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">API secret {sms.api_secret_set ? '(set)' : ''}</label>
                  <input type="password" className={inputClass} value={sms.api_secret} onChange={e => setSms(p => ({ ...p, api_secret: e.target.value }))} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void settingsApi
                      .updateSms(sms)
                      .then(() => toast.success('SMS settings saved'))
                      .catch(e => toast.error(e instanceof Error ? e.message : 'Save failed'));
                  }}
                  className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg"
                >
                  Save SMS
                </button>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1.5">Test phone</label>
                    <input className={inputClass} value={smsTestTo} onChange={e => setSmsTestTo(e.target.value)} placeholder="+234…" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void settingsApi
                        .testSms(smsTestTo)
                        .then(r => toast.success(r.message))
                        .catch(e => toast.error(e instanceof Error ? e.message : 'SMS test failed'));
                    }}
                    className="px-4 py-2.5 border border-[#ff5722] text-[#ff5722] text-sm font-semibold rounded-lg"
                  >
                    Test SMS
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'sms-templates' && <SmsTemplatesPanel initialTemplates={templates} />}

            {activeSection === 'notifications' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-3 max-w-xl">
                <h2 className="text-base font-heading font-semibold">Notification channels</h2>
                {Object.entries(notifications).map(([event, ch]) => (
                  <div key={event} className="flex items-center justify-between border border-[#F4F6F8] rounded-lg px-3 py-2">
                    <span className="text-sm font-medium capitalize">{event.replace(/_/g, ' ')}</span>
                    <div className="flex gap-4 text-xs">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={ch.email}
                          onChange={e => setNotifications(p => ({ ...p, [event]: { ...p[event], email: e.target.checked } }))}
                        />
                        Email
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={ch.sms}
                          onChange={e => setNotifications(p => ({ ...p, [event]: { ...p[event], sms: e.target.checked } }))}
                        />
                        SMS
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => void saveSettings({ notifications }, 'Notifications saved')}
                  className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg"
                >
                  Save notifications
                </button>
              </div>
            )}

            {activeSection === 'simplybook' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4 max-w-xl">
                <h2 className="text-base font-heading font-semibold">Simplybook sync</h2>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={simplybook.enabled}
                    onChange={e => setSimplybook(p => ({ ...p, enabled: e.target.checked }))}
                  />
                  Enable sync
                </label>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Company login</label>
                  <input
                    className={inputClass}
                    value={simplybook.company_login}
                    onChange={e => setSimplybook(p => ({ ...p, company_login: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">API key {simplybook.api_key_set ? '(set)' : ''}</label>
                  <input
                    type="password"
                    className={inputClass}
                    value={simplybook.api_key}
                    onChange={e => setSimplybook(p => ({ ...p, api_key: e.target.value }))}
                  />
                </div>
                <p className="text-xs text-[#6B7280]">Webhook: <code className="bg-[#F4F6F8] px-1 rounded">{simplybook.webhook_url}</code></p>
                <p className="text-xs text-[#6B7280]">
                  Last sync: {simplybook.last_sync_at || '—'} · count {simplybook.last_sync_count}
                  {simplybook.last_sync_error ? ` · error: ${simplybook.last_sync_error}` : ''}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void settingsApi
                        .updateSimplybook(simplybook)
                        .then(() => toast.success('Simplybook settings saved'))
                        .catch(e => toast.error(e instanceof Error ? e.message : 'Save failed'));
                    }}
                    className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void settingsApi
                        .syncSimplybook()
                        .then(r => toast.success(r.message))
                        .catch(e => toast.error(e instanceof Error ? e.message : 'Sync failed'));
                    }}
                    className="px-4 py-2.5 border border-[#E5E7EB] text-sm font-semibold rounded-lg"
                  >
                    Sync now
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'operations' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
                <h2 className="text-base font-heading font-semibold">Operations & checklist rules</h2>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Stalled hours</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={opsMeta.stalled_hours}
                      onChange={e => setOpsMeta(p => ({ ...p, stalled_hours: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">SLA hours</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={opsMeta.sla_hours}
                      onChange={e => setOpsMeta(p => ({ ...p, sla_hours: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto max-h-80 border border-[#F4F6F8] rounded-lg">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] text-left">
                        <th className="p-2">Section</th>
                        <th className="p-2">Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionKeys.map(key => (
                        <tr key={key} className="border-b border-[#F9FAFB]">
                          <td className="p-2 font-mono">{key}</td>
                          <td className="p-2">
                            <select
                              className={inputClass}
                              value={checklistRules[key]?.mode ?? 'required'}
                              onChange={e =>
                                setChecklistRules(p => ({
                                  ...p,
                                  [key]: { ...p[key], mode: e.target.value },
                                }))
                              }
                            >
                              <option value="required">Required</option>
                              <option value="optional">Optional</option>
                              <option value="off">Off</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void Promise.all([
                      saveSettings({ operations: { ...opsMeta, checklist_rules: checklistRules } }, 'Operations saved'),
                      settingsApi.updateChecklistRules(checklistRules),
                    ]).catch(() => undefined);
                  }}
                  className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg"
                >
                  Save operations
                </button>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4 max-w-md">
                <h2 className="text-base font-heading font-semibold">Security</h2>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Session timeout (minutes)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={sessionTimeout}
                    onChange={e => setSessionTimeout(Number(e.target.value))}
                  />
                </div>
                {Object.keys(enforce2fa).map(role => (
                  <label key={role} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={enforce2fa[role]}
                      onChange={e => setEnforce2fa(p => ({ ...p, [role]: e.target.checked }))}
                    />
                    Enforce OTP for {role}
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => void saveSettings({ security: { sessionTimeout, enforce2fa } }, 'Security saved')}
                  className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg"
                >
                  Save security
                </button>
              </div>
            )}

            {activeSection === 'roles' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-heading font-semibold text-[#1F2937]">Roles & Permissions</h2>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void saveSettings({ permissions }, 'Permission changes saved')}
                    className="px-4 py-2 bg-[#ff5722] text-white text-sm font-semibold rounded-lg disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E7EB]">
                        <th className="text-left py-3 text-xs font-semibold text-[#6B7280]">Module</th>
                        {['Super Admin', 'Ops Manager', 'Finance', 'Support'].map(r => (
                          <th key={r} className="text-center py-3 text-xs font-semibold text-[#6B7280] px-4">{r}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map((perm, i) => (
                        <tr key={perm.module} className="border-b border-[#F4F6F8]">
                          <td className="py-3 font-medium">{perm.module}</td>
                          {(['superAdmin', 'opsManager', 'finance', 'support'] as const).map(role => (
                            <td key={role} className="py-3 text-center px-4">
                              <button
                                type="button"
                                onClick={() =>
                                  setPermissions(prev =>
                                    prev.map((p, idx) => (idx === i ? { ...p, [role]: !p[role] } : p))
                                  )
                                }
                                className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto ${
                                  perm[role] ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-400'
                                }`}
                              >
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
                  <h2 className="text-base font-heading font-semibold">Team Members</h2>
                  <Link href="/users" className="text-sm font-semibold text-[#ff5722] hover:underline">
                    Manage users →
                  </Link>
                </div>
                <ul className="divide-y divide-[#F4F6F8]">
                  {users.slice(0, 8).map(u => (
                    <li key={u.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-[#6B7280]">{u.email}</p>
                      </div>
                      <span className="text-xs font-semibold text-[#6B7280] capitalize">{String(u.role).replace(/-/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeSection === 'audit' && (
              <SettingsAuditPanel
                audits={audits}
                activityFallback={activity.map(a => ({
                  id: a.id,
                  actor: a.actor,
                  action: a.action,
                  target: a.target,
                  timestamp: a.timestamp,
                  ip: a.ip,
                  role: a.role,
                }))}
              />
            )}

            {activeSection === 'migration' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <h2 className="text-base font-heading font-semibold mb-2">Data Migration</h2>
                <p className="text-sm text-[#6B7280] mb-4">Import legacy Carschek data via the migration wizard.</p>
                <Link
                  href="/settings/migration"
                  className="inline-flex px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg"
                >
                  Open migration wizard
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
    <Suspense fallback={<div className="p-8 text-sm text-[#6B7280]">Loading settings…</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
