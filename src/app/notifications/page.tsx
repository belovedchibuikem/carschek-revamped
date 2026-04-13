'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Bell, Webhook, CheckCheck, Trash2, Send, Eye, RefreshCw, Plus, ChevronDown, ChevronRight, ShoppingCart, FileText, DollarSign, AlertTriangle, Clock, Smartphone, Check } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


// ─── Mock Data ────────────────────────────────────────────────────────────────
const notifications = [
  { id: 1, group: 'Today', icon: 'order', title: 'Order #1892 requires QA review', desc: 'Stuck in QA queue for 2h 30m — needs immediate attention', time: '2m ago', read: false },
  { id: 2, group: 'Today', icon: 'payment', title: 'Payment received — ₦45,000', desc: 'Adaeze Mensah paid for inspection order #1901', time: '15m ago', read: false },
  { id: 3, group: 'Today', icon: 'report', title: 'Report #445 approved by QA', desc: 'Inspector Emeka O. report passed quality review', time: '1h ago', read: true },
  { id: 4, group: 'Today', icon: 'system', title: 'System maintenance scheduled', desc: 'Planned downtime on Apr 12 from 2:00 AM – 4:00 AM WAT', time: '3h ago', read: true },
  { id: 5, group: 'Yesterday', icon: 'order', title: 'New booking from Chidi Nwosu', desc: 'Lagos Island zone — 2020 Honda Accord', time: 'Yesterday 4:30 PM', read: true },
  { id: 6, group: 'Yesterday', icon: 'payment', title: 'Payout processed — ₦145,800', desc: 'Weekly payout for Inspector Emeka Okonkwo', time: 'Yesterday 2:15 PM', read: true },
  { id: 7, group: 'Older', icon: 'system', title: 'New inspector onboarded', desc: 'Ngozi Okafor completed onboarding and is now active', time: 'Apr 8, 10:00 AM', read: true },
];

const emailTemplates = [
  { name: 'Inspection Booked', trigger: 'booking.created', modified: '2026-04-01', status: 'Published' },
  { name: 'Inspector Assigned', trigger: 'inspector.assigned', modified: '2026-03-28', status: 'Published' },
  { name: 'Inspection In Progress', trigger: 'inspection.started', modified: '2026-03-25', status: 'Published' },
  { name: 'Report Ready', trigger: 'report.approved', modified: '2026-04-02', status: 'Published' },
  { name: 'Payment Received', trigger: 'payment.success', modified: '2026-03-20', status: 'Published' },
  { name: 'Re-inspection Reminder', trigger: 'report.expiring', modified: '2026-03-15', status: 'Draft' },
  { name: 'Account Suspended', trigger: 'account.suspended', modified: '2026-02-10', status: 'Published' },
  { name: 'Welcome Email', trigger: 'user.registered', modified: '2026-01-05', status: 'Published' },
];

const broadcasts = [
  { id: 'BC-001', name: 'April Inspection Promo', audience: 'All Customers', sent: 1240, delivered: 1198, failed: 42, date: '2026-04-05' },
  { id: 'BC-002', name: 'Report Expiry Reminder', audience: 'Customers with expired reports', sent: 342, delivered: 335, failed: 7, date: '2026-04-01' },
  { id: 'BC-003', name: 'Lagos Zone Update', audience: 'Customers in Lagos', sent: 680, delivered: 661, failed: 19, date: '2026-03-28' },
];

const webhookLogs = [
  { id: 'WH-001', time: '2026-04-10 14:23:01', source: 'Paystack', event: 'charge.success', reference: 'PSK-8821-XZ', status: 'Success', responseTime: '124ms', payload: '{"event":"charge.success","data":{"reference":"PSK-8821-XZ","amount":4500000}}' },
  { id: 'WH-002', time: '2026-04-10 13:45:22', source: 'Flutterwave', event: 'charge.failed', reference: 'FLW-9934-AB', status: 'Failed', responseTime: '—', payload: '{"event":"charge.failed","data":{"reference":"FLW-9934-AB","amount":2500000}}' },
  { id: 'WH-003', time: '2026-04-10 12:10:44', source: 'Termii', event: 'sms.delivered', reference: 'TMI-5512-CD', status: 'Success', responseTime: '89ms', payload: '{"event":"sms.delivered","data":{"to":"+2348012345678","status":"delivered"}}' },
  { id: 'WH-004', time: '2026-04-10 11:30:15', source: 'Paystack', event: 'transfer.success', reference: 'PSK-7712-EF', status: 'Retrying', responseTime: '—', payload: '{"event":"transfer.success","data":{"reference":"PSK-7712-EF","amount":145800}}' },
  { id: 'WH-005', time: '2026-04-10 10:05:33', source: 'Flutterwave', event: 'charge.success', reference: 'FLW-6601-GH', status: 'Success', responseTime: '201ms', payload: '{"event":"charge.success","data":{"reference":"FLW-6601-GH","amount":25000000}}' },
];

// ─── View 1: Notification Centre ──────────────────────────────────────────────
function NotificationCentre() {
  const [filter, setFilter] = useState('All');
  const [notifs, setNotifs] = useState(notifications);
  const filters = ['All', 'Orders', 'Reports', 'Payments', 'System Alerts'];
  const unread = notifs.filter(n => !n.read).length;

  const iconMap: Record<string, React.ElementType> = {
    order: ShoppingCart, report: FileText, payment: DollarSign, system: AlertTriangle
  };
  const iconColorMap: Record<string, string> = {
    order: 'bg-blue-100 text-blue-600', report: 'bg-teal-100 text-teal-600',
    payment: 'bg-green-100 text-green-600', system: 'bg-amber-100 text-amber-600'
  };

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const markRead = (id: number) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const deleteNotif = (id: number) => setNotifs(n => n.filter(x => x.id !== id));

  const groups = ['Today', 'Yesterday', 'Older'];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={22} className="text-[#1E3A5F]" />
            {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C0392B] rounded-full text-white text-[9px] font-bold flex items-center justify-center">{unread}</span>}
          </div>
          <h3 className="font-semibold text-[#1F2937]">Notification Centre</h3>
        </div>
        <button onClick={markAllRead} className="text-sm text-[#2E75B6] hover:underline flex items-center gap-1">
          <CheckCheck size={14} /> Mark all as read
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-[#F4F6F8] p-1 rounded-xl w-fit flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-white text-[#1E3A5F] shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      <div className="flex gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#6B7280] hover:bg-[#F4F6F8]">
          <CheckCheck size={12} /> Mark selected read
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#C0392B] hover:bg-red-50">
          <Trash2 size={12} /> Delete selected
        </button>
      </div>

      {/* Grouped notifications */}
      {groups.map(group => {
        const items = notifs.filter(n => n.group === group);
        if (!items.length) return null;
        return (
          <div key={group}>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-2">{group}</p>
            <div className="bg-white rounded-xl border border-[#E5E7EB] divide-y divide-[#F3F4F6]">
              {items.map(n => {
                const Icon = iconMap[n.icon] || Bell;
                return (
                  <div key={n.id} className={`flex items-start gap-4 p-4 hover:bg-[#F9FAFB] transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColorMap[n.icon]}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!n.read ? 'font-semibold text-[#1F2937]' : 'font-medium text-[#1F2937]'}`}>{n.title}</p>
                        {!n.read && <span className="w-2 h-2 bg-[#2E75B6] rounded-full flex-shrink-0 mt-1.5" />}
                      </div>
                      <p className="text-xs text-[#6B7280] mt-0.5">{n.desc}</p>
                      <p className="text-[10px] text-[#6B7280] mt-1 flex items-center gap-1"><Clock size={10} /> {n.time}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!n.read && <button onClick={() => markRead(n.id)} className="p-1.5 rounded-lg hover:bg-[#E5E7EB] text-[#6B7280]"><Check size={12} /></button>}
                      <button onClick={() => deleteNotif(n.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-[#C0392B]"><Trash2 size={12} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── View 2: Email Template Manager ──────────────────────────────────────────
function EmailTemplateManager() {
  const [selected, setSelected] = useState<typeof emailTemplates[0] | null>(null);
  const [subject, setSubject] = useState('Your inspection has been booked — Order #{{order_id}}');
  const [body, setBody] = useState('Hi {{customer_name}},\n\nYour inspection for {{vehicle_name}} has been successfully booked.\n\nDetails:\n- Order #: {{order_id}}\n- Scheduled: {{scheduled_time}}\n- Inspector: {{inspector_name}}\n\nThank you for choosing Carschek!\n\nBest regards,\nThe Carschek Team');
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [mobilePreview, setMobilePreview] = useState(false);
  const variables = ['{{customer_name}}', '{{order_id}}', '{{vehicle_name}}', '{{inspector_name}}', '{{scheduled_time}}'];

  const insertVar = (v: string) => setBody(b => b + v);

  return (
    <div className="space-y-4">
      {!selected ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB] flex justify-between items-center">
            <h3 className="font-semibold text-[#1F2937]">Email Templates</h3>
            <button className="flex items-center gap-2 px-3 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-medium min-h-[40px]">
              <Plus size={14} /> New Template
            </button>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {['Template Name', 'Trigger Event', 'Last Modified', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {emailTemplates.map(t => (
                <tr key={t.name} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
                  <td className="py-3 px-4 font-medium text-[#1F2937] whitespace-nowrap">{t.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[#6B7280] whitespace-nowrap">{t.trigger}</td>
                  <td className="py-3 px-4 text-[#6B7280] whitespace-nowrap">{t.modified}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${t.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(t)} className="px-3 py-1.5 bg-[#F4F6F8] text-[#6B7280] text-xs rounded-lg hover:bg-[#E5E7EB] min-h-[32px]">Edit</button>
                      <button className="px-3 py-1.5 bg-[#F4F6F8] text-[#6B7280] text-xs rounded-lg hover:bg-[#E5E7EB] min-h-[32px]">Preview</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelected(null)} className="text-[#2E75B6] text-sm hover:underline flex items-center gap-1">
              ← Back to templates
            </button>
            <span className="text-[#6B7280]">/</span>
            <span className="font-semibold text-[#1F2937]">{selected.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1">Subject Line</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-[#1F2937]">Email Body</label>
                    <div className="flex gap-1 bg-[#F4F6F8] p-0.5 rounded-lg">
                      {(['edit', 'preview'] as const).map(m => (
                        <button key={m} onClick={() => setPreviewMode(m)}
                          className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${previewMode === m ? 'bg-white text-[#1E3A5F] shadow-sm' : 'text-[#6B7280]'}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {previewMode === 'edit' ? (
                    <textarea value={body} onChange={e => setBody(e.target.value)} rows={12}
                      className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 resize-none" />
                  ) : (
                    <div className={`border border-[#E5E7EB] rounded-xl overflow-hidden ${mobilePreview ? 'max-w-sm mx-auto' : ''}`}>
                      <div className="bg-[#1E3A5F] p-4">
                        <p className="text-white font-bold text-sm">CARSCHEK</p>
                        <p className="text-white/70 text-xs mt-0.5">{subject.replace('{{order_id}}', '#1234').replace('{{customer_name}}', 'Adaeze')}</p>
                      </div>
                      <div className="p-5 bg-white">
                        <pre className="text-sm text-[#1F2937] whitespace-pre-wrap font-sans leading-relaxed">
                          {body.replace('{{customer_name}}', 'Adaeze Mensah').replace('{{vehicle_name}}', '2019 Toyota Camry').replace('{{order_id}}', '#1234').replace('{{inspector_name}}', 'Emeka Okonkwo').replace('{{scheduled_time}}', 'Apr 15, 2026 at 10:30 AM')}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E5E7EB]">
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-medium">Save</button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#1A7A4A] text-white rounded-lg text-sm font-medium">Publish</button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-[#6B7280] rounded-lg text-sm font-medium">
                    <Send size={14} /> Send Test Email
                  </button>
                  <button onClick={() => setMobilePreview(m => !m)}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all ${mobilePreview ? 'bg-[#2E75B6] text-white border-[#2E75B6]' : 'bg-white border-[#E5E7EB] text-[#6B7280]'}`}>
                    <Smartphone size={14} /> Mobile Preview
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                <p className="text-sm font-semibold text-[#1F2937] mb-3">Dynamic Variables</p>
                <p className="text-xs text-[#6B7280] mb-3">Click to insert into email body</p>
                <div className="space-y-2">
                  {variables.map(v => (
                    <button key={v} onClick={() => insertVar(v)}
                      className="w-full text-left px-3 py-2 bg-[#F4F6F8] hover:bg-[#E5E7EB] rounded-lg font-mono text-xs text-[#2E75B6] transition-colors">
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── View 3: SMS Broadcast Tool ───────────────────────────────────────────────
function SMSBroadcast() {
  const [showNew, setShowNew] = useState(false);
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('All Customers');
  const [schedule, setSchedule] = useState('now');
  const [confirmModal, setConfirmModal] = useState(false);
  const maxChars = 160;
  const audienceCount: Record<string, number> = {
    'All Customers': 1240, 'Customers in Lagos': 680, 'Customers with booking this week': 87,
    'Customers with expired reports': 342, 'Custom (upload CSV)': 0
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-[#1F2937]">SMS Broadcast Tool</h3>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-medium hover:bg-[#2E75B6] transition-colors">
          <Plus size={14} /> New Broadcast
        </button>
      </div>

      {showNew && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-5">
          <h4 className="font-semibold text-[#1F2937]">Compose Broadcast</h4>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">Audience Segment</label>
            <select value={audience} onChange={e => setAudience(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30">
              {Object.keys(audienceCount).map(a => <option key={a}>{a}</option>)}
            </select>
            <p className="text-sm text-[#2E75B6] mt-2 font-medium">
              📊 Your message will reach <strong>{audienceCount[audience].toLocaleString()}</strong> customers
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">Message</label>
            <div className="relative">
              <textarea value={message} onChange={e => setMessage(e.target.value.slice(0, maxChars))} rows={4}
                placeholder="Hi {{customer_name}}, your Carschek inspection report is ready..."
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 resize-none" />
              <div className={`absolute bottom-3 right-3 text-xs font-medium ${message.length > 140 ? 'text-[#C0392B]' : 'text-[#6B7280]'}`}>
                {message.length}/{maxChars}
              </div>
            </div>
            {message.includes('£') || message.includes('€') ? (
              <p className="text-xs text-amber-600 mt-1">⚠ Special characters detected — may reduce character limit to 70</p>
            ) : null}
            <div className="flex gap-2 mt-2">
              {['{{customer_name}}', '{{order_id}}'].map(v => (
                <button key={v} onClick={() => setMessage(m => m + v)}
                  className="px-2 py-1 bg-[#F4F6F8] text-[#2E75B6] text-xs rounded-lg font-mono hover:bg-[#E5E7EB]">{v}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">Schedule</label>
            <div className="flex gap-3">
              {['now', 'schedule'].map(s => (
                <button key={s} onClick={() => setSchedule(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${schedule === s ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'bg-white border-[#E5E7EB] text-[#6B7280]'}`}>
                  {s === 'now' ? 'Send Now' : 'Schedule'}
                </button>
              ))}
            </div>
            {schedule === 'schedule' && (
              <input type="datetime-local" className="mt-3 border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowNew(false)} className="px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#6B7280]">Cancel</button>
            <button onClick={() => setConfirmModal(true)} className="flex-1 py-2.5 bg-[#1E3A5F] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
              <Eye size={14} /> Preview & Send
            </button>
          </div>
        </div>
      )}

      {/* Broadcast History */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="p-4 border-b border-[#E5E7EB]">
          <h4 className="font-semibold text-[#1F2937]">Broadcast History</h4>
        </div>
        <div className="divide-y divide-[#F3F4F6]">
          {broadcasts.map(b => (
            <div key={b.id} className="p-4 hover:bg-[#F9FAFB]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-[#1F2937]">{b.name}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{b.audience} · {b.date}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center"><p className="font-bold text-[#1F2937]">{b.sent}</p><p className="text-xs text-[#6B7280]">Sent</p></div>
                  <div className="text-center"><p className="font-bold text-[#1A7A4A]">{b.delivered}</p><p className="text-xs text-[#6B7280]">Delivered</p></div>
                  <div className="text-center"><p className="font-bold text-[#C0392B]">{b.failed}</p><p className="text-xs text-[#6B7280]">Failed</p></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-[#1F2937] mb-4">Confirm Broadcast</h3>
            <div className="bg-[#F4F6F8] rounded-xl p-4 space-y-2 mb-4">
              <div className="flex justify-between text-sm"><span className="text-[#6B7280]">Recipients</span><span className="font-bold">{audienceCount[audience].toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#6B7280]">Estimated Cost</span><span className="font-bold text-[#1A7A4A]">₦{(audienceCount[audience] * 4).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#6B7280]">Per SMS Rate</span><span className="font-medium">₦4.00</span></div>
            </div>
            <div className="bg-[#1F2937] rounded-xl p-4 mb-4">
              <p className="text-green-400 text-sm font-mono">{message || 'Hi {{customer_name}}, your message here...'}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(false)} className="flex-1 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#6B7280]">Cancel</button>
              <button onClick={() => { setConfirmModal(false); setShowNew(false); }} className="flex-1 py-2.5 bg-[#1E3A5F] text-white rounded-xl text-sm font-medium">Send Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── View 4: Webhook Log Viewer ───────────────────────────────────────────────
function WebhookLogViewer() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState('All');

  const statusColor: Record<string, string> = {
    Success: 'bg-green-100 text-green-700',
    Failed: 'bg-red-100 text-red-700',
    Retrying: 'bg-amber-100 text-amber-700',
  };

  const filtered = sourceFilter === 'All' ? webhookLogs : webhookLogs.filter(w => w.source === sourceFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {['All', 'Paystack', 'Flutterwave', 'Termii'].map(s => (
            <button key={s} onClick={() => setSourceFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sourceFilter === s ? 'bg-[#1E3A5F] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280]'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {['Timestamp', 'Source', 'Event Type', 'Reference', 'Status', 'Response Time', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(w => (
                <React.Fragment key={w.id}>
                  <tr className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
                    <td className="py-3 px-4 font-mono text-xs text-[#6B7280] whitespace-nowrap">{w.time}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${w.source === 'Paystack' ? 'bg-blue-100 text-blue-700' : w.source === 'Flutterwave' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>{w.source}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#1F2937] whitespace-nowrap">{w.event}</td>
                    <td className="py-3 px-4 font-mono text-xs text-[#6B7280] whitespace-nowrap">{w.reference}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${statusColor[w.status]}`}>{w.status}</span></td>
                    <td className="py-3 px-4 text-[#6B7280] text-xs whitespace-nowrap">{w.responseTime}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => setExpanded(expanded === w.id ? null : w.id)}
                          className="px-2 py-1.5 bg-[#F4F6F8] text-[#6B7280] text-xs rounded-lg hover:bg-[#E5E7EB] flex items-center gap-1 min-h-[32px]">
                          {expanded === w.id ? <ChevronDown size={11} /> : <ChevronRight size={11} />} Payload
                        </button>
                        {(w.status === 'Failed' || w.status === 'Retrying') ? (
                          <button className="px-2 py-1.5 bg-amber-100 text-amber-700 text-xs rounded-lg hover:bg-amber-200 flex items-center gap-1 min-h-[32px]">
                            <RefreshCw size={11} /> Retry
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  {expanded === w.id && (
                    <tr className="bg-[#F9FAFB]">
                      <td colSpan={7} className="px-4 sm:px-6 py-4">
                        <p className="text-xs font-semibold text-[#6B7280] mb-2">Full JSON Payload</p>
                        <pre className="bg-[#1F2937] text-green-400 text-xs p-4 rounded-lg overflow-x-auto font-mono leading-relaxed">
                          {JSON.stringify(JSON.parse(w.payload), null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [activeView, setActiveView] = useState('Notification Centre');
  const views = ['Notification Centre', 'Email Templates', 'SMS Broadcast', 'Webhook Logs'];

  return (
    <AppLayout currentPath="/notifications">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937]">Notifications & Communications</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">Manage all customer, inspector, and system communications</p>
          </div>
        </div>

        {/* Scrollable tabs on mobile */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-1 bg-[#F4F6F8] p-1 rounded-xl w-max sm:w-fit">
            {views.map(v => (
              <button key={v} onClick={() => setActiveView(v)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap min-h-[36px] ${activeView === v ? 'bg-white text-[#1E3A5F] shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {activeView === 'Notification Centre' && <NotificationCentre />}
        {activeView === 'Email Templates' && <EmailTemplateManager />}
        {activeView === 'SMS Broadcast' && <SMSBroadcast />}
        {activeView === 'Webhook Logs' && <WebhookLogViewer />}
      </div>
    </AppLayout>
  );
}
