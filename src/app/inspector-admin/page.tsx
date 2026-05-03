'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Users, Briefcase, CheckCircle, AlertTriangle, MapPin, Star, Eye, RefreshCw, Download, Search, Zap, MessageSquare, Bell, X, FileText, Phone, Send } from 'lucide-react';
import { useChat } from '@/lib/hooks/useChat';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Inspector {
  id: string;
  name: string;
  initials: string;
  status: 'online' | 'offline' | 'on-job';
  zone: string;
  jobsToday: number;
  jobsCompleted: number;
  avgScore: number;
  rating: number;
  currentJob?: string;
  phone: string;
  certLevel: 'Senior' | 'Standard' | 'Trainee';
  pendingSync: number;
}

interface InspectionJob {
  id: string;
  ckId: string;
  inspector: string;
  inspectorId: string;
  vehicle: string;
  customer: string;
  status: 'assigned' | 'en-route' | 'in-progress' | 'awaiting-qa' | 'completed';
  scheduledTime: string;
  location: string;
  progress?: number;
  score?: number;
  synced?: boolean;
}

interface AdminNotification {
  id: string;
  type: 'sync' | 'qa' | 'alert' | 'complete';
  title: string;
  desc: string;
  time: string;
  read: boolean;
  inspectorId?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INSPECTORS: Inspector[] = [
  { id: 'ins-1', name: 'Emeka Okonkwo', initials: 'EO', status: 'on-job', zone: 'Lagos Island', jobsToday: 3, jobsCompleted: 1, avgScore: 87, rating: 4.9, currentJob: 'CK-41', phone: '+234 801 234 5678', certLevel: 'Senior', pendingSync: 1 },
  { id: 'ins-2', name: 'Amaka Osei', initials: 'AO', status: 'online', zone: 'Victoria Island', jobsToday: 2, jobsCompleted: 2, avgScore: 91, rating: 5.0, phone: '+234 802 345 6789', certLevel: 'Senior', pendingSync: 0 },
  { id: 'ins-3', name: 'Chukwudi Eze', initials: 'CE', status: 'on-job', zone: 'Lekki', jobsToday: 4, jobsCompleted: 2, avgScore: 79, rating: 4.7, currentJob: 'CK-43', phone: '+234 803 456 7890', certLevel: 'Standard', pendingSync: 2 },
  { id: 'ins-4', name: 'Fatima Bello', initials: 'FB', status: 'offline', zone: 'Abuja', jobsToday: 2, jobsCompleted: 2, avgScore: 85, rating: 4.8, phone: '+234 804 567 8901', certLevel: 'Senior', pendingSync: 0 },
  { id: 'ins-5', name: 'Tunde Adeyemi', initials: 'TA', status: 'online', zone: 'Ikeja', jobsToday: 1, jobsCompleted: 0, avgScore: 72, rating: 4.5, phone: '+234 805 678 9012', certLevel: 'Trainee', pendingSync: 0 },
];

const JOBS: InspectionJob[] = [
  { id: 'job-1', ckId: 'CK-41', inspector: 'Emeka Okonkwo', inspectorId: 'ins-1', vehicle: 'Toyota Camry 2019', customer: 'Adaeze Mensah', status: 'in-progress', scheduledTime: '10:30 AM', location: 'Lekki Phase 1', progress: 65, synced: false },
  { id: 'job-2', ckId: 'CK-42', inspector: 'Amaka Osei', inspectorId: 'ins-2', vehicle: 'Honda Accord 2020', customer: 'Chidi Nwosu', status: 'completed', scheduledTime: '9:00 AM', location: 'Victoria Island', score: 84, synced: true },
  { id: 'job-3', ckId: 'CK-43', inspector: 'Chukwudi Eze', inspectorId: 'ins-3', vehicle: 'Mercedes C300 2021', customer: 'Emeka Obi', status: 'en-route', scheduledTime: '11:00 AM', location: 'Ikoyi', synced: false },
  { id: 'job-4', ckId: 'CK-44', inspector: 'Tunde Adeyemi', inspectorId: 'ins-5', vehicle: 'Ford Ranger 2018', customer: 'Ngozi Adaeze', status: 'assigned', scheduledTime: '2:00 PM', location: 'Ikeja', synced: false },
  { id: 'job-5', ckId: 'CK-40', inspector: 'Emeka Okonkwo', inspectorId: 'ins-1', vehicle: 'Mercedes-Benz C300 2021', customer: 'Emeka Obi', status: 'awaiting-qa', scheduledTime: '9:00 AM', location: 'Ikoyi', score: 76, synced: false },
];

const NOTIFICATIONS: AdminNotification[] = [
  { id: 'n1', type: 'sync', title: 'Sync Pending', desc: 'CK-41 inspection data not synced — Emeka Okonkwo', time: '2 min ago', read: false, inspectorId: 'ins-1' },
  { id: 'n2', type: 'qa', title: 'Report Ready for QA', desc: 'CK-40 Mercedes-Benz C300 — Score: 76/100', time: '15 min ago', read: false },
  { id: 'n3', type: 'alert', title: 'Low Score Alert', desc: 'CK-44 Ford Ranger — Score below threshold (58/100)', time: '1h ago', read: false },
  { id: 'n4', type: 'complete', title: 'Inspection Complete', desc: 'CK-42 Honda Accord — Amaka Osei · Score: 84/100', time: '2h ago', read: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatusStyle(status: InspectionJob['status']) {
  const map: Record<InspectionJob['status'], string> = {
    'assigned': 'bg-gray-100 text-gray-600',
    'en-route': 'bg-purple-100 text-purple-700',
    'in-progress': 'bg-amber-100 text-amber-700',
    'awaiting-qa': 'bg-teal-100 text-teal-700',
    'completed': 'bg-green-100 text-green-700',
  };
  return map[status];
}

function getStatusLabel(status: InspectionJob['status']) {
  const map: Record<InspectionJob['status'], string> = {
    'assigned': 'Assigned', 'en-route': 'En Route', 'in-progress': 'In Progress',
    'awaiting-qa': 'Awaiting QA', 'completed': 'Completed',
  };
  return map[status];
}

function getInspectorStatusDot(status: Inspector['status']) {
  if (status === 'online') return 'bg-green-500';
  if (status === 'on-job') return 'bg-amber-500 animate-pulse';
  return 'bg-gray-400';
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-[#1A7A4A]';
  if (score >= 60) return 'text-[#D35400]';
  return 'text-[#C0392B]';
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────
function KPICards() {
  const kpis = [
    { label: 'Active Inspectors', value: '3/5', sub: 'online now', icon: Users, color: '#2E75B6', bg: '#EFF6FF' },
    { label: 'Jobs Today', value: '5', sub: '2 in progress', icon: Briefcase, color: '#D35400', bg: '#FFF7ED' },
    { label: 'Completed', value: '3', sub: 'avg score 82', icon: CheckCircle, color: '#1A7A4A', bg: '#F0FDF4' },
    { label: 'Pending Sync', value: '3', sub: 'reports offline', icon: RefreshCw, color: '#C0392B', bg: '#FEF2F2' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map(kpi => (
        <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.bg }}>
              <kpi.icon size={20} style={{ color: kpi.color }} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          <p className="text-sm font-semibold text-gray-700 mt-0.5">{kpi.label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Inspector Status Panel ───────────────────────────────────────────────────
function InspectorStatusPanel({ onSelectInspector }: { onSelectInspector: (id: string) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Inspector Status</h3>
        <span className="text-xs text-gray-400">{INSPECTORS.filter(i => i.status !== 'offline').length} active</span>
      </div>
      <div className="divide-y divide-gray-50">
        {INSPECTORS.map(inspector => (
          <button key={inspector.id} onClick={() => onSelectInspector(inspector.id)}
            className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] flex items-center justify-center text-white text-sm font-bold">
                {inspector.initials}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getInspectorStatusDot(inspector.status)}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{inspector.name}</p>
              <p className="text-xs text-gray-400">{inspector.zone} · {inspector.status === 'on-job' ? `On ${inspector.currentJob}` : inspector.status}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-gray-900">{inspector.jobsCompleted}/{inspector.jobsToday}</p>
              <p className="text-[10px] text-gray-400">jobs done</p>
            </div>
            {inspector.pendingSync > 0 && (
              <div className="w-5 h-5 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                {inspector.pendingSync}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Live Jobs Table ──────────────────────────────────────────────────────────
function LiveJobsTable({ onSelectJob }: { onSelectJob: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = JOBS.filter(j => {
    const matchSearch = j.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      j.ckId.toLowerCase().includes(search.toLowerCase()) ||
      j.inspector.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900">Live Inspection Jobs</h3>
          <button onClick={() => toast.success('Refreshing...')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none text-gray-600"
          >
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="en-route">En Route</option>
            <option value="in-progress">In Progress</option>
            <option value="awaiting-qa">Awaiting QA</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['CK ID', 'Vehicle', 'Inspector', 'Status', 'Progress', 'Score', 'Sync', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(job => (
              <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <span className="font-mono text-sm font-bold text-[#1E3A5F] bg-[#EFF6FF] px-2 py-0.5 rounded-lg">{job.ckId}</span>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-gray-900">{job.vehicle}</p>
                  <p className="text-xs text-gray-400">{job.customer}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#1E3A5F] flex items-center justify-center text-white text-[10px] font-bold">
                      {INSPECTORS.find(i => i.id === job.inspectorId)?.initials || '??'}
                    </div>
                    <span className="text-sm text-gray-700">{job.inspector.split(' ')[0]}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(job.status)}`}>
                    {getStatusLabel(job.status)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {job.progress !== undefined ? (
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2E75B6] rounded-full" style={{ width: `${job.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{job.progress}%</span>
                    </div>
                  ) : <span className="text-xs text-gray-400">—</span>}
                </td>
                <td className="px-5 py-4">
                  {job.score !== undefined ? (
                    <span className={`text-sm font-bold ${getScoreColor(job.score)}`}>{job.score}/100</span>
                  ) : <span className="text-xs text-gray-400">—</span>}
                </td>
                <td className="px-5 py-4">
                  {job.synced ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={14} /><span className="text-xs font-medium">Synced</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600">
                      <RefreshCw size={14} /><span className="text-xs font-medium">Pending</span>
                    </div>
                  )}
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => onSelectJob(job.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#2E75B6] hover:text-[#1E3A5F]">
                    <Eye size={13} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-50">
        {filtered.map(job => (
          <button key={job.id} onClick={() => onSelectJob(job.id)}
            className="w-full flex items-start gap-3 px-4 py-4 text-left hover:bg-gray-50">
            <span className="font-mono text-xs font-bold text-[#1E3A5F] bg-[#EFF6FF] px-2 py-1 rounded-lg flex-shrink-0">{job.ckId}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{job.vehicle}</p>
              <p className="text-xs text-gray-400">{job.inspector}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${getStatusStyle(job.status)}`}>
              {getStatusLabel(job.status)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Job Detail Panel ─────────────────────────────────────────────────────────
function JobDetailPanel({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const job = JOBS.find(j => j.id === jobId);
  const inspector = job ? INSPECTORS.find(i => i.id === job.inspectorId) : null;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ from: string; text: string; time: string }>>([
    { from: 'system', text: 'Inspector started job', time: '10:32 AM' },
    { from: 'inspector', text: 'On site, starting inspection now', time: '10:35 AM' },
  ]);

  if (!job || !inspector) return null;

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { from: 'admin', text: message, time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) }]);
    setMessage('');
    toast.success('Message sent to inspector');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-[#1E3A5F] bg-[#EFF6FF] px-3 py-1 rounded-lg">{job.ckId}</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(job.status)}`}>
              {getStatusLabel(job.status)}
            </span>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Vehicle</p>
              <p className="font-bold text-gray-900">{job.vehicle}</p>
              <p className="text-sm text-gray-500">{job.customer}</p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin size={11} />{job.location}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Inspector</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold">{inspector.initials}</div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{inspector.name}</p>
                  <p className="text-xs text-gray-400">{inspector.certLevel} · {inspector.zone}</p>
                </div>
              </div>
            </div>
          </div>

          {job.progress !== undefined && (
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-[#1E3A5F]">Live Progress</p>
                <span className="text-sm font-bold text-[#1E3A5F]">{job.progress}%</span>
              </div>
              <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#1E3A5F] rounded-full transition-all" style={{ width: `${job.progress}%` }} />
              </div>
              <p className="text-xs text-blue-600 mt-2">Updates every 10 seconds</p>
            </div>
          )}

          {job.score !== undefined && (
            <div className="bg-green-50 rounded-xl p-4 flex items-center gap-4">
              <div className="text-center">
                <p className={`text-3xl font-bold ${getScoreColor(job.score)}`}>{job.score}</p>
                <p className="text-xs text-gray-500">/ 100</p>
              </div>
              <div>
                <p className="font-bold text-gray-900">Carschek Score</p>
                <p className="text-sm text-gray-500">{job.score >= 80 ? 'Good condition' : job.score >= 60 ? 'Fair condition' : 'Poor condition'}</p>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">Message Inspector</p>
            <div className="bg-gray-50 rounded-xl p-3 space-y-2 mb-3 max-h-32 overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-1.5 rounded-xl text-xs ${
                    msg.from === 'admin' ? 'bg-[#1E3A5F] text-white' :
                    msg.from === 'system' ? 'bg-gray-200 text-gray-500 italic' : 'bg-white border border-gray-200 text-gray-700'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Send message to inspector..."
                className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none"
              />
              <button onClick={sendMessage} disabled={!message.trim()}
                className="w-10 h-10 bg-[#1E3A5F] rounded-xl flex items-center justify-center disabled:opacity-50">
                <Send size={16} className="text-white" />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            {job.status === 'awaiting-qa' && (
              <button onClick={() => { toast.success('Navigating to QA review...'); onClose(); }}
                className="flex-1 py-3 bg-[#1E3A5F] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                <FileText size={15} /> Review Report
              </button>
            )}
            {!job.synced && (
              <button onClick={() => toast.success('Sync requested from inspector')}
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                <RefreshCw size={15} /> Request Sync
              </button>
            )}
            <button onClick={() => toast.success('Report downloaded')}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              <Download size={15} /> Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Inspector Detail Panel ───────────────────────────────────────────────────
function InspectorDetailPanel({ inspectorId, onClose }: { inspectorId: string; onClose: () => void }) {
  const inspector = INSPECTORS.find(i => i.id === inspectorId);
  if (!inspector) return null;

  const inspectorJobs = JOBS.filter(j => j.inspectorId === inspectorId);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Inspector Profile</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <X size={16} className="text-gray-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F] flex items-center justify-center text-white text-xl font-bold">{inspector.initials}</div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getInspectorStatusDot(inspector.status)}`} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{inspector.name}</p>
              <p className="text-gray-500 text-sm">{inspector.certLevel} Inspector · {inspector.zone}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold text-gray-700">{inspector.rating}</span>
                <span className="text-xs text-gray-400">rating</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Jobs Today', value: `${inspector.jobsCompleted}/${inspector.jobsToday}` },
              { label: 'Avg Score', value: inspector.avgScore },
              { label: 'Pending Sync', value: inspector.pendingSync },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">Today's Jobs</p>
            <div className="space-y-2">
              {inspectorJobs.map(job => (
                <div key={job.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <span className="font-mono text-xs font-bold text-[#1E3A5F]">{job.ckId}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{job.vehicle}</p>
                    <p className="text-xs text-gray-400">{job.scheduledTime} · {job.location}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusStyle(job.status)}`}>
                    {getStatusLabel(job.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <a href={`tel:${inspector.phone}`}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              <Phone size={15} /> Call
            </a>
            <button onClick={() => toast.success('Message sent')}
              className="flex-1 py-3 bg-[#1E3A5F] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2">
              <MessageSquare size={15} /> Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI Admin Assistant ───────────────────────────────────────────────────────
function AIAdminAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'assistant', content: 'Hi! I\'m your Carschek Admin AI powered by Gemini. I can help you analyze inspection data, identify trends, and provide operational insights. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const { response, isLoading, error, sendMessage } = useChat('GEMINI', 'gemini/gemini-2.5-flash', true);
  const [lastResponse, setLastResponse] = useState('');

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  useEffect(() => {
    if (response && !isLoading && response !== lastResponse) {
      setLastResponse(response);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.content === '...') {
          return [...prev.slice(0, -1), { role: 'assistant', content: response }];
        }
        return prev;
      });
    }
  }, [response, isLoading, lastResponse]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }, { role: 'assistant', content: '...' }]);

    const history = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    sendMessage([
      {
        role: 'system',
        content: `You are a Carschek Admin AI assistant. You help operations managers with:
        - Inspector performance analysis
        - Inspection quality insights  
        - Operational efficiency recommendations
        - Report quality assessment
        Current data: 5 inspectors, 5 jobs today, 3 completed, avg score 82/100.
        Be concise, data-driven, and actionable.`
      },
      ...history.filter(m => m.content !== '...'),
      { role: 'user', content: userMsg }
    ], { temperature: 0.7, max_tokens: 400 });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" style={{ height: '70vh' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#2E75B6] to-[#1E3A5F] rounded-xl flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Admin AI Assistant</p>
              <p className="text-[10px] text-green-600 font-medium">Powered by Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-3 space-y-3" style={{ height: 'calc(70vh - 130px)' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' ? 'bg-[#1E3A5F] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                {msg.content === '...' && isLoading ? (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : msg.content}
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about inspectors, reports, trends..."
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none"
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()}
            className="w-10 h-10 bg-[#1E3A5F] rounded-xl flex items-center justify-center disabled:opacity-50">
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Drawer ─────────────────────────────────────────────────────
function NotificationsDrawer({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState(NOTIFICATIONS);

  const typeIcon = (type: AdminNotification['type']) => {
    if (type === 'sync') return <RefreshCw size={16} className="text-amber-600" />;
    if (type === 'qa') return <FileText size={16} className="text-[#2E75B6]" />;
    if (type === 'alert') return <AlertTriangle size={16} className="text-[#C0392B]" />;
    return <CheckCircle size={16} className="text-[#1A7A4A]" />;
  };

  const typeBg = (type: AdminNotification['type']) => {
    if (type === 'sync') return 'bg-amber-100';
    if (type === 'qa') return 'bg-blue-100';
    if (type === 'alert') return 'bg-red-100';
    return 'bg-green-100';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-sm h-full overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <p className="text-xs text-gray-400">{items.filter(n => !n.read).length} unread</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setItems(items.map(n => ({ ...n, read: true })))}
              className="text-xs text-[#2E75B6] font-semibold">Mark all read</button>
            <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <X size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {items.map(n => (
            <button key={n.id} onClick={() => setItems(items.map(i => i.id === n.id ? { ...i, read: true } : i))}
              className={`w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-gray-50 ${!n.read ? 'bg-blue-50/50' : ''}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeBg(n.type)}`}>
                {typeIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-tight ${n.read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.desc}</p>
                <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
              </div>
              {!n.read && <div className="w-2 h-2 bg-[#2E75B6] rounded-full mt-2 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function InspectorAdminDashboard() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedInspectorId, setSelectedInspectorId] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <AppLayout>
      {selectedJobId && <JobDetailPanel jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />}
      {selectedInspectorId && <InspectorDetailPanel inspectorId={selectedInspectorId} onClose={() => setSelectedInspectorId(null)} />}
      {showAI && <AIAdminAssistant onClose={() => setShowAI(false)} />}
      {showNotifications && <NotificationsDrawer onClose={() => setShowNotifications(false)} />}

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inspector Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Real-time oversight of all inspector activity</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowAI(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1E3A5F] to-[#2E75B6] text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-shadow">
              <Zap size={15} /> Gemini AI
            </button>
            <button onClick={() => setShowNotifications(true)}
              className="relative w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50">
              <Bell size={18} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <KPICards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <InspectorStatusPanel onSelectInspector={setSelectedInspectorId} />
          </div>
          <div className="lg:col-span-2">
            <LiveJobsTable onSelectJob={setSelectedJobId} />
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <RefreshCw size={18} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-amber-800">3 Reports Pending Sync</p>
            <p className="text-amber-600 text-sm mt-0.5">Inspectors may be offline. Data is saved locally on their devices.</p>
          </div>
          <button onClick={() => toast.success('Sync request sent to all inspectors')}
            className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-600 flex-shrink-0">
            Request All Sync
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
