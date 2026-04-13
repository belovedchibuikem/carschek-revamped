'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Shield, Users, FileText, Mail, MessageSquare, Bell, Settings, Key, Webhook, CreditCard, Lock, Globe, Clock, Search, Download, Filter, Check, X, AlertTriangle, Edit, Trash2, Send, UserPlus, ChevronDown, Save, RotateCcw, Info, Plus, Eye, EyeOff, Copy, Smartphone, Monitor, Tablet, MapPin, AlertCircle, CheckCircle, XCircle, Phone, Zap, Activity } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type SettingsSection = 'roles' | 'team' | 'audit' | 'email-templates' | 'sms' | 'notifications' | 'general' | 'api-keys' | 'webhooks' | 'billing' | '2fa' | 'ip-allowlist' | 'sessions';

// ─── Permissions Data ─────────────────────────────────────────────────────────
const PERMISSION_MODULES = [
  {
    module: 'ORDERS',
    permissions: [
      { key: 'orders.view', label: 'View' },
      { key: 'orders.create', label: 'Create' },
      { key: 'orders.edit', label: 'Edit' },
      { key: 'orders.assign', label: 'Assign Inspector' },
      { key: 'orders.cancel', label: 'Cancel' },
      { key: 'orders.export', label: 'Export' },
    ],
  },
  {
    module: 'REPORTS',
    permissions: [
      { key: 'reports.view', label: 'View' },
      { key: 'reports.approve', label: 'Approve' },
      { key: 'reports.reject', label: 'Reject' },
      { key: 'reports.edit', label: 'Edit' },
      { key: 'reports.resend', label: 'Resend' },
    ],
  },
  {
    module: 'CARS',
    permissions: [
      { key: 'cars.view', label: 'View' },
      { key: 'cars.create', label: 'Register Car' },
      { key: 'cars.edit', label: 'Edit' },
      { key: 'cars.grade', label: 'Grade Car' },
      { key: 'cars.delete', label: 'Delete' },
      { key: 'cars.export', label: 'Export' },
    ],
  },
  {
    module: 'AUCTIONS',
    permissions: [
      { key: 'auctions.view', label: 'View' },
      { key: 'auctions.create', label: 'Start Auction' },
      { key: 'auctions.manage', label: 'Manage Bids' },
      { key: 'auctions.close', label: 'Close / Cancel' },
    ],
  },
  {
    module: 'CRM',
    permissions: [
      { key: 'crm.view', label: 'View Contacts' },
      { key: 'crm.create', label: 'Add Contact' },
      { key: 'crm.edit', label: 'Edit Contact' },
      { key: 'crm.log_comm', label: 'Log Communication' },
      { key: 'crm.delete', label: 'Delete Contact' },
    ],
  },
  {
    module: 'OFFERS',
    permissions: [
      { key: 'offers.view', label: 'View' },
      { key: 'offers.create', label: 'Create Offer' },
      { key: 'offers.send', label: 'Send Offer' },
      { key: 'offers.record_response', label: 'Record Response' },
      { key: 'offers.delete', label: 'Delete' },
    ],
  },
  {
    module: 'REFERENCE DATA',
    permissions: [
      { key: 'refdata.view', label: 'View' },
      { key: 'refdata.create', label: 'Add Brand / Model / Year' },
      { key: 'refdata.edit', label: 'Edit' },
      { key: 'refdata.delete', label: 'Delete' },
    ],
  },
  {
    module: 'INVOICES',
    permissions: [
      { key: 'invoices.view', label: 'View' },
      { key: 'invoices.create', label: 'Create' },
      { key: 'invoices.send', label: 'Send' },
      { key: 'invoices.mark_paid', label: 'Mark as Paid' },
      { key: 'invoices.delete', label: 'Delete' },
    ],
  },
  {
    module: 'DOCUMENT COMPLIANCE',
    permissions: [
      { key: 'docs.view', label: 'View Documents' },
      { key: 'docs.upload', label: 'Upload' },
      { key: 'docs.approve', label: 'Approve' },
      { key: 'docs.reject', label: 'Reject' },
      { key: 'docs.request_reupload', label: 'Request Re-upload' },
    ],
  },
  {
    module: 'CUSTOMERS',
    permissions: [
      { key: 'customers.view', label: 'View' },
      { key: 'customers.edit', label: 'Edit' },
      { key: 'customers.suspend', label: 'Suspend' },
      { key: 'customers.export', label: 'Export Data' },
      { key: 'customers.delete', label: 'Delete' },
    ],
  },
  {
    module: 'FINANCE',
    permissions: [
      { key: 'finance.view_revenue', label: 'View Revenue' },
      { key: 'finance.process_payouts', label: 'Process Payouts' },
      { key: 'finance.issue_refunds', label: 'Issue Refunds' },
      { key: 'finance.create_invoices', label: 'Create Invoices' },
    ],
  },
  {
    module: 'INSPECTORS',
    permissions: [
      { key: 'inspectors.view', label: 'View' },
      { key: 'inspectors.create', label: 'Create' },
      { key: 'inspectors.edit', label: 'Edit' },
      { key: 'inspectors.deactivate', label: 'Deactivate' },
    ],
  },
  {
    module: 'SETTINGS',
    permissions: [
      { key: 'settings.view', label: 'View' },
      { key: 'settings.edit', label: 'Edit' },
    ],
  },
];

const ROLES = ['Super Admin', 'Ops Manager', 'Inspector', 'Finance', 'Support'];

const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  'Super Admin': Object.fromEntries(
    PERMISSION_MODULES.flatMap(m => m.permissions.map(p => [p.key, true]))
  ),
  'Ops Manager': {
    // Orders
    'orders.view': true, 'orders.create': true, 'orders.edit': true, 'orders.assign': true, 'orders.cancel': true, 'orders.export': true,
    // Reports
    'reports.view': true, 'reports.approve': true, 'reports.reject': true, 'reports.edit': true, 'reports.resend': true,
    // Cars
    'cars.view': true, 'cars.create': true, 'cars.edit': true, 'cars.grade': true, 'cars.delete': false, 'cars.export': true,
    // Auctions
    'auctions.view': true, 'auctions.create': true, 'auctions.manage': true, 'auctions.close': true,
    // CRM
    'crm.view': true, 'crm.create': true, 'crm.edit': true, 'crm.log_comm': true, 'crm.delete': false,
    // Offers
    'offers.view': true, 'offers.create': true, 'offers.send': true, 'offers.record_response': true, 'offers.delete': false,
    // Reference Data
    'refdata.view': true, 'refdata.create': true, 'refdata.edit': true, 'refdata.delete': false,
    // Invoices
    'invoices.view': true, 'invoices.create': true, 'invoices.send': true, 'invoices.mark_paid': true, 'invoices.delete': false,
    // Document Compliance
    'docs.view': true, 'docs.upload': true, 'docs.approve': true, 'docs.reject': true, 'docs.request_reupload': true,
    // Customers
    'customers.view': true, 'customers.edit': true, 'customers.suspend': false, 'customers.export': true, 'customers.delete': false,
    // Finance
    'finance.view_revenue': true, 'finance.process_payouts': true, 'finance.issue_refunds': true, 'finance.create_invoices': true,
    // Inspectors
    'inspectors.view': true, 'inspectors.create': true, 'inspectors.edit': true, 'inspectors.deactivate': false,
    // Settings
    'settings.view': true, 'settings.edit': false,
  },
  'Inspector': {
    // Orders
    'orders.view': true, 'orders.create': false, 'orders.edit': false, 'orders.assign': false, 'orders.cancel': false, 'orders.export': false,
    // Reports
    'reports.view': true, 'reports.approve': false, 'reports.reject': false, 'reports.edit': true, 'reports.resend': false,
    // Cars
    'cars.view': true, 'cars.create': false, 'cars.edit': false, 'cars.grade': true, 'cars.delete': false, 'cars.export': false,
    // Auctions
    'auctions.view': true, 'auctions.create': false, 'auctions.manage': false, 'auctions.close': false,
    // CRM
    'crm.view': true, 'crm.create': false, 'crm.edit': false, 'crm.log_comm': false, 'crm.delete': false,
    // Offers
    'offers.view': false, 'offers.create': false, 'offers.send': false, 'offers.record_response': false, 'offers.delete': false,
    // Reference Data
    'refdata.view': true, 'refdata.create': false, 'refdata.edit': false, 'refdata.delete': false,
    // Invoices
    'invoices.view': false, 'invoices.create': false, 'invoices.send': false, 'invoices.mark_paid': false, 'invoices.delete': false,
    // Document Compliance
    'docs.view': true, 'docs.upload': true, 'docs.approve': false, 'docs.reject': false, 'docs.request_reupload': false,
    // Customers
    'customers.view': true, 'customers.edit': false, 'customers.suspend': false, 'customers.export': false, 'customers.delete': false,
    // Finance
    'finance.view_revenue': false, 'finance.process_payouts': false, 'finance.issue_refunds': false, 'finance.create_invoices': false,
    // Inspectors
    'inspectors.view': true, 'inspectors.create': false, 'inspectors.edit': false, 'inspectors.deactivate': false,
    // Settings
    'settings.view': false, 'settings.edit': false,
  },
  'Finance': {
    // Orders
    'orders.view': true, 'orders.create': false, 'orders.edit': false, 'orders.assign': false, 'orders.cancel': false, 'orders.export': true,
    // Reports
    'reports.view': true, 'reports.approve': false, 'reports.reject': false, 'reports.edit': false, 'reports.resend': false,
    // Cars
    'cars.view': true, 'cars.create': false, 'cars.edit': false, 'cars.grade': false, 'cars.delete': false, 'cars.export': true,
    // Auctions
    'auctions.view': true, 'auctions.create': false, 'auctions.manage': false, 'auctions.close': false,
    // CRM
    'crm.view': true, 'crm.create': false, 'crm.edit': false, 'crm.log_comm': false, 'crm.delete': false,
    // Offers
    'offers.view': true, 'offers.create': false, 'offers.send': false, 'offers.record_response': false, 'offers.delete': false,
    // Reference Data
    'refdata.view': true, 'refdata.create': false, 'refdata.edit': false, 'refdata.delete': false,
    // Invoices
    'invoices.view': true, 'invoices.create': true, 'invoices.send': true, 'invoices.mark_paid': true, 'invoices.delete': false,
    // Document Compliance
    'docs.view': true, 'docs.upload': false, 'docs.approve': false, 'docs.reject': false, 'docs.request_reupload': false,
    // Customers
    'customers.view': true, 'customers.edit': false, 'customers.suspend': false, 'customers.export': true, 'customers.delete': false,
    // Finance
    'finance.view_revenue': true, 'finance.process_payouts': true, 'finance.issue_refunds': true, 'finance.create_invoices': true,
    // Inspectors
    'inspectors.view': true, 'inspectors.create': false, 'inspectors.edit': false, 'inspectors.deactivate': false,
    // Settings
    'settings.view': true, 'settings.edit': false,
  },
  'Support': {
    // Orders
    'orders.view': true, 'orders.create': false, 'orders.edit': false, 'orders.assign': false, 'orders.cancel': false, 'orders.export': false,
    // Reports
    'reports.view': true, 'reports.approve': false, 'reports.reject': false, 'reports.edit': false, 'reports.resend': true,
    // Cars
    'cars.view': true, 'cars.create': false, 'cars.edit': false, 'cars.grade': false, 'cars.delete': false, 'cars.export': false,
    // Auctions
    'auctions.view': true, 'auctions.create': false, 'auctions.manage': false, 'auctions.close': false,
    // CRM
    'crm.view': true, 'crm.create': true, 'crm.edit': true, 'crm.log_comm': true, 'crm.delete': false,
    // Offers
    'offers.view': true, 'offers.create': false, 'offers.send': false, 'offers.record_response': true, 'offers.delete': false,
    // Reference Data
    'refdata.view': true, 'refdata.create': false, 'refdata.edit': false, 'refdata.delete': false,
    // Invoices
    'invoices.view': true, 'invoices.create': false, 'invoices.send': false, 'invoices.mark_paid': false, 'invoices.delete': false,
    // Document Compliance
    'docs.view': true, 'docs.upload': false, 'docs.approve': false, 'docs.reject': false, 'docs.request_reupload': true,
    // Customers
    'customers.view': true, 'customers.edit': true, 'customers.suspend': false, 'customers.export': false, 'customers.delete': false,
    // Finance
    'finance.view_revenue': false, 'finance.process_payouts': false, 'finance.issue_refunds': false, 'finance.create_invoices': false,
    // Inspectors
    'inspectors.view': true, 'inspectors.create': false, 'inspectors.edit': false, 'inspectors.deactivate': false,
    // Settings
    'settings.view': false, 'settings.edit': false,
  },
};

// ─── Team Members Data ────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
  { id: 1, name: 'Promise Ndem', email: 'promise@carschek.com', role: 'Super Admin', status: 'Active', lastActive: '2 min ago', avatar: 'PN' },
  { id: 2, name: 'Chidi Okonkwo', email: 'chidi@carschek.com', role: 'Ops Manager', status: 'Active', lastActive: '1h ago', avatar: 'CO' },
  { id: 3, name: 'Fatima Bello', email: 'fatima@carschek.com', role: 'Finance', status: 'Active', lastActive: '3h ago', avatar: 'FB' },
  { id: 4, name: 'Seun Adebayo', email: 'seun@carschek.com', role: 'Support', status: 'Active', lastActive: 'Yesterday', avatar: 'SA' },
  { id: 5, name: 'Ngozi Okafor', email: 'ngozi@carschek.com', role: 'Ops Manager', status: 'Suspended', lastActive: '3 days ago', avatar: 'NO' },
];

const PENDING_INVITES = [
  { email: 'tunde@carschek.com', role: 'Inspector', sentAt: '2h ago' },
  { email: 'amaka@partner.ng', role: 'Support', sentAt: '1 day ago' },
];

// ─── Audit Log Data ───────────────────────────────────────────────────────────
const AUDIT_LOGS = [
  { id: 1, timestamp: '2026-04-10 22:45:12', actor: 'Promise Ndem', actorAvatar: 'PN', action: 'Edit', target: 'Permission: orders.cancel for Ops Manager', ip: '197.210.54.12', details: { before: '{ "enabled": false }', after: '{ "enabled": true }' } },
  { id: 2, timestamp: '2026-04-10 21:30:05', actor: 'Chidi Okonkwo', actorAvatar: 'CO', action: 'Login', target: 'Admin Portal', ip: '41.58.120.33', details: null },
  { id: 3, timestamp: '2026-04-10 20:15:44', actor: 'Promise Ndem', actorAvatar: 'PN', action: 'Create', target: 'Team Member: Seun Adebayo (Support)', ip: '197.210.54.12', details: { before: null, after: '{ "email": "seun@carschek.com", "role": "Support" }' } },
  { id: 4, timestamp: '2026-04-10 18:02:11', actor: 'Fatima Bello', actorAvatar: 'FB', action: 'Export', target: 'Payment Records CSV (April 2026)', ip: '105.112.88.21', details: null },
  { id: 5, timestamp: '2026-04-10 16:45:30', actor: 'Chidi Okonkwo', actorAvatar: 'CO', action: 'Approve', target: 'Report #CS-2026-4521', ip: '41.58.120.33', details: { before: '{ "status": "QA Review" }', after: '{ "status": "Approved" }' } },
  { id: 6, timestamp: '2026-04-10 15:20:08', actor: 'Promise Ndem', actorAvatar: 'PN', action: 'Delete', target: 'Customer: Emeka Test (ID: C-9901)', ip: '197.210.54.12', details: { before: '{ "id": "C-9901", "email": "test@test.com" }', after: null } },
  { id: 7, timestamp: '2026-04-10 14:10:55', actor: 'Fatima Bello', actorAvatar: 'FB', action: 'Edit', target: 'General Settings: Platform Name', ip: '105.112.88.21', details: { before: '{ "name": "Carschek" }', after: '{ "name": "Carschek Nigeria" }' } },
  { id: 8, timestamp: '2026-04-10 12:05:22', actor: 'Seun Adebayo', actorAvatar: 'SA', action: 'Login', target: 'Admin Portal', ip: '102.89.45.67', details: null },
];

// ─── Sub Navigation ───────────────────────────────────────────────────────────
const SETTINGS_NAV = [
  {
    group: 'User & Access',
    items: [
      { key: 'roles' as SettingsSection, label: 'Roles & Permissions', icon: Shield },
      { key: 'team' as SettingsSection, label: 'Team Members', icon: Users },
      { key: 'audit' as SettingsSection, label: 'Audit Log', icon: FileText },
    ],
  },
  {
    group: 'Communications',
    items: [
      { key: 'email-templates' as SettingsSection, label: 'Email Templates', icon: Mail },
      { key: 'sms' as SettingsSection, label: 'SMS Settings', icon: MessageSquare },
      { key: 'notifications' as SettingsSection, label: 'Notification Rules', icon: Bell },
    ],
  },
  {
    group: 'System',
    items: [
      { key: 'general' as SettingsSection, label: 'General Settings', icon: Settings },
      { key: 'api-keys' as SettingsSection, label: 'API Keys', icon: Key },
      { key: 'webhooks' as SettingsSection, label: 'Webhooks', icon: Webhook },
      { key: 'billing' as SettingsSection, label: 'Billing', icon: CreditCard },
    ],
  },
  {
    group: 'Security',
    items: [
      { key: '2fa' as SettingsSection, label: '2FA Policy', icon: Lock },
      { key: 'ip-allowlist' as SettingsSection, label: 'IP Allowlist', icon: Globe },
      { key: 'sessions' as SettingsSection, label: 'Session Management', icon: Clock },
    ],
  },
];

// ─── Toggle Switch Component ──────────────────────────────────────────────────
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${enabled ? 'bg-[#1E3A5F]' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

// ─── Save Bar Component ───────────────────────────────────────────────────────
function SaveBar({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return (
    <div className="flex justify-end mt-6 pt-6 border-t border-[#E5E7EB]">
      <button
        onClick={onSave}
        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${saved ? 'bg-[#1A7A4A] text-white' : 'bg-[#1E3A5F] text-white hover:bg-[#2E75B6]'}`}
      >
        {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
      </button>
    </div>
  );
}

// ─── Roles & Permissions Page ─────────────────────────────────────────────────
function RolesPermissionsPage() {
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(DEFAULT_PERMISSIONS);
  const [changes, setChanges] = useState<number>(0);

  const toggle = (role: string, permKey: string) => {
    if (role === 'Super Admin') return;
    setPermissions(prev => ({
      ...prev,
      [role]: { ...prev[role], [permKey]: !prev[role][permKey] },
    }));
    setChanges(c => c + 1);
  };

  const resetToDefaults = () => {
    setPermissions(DEFAULT_PERMISSIONS);
    setChanges(0);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1F2937]">Roles & Permissions</h2>
        <p className="text-sm text-[#6B7280] mt-1">Control what each role can access and perform across the platform.</p>
      </div>
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-48">Permission</th>
                {ROLES.map(role => (
                  <th key={role} className="px-4 py-4 text-center min-w-[120px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${role === 'Super Admin' ? 'bg-amber-100 text-amber-700' : role === 'Ops Manager' ? 'bg-blue-100 text-blue-700' : role === 'Inspector' ? 'bg-teal-100 text-teal-700' : role === 'Finance' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{role}</span>
                      {role === 'Super Admin' && <span className="text-[10px] text-[#6B7280]">Locked</span>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_MODULES.map((mod, mIdx) => (
                <React.Fragment key={mod.module}>
                  <tr className="bg-[#F4F6F8]">
                    <td colSpan={ROLES.length + 1} className="px-6 py-2">
                      <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest">{mod.module}</span>
                    </td>
                  </tr>
                  {mod.permissions.map((perm, pIdx) => (
                    <tr key={perm.key} className={`border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors ${pIdx === mod.permissions.length - 1 && mIdx < PERMISSION_MODULES.length - 1 ? 'border-b-2' : ''}`}>
                      <td className="px-6 py-3 text-sm text-[#374151]">{perm.label}</td>
                      {ROLES.map(role => {
                        const enabled = permissions[role]?.[perm.key] ?? false;
                        const isLocked = role === 'Super Admin';
                        return (
                          <td key={role} className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggle(role, perm.key)}
                              disabled={isLocked}
                              className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' : enabled ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer'}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-gray-400' : enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                              {isLocked ? 'On' : enabled ? 'On' : 'Off'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="sticky bottom-0 mt-4 bg-white border border-[#E5E7EB] rounded-xl px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          {changes > 0 ? (
            <span className="flex items-center gap-2 text-sm text-[#D35400] font-medium"><AlertTriangle size={16} />{changes} permission{changes !== 1 ? 's' : ''} modified — unsaved</span>
          ) : (
            <span className="text-sm text-[#6B7280]">No unsaved changes</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={resetToDefaults} className="flex items-center gap-2 px-4 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F8] transition-colors">
            <RotateCcw size={14} />Reset to Defaults
          </button>
          <button onClick={() => setChanges(0)} className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all ${changes > 0 ? 'bg-[#1E3A5F] text-white hover:bg-[#2E75B6]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`} disabled={changes === 0}>
            <Save size={14} />Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Team Members Page ────────────────────────────────────────────────────────
function TeamMembersPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Inspector');
  const [members] = useState(TEAM_MEMBERS);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1F2937]">Team Members</h2>
          <p className="text-sm text-[#6B7280] mt-1">Manage admin portal access for your team.</p>
        </div>
        <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-lg hover:bg-[#2E75B6] transition-colors">
          <UserPlus size={16} />Invite Team Member
        </button>
      </div>
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Member</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Last Active</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{member.avatar}</div>
                      <div>
                        <p className="text-sm font-semibold text-[#1F2937]">{member.name}</p>
                        <p className="text-xs text-[#6B7280]">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select defaultValue={member.role} className="text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" style={{ background: 'transparent' }}>
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />{member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{member.lastActive}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#6B7280] hover:text-[#1E3A5F] hover:bg-[#F4F6F8] rounded-lg transition-colors"><Edit size={14} /></button>
                      <button className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#6B7280] hover:text-[#D35400] hover:bg-orange-50 rounded-lg transition-colors"><Lock size={14} /></button>
                      <button className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#6B7280] hover:text-[#C0392B] hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-semibold text-[#1F2937]">Pending Invitations</h3>
        </div>
        {PENDING_INVITES.map((invite, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F4F6F8] border-2 border-dashed border-[#E5E7EB] flex items-center justify-center"><Mail size={14} className="text-[#6B7280]" /></div>
              <div>
                <p className="text-sm font-medium text-[#1F2937]">{invite.email}</p>
                <p className="text-xs text-[#6B7280]">Invited as {invite.role} · {invite.sentAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#2E75B6] border border-[#2E75B6]/30 rounded-lg hover:bg-blue-50 transition-colors"><Send size={12} />Resend</button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#C0392B] border border-red-200 rounded-lg hover:bg-red-50 transition-colors"><X size={12} />Cancel</button>
            </div>
          </div>
        ))}
      </div>
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB]">
              <h3 className="text-lg font-bold text-[#1F2937]">Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-1.5 hover:bg-[#F4F6F8] rounded-lg"><X size={18} className="text-[#6B7280]" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Email Address</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@carschek.com" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6] bg-white">
                  {ROLES.filter(r => r !== 'Super Admin').map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
                <Info size={14} className="text-[#2E75B6] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#2E75B6]">An invitation email will be sent. The link expires in 48 hours.</p>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#E5E7EB]">
              <button onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F8] transition-colors">Cancel</button>
              <button onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2E75B6] transition-colors">Send Invitation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Audit Log Page ───────────────────────────────────────────────────────────
function AuditLogPage() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const actionColors: Record<string, string> = {
    Login: 'bg-blue-100 text-blue-700',
    Create: 'bg-green-100 text-green-700',
    Edit: 'bg-amber-100 text-amber-700',
    Delete: 'bg-red-100 text-red-700',
    Approve: 'bg-teal-100 text-teal-700',
    Export: 'bg-purple-100 text-purple-700',
  };

  const filtered = AUDIT_LOGS.filter(log => {
    const matchSearch = !searchQuery || log.actor.toLowerCase().includes(searchQuery.toLowerCase()) || log.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAction = actionFilter === 'All' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1F2937]">Audit Log</h2>
          <p className="text-sm text-[#6B7280] mt-1">Complete record of all admin actions on the platform.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F8] transition-colors text-[#374151]">
          <Download size={14} />Export CSV
        </button>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input type="text" placeholder="Search by actor or action..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6] bg-white" />
        </div>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 bg-white text-[#374151]">
          {['All', 'Login', 'Create', 'Edit', 'Delete', 'Approve', 'Export'].map(a => <option key={a}>{a}</option>)}
        </select>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F8] transition-colors text-[#6B7280]">
          <Filter size={14} />Date Range
        </button>
      </div>
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Timestamp</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Actor</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Action</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Target</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">IP Address</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <React.Fragment key={log.id}>
                <tr className={`border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors cursor-pointer ${expandedRow === log.id ? 'bg-blue-50/50' : ''}`} onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}>
                  <td className="px-6 py-3 text-xs font-mono text-[#6B7280] whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-[10px] font-bold">{log.actorAvatar}</div>
                      <span className="text-sm text-[#1F2937]">{log.actor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>{log.action}</span></td>
                  <td className="px-6 py-3 text-sm text-[#374151] max-w-xs truncate">{log.target}</td>
                  <td className="px-6 py-3 text-xs font-mono text-[#6B7280]">{log.ip}</td>
                  <td className="px-6 py-3 text-right">
                    {log.details ? <ChevronDown size={16} className={`text-[#6B7280] transition-transform ${expandedRow === log.id ? 'rotate-180' : ''}`} /> : <span className="text-xs text-[#6B7280]">—</span>}
                  </td>
                </tr>
                {expandedRow === log.id && log.details && (
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        {log.details.before && (
                          <div>
                            <p className="text-xs font-semibold text-[#C0392B] mb-2 uppercase tracking-wider">Before</p>
                            <pre className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs font-mono text-[#C0392B] overflow-x-auto">{JSON.stringify(JSON.parse(log.details.before), null, 2)}</pre>
                          </div>
                        )}
                        {log.details.after && (
                          <div>
                            <p className="text-xs font-semibold text-[#1A7A4A] mb-2 uppercase tracking-wider">After</p>
                            <pre className="bg-green-50 border border-green-100 rounded-lg p-3 text-xs font-mono text-[#1A7A4A] overflow-x-auto">{JSON.stringify(JSON.parse(log.details.after), null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Email Templates Page ─────────────────────────────────────────────────────
const EMAIL_TEMPLATES = [
  { id: 1, name: 'Inspection Booked', trigger: 'Order Created', lastModified: '2 days ago', status: 'Published' },
  { id: 2, name: 'Inspector Assigned', trigger: 'Inspector Assigned', lastModified: '5 days ago', status: 'Published' },
  { id: 3, name: 'Inspection In Progress', trigger: 'Status: In Progress', lastModified: '1 week ago', status: 'Published' },
  { id: 4, name: 'Report Ready', trigger: 'Report Approved', lastModified: '3 days ago', status: 'Published' },
  { id: 5, name: 'Payment Received', trigger: 'Payment Success', lastModified: '1 week ago', status: 'Published' },
  { id: 6, name: 'Re-inspection Reminder', trigger: 'Report Expiring (7 days)', lastModified: '2 weeks ago', status: 'Draft' },
  { id: 7, name: 'Account Suspended', trigger: 'Account Suspended', lastModified: '1 month ago', status: 'Published' },
  { id: 8, name: 'Welcome Email', trigger: 'New Customer Registration', lastModified: '1 month ago', status: 'Published' },
];

const TEMPLATE_VARIABLES = ['{{customer_name}}', '{{order_id}}', '{{inspector_name}}', '{{report_link}}', '{{booking_date}}'];

function EmailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [mobilePreview, setMobilePreview] = useState(false);
  const [subject, setSubject] = useState('Your Carschek Inspection is Confirmed — Order #{{order_id}}');
  const [body, setBody] = useState(`Dear {{customer_name}},

Thank you for booking a Carschek vehicle inspection. Your order has been confirmed.

Order Details:
• Order ID: {{order_id}}
• Scheduled Date: {{booking_date}}
• Inspector: {{inspector_name}}

Our certified inspector will arrive at the agreed location. You will receive a notification when the inspection begins.

View your order details: {{report_link}}

Best regards,
The Carschek Team`);
  const [testEmail, setTestEmail] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const active = selectedTemplate !== null ? EMAIL_TEMPLATES.find(t => t.id === selectedTemplate) : null;

  const insertVariable = (v: string) => {
    setBody(prev => prev + ' ' + v);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1F2937]">Email Templates</h2>
        <p className="text-sm text-[#6B7280] mt-1">Manage transactional email templates with dynamic variable insertion.</p>
      </div>
      <div className="flex gap-6">
        {/* Template List */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            {EMAIL_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setSelectedTemplate(t.id)} className={`w-full text-left px-4 py-3.5 border-b border-[#E5E7EB] last:border-0 transition-colors ${selectedTemplate === t.id ? 'bg-[#EEF2FF] border-l-2 border-l-[#1E3A5F]' : 'hover:bg-[#F9FAFB]'}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`text-sm font-medium ${selectedTemplate === t.id ? 'text-[#1E3A5F]' : 'text-[#1F2937]'}`}>{t.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${t.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</span>
                </div>
                <p className="text-xs text-[#6B7280]">{t.trigger}</p>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">{t.lastModified}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        {active ? (
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2937]">{active.name}</h3>
                  <p className="text-xs text-[#6B7280]">Trigger: {active.trigger}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-[#F4F6F8] rounded-lg p-0.5">
                    <button onClick={() => setPreviewMode('edit')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${previewMode === 'edit' ? 'bg-white text-[#1F2937] shadow-sm' : 'text-[#6B7280]'}`}>Edit</button>
                    <button onClick={() => setPreviewMode('preview')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${previewMode === 'preview' ? 'bg-white text-[#1F2937] shadow-sm' : 'text-[#6B7280]'}`}>Preview</button>
                  </div>
                  <button onClick={() => setMobilePreview(!mobilePreview)} className={`p-2 rounded-lg border transition-colors ${mobilePreview ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'border-[#E5E7EB] text-[#6B7280] hover:bg-[#F4F6F8]'}`}>
                    <Smartphone size={14} />
                  </button>
                </div>
              </div>

              {previewMode === 'edit' ? (
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">Subject Line</label>
                    <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6]" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-[#374151]">Email Body</label>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-[#6B7280] mr-1">Insert variable:</span>
                        {TEMPLATE_VARIABLES.map(v => (
                          <button key={v} onClick={() => insertVariable(v)} className="text-[10px] px-2 py-0.5 bg-blue-50 text-[#2E75B6] rounded border border-blue-100 hover:bg-blue-100 transition-colors font-mono">{v}</button>
                        ))}
                      </div>
                    </div>
                    <textarea value={body} onChange={e => setBody(e.target.value)} rows={12} className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6] font-mono resize-none" />
                  </div>
                </div>
              ) : (
                <div className={`p-5 ${mobilePreview ? 'flex justify-center' : ''}`}>
                  <div className={`${mobilePreview ? 'w-80' : 'w-full'} bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] overflow-hidden`}>
                    <div className="bg-[#1E3A5F] px-5 py-3">
                      <p className="text-white text-xs font-semibold">Carschek Nigeria</p>
                      <p className="text-blue-200 text-xs mt-0.5">Subject: {subject.replace('{{order_id}}', 'CS-2026-4521').replace('{{customer_name}}', 'Adaeze Mensah')}</p>
                    </div>
                    <div className="p-5">
                      <pre className="text-sm text-[#374151] whitespace-pre-wrap font-sans leading-relaxed">
                        {body.replace('{{customer_name}}', 'Adaeze Mensah').replace('{{order_id}}', 'CS-2026-4521').replace('{{booking_date}}', 'April 15, 2026').replace('{{inspector_name}}', 'Emeka Obi').replace('{{report_link}}', 'https://carschek.com/report/CS-2026-4521')}
                      </pre>
                    </div>
                    <div className="bg-[#F4F6F8] px-5 py-3 border-t border-[#E5E7EB]">
                      <p className="text-[10px] text-[#9CA3AF] text-center">© 2026 Carschek Nigeria · info@carschek.com · +234 817 362 4953</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between px-5 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                <button onClick={() => setShowTestModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F8] transition-colors text-[#374151]">
                  <Send size={14} />Send Test Email
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${active.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{active.status}</span>
                  <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${saved ? 'bg-[#1A7A4A] text-white' : 'bg-[#1E3A5F] text-white hover:bg-[#2E75B6]'}`}>
                    {saved ? <><Check size={14} />Saved</> : <><Save size={14} />Save & Publish</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center py-20 text-center">
            <div>
              <Mail size={40} className="text-[#E5E7EB] mx-auto mb-3" />
              <p className="text-sm text-[#6B7280]">Select a template to edit</p>
            </div>
          </div>
        )}
      </div>

      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-base font-bold text-[#1F2937] mb-4">Send Test Email</h3>
            <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="your@email.com" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowTestModal(false)} className="flex-1 px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={() => setShowTestModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2E75B6]">Send Test</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SMS Settings Page ────────────────────────────────────────────────────────
function SMSSettingsPage() {
  const [provider, setProvider] = useState<'termii' | 'twilio' | 'africastalking'>('termii');
  const [senderId, setSenderId] = useState('CARSCHEK');
  const [apiKey, setApiKey] = useState('TL_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  const [showKey, setShowKey] = useState(false);
  const [testPhone, setTestPhone] = useState('+234');
  const [testMessage, setTestMessage] = useState('This is a test SMS from Carschek Nigeria.');
  const [testSent, setTestSent] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [deliveryReports, setDeliveryReports] = useState(true);
  const [unicode, setUnicode] = useState(false);
  const [saved, setSaved] = useState(false);

  const providers = [
    { id: 'termii', name: 'Termii', desc: 'Nigerian SMS gateway — recommended', logo: '🇳🇬' },
    { id: 'twilio', name: 'Twilio', desc: 'Global SMS provider', logo: '🌐' },
    { id: 'africastalking', name: "Africa\'s Talking", desc: 'Pan-African SMS gateway', logo: '🌍' },
  ];

  const SMS_STATS = [
    { label: 'Sent This Month', value: '4,231', color: 'text-[#1E3A5F]' },
    { label: 'Delivered', value: '4,187', color: 'text-green-600' },
    { label: 'Failed', value: '44', color: 'text-red-600' },
    { label: 'Delivery Rate', value: '98.96%', color: 'text-teal-600' },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1F2937]">SMS Settings</h2>
        <p className="text-sm text-[#6B7280] mt-1">Configure your SMS provider, sender ID, and delivery preferences.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {SMS_STATS.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {/* Provider Selection */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-4 flex items-center gap-2"><Phone size={15} className="text-[#2E75B6]" />SMS Provider</h3>
          <div className="space-y-2">
            {providers.map(p => (
              <label key={p.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${provider === p.id ? 'border-[#1E3A5F] bg-[#EEF2FF]' : 'border-[#E5E7EB] hover:bg-[#F9FAFB]'}`}>
                <input type="radio" name="provider" value={p.id} checked={provider === p.id} onChange={() => setProvider(p.id as typeof provider)} className="sr-only" />
                <span className="text-xl">{p.logo}</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${provider === p.id ? 'text-[#1E3A5F]' : 'text-[#1F2937]'}`}>{p.name}</p>
                  <p className="text-xs text-[#6B7280]">{p.desc}</p>
                </div>
                {provider === p.id && <Check size={16} className="text-[#1E3A5F]" />}
              </label>
            ))}
          </div>
        </div>

        {/* Credentials */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-4 flex items-center gap-2"><Key size={15} className="text-[#2E75B6]" />API Credentials</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Sender ID / From Name</label>
              <input value={senderId} onChange={e => setSenderId(e.target.value)} maxLength={11} className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6]" />
              <p className="text-xs text-[#6B7280] mt-1">Max 11 characters. Must be registered with your provider.</p>
            </div>
            <div className="relative">
              <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full px-3 py-2.5 pr-20 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6] font-mono" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => setShowKey(!showKey)} className="p-1 text-[#6B7280] hover:text-[#1F2937] transition-colors">{showKey ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                <button onClick={() => navigator.clipboard?.writeText(apiKey)} className="p-1 text-[#6B7280] hover:text-[#1F2937] rounded transition-colors"><Copy size={14} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-4 flex items-center gap-2"><Settings size={15} className="text-[#2E75B6]" />Delivery Preferences</h3>
          <div className="space-y-4">
            {[
              { label: 'Enable SMS Notifications', desc: 'Send SMS for all configured notification events', val: smsEnabled, set: setSmsEnabled },
              { label: 'Delivery Reports', desc: 'Request delivery confirmation from provider', val: deliveryReports, set: setDeliveryReports },
              { label: 'Unicode Support', desc: 'Enable for messages with special characters (reduces max length to 70)', val: unicode, set: setUnicode },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-[#374151]">{item.label}</p>
                  <p className="text-xs text-[#6B7280]">{item.desc}</p>
                </div>
                <Toggle enabled={item.val} onChange={() => item.set(!item.val)} />
              </div>
            ))}
          </div>
        </div>

        {/* Test SMS */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-4 flex items-center gap-2"><Send size={15} className="text-[#2E75B6]" />Send Test SMS</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Phone Number</label>
              <input value={testPhone} onChange={e => setTestPhone(e.target.value)} placeholder="+2348012345678" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Message <span className="text-[#6B7280] font-normal">({testMessage.length}/160)</span></label>
              <textarea value={testMessage} onChange={e => setTestMessage(e.target.value)} maxLength={160} rows={3} className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6] resize-none" />
            </div>
            <button onClick={() => { setTestSent(true); setTimeout(() => setTestSent(false), 3000); }} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${testSent ? 'bg-green-600 text-white' : 'bg-[#1E3A5F] text-white hover:bg-[#2E75B6]'}`}>
              {testSent ? <><Check size={14} />SMS Sent!</> : <><Send size={14} />Send Test SMS</>}
            </button>
          </div>
        </div>

        <SaveBar onSave={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} saved={saved} />
      </div>
    </div>
  );
}

// ─── Notification Rules Page ──────────────────────────────────────────────────
interface NotifRule {
  id: string;
  event: string;
  description: string;
  audience: string;
  sms: boolean;
  email: boolean;
  inApp: boolean;
  category: string;
}

const INITIAL_NOTIF_RULES: NotifRule[] = [
  { id: 'order_created', event: 'Order Created', description: 'New inspection booking placed', audience: 'Customer + Ops Team', sms: true, email: true, inApp: true, category: 'Orders' },
  { id: 'inspector_assigned', event: 'Inspector Assigned', description: 'Inspector assigned to an order', audience: 'Customer + Inspector', sms: true, email: true, inApp: true, category: 'Orders' },
  { id: 'inspection_started', event: 'Inspection Started', description: 'Inspector begins the inspection', audience: 'Customer', sms: true, email: false, inApp: true, category: 'Orders' },
  { id: 'inspection_completed', event: 'Inspection Completed', description: 'Inspector submits the report', audience: 'QA Team + Ops', sms: false, email: true, inApp: true, category: 'Orders' },
  { id: 'report_approved', event: 'Report Approved', description: 'QA approves the inspection report', audience: 'Customer + Inspector', sms: true, email: true, inApp: true, category: 'Reports' },
  { id: 'report_rejected', event: 'Report Rejected', description: 'QA rejects and returns for revision', audience: 'Inspector', sms: true, email: true, inApp: true, category: 'Reports' },
  { id: 'report_expiring', event: 'Report Expiring (7 days)', description: 'Report will expire in 7 days', audience: 'Customer', sms: true, email: true, inApp: false, category: 'Reports' },
  { id: 'payment_received', event: 'Payment Received', description: 'Successful payment processed', audience: 'Customer + Finance', sms: false, email: true, inApp: true, category: 'Payments' },
  { id: 'payment_failed', event: 'Payment Failed', description: 'Payment attempt unsuccessful', audience: 'Customer + Finance', sms: true, email: true, inApp: true, category: 'Payments' },
  { id: 'refund_processed', event: 'Refund Processed', description: 'Refund issued to customer', audience: 'Customer', sms: true, email: true, inApp: true, category: 'Payments' },
  { id: 'payout_processed', event: 'Payout Processed', description: 'Inspector payout completed', audience: 'Inspector', sms: true, email: true, inApp: true, category: 'Payments' },
  { id: 'account_suspended', event: 'Account Suspended', description: 'User account suspended by admin', audience: 'Affected User', sms: true, email: true, inApp: false, category: 'System' },
  { id: 'login_new_device', event: 'Login from New Device', description: 'Admin login from unrecognised device', audience: 'Admin User', sms: false, email: true, inApp: true, category: 'System' },
  { id: 'inspector_payout_due', event: 'Payout Due Reminder', description: 'Pending payouts require processing', audience: 'Finance Team', sms: false, email: true, inApp: true, category: 'System' },
];

function NotificationRulesPage() {
  const [rules, setRules] = useState<NotifRule[]>(INITIAL_NOTIF_RULES);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [saved, setSaved] = useState(false);

  const categories = ['All', 'Orders', 'Reports', 'Payments', 'System'];

  const toggle = (id: string, channel: 'sms' | 'email' | 'inApp') => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [channel]: !r[channel] } : r));
  };

  const filtered = categoryFilter === 'All' ? rules : rules.filter(r => r.category === categoryFilter);

  const channelIcon = (channel: string) => {
    if (channel === 'sms') return <MessageSquare size={12} />;
    if (channel === 'email') return <Mail size={12} />;
    return <Bell size={12} />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1F2937]">Notification Rules</h2>
          <p className="text-sm text-[#6B7280] mt-1">Define which events trigger SMS, email, or in-app notifications.</p>
        </div>
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${saved ? 'bg-[#1A7A4A] text-white' : 'bg-[#1E3A5F] text-white hover:bg-[#2E75B6]'}`}>
          {saved ? <><Check size={14} />Saved!</> : <><Save size={14} />Save Rules</>}
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
        <span className="text-xs text-[#6B7280] font-medium">Channels:</span>
        {[{ label: 'SMS', icon: '🔐' }, { label: 'Email', icon: '📱' }, { label: 'In-App', icon: '📧' }].map(c => (
          <div key={c.label} className="flex items-center gap-1.5 text-xs text-[#374151]">{c.icon}<span>{c.label}</span></div>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 mb-4">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${categoryFilter === cat ? 'bg-[#1E3A5F] text-white' : 'bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F4F6F8]'}`}>{cat}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Event</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Audience</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1"><MessageSquare size={12} />SMS</div>
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1"><Mail size={12} />Email</div>
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1"><Bell size={12} />In-App</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((rule, i) => {
              const prevCat = i > 0 ? filtered[i - 1].category : null;
              const showCatHeader = rule.category !== prevCat;
              return (
                <React.Fragment key={rule.id}>
                  {showCatHeader && (
                    <tr className="bg-[#F4F6F8]">
                      <td colSpan={5} className="px-5 py-2">
                        <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest">{rule.category}</span>
                      </td>
                    </tr>
                  )}
                  <tr className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-[#1F2937]">{rule.event}</p>
                      <p className="text-xs text-[#6B7280]">{rule.description}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-[#374151] bg-[#F4F6F8] px-2 py-0.5 rounded-full font-mono">{rule.audience}</span>
                    </td>
                    {(['sms', 'email', 'inApp'] as const).map(ch => (
                      <td key={ch} className="px-4 py-3.5 text-center">
                        <button onClick={() => toggle(rule.id, ch)} className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all ${rule[ch] ? 'bg-[#1E3A5F] text-white' : 'bg-[#F4F6F8] text-[#9CA3AF] hover:bg-[#E5E7EB]'}`}>
                          {channelIcon(ch)}
                        </button>
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── General Settings Page ────────────────────────────────────────────────────
function GeneralSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [platformName, setPlatformName] = useState('Carschek Nigeria');
  const [contactEmail, setContactEmail] = useState('info@carschek.com');
  const [supportPhone, setSupportPhone] = useState('+234 817 362 4953');
  const [timezone, setTimezone] = useState('Africa/Lagos');
  const [defaultSLA, setDefaultSLA] = useState('48');
  const [autoAssign, setAutoAssign] = useState(true);
  const [reportExpiry, setReportExpiry] = useState('90');
  const [autoSendReport, setAutoSendReport] = useState(false);
  const [whiteLabel, setWhiteLabel] = useState(false);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1F2937]">General Settings</h2>
        <p className="text-sm text-[#6B7280] mt-1">Platform-wide configuration. All changes require explicit save.</p>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-4 flex items-center gap-2"><Globe size={16} className="text-[#2E75B6]" />Platform Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Platform Name</label>
              <input value={platformName} onChange={e => setPlatformName(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Contact Email</label>
                <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Support Phone</label>
                <input value={supportPhone} onChange={e => setSupportPhone(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Timezone</label>
              <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 bg-white">
                <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
                <option value="UTC">UTC</option>
                <option value="Africa/Abidjan">Africa/Abidjan</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-4 flex items-center gap-2"><Settings size={16} className="text-[#2E75B6]" />Inspection Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Default SLA Hours</label>
              <div className="flex items-center gap-3">
                <input type="number" value={defaultSLA} onChange={e => setDefaultSLA(e.target.value)} className="w-32 px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6]" />
                <span className="text-sm text-[#6B7280]">hours from booking to completion</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-[#374151]">Auto-Assignment</p>
                <p className="text-xs text-[#6B7280]">Automatically assign nearest available inspector</p>
              </div>
              <Toggle enabled={autoAssign} onChange={() => setAutoAssign(!autoAssign)} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-4 flex items-center gap-2"><FileText size={16} className="text-[#2E75B6]" />Report Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Default Report Expiry</label>
              <div className="flex items-center gap-3">
                <input type="number" value={reportExpiry} onChange={e => setReportExpiry(e.target.value)} className="w-32 px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6]" />
                <span className="text-sm text-[#6B7280]">days from inspection date</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-[#374151]">Auto-Send Report</p>
                <p className="text-xs text-[#6B7280]">Automatically send approved reports to customers</p>
              </div>
              <Toggle enabled={autoSendReport} onChange={() => setAutoSendReport(!autoSendReport)} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-[#374151]">White-Label Reports</p>
                <p className="text-xs text-[#6B7280]">Remove Carschek branding for dealer partners</p>
              </div>
              <Toggle enabled={whiteLabel} onChange={() => setWhiteLabel(!whiteLabel)} />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${saved ? 'bg-[#1A7A4A] text-white' : 'bg-[#1E3A5F] text-white hover:bg-[#2E75B6]'}`}>
            {saved ? <><Check size={16} />Saved!</> : <><Save size={16} />Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── API Keys Page ────────────────────────────────────────────────────────────
interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created: string;
  lastUsed: string;
  status: 'Active' | 'Revoked';
}

const INITIAL_API_KEYS: ApiKey[] = [
  { id: '1', name: 'Production API Key', key: 'csk_live_4xK9mN2pQrT8vW3yZ6aB1cD5eF7gH0iJ', permissions: ['Read Orders', 'Read Reports', 'Read Customers'], created: 'Jan 15, 2026', lastUsed: '2 hours ago', status: 'Active' },
  { id: '2', name: 'Webhook Integration Key', key: 'csk_live_7hU2kL5nO8qR1tV4wX9yA3bC6dE0fG2i', permissions: ['Read Orders', 'Write Webhooks'], created: 'Feb 3, 2026', lastUsed: '5 min ago', status: 'Active' },
  { id: '3', name: 'Analytics Dashboard Key', key: 'csk_live_1aB4cD7eF0gH3iJ6kL9mN2oP5qR8sT1u', permissions: ['Read Reports', 'Read Finance'], created: 'Mar 20, 2026', lastUsed: '1 day ago', status: 'Active' },
  { id: '4', name: 'Old Mobile App Key', key: 'csk_live_9zY6xW3vU0tS7rQ4pO1nM8lK5jI2hG0f', permissions: ['Read Orders', 'Write Reports'], created: 'Nov 10, 2025', lastUsed: '45 days ago', status: 'Revoked' },
];

const API_PERMISSIONS = ['Read Orders', 'Write Orders', 'Read Reports', 'Write Reports', 'Read Customers', 'Write Customers', 'Read Finance', 'Write Webhooks'];

function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_API_KEYS);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPerms, setNewKeyPerms] = useState<string[]>([]);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const maskKey = (key: string) => key.slice(0, 12) + '•'.repeat(20) + key.slice(-4);

  const copyKey = (key: string, id: string) => {
    navigator.clipboard?.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const revokeKey = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'Revoked' as const } : k));
  };

  const createKey = () => {
    const newKey = 'csk_live_' + Math.random().toString(36).slice(2, 34);
    const key: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName || 'New API Key',
      key: newKey,
      permissions: newKeyPerms,
      created: 'Apr 10, 2026',
      lastUsed: 'Never',
      status: 'Active',
    };
    setKeys(prev => [key, ...prev]);
    setCreatedKey(newKey);
    setShowCreate(false);
    setNewKeyName('');
    setNewKeyPerms([]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1F2937]">API Keys</h2>
          <p className="text-sm text-[#6B7280] mt-1">Generate and manage API keys for third-party integrations.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-lg hover:bg-[#2E75B6] transition-colors">
          <Plus size={16} />Create API Key
        </button>
      </div>

      {/* Newly created key banner */}
      {createdKey && (
        <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-800 mb-1">API Key Created — Copy it now!</p>
              <p className="text-xs text-green-700 mb-2">This key will only be shown once. Store it securely.</p>
              <div className="flex items-center gap-2 bg-white rounded-lg border border-green-200 px-3 py-2">
                <code className="text-xs font-mono text-[#1F2937] flex-1 truncate">{createdKey}</code>
                <button onClick={() => { navigator.clipboard?.writeText(createdKey); }} className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 font-medium flex-shrink-0"><Copy size={12} />Copy</button>
              </div>
            </div>
            <button onClick={() => setCreatedKey(null)} className="text-green-600 hover:text-green-800"><X size={16} /></button>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
        <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700">API keys grant programmatic access to Carschek data. Never share keys publicly or commit them to version control.</p>
      </div>

      {/* Keys List */}
      <div className="space-y-3">
        {keys.map(k => (
          <div key={k.id} className={`bg-white rounded-xl border p-5 transition-colors ${k.status === 'Revoked' ? 'border-[#E5E7EB] opacity-60' : 'border-[#E5E7EB]'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-[#1F2937]">{k.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${k.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{k.status}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-xs font-mono text-[#6B7280] bg-[#F4F6F8] px-2 py-1 rounded">
                    {revealedKey === k.id ? k.key : maskKey(k.key)}
                  </code>
                  <button onClick={() => setRevealedKey(revealedKey === k.id ? null : k.id)} className="p-1 text-[#6B7280] hover:text-[#1F2937] transition-colors">
                    {revealedKey === k.id ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button onClick={() => copyKey(k.key, k.id)} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors ${copied === k.id ? 'text-green-600 bg-green-50' : 'text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F4F6F8]'}`}>
                    {copied === k.id ? <><Check size={11} />Copied</> : <><Copy size={11} />Copy</>}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {k.permissions.map(p => (
                    <span key={p} className="text-[10px] px-2 py-0.5 bg-blue-50 text-[#2E75B6] rounded-full border border-blue-100">{p}</span>
                  ))}
                </div>
                <p className="text-xs text-[#9CA3AF]">Created {k.created} · Last used {k.lastUsed}</p>
              </div>
              {k.status === 'Active' && (
                <button onClick={() => revokeKey(k.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#C0392B] border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
                  <X size={12} />Revoke
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB]">
              <h3 className="text-lg font-bold text-[#1F2937]">Create API Key</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-[#F4F6F8] rounded-lg"><X size={18} className="text-[#6B7280]" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Key Name</label>
                <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="e.g. Mobile App Integration" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {API_PERMISSIONS.map(p => (
                    <label key={p} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${newKeyPerms.includes(p) ? 'border-[#1E3A5F] bg-[#EEF2FF]' : 'border-[#E5E7EB] hover:bg-[#F9FAFB]'}`}>
                      <input type="checkbox" checked={newKeyPerms.includes(p)} onChange={() => setNewKeyPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])} className="sr-only" />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${newKeyPerms.includes(p) ? 'bg-[#1E3A5F] border-[#1E3A5F]' : 'border-[#D1D5DB]'}`}>
                        {newKeyPerms.includes(p) && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-xs text-[#374151]">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#E5E7EB]">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F8] transition-colors">Cancel</button>
              <button onClick={createKey} disabled={!newKeyName} className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2E75B6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Generate Key</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Webhooks Page ────────────────────────────────────────────────────────────
interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: 'Active' | 'Inactive' | 'Failing';
  successRate: number;
  lastTriggered: string;
  secret: string;
}

const WEBHOOK_EVENTS = ['order.created', 'order.assigned', 'order.completed', 'report.approved', 'report.rejected', 'payment.success', 'payment.failed', 'refund.processed', 'inspector.payout'];

const INITIAL_WEBHOOKS: WebhookEndpoint[] = [
  { id: '1', url: 'https://api.partner.ng/webhooks/carschek', events: ['order.created', 'order.completed', 'report.approved'], status: 'Active', successRate: 98.7, lastTriggered: '3 min ago', secret: 'whsec_4xK9mN2pQrT8vW3yZ6aB1cD5eF7gH0iJ' },
  { id: '2', url: 'https://hooks.zapier.com/hooks/catch/12345/abcdef/', events: ['payment.success', 'payment.failed'], status: 'Active', successRate: 100, lastTriggered: '1 hour ago', secret: 'whsec_7hU2kL5nO8qR1tV4wX9yA3bC6dE0fG2i' },
  { id: '3', url: 'https://crm.dealergroup.com/api/carschek-events', events: ['order.created', 'report.approved', 'payment.success'], status: 'Failing', successRate: 34.2, lastTriggered: '2 hours ago', secret: 'whsec_1aB4cD7eF0gH3iJ6kL9mN2oP5qR8sT1u' },
];

const RECENT_DELIVERIES = [
  { id: 'd1', endpoint: 'api.partner.ng', event: 'order.created', status: 'Success', time: '3 min ago', duration: '142ms' },
  { id: 'd2', endpoint: 'hooks.zapier.com', event: 'payment.success', status: 'Success', time: '1 hour ago', duration: '89ms' },
  { id: 'd3', endpoint: 'crm.dealergroup.com', event: 'report.approved', status: 'Failed', time: '2 hours ago', duration: '5001ms' },
  { id: 'd4', endpoint: 'api.partner.ng', event: 'report.approved', status: 'Success', time: '3 hours ago', duration: '201ms' },
  { id: 'd5', endpoint: 'crm.dealergroup.com', event: 'order.created', status: 'Failed', time: '4 hours ago', duration: '5001ms' },
];

function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(INITIAL_WEBHOOKS);
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newEvents, setNewEvents] = useState<string[]>([]);
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);

  const toggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(w => w.id === id ? { ...w, status: w.status === 'Active' ? 'Inactive' as const : 'Active' as const } : w));
  };

  const createWebhook = () => {
    const wh: WebhookEndpoint = {
      id: Date.now().toString(),
      url: newUrl,
      events: newEvents,
      status: 'Active',
      successRate: 100,
      lastTriggered: 'Never',
      secret: 'whsec_' + Math.random().toString(36).slice(2, 34),
    };
    setWebhooks(prev => [...prev, wh]);
    setShowCreate(false);
    setNewUrl('');
    setNewEvents([]);
  };

  const statusColor = (s: string) => s === 'Active' ? 'bg-green-100 text-green-700' : s === 'Failing' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600';

  const samplePayload = JSON.stringify({ event: 'order.created', timestamp: '2026-04-10T22:45:12Z', data: { order_id: 'CS-2026-4521', customer: 'Adaeze Mensah', vehicle: '2019 Toyota Camry', status: 'Pending Assignment' } }, null, 2);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1F2937]">Webhooks</h2>
          <p className="text-sm text-[#6B7280] mt-1">Configure endpoints to receive real-time event notifications.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-lg hover:bg-[#2E75B6] transition-colors">
          <Plus size={16} />Add Endpoint
        </button>
      </div>

      {/* Failing alert */}
      {webhooks.some(w => w.status === 'Failing') && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">{webhooks.filter(w => w.status === 'Failing').length} endpoint(s) are failing. Check delivery logs below.</p>
        </div>
      )}

      {/* Endpoints */}
      <div className="space-y-4 mb-8">
        {webhooks.map(wh => (
          <div key={wh.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-sm font-mono text-[#1F2937] truncate">{wh.url}</code>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColor(wh.status)}`}>{wh.status}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {wh.events.map(e => <span key={e} className="text-[10px] px-2 py-0.5 bg-[#F4F6F8] text-[#374151] rounded-full font-mono">{e}</span>)}
                </div>
                <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                  <span>Success rate: <span className={`font-semibold ${wh.successRate > 90 ? 'text-green-600' : 'text-red-600'}`}>{wh.successRate}%</span></span>
                  <span>Last triggered: {wh.lastTriggered}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="p-2 text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F4F6F8] rounded-lg transition-colors" title="Send test event"><Zap size={14} /></button>
                <button onClick={() => toggleWebhook(wh.id)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${wh.status === 'Active' ? 'border-[#E5E7EB] text-[#6B7280] hover:bg-[#F4F6F8]' : 'border-green-200 text-green-700 hover:bg-green-50'}`}>
                  {wh.status === 'Active' ? 'Disable' : 'Enable'}
                </button>
                <button className="p-2 text-[#C0392B] hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            {/* Secret */}
            <div className="flex items-center gap-2 pt-3 border-t border-[#E5E7EB]">
              <span className="text-xs text-[#6B7280]">Signing secret:</span>
              <code className="text-xs font-mono text-[#6B7280] bg-[#F4F6F8] px-2 py-0.5 rounded">
                {revealedSecret === wh.id ? wh.secret : wh.secret.slice(0, 10) + '•'.repeat(16)}
              </code>
              <button onClick={() => setRevealedSecret(revealedSecret === wh.id ? null : wh.id)} className="text-[#6B7280] hover:text-[#1F2937] transition-colors">
                {revealedSecret === wh.id ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
              <button onClick={() => navigator.clipboard?.writeText(wh.secret)} className="text-[#6B7280] hover:text-[#1F2937] transition-colors"><Copy size={12} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Deliveries */}
      <div>
        <h3 className="text-sm font-semibold text-[#1F2937] mb-3">Recent Deliveries</h3>
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Endpoint</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Event</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Duration</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Time</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_DELIVERIES.map(d => (
                <React.Fragment key={d.id}>
                  <tr className={`border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB] transition-colors cursor-pointer ${expandedDelivery === d.id ? 'bg-blue-50/30' : ''}`} onClick={() => setExpandedDelivery(expandedDelivery === d.id ? null : d.id)}>
                    <td className="px-5 py-3 text-xs font-mono text-[#374151]">{d.endpoint}</td>
                    <td className="px-5 py-3"><span className="text-xs font-mono bg-[#F4F6F8] px-2 py-0.5 rounded text-[#374151]">{d.event}</span></td>
                    <td className="px-5 py-3">
                      <span className={`flex items-center gap-1.5 text-xs font-medium w-fit ${d.status === 'Success' ? 'text-green-700' : 'text-red-700'}`}>
                        {d.status === 'Success' ? <CheckCircle size={13} /> : <XCircle size={13} />}{d.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#6B7280] font-mono">{d.duration}</td>
                    <td className="px-5 py-3 text-xs text-[#6B7280]">{d.time}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {d.status === 'Failed' && <button className="text-xs text-[#2E75B6] hover:underline font-medium">Retry</button>}
                        <ChevronDown size={14} className={`text-[#6B7280] transition-transform ${expandedDelivery === d.id ? 'rotate-180' : ''}`} />
                      </div>
                    </td>
                  </tr>
                  {expandedDelivery === d.id && (
                    <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                      <td colSpan={6} className="px-5 py-4">
                        <p className="text-xs font-semibold text-[#374151] mb-2 uppercase tracking-wider">Payload</p>
                        <pre className="bg-[#1F2937] text-green-400 rounded-lg p-4 text-xs font-mono overflow-x-auto">{samplePayload}</pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB]">
              <h3 className="text-lg font-bold text-[#1F2937]">Add Webhook Endpoint</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-[#F4F6F8] rounded-lg"><X size={18} className="text-[#6B7280]" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Endpoint URL</label>
                <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://your-server.com/webhooks" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Events to Subscribe</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {WEBHOOK_EVENTS.map(e => (
                    <label key={e} className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${newEvents.includes(e) ? 'bg-[#EEF2FF]' : 'hover:bg-[#F9FAFB]'}`}>
                      <input type="checkbox" checked={newEvents.includes(e)} onChange={() => setNewEvents(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])} className="sr-only" />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${newEvents.includes(e) ? 'bg-[#1E3A5F] border-[#1E3A5F]' : 'border-[#D1D5DB]'}`}>
                        {newEvents.includes(e) && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-xs font-mono text-[#374151]">{e}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#E5E7EB]">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F8] transition-colors">Cancel</button>
              <button onClick={createWebhook} disabled={!newUrl} className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2E75B6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Add Endpoint</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Billing Page ─────────────────────────────────────────────────────────────
const BILLING_INVOICES = [
  { id: 'INV-2026-004', date: 'Apr 1, 2026', amount: '₦45,000', status: 'Paid', period: 'April 2026' },
  { id: 'INV-2026-003', date: 'Mar 1, 2026', amount: '₦45,000', status: 'Paid', period: 'March 2026' },
  { id: 'INV-2026-002', date: 'Feb 1, 2026', amount: '₦45,000', status: 'Paid', period: 'February 2026' },
  { id: 'INV-2026-001', date: 'Jan 1, 2026', amount: '₦35,000', status: 'Paid', period: 'January 2026' },
  { id: 'INV-2025-012', date: 'Dec 1, 2025', amount: '₦35,000', status: 'Paid', period: 'December 2025' },
];

function BillingPage() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const PLANS = [
    { name: 'Starter', price: '₦25,000', period: '/month', features: ['Up to 5 team members', '100 inspections/month', 'Basic reports', 'Email support'], current: false },
    { name: 'Growth', price: '₦45,000', period: '/month', features: ['Up to 15 team members', '500 inspections/month', 'Advanced reports + QA', 'SMS notifications', 'Priority support'], current: true },
    { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited team members', 'Unlimited inspections', 'White-label reports', 'Dedicated account manager', 'SLA guarantee', 'Custom integrations'], current: false },
  ];

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1F2937]">Billing & Subscription</h2>
        <p className="text-sm text-[#6B7280] mt-1">Manage your plan, payment method, and billing history.</p>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2E75B6] rounded-xl p-6 mb-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-blue-200 mb-1">Current Plan</p>
            <h3 className="text-2xl font-bold mb-1">Growth Plan</h3>
            <p className="text-blue-200 text-sm">₦45,000 / month · Renews May 1, 2026</p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-lg px-3 py-1.5 mb-2">
              <p className="text-xs text-blue-100">Inspections this month</p>
              <p className="text-xl font-bold">312 <span className="text-sm font-normal text-blue-200">/ 500</span></p>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div className={`rounded-full h-1.5 transition-all ${(312 / 500) > 0.8 ? 'bg-amber-500' : 'bg-[#1E3A5F]'}`} style={{ width: `${Math.min((312 / 500) * 100, 100)}%` }} />
            </div>
            <p className="text-[10px] text-blue-200 mt-1">62.4% used</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/20">
          <button onClick={() => setShowUpgrade(true)} className="px-4 py-2 bg-white text-[#1E3A5F] text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors">Upgrade Plan</button>
          <button className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors border border-white/20">Cancel Subscription</button>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Team Members', used: 5, limit: 15, icon: <Users size={16} /> },
          { label: 'Inspections', used: 312, limit: 500, icon: <Activity size={16} /> },
          { label: 'API Calls', used: 8420, limit: 50000, icon: <Zap size={16} /> },
        ].map(u => (
          <div key={u.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#2E75B6]">{u.icon}</span>
              <p className="text-xs font-medium text-[#374151]">{u.label}</p>
            </div>
            <p className="text-lg font-bold text-[#1F2937]">{u.used.toLocaleString()} <span className="text-sm font-normal text-[#6B7280]">/ {u.limit.toLocaleString()}</span></p>
            <div className="w-full bg-[#F4F6F8] rounded-full h-1.5 mt-2">
              <div className={`rounded-full h-1.5 transition-all ${(u.used / u.limit) > 0.8 ? 'bg-amber-500' : 'bg-[#1E3A5F]'}`} style={{ width: `${Math.min((u.used / u.limit) * 100, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#1F2937] flex items-center gap-2"><CreditCard size={15} className="text-[#2E75B6]" />Payment Method</h3>
          <button onClick={() => setShowPaymentModal(true)} className="text-xs text-[#2E75B6] hover:underline font-medium">Update</button>
        </div>
        <div className="flex items-center gap-4 p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
          <div className="w-10 h-7 bg-[#1E3A5F] rounded flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">VISA</span>
          </div>
          <div>
            <p className="text-sm font-medium text-[#1F2937]">Visa ending in 4242</p>
            <p className="text-xs text-[#6B7280]">Expires 08/2028 · Billing contact: promise@carschek.com</p>
          </div>
          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Default</span>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-semibold text-[#1F2937]">Billing History</h3>
          <button className="flex items-center gap-1.5 text-xs text-[#374151] border border-[#E5E7EB] px-3 py-1.5 rounded-lg hover:bg-[#F4F6F8] transition-colors"><Download size={12} />Export All</button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Invoice</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Period</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Amount</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {BILLING_INVOICES.map(inv => (
              <tr key={inv.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                <td className="px-5 py-3.5 text-sm font-mono text-[#374151]">{inv.id}</td>
                <td className="px-5 py-3.5 text-sm text-[#374151]">{inv.period}</td>
                <td className="px-5 py-3.5 text-sm text-[#6B7280]">{inv.date}</td>
                <td className="px-5 py-3.5 text-sm font-semibold text-[#1F2937]">{inv.amount}</td>
                <td className="px-5 py-3.5"><span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{inv.status}</span></td>
                <td className="px-5 py-3.5 text-right">
                  <button className="flex items-center gap-1 text-xs text-[#2E75B6] hover:underline ml-auto"><Download size={11} />PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB]">
              <h3 className="text-lg font-bold text-[#1F2937]">Choose a Plan</h3>
              <button onClick={() => setShowUpgrade(false)} className="p-1.5 hover:bg-[#F4F6F8] rounded-lg"><X size={18} className="text-[#6B7280]" /></button>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              {PLANS.map(plan => (
                <div key={plan.name} className={`rounded-xl border p-5 ${plan.current ? 'border-[#1E3A5F] bg-[#EEF2FF]' : 'border-[#E5E7EB]'}`}>
                  {plan.current && <span className="text-[10px] bg-[#1E3A5F] text-white px-2 py-0.5 rounded-full font-medium mb-2 inline-block">Current</span>}
                  <h4 className="text-base font-bold text-[#1F2937] mb-1">{plan.name}</h4>
                  <p className="text-xl font-bold text-[#1E3A5F] mb-3">{plan.price}<span className="text-sm font-normal text-[#6B7280]">{plan.period}</span></p>
                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-[#374151]"><Check size={12} className="text-green-600 mt-0.5 flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                  <button className={`w-full py-2 text-sm font-medium rounded-lg transition-colors ${plan.current ? 'bg-[#1E3A5F] text-white cursor-default' : plan.name === 'Enterprise' ? 'border border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#EEF2FF]' : 'bg-[#1E3A5F] text-white hover:bg-[#2E75B6]'}`}>
                    {plan.current ? 'Current Plan' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[#1F2937]">Update Payment Method</h3>
              <button onClick={() => setShowPaymentModal(false)}><X size={18} className="text-[#6B7280]" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Card Number</label>
                <input placeholder="1234 5678 9012 3456" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Expiry</label>
                  <input placeholder="MM/YY" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">CVV</label>
                  <input placeholder="123" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowPaymentModal(false)} className="flex-1 px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F8] transition-colors">Cancel</button>
              <button onClick={() => setShowPaymentModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2E75B6] transition-colors">Save Card</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 2FA Policy Page ──────────────────────────────────────────────────────────
function TwoFAPolicyPage() {
  const [enforce2FA, setEnforce2FA] = useState(false);
  const [graceperiod, setGracePeriod] = useState('7');
  const [allowedMethods, setAllowedMethods] = useState({ totp: true, sms: true, email: false });
  const [roleRequirements, setRoleRequirements] = useState<Record<string, boolean>>({
    'Super Admin': true,
    'Ops Manager': true,
    'Finance': true,
    'Inspector': false,
    'Support': false,
  });
  const [saved, setSaved] = useState(false);

  const TEAM_2FA_STATUS = [
    { name: 'Promise Ndem', role: 'Super Admin', avatar: 'PN', enabled: true, method: 'Authenticator App', lastVerified: '2 hours ago' },
    { name: 'Chidi Okonkwo', role: 'Ops Manager', avatar: 'CO', enabled: true, method: 'SMS', lastVerified: '1 day ago' },
    { name: 'Fatima Bello', role: 'Finance', avatar: 'FB', enabled: false, method: '—', lastVerified: 'Never' },
    { name: 'Seun Adebayo', role: 'Support', avatar: 'SA', enabled: false, method: '—', lastVerified: 'Never' },
    { name: 'Ngozi Okafor', role: 'Ops Manager', avatar: 'NO', enabled: true, method: 'Authenticator App', lastVerified: '3 days ago' },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1F2937]">2FA Policy</h2>
        <p className="text-sm text-[#6B7280] mt-1">Enforce two-factor authentication requirements for your team.</p>
      </div>

      <div className="space-y-5">
        {/* Enforcement */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1F2937] flex items-center gap-2"><Shield size={15} className="text-[#2E75B6]" />Enforce 2FA Platform-Wide</h3>
              <p className="text-xs text-[#6B7280] mt-1">Require all team members to set up 2FA before accessing the admin portal.</p>
            </div>
            <Toggle enabled={enforce2FA} onChange={() => setEnforce2FA(!enforce2FA)} />
          </div>
          {enforce2FA && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">Enabling this will lock out team members who haven&apos;t set up 2FA after the grace period.</p>
            </div>
          )}
        </div>

        {/* Grace Period */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-4 flex items-center gap-2"><Clock size={15} className="text-[#2E75B6]" />Grace Period</h3>
          <div className="flex items-center gap-3">
            <input type="number" value={graceperiod} onChange={e => setGracePeriod(e.target.value)} min="1" max="30" className="w-24 px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6]" />
            <span className="text-sm text-[#6B7280]">days for team members to set up 2FA after enforcement is enabled</span>
          </div>
        </div>

        {/* Allowed Methods */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-4 flex items-center gap-2"><Smartphone size={15} className="text-[#2E75B6]" />Allowed 2FA Methods</h3>
          <div className="space-y-3">
            {[
              { key: 'totp', label: 'Authenticator App (TOTP)', desc: 'Google Authenticator, Authy, 1Password — most secure', icon: '🔐' },
              { key: 'sms', label: 'SMS One-Time Password', desc: 'Code sent via SMS to registered phone number', icon: '📱' },
              { key: 'email', label: 'Email One-Time Password', desc: 'Code sent via email — least secure, not recommended', icon: '📧' },
            ].map(method => (
              <div key={method.key} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${allowedMethods[method.key as keyof typeof allowedMethods] ? 'border-[#1E3A5F] bg-[#EEF2FF]' : 'border-[#E5E7EB]'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{method.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-[#1F2937]">{method.label}</p>
                    <p className="text-xs text-[#6B7280]">{method.desc}</p>
                  </div>
                </div>
                <Toggle enabled={allowedMethods[method.key as keyof typeof allowedMethods]} onChange={() => setAllowedMethods(prev => ({ ...prev, [method.key]: !prev[method.key as keyof typeof allowedMethods] }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Per-Role Requirements */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-4 flex items-center gap-2"><Users size={15} className="text-[#2E75B6]" />Per-Role Requirements</h3>
          <div className="space-y-3">
            {Object.entries(roleRequirements).map(([role, required]) => (
              <div key={role} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${role === 'Super Admin' ? 'bg-amber-100 text-amber-700' : role === 'Ops Manager' ? 'bg-blue-100 text-blue-700' : role === 'Finance' ? 'bg-green-100 text-green-700' : role === 'Inspector' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-700'}`}>{role}</span>
                  {role === 'Super Admin' && <span className="text-xs text-[#6B7280]">(always required)</span>}
                </div>
                <Toggle enabled={required} onChange={() => { if (role !== 'Super Admin') setRoleRequirements(prev => ({ ...prev, [role]: !prev[role] })); }} />
              </div>
            ))}
          </div>
        </div>

        {/* Team 2FA Status */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-[#1F2937]">Team 2FA Status</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">{TEAM_2FA_STATUS.filter(m => m.enabled).length} of {TEAM_2FA_STATUS.length} members have 2FA enabled</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Member</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">2FA Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Method</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Last Verified</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {TEAM_2FA_STATUS.map(m => (
                <tr key={m.name} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-[10px] font-bold">{m.avatar}</div>
                      <div>
                        <p className="text-sm font-medium text-[#1F2937]">{m.name}</p>
                        <p className="text-xs text-[#6B7280]">{m.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`flex items-center gap-1.5 text-xs font-medium w-fit ${m.enabled ? 'text-green-700' : 'text-red-700'}`}>
                      {m.enabled ? <CheckCircle size={13} /> : <XCircle size={13} />}{m.enabled ? 'Enabled' : 'Not Set Up'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#374151]">{m.method}</td>
                  <td className="px-5 py-3.5 text-xs text-[#6B7280]">{m.lastVerified}</td>
                  <td className="px-5 py-3.5 text-right">
                    {!m.enabled ? (
                      <button className="text-xs text-[#2E75B6] hover:underline font-medium">Send Setup Link</button>
                    ) : (
                      <button className="text-xs text-[#C0392B] hover:underline font-medium">Reset 2FA</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SaveBar onSave={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} saved={saved} />
      </div>
    </div>
  );
}

// ─── IP Allowlist Page ────────────────────────────────────────────────────────
interface IPEntry {
  id: string;
  ip: string;
  label: string;
  addedBy: string;
  addedAt: string;
  lastSeen: string;
  type: 'IPv4' | 'IPv6' | 'CIDR';
}

const INITIAL_IPS: IPEntry[] = [
  { id: '1', ip: '197.210.54.12', label: 'Promise Home Office', addedBy: 'Promise Ndem', addedAt: 'Jan 15, 2026', lastSeen: '2 hours ago', type: 'IPv4' },
  { id: '2', ip: '41.58.120.0/24', label: 'Carschek Lagos Office', addedBy: 'Promise Ndem', addedAt: 'Jan 15, 2026', lastSeen: '5 min ago', type: 'CIDR' },
  { id: '3', ip: '105.112.88.21', label: 'Finance Team VPN', addedBy: 'Fatima Bello', addedAt: 'Feb 3, 2026', lastSeen: '3 hours ago', type: 'IPv4' },
  { id: '4', ip: '102.89.45.67', label: 'Support Team Abuja', addedBy: 'Chidi Okonkwo', addedAt: 'Mar 10, 2026', lastSeen: '1 day ago', type: 'IPv4' },
];

function IPAllowlistPage() {
  const [ips, setIps] = useState<IPEntry[]>(INITIAL_IPS);
  const [allowlistEnabled, setAllowlistEnabled] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newIP, setNewIP] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [saved, setSaved] = useState(false);

  const addIP = () => {
    if (!newIP) return;
    const entry: IPEntry = {
      id: Date.now().toString(),
      ip: newIP,
      label: newLabel || 'Unnamed',
      addedBy: 'Promise Ndem',
      addedAt: 'Apr 10, 2026',
      lastSeen: 'Never',
      type: newIP.includes('/') ? 'CIDR' : newIP.includes(':') ? 'IPv6' : 'IPv4',
    };
    setIps(prev => [...prev, entry]);
    setShowAdd(false);
    setNewIP('');
    setNewLabel('');
  };

  const removeIP = (id: string) => setIps(prev => prev.filter(ip => ip.id !== id));

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1F2937]">IP Allowlist</h2>
        <p className="text-sm text-[#6B7280] mt-1">Restrict admin portal access to specific IP addresses or ranges.</p>
      </div>

      <div className="space-y-5">
        {/* Enable Toggle */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#1F2937] flex items-center gap-2"><Globe size={15} className="text-[#2E75B6]" />Enable IP Allowlist</h3>
              <p className="text-xs text-[#6B7280] mt-1">Only allow admin portal access from the IP addresses listed below.</p>
            </div>
            <Toggle enabled={allowlistEnabled} onChange={() => setAllowlistEnabled(!allowlistEnabled)} />
          </div>
          {allowlistEnabled && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertTriangle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-700">Warning: Ensure your current IP is in the list</p>
                <p className="text-xs text-red-600 mt-0.5">Your current IP: <code className="font-mono bg-red-100 px-1 rounded">197.210.54.12</code> — ✓ Already in allowlist</p>
              </div>
            </div>
          )}
        </div>

        {/* IP List */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
            <div>
              <h3 className="text-sm font-semibold text-[#1F2937]">Allowed IP Addresses</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">{ips.length} entries · Supports IPv4, IPv6, and CIDR notation</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E3A5F] text-white text-xs font-medium rounded-lg hover:bg-[#2E75B6] transition-colors">
              <Plus size={13} />Add IP
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">IP Address</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Label</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Added By</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Last Seen</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ips.map(entry => (
                <tr key={entry.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-[#1F2937]">{entry.ip}</code>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${entry.type === 'CIDR' ? 'bg-purple-100 text-purple-700' : entry.type === 'IPv6' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{entry.type}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-[#374151]"><MapPin size={12} className="text-[#6B7280]" />{entry.label}</div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#6B7280]">{entry.addedBy} · {entry.addedAt}</td>
                  <td className="px-5 py-3.5 text-xs text-[#6B7280]">{entry.lastSeen}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F4F6F8] rounded-lg transition-colors"><Edit size={13} /></button>
                      <button onClick={() => removeIP(entry.id)} className="p-1.5 text-[#6B7280] hover:text-[#C0392B] hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Blocked Attempts */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-3 flex items-center gap-2"><AlertCircle size={15} className="text-amber-500" />Recent Blocked Attempts</h3>
          <div className="space-y-2">
            {[
              { ip: '196.45.23.88', time: '1 hour ago', user: 'promise@carschek.com', country: '🇳🇬 Nigeria' },
              { ip: '45.33.32.156', time: '3 hours ago', user: 'unknown', country: '🇺🇸 United States' },
              { ip: '185.220.101.47', time: '1 day ago', user: 'unknown', country: '🇩🇪 Germany' },
            ].map((attempt, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle size={14} className="text-red-500 flex-shrink-0" />
                  <div>
                    <code className="text-xs font-mono text-[#1F2937]">{attempt.ip}</code>
                    <span className="text-xs text-[#6B7280] ml-2">· {attempt.user}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                  <span>{attempt.country}</span>
                  <span>{attempt.time}</span>
                  <button onClick={() => setIps(prev => [...prev, { id: Date.now().toString(), ip: attempt.ip, label: 'Added from blocked', addedBy: 'Promise Ndem', addedAt: 'Apr 10, 2026', lastSeen: attempt.time, type: 'IPv4' }])} className="text-[#2E75B6] hover:underline font-medium">Allow</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <SaveBar onSave={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} saved={saved} />
      </div>

      {/* Add IP Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[#1F2937]">Add IP Address</h3>
              <button onClick={() => setShowAdd(false)}><X size={18} className="text-[#6B7280]" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">IP Address or CIDR Range</label>
                <input value={newIP} onChange={e => setNewIP(e.target.value)} placeholder="e.g. 197.210.54.12 or 41.58.0.0/16" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6] font-mono" />
                <p className="text-xs text-[#6B7280] mt-1">Supports IPv4, IPv6, and CIDR notation</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Label (optional)</label>
                <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="e.g. Office VPN" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6]" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F8] transition-colors">Cancel</button>
              <button onClick={addIP} disabled={!newIP} className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2E75B6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Add IP</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Session Management Page ──────────────────────────────────────────────────
interface Session {
  id: string;
  user: string;
  avatar: string;
  role: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  ip: string;
  location: string;
  startedAt: string;
  lastActivity: string;
  current: boolean;
}

const ACTIVE_SESSIONS: Session[] = [
  { id: 's1', user: 'Promise Ndem', avatar: 'PN', role: 'Super Admin', device: 'MacBook Pro 16"', deviceType: 'desktop', browser: 'Chrome 123', ip: '197.210.54.12', location: 'Lagos, Nigeria', startedAt: '2026-04-10 20:00', lastActivity: '2 min ago', current: true },
  { id: 's2', user: 'Promise Ndem', avatar: 'PN', role: 'Super Admin', device: 'iPhone 15 Pro', deviceType: 'mobile', browser: 'Safari 17', ip: '197.210.54.15', location: 'Lagos, Nigeria', startedAt: '2026-04-10 18:30', lastActivity: '45 min ago', current: false },
  { id: 's3', user: 'Chidi Okonkwo', avatar: 'CO', role: 'Ops Manager', device: 'Windows PC', deviceType: 'desktop', browser: 'Firefox 124', ip: '41.58.120.33', location: 'Abuja, Nigeria', startedAt: '2026-04-10 09:00', lastActivity: '1 hour ago', current: false },
  { id: 's4', user: 'Fatima Bello', avatar: 'FB', role: 'Finance', device: 'iPad Air', deviceType: 'tablet', browser: 'Safari 17', ip: '105.112.88.21', location: 'Lagos, Nigeria', startedAt: '2026-04-10 14:00', lastActivity: '3 hours ago', current: false },
  { id: 's5', user: 'Seun Adebayo', avatar: 'SA', role: 'Support', device: 'MacBook Air', deviceType: 'desktop', browser: 'Chrome 123', ip: '102.89.45.67', location: 'Port Harcourt, Nigeria', startedAt: '2026-04-09 16:00', lastActivity: 'Yesterday', current: false },
];

function SessionManagementPage() {
  const [sessions, setSessions] = useState<Session[]>(ACTIVE_SESSIONS);
  const [sessionTimeout, setSessionTimeout] = useState('8');
  const [rememberMe, setRememberMe] = useState(true);
  const [concurrentSessions, setConcurrentSessions] = useState(true);
  const [showTerminateAll, setShowTerminateAll] = useState(false);
  const [saved, setSaved] = useState(false);

  const terminateSession = (id: string) => setSessions(prev => prev.filter(s => s.id !== id));
  const terminateAll = () => { setSessions(prev => prev.filter(s => s.current)); setShowTerminateAll(false); };

  const DeviceIcon = ({ type }: { type: string }) => {
    if (type === 'mobile') return <Smartphone size={16} className="text-[#6B7280]" />;
    if (type === 'tablet') return <Tablet size={16} className="text-[#6B7280]" />;
    return <Monitor size={16} className="text-[#6B7280]" />;
  };

  const userSessions = sessions.reduce<Record<string, Session[]>>((acc, s) => {
    if (!acc[s.user]) acc[s.user] = [];
    acc[s.user].push(s);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1F2937]">Session Management</h2>
          <p className="text-sm text-[#6B7280] mt-1">View and manage all active admin sessions across devices.</p>
        </div>
        <button onClick={() => setShowTerminateAll(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#C0392B] border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
          <X size={14} />Terminate All Other Sessions
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Active Sessions', value: sessions.length, color: 'text-[#1E3A5F]' },
          { label: 'Unique Users', value: new Set(sessions.map(s => s.user)).size, color: 'text-[#2E75B6]' },
          { label: 'Desktop', value: sessions.filter(s => s.deviceType === 'desktop').length, color: 'text-teal-600' },
          { label: 'Mobile/Tablet', value: sessions.filter(s => s.deviceType !== 'desktop').length, color: 'text-amber-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Session Policy */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 mb-6">
        <h3 className="text-sm font-semibold text-[#1F2937] mb-4 flex items-center gap-2"><Clock size={15} className="text-[#2E75B6]" />Session Policy</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-[#374151]">Session Timeout</p>
              <p className="text-xs text-[#6B7280]">Automatically log out inactive sessions after this period</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} min="1" max="72" className="w-20 px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 text-center" />
              <span className="text-sm text-[#6B7280]">hours</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-[#374151]">Allow &quot;Remember Me&quot;</p>
              <p className="text-xs text-[#6B7280]">Let users stay logged in for 30 days on trusted devices</p>
            </div>
            <Toggle enabled={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
          </div>
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-[#374151]">Allow Concurrent Sessions</p>
              <p className="text-xs text-[#6B7280]">Allow users to be logged in on multiple devices simultaneously</p>
            </div>
            <Toggle enabled={concurrentSessions} onChange={() => setConcurrentSessions(!concurrentSessions)} />
          </div>
        </div>
        <SaveBar onSave={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} saved={saved} />
      </div>

      {/* Active Sessions by User */}
      <div className="space-y-4">
        {Object.entries(userSessions).map(([user, userSess]) => (
          <div key={user} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold">{userSess[0].avatar}</div>
              <div>
                <p className="text-sm font-semibold text-[#1F2937]">{user}</p>
                <p className="text-xs text-[#6B7280]">{userSess[0].role} · {userSess.length} active session{userSess.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
              {userSess.map(session => (
                <div key={session.id} className={`flex items-center gap-4 px-5 py-4 ${session.current ? 'bg-green-50/50' : 'hover:bg-[#F9FAFB]'} transition-colors`}>
                  <DeviceIcon type={session.deviceType} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-[#1F2937]">{session.device}</p>
                      <span className="text-xs text-[#6B7280]">· {session.browser}</span>
                      {session.current && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Current Session</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                      <span className="flex items-center gap-1"><MapPin size={10} />{session.location}</span>
                      <span className="font-mono">{session.ip}</span>
                      <span>Active {session.lastActivity}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#6B7280] mb-1">Started {session.startedAt}</p>
                    {!session.current && (
                      <button onClick={() => terminateSession(session.id)} className="flex items-center gap-1 text-xs text-[#C0392B] hover:underline font-medium ml-auto">
                        <X size={11} />Terminate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Terminate All Modal */}
      {showTerminateAll && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-600" />
            </div>
            <h3 className="text-base font-bold text-[#1F2937] text-center mb-2">Terminate All Other Sessions?</h3>
            <p className="text-sm text-[#6B7280] text-center mb-5">This will immediately log out all other team members from the admin portal. They will need to log in again.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowTerminateAll(false)} className="flex-1 px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F8] transition-colors">Cancel</button>
              <button onClick={terminateAll} className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#C0392B] text-white rounded-lg hover:bg-red-700 transition-colors">Terminate All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('roles');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const currentNavItem = SETTINGS_NAV.flatMap(g => g.items).find(i => i.key === activeSection);

  const renderContent = () => {
    switch (activeSection) {
      case 'roles': return <RolesPermissionsPage />;
      case 'team': return <TeamMembersPage />;
      case 'audit': return <AuditLogPage />;
      case 'email-templates': return <EmailTemplatesPage />;
      case 'sms': return <SMSSettingsPage />;
      case 'notifications': return <NotificationRulesPage />;
      case 'general': return <GeneralSettingsPage />;
      case 'api-keys': return <ApiKeysPage />;
      case 'webhooks': return <WebhooksPage />;
      case 'billing': return <BillingPage />;
      case '2fa': return <TwoFAPolicyPage />;
      case 'ip-allowlist': return <IPAllowlistPage />;
      case 'sessions': return <SessionManagementPage />;
      default: return null;
    }
  };

  return (
    <AppLayout currentPath="/settings">
      <div className="flex gap-0 -m-4 md:-m-6 xl:-mx-8 2xl:-mx-10 h-[calc(100vh-64px)] relative">

        {/* Mobile nav overlay */}
        {mobileNavOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileNavOpen(false)} />
        )}

        {/* Left Settings Nav */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50 md:z-auto
          w-64 md:w-56 flex-shrink-0 bg-white border-r border-[#E5E7EB] overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="px-4 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-[#1F2937]">Settings</h1>
              <p className="text-xs text-[#6B7280] mt-0.5">Super Admin only</p>
            </div>
            <button onClick={() => setMobileNavOpen(true)} className="md:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-gray-100">
              <ChevronDown size={18} className="text-[#6B7280]" />
            </button>
          </div>
          <nav className="py-3">
            {SETTINGS_NAV.map(group => (
              <div key={group.group} className="mb-4">
                <p className="px-4 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">{group.group}</p>
                {group.items.map(item => {
                  const active = activeSection === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => { setActiveSection(item.key); setMobileNavOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-4 min-h-[44px] text-sm transition-colors text-left ${active ? 'bg-[#EEF2FF] text-[#1E3A5F] font-semibold border-r-2 border-[#1E3A5F]' : 'text-[#374151] hover:bg-[#F4F6F8] hover:text-[#1F2937]'}`}
                    >
                      <item.icon size={15} className={active ? 'text-[#1E3A5F]' : 'text-[#6B7280]'} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile section selector bar */}
          <div className="md:hidden sticky top-0 z-30 bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-gray-50"
            >
              <ChevronDown size={18} className="text-[#6B7280]" />
            </button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {currentNavItem && <currentNavItem.icon size={16} className="text-[#1E3A5F] flex-shrink-0" />}
              <span className="text-sm font-semibold text-[#1F2937] truncate">{currentNavItem?.label}</span>
            </div>
          </div>
          <div className="p-4 md:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
