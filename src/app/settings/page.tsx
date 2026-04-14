'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import { Shield, Users, Activity, Mail, MessageSquare, Settings, Lock, Database, Check, X } from 'lucide-react';
import { toast } from 'sonner';

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

const PERMISSIONS = [
  { module: 'Dashboard', superAdmin: true, opsManager: true, finance: false, support: false },
  { module: 'Orders', superAdmin: true, opsManager: true, finance: false, support: true },
  { module: 'Inspectors', superAdmin: true, opsManager: true, finance: false, support: false },
  { module: 'Reports', superAdmin: true, opsManager: true, finance: true, support: true },
  { module: 'Finance', superAdmin: true, opsManager: false, finance: true, support: false },
  { module: 'Settings', superAdmin: true, opsManager: false, finance: false, support: false },
  { module: 'Cars', superAdmin: true, opsManager: true, finance: false, support: false },
  { module: 'Customers', superAdmin: true, opsManager: true, finance: false, support: true },
];

export default function SettingsPage() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('roles');
  const [permissions, setPermissions] = useState(PERMISSIONS);
  const [generalForm, setGeneralForm] = useState({ companyName: 'Carschek Technologies Ltd', timezone: 'Africa/Lagos', currency: 'NGN' });
  const [sessionTimeout, setSessionTimeout] = useState(30);

  const togglePermission = (moduleIdx: number, role: string) => {
    setPermissions(prev => prev.map((p, i) => i === moduleIdx ? { ...p, [role]: !p[role as keyof typeof p] } : p));
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Settings</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left nav */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-2">
              {SETTINGS_NAV.map(item => (
                <button key={item.id} onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${activeSection === item.id ? 'bg-[#1E3A5F] text-white' : 'text-[#6B7280] hover:bg-[#F4F6F8] hover:text-[#1F2937]'}`}>
                  <item.icon size={16} className="flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeSection === 'roles' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-heading font-semibold text-[#1F2937]">Roles & Permissions</h2>
                  <button onClick={() => toast.success('Permission changes saved')} className="px-4 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">
                    Save Changes
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
                              <button onClick={() => togglePermission(i, role)}
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
                        className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
                    </div>
                  ))}
                  <button onClick={() => toast.success('Settings saved')} className="px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">
                    Save Settings
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
                      {['Super Admin', 'Ops Manager', 'Finance'].map(role => (
                        <label key={role} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked={role === 'Super Admin'} className="w-4 h-4 rounded" />
                          <span className="text-sm text-[#1F2937]">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-2">Session Timeout: {sessionTimeout} minutes</label>
                    <input type="range" min="5" max="120" value={sessionTimeout} onChange={e => setSessionTimeout(parseInt(e.target.value))}
                      className="w-full accent-[#1E3A5F]" />
                    <div className="flex justify-between text-xs text-[#9CA3AF] mt-1">
                      <span>5 min</span><span>120 min</span>
                    </div>
                  </div>
                  <button onClick={() => toast.success('Security settings saved')} className="px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">
                    Save Security Settings
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'migration' && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <h2 className="text-base font-heading font-semibold text-[#1F2937] mb-2">Data Migration</h2>
                <p className="text-sm text-[#6B7280] mb-5">Migrate data from the legacy Carschek system</p>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <h3 className="text-sm font-semibold text-[#1E3A5F] mb-2">Connect to Legacy System</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#374151] mb-1.5">API Base URL</label>
                        <input defaultValue="https://admin.carschek.com/api" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#374151] mb-1.5">API Key</label>
                        <input type="password" placeholder="Enter API key…" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 bg-white" />
                      </div>
                      <button onClick={() => toast.success('Connection successful! Found 33 cars, 41 inspections, 156 customers')} className="px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">
                        Test Connection
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Cars', count: 33 }, { label: 'Car Brands', count: 8 }, { label: 'Car Models', count: 24 },
                      { label: 'Inspections & Reports', count: 41 }, { label: 'Customers', count: 156 }, { label: 'Inspectors', count: 12 },
                    ].map(item => (
                      <label key={item.label} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg cursor-pointer hover:bg-[#F4F6F8] transition-colors">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                        <span className="text-sm text-[#1F2937] flex-1">{item.label}</span>
                        <span className="text-xs text-[#6B7280] font-semibold">{item.count} records</span>
                      </label>
                    ))}
                  </div>
                  <button onClick={() => toast.success('Migration started! This may take a few minutes.')} className="w-full py-3 bg-[#D35400] text-white text-sm font-bold rounded-xl hover:bg-orange-700 transition-all">
                    Start Migration
                  </button>
                </div>
              </div>
            )}

            {!['roles', 'general', 'security', 'migration'].includes(activeSection) && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
                <Settings size={40} className="mx-auto mb-3 text-[#E5E7EB]" />
                <p className="font-medium text-[#1F2937]">{SETTINGS_NAV.find(n => n.id === activeSection)?.label}</p>
                <p className="text-sm text-[#6B7280] mt-1">Configuration options for this section</p>
                <button onClick={() => toast.success('Settings saved')} className="mt-4 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
