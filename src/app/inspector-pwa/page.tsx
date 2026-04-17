'use client';
import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { MapPin, Phone, Navigation, Play, Eye, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, AlertTriangle, Mic, Camera, Pen, Share2, Flag, Home, Briefcase, Bell, User, Send } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type JobStatus = 'Upcoming' | 'En Route' | 'In Progress' | 'Awaiting QA' | 'Completed';
type CheckResult = 'pass' | 'fail' | 'na' | null;
type Severity = 'Minor' | 'Major' | 'Critical' | null;

interface Job {
  id: string;
  status: JobStatus;
  vehicle: string;
  plate: string;
  customer: string;
  phone: string;
  time: string;
  timeFromNow: string;
  location: string;
  distance: string;
}

interface CheckItem {
  id: string;
  name: string;
  mode: 'paired' | 'single';
  leftResult?: CheckResult;
  rightResult?: CheckResult;
  singleResult?: CheckResult;
  severity?: Severity;
  defectNote?: string;
  hasFail?: boolean;
}

interface Section {
  id: string;
  name: string;
  items: number;
  timeEst: string;
  status: 'not-started' | 'in-progress' | 'complete-pass' | 'complete-fail';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const jobs: Job[] = [
  { id: '#1901', status: 'En Route', vehicle: '2019 Toyota Camry', plate: 'KJA 234 AA', customer: 'Adaeze Mensah', phone: '+234 801 ***4521', time: '10:30 AM', timeFromNow: '15 min from now', location: '45 Admiralty Way, Lekki Phase 1', distance: '3.2 km away' },
  { id: '#1902', status: 'Upcoming', vehicle: '2020 Honda Accord', plate: 'LND 891 KK', customer: 'Chidi Nwosu', phone: '+234 802 ***7834', time: '1:00 PM', timeFromNow: '2h 45min from now', location: '12 Ozumba Mbadiwe Ave, VI', distance: '8.1 km away' },
  { id: '#1903', status: 'Completed', vehicle: '2018 Ford Ranger', plate: 'ABJ 445 FC', customer: 'Fatima Bello', phone: '+234 803 ***2267', time: '8:00 AM', timeFromNow: 'Completed', location: '3 Wuse Zone 5, Abuja', distance: '—' },
];

const sections: Section[] = [
  { id: 's1', name: 'Body Frame', items: 12, timeEst: '~1.5 min', status: 'complete-fail' },
  { id: 's2', name: 'Engine Bay', items: 15, timeEst: '~2 min', status: 'complete-pass' },
  { id: 's3', name: 'Transmission', items: 8, timeEst: '~1 min', status: 'in-progress' },
  { id: 's4', name: 'Suspension', items: 10, timeEst: '~1.5 min', status: 'complete-pass' },
  { id: 's5', name: 'Brakes', items: 8, timeEst: '~1 min', status: 'complete-pass' },
  { id: 's6', name: 'Tyres', items: 6, timeEst: '~1 min', status: 'complete-pass' },
  { id: 's7', name: 'Lights', items: 10, timeEst: '~1 min', status: 'not-started' },
  { id: 's8', name: 'Interior', items: 14, timeEst: '~2 min', status: 'not-started' },
  { id: 's9', name: 'Electrical', items: 12, timeEst: '~1.5 min', status: 'not-started' },
  { id: 's10', name: 'AC System', items: 6, timeEst: '~1 min', status: 'not-started' },
  { id: 's11', name: 'Underbody', items: 10, timeEst: '~1.5 min', status: 'not-started' },
  { id: 's12', name: 'Documents', items: 5, timeEst: '~0.5 min', status: 'not-started' },
];

const checklistItems: CheckItem[] = [
  { id: 'ci1', name: 'Front Rail', mode: 'paired', leftResult: 'pass', rightResult: 'fail', hasFail: true, severity: 'Major', defectNote: 'Visible dent on right front rail, approximately 15cm' },
  { id: 'ci2', name: 'Rear Rail', mode: 'paired', leftResult: 'pass', rightResult: 'pass' },
  { id: 'ci3', name: 'Cowl Panel Firewall', mode: 'single', singleResult: 'pass' },
  { id: 'ci4', name: 'A-Pillar', mode: 'paired', leftResult: null, rightResult: null },
  { id: 'ci5', name: 'B-Pillar', mode: 'paired', leftResult: null, rightResult: null },
  { id: 'ci6', name: 'Roof Panel', mode: 'single', singleResult: null },
];

const defects = [
  { section: 'Body Frame', item: 'Front Rail (Right)', severity: 'Major', desc: 'Visible dent on right front rail, approximately 15cm' },
  { section: 'Body Frame', item: 'Door Sill (Left)', severity: 'Minor', desc: 'Surface rust on left door sill' },
  { section: 'Engine Bay', item: 'Valve Cover Seal', severity: 'Critical', desc: 'Oil leak from valve cover gasket — requires immediate attention' },
  { section: 'Transmission', item: 'Fluid Level', severity: 'Major', desc: 'Transmission fluid below minimum level' },
];

// ─── Status chip ──────────────────────────────────────────────────────────────
function JobStatusChip({ status }: { status: JobStatus }) {
  const map: Record<JobStatus, string> = {
    Upcoming: 'bg-[#ff5722] text-white',
    'En Route': 'bg-purple-600 text-white',
    'In Progress': 'bg-[#D35400] text-white',
    'Awaiting QA': 'bg-teal-600 text-white',
    Completed: 'bg-[#1A7A4A] text-white',
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${map[status]}`}>{status}</span>;
}

// ─── Screen 1: Inspector Home ─────────────────────────────────────────────────
function InspectorHome({ onJobSelect }: { onJobSelect: (job: Job) => void }) {
  const [activeNav, setActiveNav] = useState('Home');
  const navItems = [
    { icon: Home, label: 'Home' }, { icon: Briefcase, label: 'Jobs' },
    { icon: Bell, label: 'Alerts' }, { icon: User, label: 'Profile' }
  ];

  return (
    <div className="bg-[#F4F6F8] min-h-screen flex flex-col" style={{ maxWidth: 375, margin: '0 auto' }}>
      {/* Header */}
      <div className="bg-[#ff5722] px-4 pt-10 pb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-bold text-lg tracking-tight">CARSCHEK</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white text-xs font-medium">Online</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#ff8a65] flex items-center justify-center text-white text-sm font-bold">EO</div>
          </div>
        </div>
        {/* Greeting */}
        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-white text-xl font-bold">Good morning, Emeka 👋</p>
          <p className="text-white/70 text-sm mt-0.5">Thursday, April 10, 2026 · Clear skies in Lagos</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-white mx-4 -mt-3 rounded-2xl shadow-sm border border-[#E5E7EB] p-4 grid grid-cols-4 gap-2">
        {[
          { label: 'Jobs Today', value: '3', color: 'text-[#ff5722]' },
          { label: 'Completed', value: '1', color: 'text-[#1A7A4A]' },
          { label: 'Pending', value: '2', color: 'text-[#D35400]' },
          { label: 'Avg Score', value: '87', color: 'text-[#ff8a65]' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-[#6B7280] leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Job list */}
      <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto pb-24">
        <p className="text-sm font-semibold text-[#6B7280] uppercase tracking-widest">Today's Jobs</p>
        {jobs.map(job => (
          <div key={job.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <JobStatusChip status={job.status} />
              <span className="text-xs text-[#6B7280] font-medium">{job.time}</span>
            </div>
            <p className="text-base font-bold text-[#1F2937]">{job.vehicle}</p>
            <p className="text-sm font-mono font-semibold text-[#ff8a65]">{job.plate}</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-[#6B7280]">👤 {job.customer} · {job.phone}</p>
              <p className="text-sm text-[#6B7280]">⏱ {job.timeFromNow}</p>
              <p className="text-sm text-[#6B7280] flex items-center gap-1">
                <MapPin size={12} className="text-[#C0392B]" /> {job.location}
                <span className="text-[#ff8a65] font-medium ml-1">{job.distance}</span>
              </p>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 py-2.5 bg-[#F4F6F8] text-[#1F2937] rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 min-h-[48px]">
                <Navigation size={14} /> Navigate
              </button>
              <button onClick={() => onJobSelect(job)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 min-h-[48px] ${job.status === 'Completed' ? 'bg-[#F4F6F8] text-[#6B7280]' : 'bg-[#ff5722] text-white'}`}>
                {job.status === 'Completed' ? <><Eye size={14} /> View</> : <><Play size={14} /> Start</>}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 bg-white border-t border-[#E5E7EB] px-4 py-2 grid grid-cols-4 gap-1" style={{ maxWidth: 375, width: '100%' }}>
        {navItems.map(n => (
          <button key={n.label} onClick={() => setActiveNav(n.label)}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all min-h-[48px] ${activeNav === n.label ? 'text-[#ff5722]' : 'text-[#6B7280]'}`}>
            <n.icon size={20} />
            <span className="text-[10px] font-medium">{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Screen 2: Job Detail ─────────────────────────────────────────────────────
function JobDetail({ job, onBack, onStart }: { job: Job; onBack: () => void; onStart: () => void }) {
  const [confirmStart, setConfirmStart] = useState(false);
  const [notes, setNotes] = useState('');

  return (
    <div className="bg-[#F4F6F8] min-h-screen flex flex-col" style={{ maxWidth: 375, margin: '0 auto' }}>
      <div className="bg-[#ff5722] px-4 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center min-h-[48px] min-w-[48px]">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <p className="text-white font-bold text-lg">Order {job.id}</p>
          <JobStatusChip status={job.status} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">
        {/* Vehicle card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
          <p className="text-3xl font-black text-[#ff5722] tracking-widest font-mono">{job.plate}</p>
          <p className="text-lg font-bold text-[#1F2937] mt-1">{job.vehicle}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-5 h-5 rounded-full bg-white border-2 border-[#E5E7EB]" style={{ backgroundColor: '#F5F5DC' }} />
            <span className="text-sm text-[#6B7280]">Beige · 87,450 km</span>
          </div>
        </div>

        {/* Customer info */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-3">Customer</p>
          <p className="text-base font-bold text-[#1F2937]">{job.customer}</p>
          <a href={`tel:${job.phone}`} className="flex items-center gap-2 mt-2 text-[#ff8a65] font-medium text-sm min-h-[48px]">
            <Phone size={16} /> {job.phone}
          </a>
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-amber-700">⚠ Special Note</p>
            <p className="text-xs text-amber-600 mt-0.5">Customer requests extra attention to engine bay — previous mechanic flagged oil leak</p>
          </div>
        </div>

        {/* Map thumbnail */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="bg-[#E5E7EB] h-32 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 opacity-60" />
            <div className="relative text-center">
              <MapPin size={28} className="text-[#C0392B] mx-auto" />
              <p className="text-xs font-medium text-[#1F2937] mt-1">Tap to open navigation</p>
            </div>
          </div>
          <div className="p-3 flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">{job.location}</p>
            <span className="text-xs font-semibold text-[#ff8a65]">{job.distance}</span>
          </div>
        </div>

        {/* Previous inspections */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-3">Previous Inspections</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#1F2937]">Last inspected: Jan 15, 2026</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Score: 81/100 · Good Condition</p>
            </div>
            <button className="px-3 py-2 bg-[#F4F6F8] text-[#ff8a65] text-xs rounded-xl font-medium min-h-[48px]">View Report</button>
          </div>
        </div>

        {/* Inspector notes */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-2">Inspector Notes</p>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="Add job-specific notes before starting..."
            className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 resize-none" />
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 bg-white border-t border-[#E5E7EB] p-4" style={{ maxWidth: 375, width: '100%' }}>
        {job.status !== 'Completed' ? (
          <button onClick={() => setConfirmStart(true)}
            className="w-full py-4 bg-[#ff5722] text-white rounded-2xl text-base font-bold flex items-center justify-center gap-2 min-h-[56px]">
            <Play size={18} /> START INSPECTION
          </button>
        ) : (
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-[#F4F6F8] text-[#1F2937] rounded-2xl text-sm font-bold min-h-[48px]">View Report</button>
            <button className="flex-1 py-3 bg-[#ff8a65] text-white rounded-2xl text-sm font-bold min-h-[48px] flex items-center justify-center gap-1.5">
              <Share2 size={14} /> Share
            </button>
          </div>
        )}
      </div>

      {/* Confirm start modal */}
      {confirmStart && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" style={{ maxWidth: 375, margin: '0 auto' }}>
          <div className="bg-white rounded-t-3xl p-6 w-full">
            <p className="text-lg font-bold text-[#1F2937] mb-2">Ready to start?</p>
            <p className="text-sm text-[#6B7280] mb-6">Starting timer and locking this job to you. Ready?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmStart(false)} className="flex-1 py-3.5 border border-[#E5E7EB] rounded-2xl font-semibold text-[#6B7280] min-h-[48px]">Cancel</button>
              <button onClick={() => { setConfirmStart(false); onStart(); }} className="flex-1 py-3.5 bg-[#ff5722] text-white rounded-2xl font-bold min-h-[48px]">Start</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Screen 3: Section Overview ───────────────────────────────────────────────
function SectionOverview({ onSectionSelect, onFinish }: { onSectionSelect: (s: Section) => void; onFinish: () => void }) {
  const [elapsed, setElapsed] = useState(222);
  const [allPassModal, setAllPassModal] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const completed = sections.filter(s => s.status.startsWith('complete')).length;
  const pct = Math.round((completed / sections.length) * 100);
  const allDone = completed === sections.length;

  const statusDot = (s: Section['status']) => {
    if (s === 'not-started') return <span className="w-3 h-3 rounded-full bg-[#E5E7EB] border-2 border-[#D1D5DB]" />;
    if (s === 'in-progress') return <span className="w-3 h-3 rounded-full bg-[#D35400]" />;
    if (s === 'complete-pass') return <CheckCircle size={14} className="text-[#1A7A4A]" />;
    return <XCircle size={14} className="text-[#C0392B]" />;
  };

  return (
    <div className="bg-[#F4F6F8] min-h-screen flex flex-col" style={{ maxWidth: 375, margin: '0 auto' }}>
      {/* Header */}
      <div className="bg-[#ff5722] px-4 pt-10 pb-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-bold text-base">2019 Toyota Camry</p>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
            <Clock size={14} className="text-white" />
            <span className="text-white font-bold text-base">{fmt(elapsed)}</span>
          </div>
        </div>

        {/* Progress ring */}
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="#ff8a65" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white font-black text-lg leading-none">{pct}%</span>
            </div>
          </div>
          <div>
            <p className="text-white font-bold text-lg">{completed}/{sections.length} Sections</p>
            <div className="flex gap-3 mt-1">
              <span className="text-white/70 text-xs">47 items done</span>
              <span className="text-[#C0392B] text-xs font-semibold">4 defects</span>
              <span className="text-white/70 text-xs">~6 min left</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="grid grid-cols-3 gap-2.5">
          {sections.map(s => (
            <button key={s.id} onClick={() => onSectionSelect(s)}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-3 text-left active:scale-95 transition-transform shadow-sm">
              <div className="flex justify-end mb-2">{statusDot(s.status)}</div>
              <p className="text-xs font-bold text-[#1F2937] leading-tight">{s.name}</p>
              <p className="text-[10px] text-[#6B7280] mt-1">{s.items} items</p>
              <p className="text-[10px] text-[#6B7280]">{s.timeEst}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 bg-white border-t border-[#E5E7EB] p-4 space-y-2" style={{ maxWidth: 375, width: '100%' }}>
        {allDone ? (
          <button onClick={onFinish} className="w-full py-4 bg-[#1A7A4A] text-white rounded-2xl text-base font-bold min-h-[56px]">
            Finish & Review ✓
          </button>
        ) : (
          <>
            <button onClick={onFinish} className="w-full py-3.5 bg-[#ff5722] text-white rounded-2xl text-sm font-bold min-h-[48px]">
              Finish & Review
            </button>
            <button onClick={() => setAllPassModal(true)} className="w-full py-3 border border-[#E5E7EB] text-[#6B7280] rounded-2xl text-sm font-medium min-h-[48px]">
              ALL PASS (mark remaining)
            </button>
          </>
        )}
      </div>

      {allPassModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" style={{ maxWidth: 375, margin: '0 auto' }}>
          <div className="bg-white rounded-t-3xl p-6 w-full">
            <p className="text-lg font-bold text-[#1F2937] mb-2">Mark All Remaining as Pass?</p>
            <p className="text-sm text-[#6B7280] mb-6">This will mark {sections.filter(s => s.status === 'not-started').length} sections as fully passing. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setAllPassModal(false)} className="flex-1 py-3.5 border border-[#E5E7EB] rounded-2xl font-semibold text-[#6B7280] min-h-[48px]">Cancel</button>
              <button onClick={() => setAllPassModal(false)} className="flex-1 py-3.5 bg-[#1A7A4A] text-white rounded-2xl font-bold min-h-[48px]">Confirm All Pass</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Screen 4: Section Checklist ──────────────────────────────────────────────
function SectionChecklist({ section, onBack, onNext }: { section: Section; onBack: () => void; onNext: () => void }) {
  const [items, setItems] = useState<CheckItem[]>(checklistItems);
  const [expandedFail, setExpandedFail] = useState<string | null>('ci1');

  const setResult = (id: string, side: 'left' | 'right' | 'single', val: CheckResult) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item };
      if (side === 'left') updated.leftResult = val;
      else if (side === 'right') updated.rightResult = val;
      else updated.singleResult = val;
      const hasFail = (updated.leftResult === 'fail' || updated.rightResult === 'fail' || updated.singleResult === 'fail');
      updated.hasFail = hasFail;
      if (hasFail) setExpandedFail(id);
      return updated;
    }));
  };

  const done = items.filter(i => {
    if (i.mode === 'paired') return i.leftResult !== null && i.rightResult !== null;
    return i.singleResult !== null;
  }).length;

  const btnClass = (active: boolean, type: 'pass' | 'fail' | 'na') => {
    if (!active) return 'bg-[#F4F6F8] text-[#6B7280] border border-[#E5E7EB]';
    if (type === 'pass') return 'bg-[#1A7A4A] text-white border border-[#1A7A4A]';
    if (type === 'fail') return 'bg-[#C0392B] text-white border border-[#C0392B]';
    return 'bg-[#6B7280] text-white border border-[#6B7280]';
  };

  return (
    <div className="bg-[#F4F6F8] min-h-screen flex flex-col" style={{ maxWidth: 375, margin: '0 auto' }}>
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-4 pt-10 pb-3 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="w-9 h-9 bg-[#F4F6F8] rounded-xl flex items-center justify-center min-h-[48px] min-w-[48px]">
            <ChevronLeft size={18} className="text-[#1F2937]" />
          </button>
          <div className="flex-1">
            <p className="font-bold text-[#1F2937] text-base">{section.name}</p>
            <p className="text-xs text-[#6B7280]">{done}/{items.length} items done</p>
          </div>
          <p className="text-xs text-[#6B7280]">💾 Saved 2s ago</p>
        </div>
        <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div className="h-full bg-[#ff8a65] rounded-full transition-all" style={{ width: `${(done / items.length) * 100}%` }} />
        </div>
      </div>

      {/* Checklist */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 pb-28">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-[#1F2937]">{item.name}</p>
                <button className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#1F2937]">
                  <Camera size={16} />
                </button>
              </div>

              {item.mode === 'paired' ? (
                <div className="grid grid-cols-2 gap-2">
                  {(['left', 'right'] as const).map(side => (
                    <div key={side} className="space-y-1">
                      <p className="text-[10px] text-[#6B7280] uppercase font-semibold">{side}</p>
                      <div className="grid grid-cols-2 gap-1">
                        <button onClick={() => setResult(item.id, side, 'pass')}
                          className={`py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${btnClass(side === 'left' ? item.leftResult === 'pass' : item.rightResult === 'pass', 'pass')}`}>
                          ✓ PASS
                        </button>
                        <button onClick={() => setResult(item.id, side, 'fail')}
                          className={`py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${btnClass(side === 'left' ? item.leftResult === 'fail' : item.rightResult === 'fail', 'fail')}`}>
                          ✗ FAIL
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  <button onClick={() => setResult(item.id, 'single', 'pass')}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${btnClass(item.singleResult === 'pass', 'pass')}`}>
                    ✓ PASS
                  </button>
                  <button onClick={() => setResult(item.id, 'single', 'fail')}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${btnClass(item.singleResult === 'fail', 'fail')}`}>
                    ✗ FAIL
                  </button>
                  <button onClick={() => setResult(item.id, 'single', 'na')}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${btnClass(item.singleResult === 'na', 'na')}`}>
                    ⊘ N/A
                  </button>
                </div>
              )}
            </div>

            {/* Fail expansion */}
            {item.hasFail && expandedFail === item.id && (
              <div className="border-t border-[#E5E7EB] bg-red-50 p-3 space-y-3">
                <p className="text-xs font-bold text-[#C0392B] flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Defect Details — {item.name}
                </p>
                <div>
                  <p className="text-[10px] text-[#6B7280] mb-1.5 font-semibold uppercase">Severity</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Minor', 'Major', 'Critical'] as Severity[]).map(sev => (
                      <button key={sev as string}
                        onClick={() => setItems(prev => prev.map(x => x.id === item.id ? { ...x, severity: sev } : x))}
                        className={`py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${item.severity === sev
                          ? sev === 'Critical' ? 'bg-[#C0392B] text-white' : sev === 'Major' ? 'bg-[#D35400] text-white' : 'bg-yellow-400 text-white'
                          : 'bg-white border border-[#E5E7EB] text-[#6B7280]'}`}>
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={item.defectNote || ''}
                  onChange={e => setItems(prev => prev.map(x => x.id === item.id ? { ...x, defectNote: e.target.value } : x))}
                  rows={2} placeholder="Describe the defect..."
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 resize-none" />
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#6B7280] flex items-center justify-center gap-1.5 min-h-[44px]">
                    <Mic size={13} /> Voice Note
                  </button>
                  <button className="flex-1 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#6B7280] flex items-center justify-center gap-1.5 min-h-[44px]">
                    <Camera size={13} /> Add Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 bg-white border-t border-[#E5E7EB] p-4 space-y-2" style={{ maxWidth: 375, width: '100%' }}>
        <p className="text-xs text-center text-[#6B7280]">{done} / {items.length} items completed</p>
        <button onClick={onNext}
          className={`w-full py-3.5 rounded-2xl text-sm font-bold min-h-[48px] transition-all ${done === items.length ? 'bg-[#1A7A4A] text-white' : 'bg-[#E5E7EB] text-[#6B7280] cursor-not-allowed'}`}>
          Section Complete ✓
        </button>
        <div className="flex gap-2">
          <button onClick={onBack} className="flex-1 py-2.5 bg-[#F4F6F8] text-[#6B7280] rounded-xl text-xs font-medium min-h-[44px] flex items-center justify-center gap-1">
            <ChevronLeft size={12} /> Previous
          </button>
          <button onClick={onNext} className="flex-1 py-2.5 bg-[#F4F6F8] text-[#6B7280] rounded-xl text-xs font-medium min-h-[44px] flex items-center justify-center gap-1">
            Next <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 5: Review & Submit ────────────────────────────────────────────────
function ReviewAndSubmit({ onSubmit }: { onSubmit: () => void }) {
  const [signed, setSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [online] = useState(true);
  const score = 73;
  const scoreColor = score >= 71 ? '#1A7A4A' : score >= 41 ? '#D35400' : '#C0392B';

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); onSubmit(); }, 2000);
  };

  return (
    <div className="bg-[#F4F6F8] min-h-screen flex flex-col" style={{ maxWidth: 375, margin: '0 auto' }}>
      <div className="bg-[#ff5722] px-4 pt-10 pb-5">
        <p className="text-white font-bold text-xl mb-4">Review & Submit</p>
        {/* Score gauge */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12" />
              <circle cx="64" cy="64" r="54" fill="none" stroke={scoreColor} strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - score / 100)}`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white font-black text-3xl leading-none">{score}</span>
              <span className="text-white/60 text-xs">/100</span>
            </div>
          </div>
          <p className="text-white font-bold text-base mt-2" style={{ color: scoreColor }}>Vehicle Health: Good</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total', value: '210', color: 'text-[#1F2937]' },
            { label: 'Pass', value: '198', color: 'text-[#1A7A4A]' },
            { label: 'Fail', value: '8', color: 'text-[#C0392B]' },
            { label: 'N/A', value: '4', color: 'text-[#6B7280]' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-3 text-center">
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-[#6B7280]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Defects list */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB]">
            <p className="font-bold text-[#1F2937]">Defects Found ({defects.length})</p>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {defects.map((d, i) => (
              <div key={i} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-[#1F2937]">{d.section} → {d.item}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${d.severity === 'Critical' ? 'bg-red-100 text-red-700' : d.severity === 'Major' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {d.severity}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280]">{d.desc}</p>
                <button className="mt-2 text-xs text-[#ff8a65] flex items-center gap-1">
                  <Pen size={10} /> Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Signature pad */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
          <p className="font-bold text-[#1F2937] mb-3">Inspector Sign-Off</p>
          <div className="border-2 border-dashed border-[#E5E7EB] rounded-2xl h-28 flex items-center justify-center relative overflow-hidden"
            onClick={() => setSigned(true)}>
            {signed ? (
              <div className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 280 100" className="w-full h-full p-4">
                  <path d="M20,60 Q40,20 60,50 Q80,80 100,40 Q120,10 140,50 Q160,80 180,45 Q200,20 220,55 Q240,75 260,50" fill="none" stroke="#ff5722" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            ) : (
              <div className="text-center">
                <Pen size={24} className="text-[#E5E7EB] mx-auto mb-1" />
                <p className="text-sm text-[#6B7280]">Tap to sign</p>
              </div>
            )}
          </div>
          {signed && (
            <button onClick={() => setSigned(false)} className="mt-2 text-xs text-[#C0392B] hover:underline">Clear</button>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="fixed bottom-0 bg-white border-t border-[#E5E7EB] p-4" style={{ maxWidth: 375, width: '100%' }}>
        {online ? (
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-4 bg-[#1A7A4A] text-white rounded-2xl text-base font-bold min-h-[56px] flex items-center justify-center gap-2">
            {submitting ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating report...</>
            ) : (
              <><Send size={18} /> Submit Report</>
            )}
          </button>
        ) : (
          <div className="space-y-2">
            <button className="w-full py-4 bg-[#D35400] text-white rounded-2xl text-base font-bold min-h-[56px]">
              Save & Submit When Online
            </button>
            <p className="text-center text-xs text-[#C0392B]">🔴 Offline Mode — Report saved locally</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Screen 6: Report Preview ─────────────────────────────────────────────────
function ReportPreview({ onBack }: { onBack: () => void }) {
  const [flagModal, setFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const score = 73;
  const scoreColor = '#1A7A4A';

  return (
    <div className="bg-[#F4F6F8] min-h-screen flex flex-col" style={{ maxWidth: 375, margin: '0 auto' }}>
      <div className="bg-[#ff5722] px-4 pt-10 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center min-h-[48px] min-w-[48px]">
            <ChevronLeft size={18} className="text-white" />
          </button>
          <p className="text-white font-bold text-base">Report Preview</p>
        </div>
        <button className="flex items-center gap-1.5 bg-white/10 px-3 py-2 rounded-xl text-white text-sm font-medium min-h-[48px]">
          <Share2 size={14} /> Share
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Report card */}
        <div className="bg-white mx-4 mt-4 rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-[#ff5722] p-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-black text-lg tracking-tight">CARSCHEK</span>
              <div className="text-right">
                <p className="text-white/70 text-xs">Report #CS-2026-4521</p>
                <p className="text-white/70 text-xs">Apr 10, 2026</p>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="p-5 flex flex-col items-center border-b border-[#E5E7EB]">
            <div className="relative w-24 h-24 mb-2">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                <circle cx="48" cy="48" r="40" fill="none" stroke={scoreColor} strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-black text-2xl text-[#1F2937]">{score}</span>
                <span className="text-[#6B7280] text-[10px]">/100</span>
              </div>
            </div>
            <p className="font-bold text-[#1A7A4A] text-base">GOOD CONDITION</p>
            <div className="grid grid-cols-4 gap-2 mt-3 w-full">
              {[{ label: 'Body', score: 68 }, { label: 'Engine', score: 72 }, { label: 'Interior', score: 85 }, { label: 'Electrical', score: 79 }].map(s => (
                <div key={s.label} className="text-center">
                  <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-[#ff8a65] rounded-full" style={{ width: `${s.score}%` }} />
                  </div>
                  <p className="text-[9px] text-[#6B7280]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle info */}
          <div className="p-4 border-b border-[#E5E7EB]">
            <p className="font-bold text-[#1F2937] text-base">2019 Toyota Camry LE</p>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {[['Plate', 'KJA 234 AA'], ['Mileage', '87,450 km'], ['Colour', 'Beige'], ['VIN', 'JTMBF3EH4...']].map(([k, v]) => (
                <div key={k}>
                  <span className="text-[10px] text-[#6B7280]">{k}: </span>
                  <span className="text-xs font-medium text-[#1F2937]">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Critical findings */}
          <div className="p-4 border-b border-[#E5E7EB]">
            <div className="border border-[#C0392B] rounded-xl p-3 bg-red-50">
              <p className="text-xs font-bold text-[#C0392B] mb-2">⚠ 1 Critical Issue Found</p>
              <p className="text-xs text-[#1F2937]">Engine Bay → Valve Cover Seal: Oil leak from valve cover gasket</p>
            </div>
          </div>

          {/* Sections */}
          <div className="p-4 border-b border-[#E5E7EB]">
            <p className="font-semibold text-[#1F2937] mb-3 text-sm">Inspection Sections</p>
            <div className="space-y-2">
              {sections.slice(0, 6).map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                  <p className="text-sm text-[#1F2937]">{s.name}</p>
                  <div className="flex items-center gap-2">
                    {s.status === 'complete-fail' ? <XCircle size={14} className="text-[#C0392B]" /> : <CheckCircle size={14} className="text-[#1A7A4A]" />}
                    <span className="text-xs text-[#6B7280]">{s.items} items</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inspector footer */}
          <div className="p-4 bg-[#F9FAFB]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-sm font-bold">EO</div>
              <div>
                <p className="text-sm font-bold text-[#1F2937]">Emeka Okonkwo</p>
                <p className="text-xs text-[#6B7280]">Inspector ID: INS-001 · Certified</p>
              </div>
            </div>
            <div className="border border-dashed border-[#E5E7EB] rounded-xl p-3 flex items-center justify-center gap-2">
              <div className="w-12 h-12 bg-[#E5E7EB] rounded-lg flex items-center justify-center">
                <p className="text-[8px] text-[#6B7280] text-center leading-tight">QR&lt;br/&gt;CODE</p>
              </div>
              <p className="text-xs text-[#6B7280]">Scan to verify at carschek.com</p>
            </div>
            <p className="text-[10px] text-[#6B7280] text-center mt-2">This report is valid for 90 days from inspection date</p>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 bg-white border-t border-[#E5E7EB] p-4 space-y-2" style={{ maxWidth: 375, width: '100%' }}>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              const text = encodeURIComponent('Your Carschek Vehicle Inspection Report is ready. View it here: https://carschek.com/reports/CS-2026-4521');
              window.open(`https://wa.me/?text=${text}`, '_blank');
            }}
            className="py-3 bg-[#25D366] text-white rounded-2xl text-xs font-bold min-h-[48px] flex items-center justify-center gap-1">
            📤 WhatsApp
          </button>
          <button
            onClick={() => {
              window.open('sms:?body=' + encodeURIComponent('Your Carschek report is ready: https://carschek.com/reports/CS-2026-4521'), '_blank');
            }}
            className="py-3 bg-[#ff8a65] text-white rounded-2xl text-xs font-bold min-h-[48px] flex items-center justify-center gap-1">
            📱 SMS
          </button>
          <button
            onClick={() => window.print()}
            className="py-3 bg-[#ff5722] text-white rounded-2xl text-xs font-bold min-h-[48px] flex items-center justify-center gap-1">
            ⬇ PDF
          </button>
        </div>
        <button onClick={() => setFlagModal(true)}
          className="w-full py-3 border border-[#C0392B] text-[#C0392B] rounded-2xl text-xs font-bold min-h-[48px] flex items-center justify-center gap-1.5">
          <Flag size={14} /> Flag for QA Review
        </button>
      </div>

      {flagModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" style={{ maxWidth: 375, margin: '0 auto' }}>
          <div className="bg-white rounded-t-3xl p-6 w-full">
            <p className="text-lg font-bold text-[#1F2937] mb-3">Flag for QA Review</p>
            <textarea value={flagReason} onChange={e => setFlagReason(e.target.value)} rows={3}
              placeholder="Describe the reason for flagging..."
              className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none resize-none" />
            <div className="flex gap-3">
              <button onClick={() => setFlagModal(false)} className="flex-1 py-3.5 border border-[#E5E7EB] rounded-2xl font-semibold text-[#6B7280] min-h-[48px]">Cancel</button>
              <button onClick={() => setFlagModal(false)} className="flex-1 py-3.5 bg-[#C0392B] text-white rounded-2xl font-bold min-h-[48px]">Submit Flag</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ onViewReport }: { onViewReport: () => void }) {
  return (
    <div className="bg-[#F4F6F8] min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ maxWidth: 375, margin: '0 auto' }}>
      <div className="w-24 h-24 bg-[#1A7A4A] rounded-full flex items-center justify-center mb-6 shadow-lg">
        <CheckCircle size={48} className="text-white" />
      </div>
      <h2 className="text-2xl font-black text-[#1F2937] mb-2">Report Submitted! 🎉</h2>
      <p className="text-[#6B7280] text-sm mb-8">Your QA team will review within 2 hours</p>
      <button onClick={onViewReport}
        className="w-full py-4 bg-[#ff5722] text-white rounded-2xl text-base font-bold min-h-[56px]">
        View Report Preview
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type Screen = 'home' | 'job-detail' | 'section-overview' | 'section-checklist' | 'review-submit' | 'success' | 'report-preview';

export default function InspectorPWAPage() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  return (
    <AppLayout currentPath="/inspector-pwa">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Inspector PWA — Mobile Screens</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">Mobile-first inspector app (375px viewport simulation)</p>
          </div>
          {/* Screen nav */}
          <div className="flex flex-wrap gap-2">
            {([
              ['home', 'Home'], ['job-detail', 'Job Detail'], ['section-overview', 'Sections'],
              ['section-checklist', 'Checklist'], ['review-submit', 'Review'], ['report-preview', 'Report']
            ] as [Screen, string][]).map(([s, label]) => (
              <button key={s} onClick={() => {
                if (s === 'job-detail' && !selectedJob) setSelectedJob(jobs[0]);
                if (s === 'section-checklist' && !selectedSection) setSelectedSection(sections[0]);
                setScreen(s);
              }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${screen === s ? 'bg-[#ff5722] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#ff8a65]'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Phone frame */}
        <div className="flex justify-center">
          <div className="relative" style={{ width: 375 }}>
            <div className="rounded-[2.5rem] border-4 border-[#1F2937] shadow-2xl overflow-hidden bg-white" style={{ minHeight: 700 }}>
              {screen === 'home' && (
                <InspectorHome onJobSelect={job => { setSelectedJob(job); setScreen('job-detail'); }} />
              )}
              {screen === 'job-detail' && selectedJob && (
                <JobDetail job={selectedJob} onBack={() => setScreen('home')} onStart={() => setScreen('section-overview')} />
              )}
              {screen === 'section-overview' && (
                <SectionOverview
                  onSectionSelect={s => { setSelectedSection(s); setScreen('section-checklist'); }}
                  onFinish={() => setScreen('review-submit')}
                />
              )}
              {screen === 'section-checklist' && selectedSection && (
                <SectionChecklist section={selectedSection} onBack={() => setScreen('section-overview')} onNext={() => setScreen('section-overview')} />
              )}
              {screen === 'review-submit' && (
                <ReviewAndSubmit onSubmit={() => setScreen('success')} />
              )}
              {screen === 'success' && (
                <SuccessScreen onViewReport={() => setScreen('report-preview')} />
              )}
              {screen === 'report-preview' && (
                <ReportPreview onBack={() => setScreen('success')} />
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
