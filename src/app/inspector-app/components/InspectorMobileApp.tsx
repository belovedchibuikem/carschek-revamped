'use client';
import React, { useState, useEffect } from 'react';
import { Home, Briefcase, Bell, User, ChevronLeft, ChevronRight, Camera, CheckCircle, AlertTriangle, MapPin, Phone, Navigation, Clock, Star, Wifi, WifiOff, RefreshCw, Check, X, Plus, Trash2, RotateCcw, Zap, Edit3, Send, LogOut, Settings, Shield, Award, Eye, Car, Clipboard, BarChart2, ArrowRight, Circle, Minus, Info, Download } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


// ─── Types ────────────────────────────────────────────────────────────────────
type TabName = 'Home' | 'Jobs' | 'Inspect' | 'Notifications' | 'Profile';
type JobStatus = 'Upcoming' | 'En Route' | 'In Progress' | 'Awaiting QA' | 'Completed';
type CheckResult = 'pass' | 'fail' | 'na' | null;
type InspectScreen =
  | 'job-list' |'job-detail' |'inspection-hub' |'vehicle-photos' |'damage-photos' |'checklist' |'grading' |'sync-review';

interface Job {
  id: string;
  ckId: string;
  status: JobStatus;
  vehicle: string;
  year: number;
  plate: string;
  customer: string;
  phone: string;
  time: string;
  location: string;
  distance: string;
  priority: 'High' | 'Normal' | 'Low';
  inspectionType: string;
  synced?: boolean;
}

interface PhotoItem {
  id: string;
  name: string;
  captured: boolean;
  required: boolean;
}

interface DamagePhoto {
  id: string;
  label: string;
  comment: string;
  captured: boolean;
  severity?: 'Minor' | 'Major' | 'Critical';
}

interface CheckItem {
  id: string;
  name: string;
  mode: 'paired' | 'single';
  leftResult?: CheckResult;
  rightResult?: CheckResult;
  singleResult?: CheckResult;
  severity?: 'Minor' | 'Major' | 'Critical';
  note?: string;
}

interface InspectionSection {
  id: string;
  name: string;
  icon: string;
  items: CheckItem[];
  status: 'not-started' | 'in-progress' | 'complete';
}

interface GradeCategory {
  id: string;
  name: string;
  weight: number;
  score: number | null;
  maxScore: number;
  note: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_JOBS: Job[] = [
  {
    id: 'job-1', ckId: 'CK-41', status: 'En Route',
    vehicle: 'Toyota Camry', year: 2019, plate: 'LSD 260 JE',
    customer: 'Adaeze Mensah', phone: '+234 801 234 5678',
    time: '10:30 AM', location: '45 Admiralty Way, Lekki Phase 1, Lagos',
    distance: '3.2 km', priority: 'High', inspectionType: 'Full Inspection',
  },
  {
    id: 'job-2', ckId: 'CK-42', status: 'Upcoming',
    vehicle: 'Honda Accord', year: 2020, plate: 'LND 891 KK',
    customer: 'Chidi Nwosu', phone: '+234 802 345 6789',
    time: '1:00 PM', location: '12 Ozumba Mbadiwe Ave, Victoria Island',
    distance: '8.1 km', priority: 'Normal', inspectionType: 'Pre-Purchase',
  },
  {
    id: 'job-3', ckId: 'CK-39', status: 'Completed',
    vehicle: 'Ford Ranger', year: 2018, plate: 'ABJ 445 FC',
    customer: 'Fatima Bello', phone: '+234 803 456 7890',
    time: '8:00 AM', location: '3 Wuse Zone 5, Abuja',
    distance: '—', priority: 'Normal', inspectionType: 'Full Inspection',
    synced: true,
  },
  {
    id: 'job-4', ckId: 'CK-40', status: 'Awaiting QA',
    vehicle: 'Mercedes-Benz C300', year: 2021, plate: 'KJA 234 AA',
    customer: 'Emeka Obi', phone: '+234 804 567 8901',
    time: '9:00 AM', location: '7 Bourdillon Road, Ikoyi',
    distance: '—', priority: 'High', inspectionType: 'Full Inspection',
    synced: false,
  },
];

const VEHICLE_PHOTOS: PhotoItem[] = [
  { id: 'vp1', name: 'Car Overview', captured: false, required: true },
  { id: 'vp2', name: 'Front View', captured: false, required: true },
  { id: 'vp3', name: 'Front Left', captured: false, required: true },
  { id: 'vp4', name: 'Front Right', captured: false, required: true },
  { id: 'vp5', name: 'Rear View', captured: false, required: true },
  { id: 'vp6', name: 'Rear Left', captured: false, required: true },
  { id: 'vp7', name: 'Rear Right', captured: false, required: true },
  { id: 'vp8', name: 'Interior Front', captured: false, required: true },
  { id: 'vp9', name: 'Interior Rear', captured: false, required: false },
  { id: 'vp10', name: 'Engine Bay', captured: false, required: true },
  { id: 'vp11', name: 'Tyre / Wheel', captured: false, required: false },
];

const INITIAL_SECTIONS: InspectionSection[] = [
  {
    id: 's1', name: 'Body Frame', icon: '🚗', status: 'not-started',
    items: [
      { id: 'bf1', name: 'Front Rail', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'bf2', name: 'Rear Rail', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'bf3', name: 'Roof Panel', mode: 'single', singleResult: null },
      { id: 'bf4', name: 'Hood / Bonnet', mode: 'single', singleResult: null },
      { id: 'bf5', name: 'Front Bumper', mode: 'single', singleResult: null },
      { id: 'bf6', name: 'Rear Bumper', mode: 'single', singleResult: null },
      { id: 'bf7', name: 'Door Sill', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'bf8', name: 'A-Pillar', mode: 'paired', leftResult: null, rightResult: null },
    ],
  },
  {
    id: 's2', name: 'Engine Bay', icon: '⚙️', status: 'not-started',
    items: [
      { id: 'eb1', name: 'Engine Oil Level', mode: 'single', singleResult: null },
      { id: 'eb2', name: 'Coolant Level', mode: 'single', singleResult: null },
      { id: 'eb3', name: 'Valve Cover Seal', mode: 'single', singleResult: null },
      { id: 'eb4', name: 'Timing Belt / Chain', mode: 'single', singleResult: null },
      { id: 'eb5', name: 'Air Filter', mode: 'single', singleResult: null },
      { id: 'eb6', name: 'Battery Terminals', mode: 'single', singleResult: null },
    ],
  },
  {
    id: 's3', name: 'Transmission', icon: '🔧', status: 'not-started',
    items: [
      { id: 'tr1', name: 'Fluid Level', mode: 'single', singleResult: null },
      { id: 'tr2', name: 'Gear Shift Response', mode: 'single', singleResult: null },
      { id: 'tr3', name: 'Clutch (if manual)', mode: 'single', singleResult: null },
      { id: 'tr4', name: 'Driveshaft / CV Joints', mode: 'paired', leftResult: null, rightResult: null },
    ],
  },
  {
    id: 's4', name: 'Suspension', icon: '🔩', status: 'not-started',
    items: [
      { id: 'su1', name: 'Shock Absorbers', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'su2', name: 'Control Arms', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'su3', name: 'Tie Rods', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'su4', name: 'Sway Bar Links', mode: 'paired', leftResult: null, rightResult: null },
    ],
  },
  {
    id: 's5', name: 'Brakes', icon: '🛑', status: 'not-started',
    items: [
      { id: 'br1', name: 'Brake Pads', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'br2', name: 'Brake Discs', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'br3', name: 'Brake Fluid Level', mode: 'single', singleResult: null },
      { id: 'br4', name: 'Handbrake Function', mode: 'single', singleResult: null },
    ],
  },
  {
    id: 's6', name: 'Tyres', icon: '⭕', status: 'not-started',
    items: [
      { id: 'ty1', name: 'Tread Depth (Front)', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'ty2', name: 'Tread Depth (Rear)', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'ty3', name: 'Spare Tyre', mode: 'single', singleResult: null },
    ],
  },
  {
    id: 's7', name: 'Lights', icon: '💡', status: 'not-started',
    items: [
      { id: 'li1', name: 'Headlights', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'li2', name: 'Tail Lights', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'li3', name: 'Indicators', mode: 'paired', leftResult: null, rightResult: null },
      { id: 'li4', name: 'Reverse Lights', mode: 'paired', leftResult: null, rightResult: null },
    ],
  },
  {
    id: 's8', name: 'Interior', icon: '🪑', status: 'not-started',
    items: [
      { id: 'in1', name: 'Dashboard / Instrument Cluster', mode: 'single', singleResult: null },
      { id: 'in2', name: 'Seat Condition', mode: 'single', singleResult: null },
      { id: 'in3', name: 'Seatbelts', mode: 'single', singleResult: null },
      { id: 'in4', name: 'Airbag Indicator', mode: 'single', singleResult: null },
      { id: 'in5', name: 'Central Locking', mode: 'single', singleResult: null },
      { id: 'in6', name: 'Window Regulators', mode: 'paired', leftResult: null, rightResult: null },
    ],
  },
  {
    id: 's9', name: 'Electrical', icon: '⚡', status: 'not-started',
    items: [
      { id: 'el1', name: 'Alternator Output', mode: 'single', singleResult: null },
      { id: 'el2', name: 'Battery Charge', mode: 'single', singleResult: null },
      { id: 'el3', name: 'Infotainment System', mode: 'single', singleResult: null },
      { id: 'el4', name: 'Horn', mode: 'single', singleResult: null },
    ],
  },
  {
    id: 's10', name: 'AC System', icon: '❄️', status: 'not-started',
    items: [
      { id: 'ac1', name: 'Cooling Performance', mode: 'single', singleResult: null },
      { id: 'ac2', name: 'Compressor Noise', mode: 'single', singleResult: null },
      { id: 'ac3', name: 'Cabin Filter', mode: 'single', singleResult: null },
    ],
  },
];

const GRADE_CATEGORIES: GradeCategory[] = [
  { id: 'gc1', name: 'Body & Exterior', weight: 25, score: null, maxScore: 25, note: '' },
  { id: 'gc2', name: 'Engine & Mechanical', weight: 30, score: null, maxScore: 30, note: '' },
  { id: 'gc3', name: 'Interior & Comfort', weight: 20, score: null, maxScore: 20, note: '' },
  { id: 'gc4', name: 'Electrical Systems', weight: 15, score: null, maxScore: 15, note: '' },
  { id: 'gc5', name: 'Tyres & Brakes', weight: 10, score: null, maxScore: 10, note: '' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getJobStatusStyle(status: JobStatus) {
  const map: Record<JobStatus, string> = {
    Upcoming: 'bg-[#1E3A5F] text-white',
    'En Route': 'bg-purple-600 text-white',
    'In Progress': 'bg-amber-500 text-white',
    'Awaiting QA': 'bg-teal-600 text-white',
    Completed: 'bg-[#1A7A4A] text-white',
  };
  return map[status];
}

function getPriorityStyle(priority: 'High' | 'Normal' | 'Low') {
  if (priority === 'High') return 'text-red-600 bg-red-50';
  if (priority === 'Low') return 'text-gray-500 bg-gray-100';
  return 'text-blue-600 bg-blue-50';
}

function getScoreColor(score: number) {
  if (score >= 80) return '#1A7A4A';
  if (score >= 60) return '#D35400';
  return '#C0392B';
}

function getScoreLabel(score: number) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Below Average';
  return 'Poor';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MobileHeader({ title, subtitle, onBack, rightAction }: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 pt-safe pb-3 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3 pt-2">
        {onBack && (
          <button onClick={onBack}
            className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 active:bg-gray-100 transition-colors">
            <ChevronLeft size={20} className="text-gray-700" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-900 text-base leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
        {rightAction}
      </div>
    </div>
  );
}

function BottomNav({ active, onChange }: { active: TabName; onChange: (t: TabName) => void }) {
  const items: { icon: React.ElementType; label: TabName; badge?: number }[] = [
    { icon: Home, label: 'Home' },
    { icon: Briefcase, label: 'Jobs', badge: 2 },
    { icon: Clipboard, label: 'Inspect' },
    { icon: Bell, label: 'Notifications', badge: 3 },
    { icon: User, label: 'Profile' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 safe-area-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
      <div className="flex items-stretch max-w-lg mx-auto">
        {items.map(item => (
          <button key={item.label} onClick={() => onChange(item.label)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 relative transition-all active:scale-95 ${active === item.label ? 'text-[#1E3A5F]' : 'text-gray-400'}`}>
            <div className="relative">
              <item.icon size={22} strokeWidth={active === item.label ? 2.5 : 1.8} />
              {item.badge && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium ${active === item.label ? 'font-bold' : ''}`}>{item.label}</span>
            {active === item.label && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#1E3A5F] rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── Screen: Home ─────────────────────────────────────────────────────────────
function HomeScreen({ onNavigate }: { onNavigate: (tab: TabName) => void }) {
  const [isOnline, setIsOnline] = useState(true);
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });

  const stats = [
    { label: 'Today', value: '2', sub: 'jobs assigned', color: '#1E3A5F', bg: '#EFF6FF' },
    { label: 'Completed', value: '1', sub: 'this week', color: '#1A7A4A', bg: '#F0FDF4' },
    { label: 'Pending Sync', value: '1', sub: 'report', color: '#D35400', bg: '#FFF7ED' },
    { label: 'Rating', value: '4.9', sub: 'avg score', color: '#7C3AED', bg: '#F5F3FF' },
  ];

  const activeJob = MOCK_JOBS.find(j => j.status === 'En Route' || j.status === 'In Progress');

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Hero Header */}
      <div className="bg-[#1E3A5F] px-5 pt-12 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-blue-200 text-xs font-medium mb-1">{dateStr}</p>
            <h2 className="text-white text-xl font-bold leading-tight">Good morning,<br />Emeka 👋</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsOnline(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isOnline ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? 'Online' : 'Offline'}
            </button>
            <div className="w-10 h-10 rounded-full bg-[#2E75B6] flex items-center justify-center text-white font-bold text-sm">
              EO
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mt-2">
          {stats.map(s => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-2.5 text-center">
              <p className="text-white font-bold text-lg leading-none">{s.value}</p>
              <p className="text-blue-200 text-[9px] mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Active Job Card */}
        {activeJob && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-xs font-bold">ACTIVE JOB</span>
              </div>
              <span className="text-purple-200 text-xs">{activeJob.ckId}</span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900 text-base">{activeJob.vehicle} {activeJob.year}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{activeJob.plate} · {activeJob.inspectionType}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getJobStatusStyle(activeJob.status)}`}>
                  {activeJob.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                <MapPin size={12} className="text-[#1E3A5F] flex-shrink-0" />
                <span className="truncate">{activeJob.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-4">
                <Clock size={12} className="text-[#1E3A5F] flex-shrink-0" />
                <span>{activeJob.time} · {activeJob.distance}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onNavigate('Jobs')}
                  className="flex-1 bg-[#1E3A5F] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:opacity-90">
                  <Clipboard size={13} /> Start Inspection
                </button>
                <a href={`tel:${activeJob.phone}`}
                  className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 active:bg-gray-100">
                  <Phone size={16} className="text-gray-600" />
                </a>
                <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 active:bg-gray-100">
                  <Navigation size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Camera, label: 'Capture Photos', sub: 'Vehicle & damage', color: '#2E75B6', bg: '#EFF6FF', tab: 'Inspect' as TabName },
              { icon: Clipboard, label: 'Fill Checklist', sub: '12 sections', color: '#1A7A4A', bg: '#F0FDF4', tab: 'Inspect' as TabName },
              { icon: Star, label: 'Grade Car', sub: 'Score & submit', color: '#7C3AED', bg: '#F5F3FF', tab: 'Inspect' as TabName },
              { icon: RefreshCw, label: 'Sync Reports', sub: '1 pending', color: '#D35400', bg: '#FFF7ED', tab: 'Jobs' as TabName },
            ].map(action => (
              <button key={action.label} onClick={() => onNavigate(action.tab)}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-left active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: action.bg }}>
                  <action.icon size={20} style={{ color: action.color }} />
                </div>
                <p className="font-bold text-gray-900 text-sm">{action.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{action.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Pending Sync Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <RefreshCw size={18} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-amber-800 text-sm">1 Report Pending Sync</p>
            <p className="text-amber-600 text-xs mt-0.5">CK-40 · Mercedes-Benz C300</p>
          </div>
          <button onClick={() => onNavigate('Jobs')}
            className="bg-amber-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold active:opacity-90 flex-shrink-0">
            Sync
          </button>
        </div>

        {/* Today's Schedule */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today's Schedule</p>
            <button onClick={() => onNavigate('Jobs')} className="text-[#1E3A5F] text-xs font-semibold">View all</button>
          </div>
          <div className="space-y-2">
            {MOCK_JOBS.filter(j => j.status !== 'Completed').slice(0, 2).map(job => (
              <div key={job.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Car size={18} className="text-[#1E3A5F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{job.vehicle} {job.year}</p>
                  <p className="text-gray-400 text-xs">{job.time} · {job.distance}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getJobStatusStyle(job.status)}`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Jobs List ────────────────────────────────────────────────────────
function JobsScreen({ onStartInspection }: { onStartInspection: (job: Job) => void }) {
  const [filter, setFilter] = useState<'All' | JobStatus>('All');
  const filters: ('All' | JobStatus)[] = ['All', 'En Route', 'Upcoming', 'In Progress', 'Awaiting QA', 'Completed'];
  const filtered = filter === 'All' ? MOCK_JOBS : MOCK_JOBS.filter(j => j.status === filter);

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <MobileHeader title="My Jobs" subtitle={`${MOCK_JOBS.length} total assignments`} />

      {/* Filter chips */}
      <div className="px-4 py-3 overflow-x-auto flex gap-2 no-scrollbar border-b border-gray-100 bg-white">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-600'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 space-y-3">
        {filtered.map(job => (
          <div key={job.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#1E3A5F] bg-[#EFF6FF] px-2 py-0.5 rounded-lg">{job.ckId}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getPriorityStyle(job.priority)}`}>
                    {job.priority}
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getJobStatusStyle(job.status)}`}>
                  {job.status}
                </span>
              </div>

              <p className="font-bold text-gray-900 text-base">{job.vehicle} {job.year}</p>
              <p className="text-gray-500 text-xs mt-0.5 mb-3">{job.plate} · {job.inspectionType}</p>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <User size={12} className="text-gray-400 flex-shrink-0" />
                  <span>{job.customer}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Clock size={12} className="text-gray-400 flex-shrink-0" />
                  <span>{job.time}</span>
                  {job.distance !== '—' && <span className="text-gray-300">·</span>}
                  {job.distance !== '—' && <span>{job.distance} away</span>}
                </div>
              </div>

              {/* Sync status */}
              {job.status === 'Awaiting QA' && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs font-medium ${job.synced ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  {job.synced ? <CheckCircle size={13} /> : <RefreshCw size={13} />}
                  {job.synced ? 'Synced with admin dashboard' : 'Pending sync to admin dashboard'}
                </div>
              )}

              <div className="flex gap-2">
                {(job.status === 'En Route' || job.status === 'Upcoming' || job.status === 'In Progress') && (
                  <button onClick={() => onStartInspection(job)}
                    className="flex-1 bg-[#1E3A5F] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:opacity-90">
                    <Clipboard size={13} />
                    {job.status === 'In Progress' ? 'Continue Inspection' : 'Start Inspection'}
                  </button>
                )}
                {job.status === 'Awaiting QA' && !job.synced && (
                  <button className="flex-1 bg-amber-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:opacity-90">
                    <RefreshCw size={13} /> Sync Now
                  </button>
                )}
                {job.status === 'Completed' && (
                  <button className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                    <Eye size={13} /> View Report
                  </button>
                )}
                <a href={`tel:${job.phone}`}
                  className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 active:bg-gray-100 flex-shrink-0">
                  <Phone size={16} className="text-gray-600" />
                </a>
                {job.distance !== '—' && (
                  <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 active:bg-gray-100 flex-shrink-0">
                    <Navigation size={16} className="text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Screen: Inspection Hub ───────────────────────────────────────────────────
function InspectionHub({ job, onBack, onGoTo }: {
  job: Job;
  onBack: () => void;
  onGoTo: (screen: InspectScreen) => void;
}) {
  const sections = [
    { key: 'vehicle-photos' as InspectScreen, icon: Camera, label: 'Vehicle Photos', sub: '0 / 11 captured', done: false, required: true },
    { key: 'checklist' as InspectScreen, icon: Clipboard, label: 'Inspection Checklist', sub: '0 / 10 sections', done: false, required: true },
    { key: 'damage-photos' as InspectScreen, icon: AlertTriangle, label: 'Damage Photos', sub: 'Add damage evidence', done: false, required: false },
    { key: 'grading' as InspectScreen, icon: Star, label: 'Grade Car', sub: 'Score & finalize', done: false, required: true },
    { key: 'sync-review' as InspectScreen, icon: Send, label: 'Review & Sync', sub: 'Submit to admin', done: false, required: true },
  ];

  const progress = 0;

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <MobileHeader
        title="Inspection Hub"
        subtitle={`${job.ckId} · ${job.vehicle} ${job.year}`}
        onBack={onBack}
      />

      {/* Vehicle summary */}
      <div className="bg-[#1E3A5F] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <Car size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-base">{job.vehicle} {job.year}</p>
            <p className="text-blue-200 text-xs">{job.plate} · {job.inspectionType}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getJobStatusStyle(job.status)}`}>
            {job.status}
          </span>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-blue-200 text-xs">Overall Progress</span>
            <span className="text-white text-xs font-bold">{progress}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Inspection Steps</p>

        {sections.map((section, idx) => (
          <button key={section.key} onClick={() => onGoTo(section.key)}
            className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${section.done ? 'bg-green-50' : 'bg-[#EFF6FF]'}`}>
              <section.icon size={22} className={section.done ? 'text-[#1A7A4A]' : 'text-[#1E3A5F]'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-bold text-gray-900 text-sm">{section.label}</p>
                {section.required && (
                  <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">Required</span>
                )}
              </div>
              <p className="text-gray-400 text-xs">{section.sub}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {section.done ? (
                <CheckCircle size={20} className="text-[#1A7A4A]" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-[10px] font-bold">{idx + 1}</span>
                </div>
              )}
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </button>
        ))}

        {/* Customer info */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Customer</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#1E3A5F] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {job.customer.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{job.customer}</p>
              <p className="text-gray-400 text-xs">{job.phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-gray-500 text-xs">
            <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span>{job.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Vehicle Photos ───────────────────────────────────────────────────
function VehiclePhotosScreen({ onBack }: { onBack: () => void }) {
  const [photos, setPhotos] = useState<PhotoItem[]>(VEHICLE_PHOTOS);
  const [capturing, setCapturing] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const captured = photos.filter(p => p.captured).length;
  const required = photos.filter(p => p.required).length;
  const capturedRequired = photos.filter(p => p.required && p.captured).length;

  const handleCapture = (id: string) => {
    setCapturing(id);
    setTimeout(() => {
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, captured: true } : p));
      setCapturing(null);
    }, 800);
  };

  const handleRetake = (id: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, captured: false } : p));
  };

  const photoEmoji: Record<string, string> = {
    'Car Overview': '🚗', 'Front View': '🚘', 'Front Left': '↖️', 'Front Right': '↗️',
    'Rear View': '🚙', 'Rear Left': '↙️', 'Rear Right': '↘️',
    'Interior Front': '🪑', 'Interior Rear': '💺', 'Engine Bay': '⚙️', 'Tyre / Wheel': '⭕',
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <MobileHeader
        title="Vehicle Photos"
        subtitle={`${captured} / ${photos.length} captured`}
        onBack={onBack}
        rightAction={
          <div className="flex items-center gap-1.5 bg-[#EFF6FF] px-2.5 py-1.5 rounded-xl">
            <Camera size={13} className="text-[#1E3A5F]" />
            <span className="text-[#1E3A5F] text-xs font-bold">{captured}/{photos.length}</span>
          </div>
        }
      />

      {/* Progress bar */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>{capturedRequired}/{required} required photos</span>
          <span className="font-semibold text-[#1E3A5F]">{Math.round((captured / photos.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#1E3A5F] rounded-full transition-all duration-500"
            style={{ width: `${(captured / photos.length) * 100}%` }} />
        </div>
      </div>

      {/* AI tip */}
      <div className="mx-4 mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-2.5">
        <Zap size={15} className="text-blue-600 flex-shrink-0" />
        <p className="text-blue-700 text-xs font-medium">AI will auto-detect damage in photos. Capture clearly in good lighting.</p>
      </div>

      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        {photos.map((photo, idx) => (
          <div key={photo.id}
            className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all ${photo.captured ? 'border-green-200' : 'border-gray-100'}`}>
            {/* Photo area */}
            <div className={`h-28 flex items-center justify-center relative ${photo.captured ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
              {capturing === photo.id ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-gray-500">Capturing...</span>
                </div>
              ) : photo.captured ? (
                <>
                  <span className="text-4xl">{photoEmoji[photo.name] || '📷'}</span>
                  <div className="absolute top-2 right-2 w-6 h-6 bg-[#1A7A4A] rounded-full flex items-center justify-center shadow-sm">
                    <Check size={12} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Camera size={28} className="text-gray-300 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-400">Tap to capture</p>
                </div>
              )}
              {/* Number badge */}
              <div className="absolute top-2 left-2 w-5 h-5 bg-[#1E3A5F] rounded-full flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">{idx + 1}</span>
              </div>
              {/* Required badge */}
              {photo.required && !photo.captured && (
                <div className="absolute bottom-2 left-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                  Required
                </div>
              )}
            </div>
            {/* Controls */}
            <div className="p-2.5">
              <p className="text-xs font-semibold text-gray-800 mb-2 leading-tight">{photo.name}</p>
              {photo.captured ? (
                <button onClick={() => handleRetake(photo.id)}
                  className="w-full py-1.5 border border-gray-200 rounded-lg text-[10px] font-medium text-gray-500 flex items-center justify-center gap-1 active:bg-gray-50">
                  <RotateCcw size={10} /> Retake
                </button>
              ) : (
                <button onClick={() => handleCapture(photo.id)}
                  disabled={capturing !== null}
                  className="w-full py-2 bg-[#1E3A5F] rounded-lg text-[10px] font-bold text-white flex items-center justify-center gap-1.5 active:opacity-90 disabled:opacity-50">
                  <Camera size={11} /> Capture
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4 max-w-lg mx-auto">
        <button onClick={onBack}
          className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all ${capturedRequired === required ? 'bg-[#1A7A4A] text-white' : 'bg-gray-100 text-gray-500'}`}>
          {capturedRequired === required ? '✓ All Required Photos Captured' : `${required - capturedRequired} required photo${required - capturedRequired !== 1 ? 's' : ''} remaining`}
        </button>
      </div>
    </div>
  );
}

// ─── Screen: Damage Photos ────────────────────────────────────────────────────
function DamagePhotosScreen({ onBack }: { onBack: () => void }) {
  const [damages, setDamages] = useState<DamagePhoto[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newComment, setNewComment] = useState('');
  const [capturing, setCapturing] = useState<string | null>(null);

  const addDamage = () => {
    if (!newLabel.trim()) return;
    const id = `d${Date.now()}`;
    setDamages(prev => [...prev, { id, label: newLabel.trim(), comment: newComment.trim(), captured: false }]);
    setNewLabel('');
    setNewComment('');
    setShowAdd(false);
    setCapturing(id);
    setTimeout(() => {
      setDamages(prev => prev.map(d => d.id === id ? { ...d, captured: true, severity: 'Major' } : d));
      setCapturing(null);
    }, 1000);
  };

  const removeDamage = (id: string) => {
    setDamages(prev => prev.filter(d => d.id !== id));
  };

  const severityColor: Record<string, string> = {
    Minor: 'bg-yellow-100 text-yellow-700',
    Major: 'bg-orange-100 text-orange-700',
    Critical: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <MobileHeader
        title="Damage Photos"
        subtitle={`${damages.length} damage${damages.length !== 1 ? 's' : ''} documented`}
        onBack={onBack}
        rightAction={
          <button onClick={() => setShowAdd(true)}
            className="w-9 h-9 bg-[#1E3A5F] rounded-xl flex items-center justify-center active:opacity-90">
            <Plus size={18} className="text-white" />
          </button>
        }
      />

      {/* Add damage modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-5 space-y-4 max-w-lg mx-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Add Damage</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={16} className="text-gray-600" />
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Damage Location / Label *</label>
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
                placeholder="e.g. Front bumper dent, Left door scratch"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Description / Notes</label>
              <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                placeholder="Describe the damage in detail..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F] resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 active:bg-gray-50">
                Cancel
              </button>
              <button onClick={addDamage}
                className="flex-1 py-3 bg-[#1E3A5F] rounded-xl text-sm font-bold text-white active:opacity-90 flex items-center justify-center gap-2">
                <Camera size={15} /> Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {damages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
            <AlertTriangle size={36} className="text-gray-300" />
          </div>
          <p className="font-bold text-gray-700 text-base mb-2">No Damage Documented</p>
          <p className="text-gray-400 text-sm mb-6">Tap the + button to add damage photos with AI severity detection</p>
          <button onClick={() => setShowAdd(true)}
            className="bg-[#1E3A5F] text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 active:opacity-90">
            <Plus size={16} /> Add First Damage
          </button>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {/* AI tip */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-2.5">
            <Zap size={14} className="text-amber-600 flex-shrink-0" />
            <p className="text-amber-700 text-xs">AI auto-classifies severity. You can override after capture.</p>
          </div>

          {damages.map(damage => (
            <div key={damage.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Photo area */}
              <div className={`h-36 flex items-center justify-center relative ${damage.captured ? 'bg-gradient-to-br from-orange-50 to-amber-50' : 'bg-gray-50'}`}>
                {capturing === damage.id ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-500">AI Analyzing...</span>
                  </div>
                ) : damage.captured ? (
                  <>
                    <span className="text-5xl">⚠️</span>
                    <div className="absolute top-2 right-2">
                      {damage.severity && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${severityColor[damage.severity]}`}>
                          {damage.severity}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                      <Zap size={10} className="text-yellow-400" />
                      <span className="text-white text-[9px] font-medium">AI Detected</span>
                    </div>
                  </>
                ) : (
                  <Camera size={32} className="text-gray-300" />
                )}
              </div>
              {/* Info */}
              <div className="p-3">
                <div className="flex items-start justify-between mb-1.5">
                  <p className="font-bold text-gray-900 text-sm flex-1 pr-2">{damage.label}</p>
                  <button onClick={() => removeDamage(damage.id)}
                    className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trash2 size={13} className="text-red-500" />
                  </button>
                </div>
                {damage.comment && <p className="text-gray-500 text-xs mb-2">{damage.comment}</p>}
                {damage.captured && (
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 border border-gray-200 rounded-lg text-[10px] font-medium text-gray-500 flex items-center justify-center gap-1">
                      <RotateCcw size={10} /> Retake
                    </button>
                    <button className="flex-1 py-1.5 border border-gray-200 rounded-lg text-[10px] font-medium text-gray-500 flex items-center justify-center gap-1">
                      <Edit3 size={10} /> Edit Note
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <button onClick={() => setShowAdd(true)}
            className="w-full py-3.5 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-semibold text-gray-400 flex items-center justify-center gap-2 active:bg-gray-50">
            <Plus size={16} /> Add Another Damage
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Screen: Inspection Checklist ─────────────────────────────────────────────
function ChecklistScreen({ onBack }: { onBack: () => void }) {
  const [sections, setSections] = useState<InspectionSection[]>(INITIAL_SECTIONS);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ sectionId: string; itemId: string } | null>(null);
  const [noteText, setNoteText] = useState('');

  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);
  const answeredItems = sections.reduce((acc, s) =>
    acc + s.items.filter(i => i.mode === 'paired'
      ? (i.leftResult !== null && i.rightResult !== null)
      : i.singleResult !== null).length, 0);

  const setResult = (sectionId: string, itemId: string, side: 'left' | 'right' | 'single', result: CheckResult) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const items = s.items.map(item => {
        if (item.id !== itemId) return item;
        if (side === 'single') return { ...item, singleResult: result };
        if (side === 'left') return { ...item, leftResult: result };
        return { ...item, rightResult: result };
      });
      const allAnswered = items.every(i => i.mode === 'paired'
        ? (i.leftResult !== null && i.rightResult !== null)
        : i.singleResult !== null);
      return { ...s, items, status: allAnswered ? 'complete' : 'in-progress' };
    }));
  };

  const resultBtn = (label: string, value: CheckResult, current: CheckResult, onClick: () => void) => {
    const styles: Record<string, string> = {
      pass: current === 'pass' ? 'bg-[#1A7A4A] text-white border-[#1A7A4A]' : 'border-gray-200 text-gray-500',
      fail: current === 'fail' ? 'bg-red-500 text-white border-red-500' : 'border-gray-200 text-gray-500',
      na: current === 'na' ? 'bg-gray-400 text-white border-gray-400' : 'border-gray-200 text-gray-500',
    };
    return (
      <button onClick={onClick}
        className={`flex-1 py-2 border rounded-xl text-xs font-bold transition-all active:scale-95 ${styles[value as string]}`}>
        {label}
      </button>
    );
  };

  const activeSectionData = sections.find(s => s.id === activeSection);

  if (activeSectionData) {
    const sectionAnswered = activeSectionData.items.filter(i =>
      i.mode === 'paired' ? (i.leftResult !== null && i.rightResult !== null) : i.singleResult !== null
    ).length;
    const hasFails = activeSectionData.items.some(i =>
      i.leftResult === 'fail' || i.rightResult === 'fail' || i.singleResult === 'fail'
    );

    return (
      <div className="flex-1 overflow-y-auto pb-24">
        <MobileHeader
          title={activeSectionData.name}
          subtitle={`${sectionAnswered} / ${activeSectionData.items.length} items`}
          onBack={() => setActiveSection(null)}
          rightAction={
            hasFails ? (
              <div className="flex items-center gap-1 bg-red-50 px-2.5 py-1.5 rounded-xl">
                <AlertTriangle size={12} className="text-red-500" />
                <span className="text-red-600 text-xs font-bold">Fails</span>
              </div>
            ) : undefined
          }
        />

        {/* Note modal */}
        {noteModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-white w-full rounded-t-3xl p-5 space-y-4 max-w-lg mx-auto">
              <h3 className="font-bold text-gray-900">Add Defect Note</h3>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                placeholder="Describe the defect in detail..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E3A5F] resize-none" />
              <div className="flex gap-3">
                <button onClick={() => { setNoteModal(null); setNoteText(''); }}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">Cancel</button>
                <button onClick={() => {
                  setSections(prev => prev.map(s => s.id === noteModal.sectionId ? {
                    ...s,
                    items: s.items.map(i => i.id === noteModal.itemId ? { ...i, note: noteText } : i)
                  } : s));
                  setNoteModal(null);
                  setNoteText('');
                }}
                  className="flex-1 py-3 bg-[#1E3A5F] rounded-xl text-sm font-bold text-white">Save Note</button>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 py-4 space-y-3">
          {activeSectionData.items.map(item => {
            const hasFail = item.leftResult === 'fail' || item.rightResult === 'fail' || item.singleResult === 'fail';
            return (
              <div key={item.id}
                className={`bg-white rounded-2xl border p-4 shadow-sm ${hasFail ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                  {hasFail && (
                    <button onClick={() => { setNoteModal({ sectionId: activeSectionData.id, itemId: item.id }); setNoteText(item.note || ''); }}
                      className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                      <Edit3 size={10} /> {item.note ? 'Edit Note' : 'Add Note'}
                    </button>
                  )}
                </div>

                {item.mode === 'paired' ? (
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium mb-1.5">LEFT SIDE</p>
                      <div className="flex gap-2">
                        {resultBtn('Pass', 'pass', item.leftResult ?? null, () => setResult(activeSectionData.id, item.id, 'left', 'pass'))}
                        {resultBtn('Fail', 'fail', item.leftResult ?? null, () => setResult(activeSectionData.id, item.id, 'left', 'fail'))}
                        {resultBtn('N/A', 'na', item.leftResult ?? null, () => setResult(activeSectionData.id, item.id, 'left', 'na'))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium mb-1.5">RIGHT SIDE</p>
                      <div className="flex gap-2">
                        {resultBtn('Pass', 'pass', item.rightResult ?? null, () => setResult(activeSectionData.id, item.id, 'right', 'pass'))}
                        {resultBtn('Fail', 'fail', item.rightResult ?? null, () => setResult(activeSectionData.id, item.id, 'right', 'fail'))}
                        {resultBtn('N/A', 'na', item.rightResult ?? null, () => setResult(activeSectionData.id, item.id, 'right', 'na'))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {resultBtn('Pass', 'pass', item.singleResult ?? null, () => setResult(activeSectionData.id, item.id, 'single', 'pass'))}
                    {resultBtn('Fail', 'fail', item.singleResult ?? null, () => setResult(activeSectionData.id, item.id, 'single', 'fail'))}
                    {resultBtn('N/A', 'na', item.singleResult ?? null, () => setResult(activeSectionData.id, item.id, 'single', 'na'))}
                  </div>
                )}

                {item.note && (
                  <div className="mt-2.5 bg-amber-50 border border-amber-100 rounded-xl p-2.5">
                    <p className="text-xs text-amber-700 font-medium">📝 {item.note}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4 max-w-lg mx-auto">
          <button onClick={() => setActiveSection(null)}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold ${sectionAnswered === activeSectionData.items.length ? 'bg-[#1A7A4A] text-white' : 'bg-[#1E3A5F] text-white'}`}>
            {sectionAnswered === activeSectionData.items.length ? '✓ Section Complete' : `Save & Continue (${sectionAnswered}/${activeSectionData.items.length})`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <MobileHeader
        title="Inspection Checklist"
        subtitle={`${answeredItems} / ${totalItems} items completed`}
        onBack={onBack}
      />

      {/* Progress */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>{sections.filter(s => s.status === 'complete').length} / {sections.length} sections done</span>
          <span className="font-semibold text-[#1E3A5F]">{Math.round((answeredItems / totalItems) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#1E3A5F] rounded-full transition-all duration-500"
            style={{ width: `${(answeredItems / totalItems) * 100}%` }} />
        </div>
      </div>

      <div className="px-4 py-4 space-y-2">
        {sections.map(section => {
          const answered = section.items.filter(i =>
            i.mode === 'paired' ? (i.leftResult !== null && i.rightResult !== null) : i.singleResult !== null
          ).length;
          const fails = section.items.filter(i =>
            i.leftResult === 'fail' || i.rightResult === 'fail' || i.singleResult === 'fail'
          ).length;

          return (
            <button key={section.id} onClick={() => setActiveSection(section.id)}
              className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 active:scale-[0.98] transition-transform text-left">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl
                ${section.status === 'complete' ? 'bg-green-50' : section.status === 'in-progress' ? 'bg-amber-50' : 'bg-gray-50'}`}>
                {section.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-bold text-gray-900 text-sm">{section.name}</p>
                  {fails > 0 && (
                    <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                      {fails} fail{fails !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-xs">{answered}/{section.items.length} items</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {section.status === 'complete' ? (
                  <CheckCircle size={20} className="text-[#1A7A4A]" />
                ) : section.status === 'in-progress' ? (
                  <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                ) : (
                  <Circle size={20} className="text-gray-200" />
                )}
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Screen: Car Grading ──────────────────────────────────────────────────────
function GradingScreen({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const [categories, setCategories] = useState<GradeCategory[]>(GRADE_CATEGORIES);
  const [overallNote, setOverallNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const totalScore = categories.reduce((acc, c) => acc + (c.score ?? 0), 0);
  const maxScore = categories.reduce((acc, c) => acc + c.maxScore, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);
  const allScored = categories.every(c => c.score !== null);

  const setScore = (id: string, score: number) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, score } : c));
  };

  const setNote = (id: string, note: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, note } : c));
  };

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24 text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg"
          style={{ backgroundColor: getScoreColor(percentage) }}>
          <span className="text-white font-bold text-3xl">{percentage}</span>
        </div>
        <h2 className="font-bold text-gray-900 text-2xl mb-2">Car Graded!</h2>
        <p className="text-gray-500 text-sm mb-1">Carschek Score</p>
        <p className="font-bold text-lg mb-6" style={{ color: getScoreColor(percentage) }}>
          {getScoreLabel(percentage)}
        </p>
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 space-y-2">
          {categories.map(c => (
            <div key={c.id} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{c.name}</span>
              <span className="font-bold text-gray-900 text-sm">{c.score}/{c.maxScore}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
            <span className="font-bold text-gray-900">Total Score</span>
            <span className="font-bold text-lg" style={{ color: getScoreColor(percentage) }}>{totalScore}/{maxScore}</span>
          </div>
        </div>
        <button onClick={onSubmit}
          className="w-full bg-[#1E3A5F] text-white py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 active:opacity-90">
          <Send size={16} /> Proceed to Sync & Submit
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <MobileHeader
        title="Grade Car"
        subtitle="Score each category 0–max"
        onBack={onBack}
        rightAction={
          allScored ? (
            <div className="flex items-center gap-1.5 bg-[#EFF6FF] px-3 py-1.5 rounded-xl">
              <span className="font-bold text-[#1E3A5F] text-sm">{percentage}</span>
              <span className="text-[#1E3A5F] text-xs">/100</span>
            </div>
          ) : undefined
        }
      />

      {/* Score preview */}
      {allScored && (
        <div className="mx-4 mt-4 rounded-2xl p-4 text-center"
          style={{ backgroundColor: `${getScoreColor(percentage)}15` }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: getScoreColor(percentage) }}>
            Carschek Score
          </p>
          <p className="font-bold text-4xl" style={{ color: getScoreColor(percentage) }}>{percentage}</p>
          <p className="text-sm font-semibold mt-1" style={{ color: getScoreColor(percentage) }}>
            {getScoreLabel(percentage)}
          </p>
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-gray-900 text-sm">{cat.name}</p>
                <p className="text-gray-400 text-xs">Weight: {cat.weight}% · Max: {cat.maxScore} pts</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-2xl" style={{ color: cat.score !== null ? getScoreColor(Math.round((cat.score / cat.maxScore) * 100)) : '#9CA3AF' }}>
                  {cat.score ?? '—'}
                </p>
                <p className="text-gray-400 text-xs">/ {cat.maxScore}</p>
              </div>
            </div>

            {/* Score slider */}
            <div className="mb-3">
              <input
                type="range"
                min={0}
                max={cat.maxScore}
                value={cat.score ?? 0}
                onChange={e => setScore(cat.id, parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: cat.score !== null
                    ? `linear-gradient(to right, ${getScoreColor(Math.round((cat.score / cat.maxScore) * 100))} ${(cat.score / cat.maxScore) * 100}%, #E5E7EB ${(cat.score / cat.maxScore) * 100}%)`
                    : '#E5E7EB'
                }}
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>0</span>
                <span>{Math.round(cat.maxScore / 2)}</span>
                <span>{cat.maxScore}</span>
              </div>
            </div>

            {/* Quick score buttons */}
            <div className="flex gap-1.5 mb-3">
              {[0, Math.round(cat.maxScore * 0.25), Math.round(cat.maxScore * 0.5), Math.round(cat.maxScore * 0.75), cat.maxScore].map(v => (
                <button key={v} onClick={() => setScore(cat.id, v)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${cat.score === v ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {v}
                </button>
              ))}
            </div>

            <textarea
              value={cat.note}
              onChange={e => setNote(cat.id, e.target.value)}
              placeholder="Notes for this category (optional)..."
              rows={2}
              className="w-full border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-600 focus:outline-none focus:border-[#1E3A5F] resize-none bg-gray-50"
            />
          </div>
        ))}

        {/* Overall note */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="font-bold text-gray-900 text-sm mb-3">Overall Inspector Notes</p>
          <textarea
            value={overallNote}
            onChange={e => setOverallNote(e.target.value)}
            placeholder="General observations, recommendations, or notes for the admin..."
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E3A5F] resize-none"
          />
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4 max-w-lg mx-auto">
        <button
          onClick={() => allScored && setSubmitted(true)}
          disabled={!allScored}
          className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all ${allScored ? 'bg-[#7C3AED] text-white active:opacity-90' : 'bg-gray-100 text-gray-400'}`}>
          {allScored ? `Submit Grade — Score: ${percentage}/100` : 'Score all categories to continue'}
        </button>
      </div>
    </div>
  );
}

// ─── Screen: Sync & Review ────────────────────────────────────────────────────
function SyncReviewScreen({ job, onBack }: { job: Job; onBack: () => void }) {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const handleSync = () => {
    setSyncing(true);
    setSyncProgress(0);
    const steps = [20, 45, 70, 90, 100];
    steps.forEach((p, i) => setTimeout(() => {
      setSyncProgress(p);
      if (p === 100) { setSyncing(false); setSynced(true); }
    }, (i + 1) * 600));
  };

  const checklist = [
    { label: 'Vehicle Photos', done: true, count: '8/11 captured' },
    { label: 'Inspection Checklist', done: false, count: '0/10 sections' },
    { label: 'Damage Photos', done: true, count: '2 documented' },
    { label: 'Car Grading', done: false, count: 'Not graded' },
  ];

  const readyToSync = checklist.filter(c => c.done).length >= 2;

  if (synced) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24 text-center">
        <div className="w-24 h-24 bg-[#1A7A4A] rounded-full flex items-center justify-center mb-6 shadow-lg">
          <CheckCircle size={48} className="text-white" />
        </div>
        <h2 className="font-bold text-gray-900 text-2xl mb-2">Synced!</h2>
        <p className="text-gray-500 text-sm mb-1">Report submitted to admin dashboard</p>
        <p className="font-bold text-[#1E3A5F] text-base mb-6">{job.ckId} · {job.vehicle} {job.year}</p>

        <div className="w-full bg-green-50 border border-green-100 rounded-2xl p-4 mb-6 text-left space-y-2">
          {[
            'Report visible in admin dashboard',
            'QA review queue updated',
            'Customer notification sent',
            'Inspector performance logged',
          ].map(item => (
            <div key={item} className="flex items-center gap-2.5">
              <CheckCircle size={15} className="text-[#1A7A4A] flex-shrink-0" />
              <span className="text-sm text-gray-700">{item}</span>
            </div>
          ))}
        </div>

        <button onClick={onBack}
          className="w-full bg-[#1E3A5F] text-white py-4 rounded-2xl text-sm font-bold active:opacity-90">
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <MobileHeader
        title="Review & Sync"
        subtitle="Submit inspection to admin dashboard"
        onBack={onBack}
      />

      <div className="px-4 py-4 space-y-4">
        {/* Job summary */}
        <div className="bg-[#1E3A5F] rounded-2xl p-4 text-white">
          <p className="text-blue-200 text-xs font-medium mb-1">Inspection Report</p>
          <p className="font-bold text-lg">{job.vehicle} {job.year}</p>
          <p className="text-blue-200 text-xs mt-0.5">{job.ckId} · {job.plate}</p>
          <div className="mt-3 flex items-center gap-2">
            <Clock size={12} className="text-blue-300" />
            <span className="text-blue-200 text-xs">Completed {new Date().toLocaleDateString('en-NG')}</span>
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="font-bold text-gray-900 text-sm mb-3">Inspection Completeness</p>
          <div className="space-y-3">
            {checklist.map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-[#1A7A4A]' : 'bg-gray-100'}`}>
                  {item.done ? <Check size={12} className="text-white" /> : <Minus size={12} className="text-gray-400" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${item.done ? 'text-gray-900' : 'text-gray-400'}`}>{item.label}</p>
                  <p className="text-xs text-gray-400">{item.count}</p>
                </div>
                {!item.done && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Incomplete</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sync destination */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="font-bold text-gray-900 text-sm mb-3">Sync Destination</p>
          <div className="space-y-2">
            {[
              { label: 'Admin Dashboard', sub: 'Inspection Reports & QA Queue', icon: BarChart2 },
              { label: 'Car Record', sub: `${job.ckId} — Photos & Checklist`, icon: Car },
              { label: 'Customer Notification', sub: job.customer, icon: Bell },
            ].map(dest => (
              <div key={dest.label} className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 bg-[#EFF6FF] rounded-xl flex items-center justify-center flex-shrink-0">
                  <dest.icon size={16} className="text-[#1E3A5F]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{dest.label}</p>
                  <p className="text-gray-400 text-xs">{dest.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sync progress */}
        {syncing && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
              <p className="font-bold text-[#1E3A5F] text-sm">Syncing to admin dashboard...</p>
            </div>
            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#1E3A5F] rounded-full transition-all duration-500"
                style={{ width: `${syncProgress}%` }} />
            </div>
            <p className="text-[#1E3A5F] text-xs mt-2 text-right">{syncProgress}%</p>
          </div>
        )}

        {!readyToSync && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 text-sm">Incomplete Inspection</p>
              <p className="text-amber-600 text-xs mt-0.5">Complete at least the checklist and grading before syncing.</p>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4 max-w-lg mx-auto space-y-2">
        <button onClick={handleSync} disabled={syncing}
          className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${syncing ? 'bg-gray-100 text-gray-400' : 'bg-[#1A7A4A] text-white active:opacity-90'}`}>
          {syncing ? (
            <><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Syncing...</>
          ) : (
            <><Send size={16} /> Sync & Submit to Admin</>
          )}
        </button>
        <button className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 flex items-center justify-center gap-2 active:bg-gray-50">
          <Download size={14} /> Save Offline Copy
        </button>
      </div>
    </div>
  );
}

// ─── Screen: Notifications ────────────────────────────────────────────────────
function NotificationsScreen() {
  const notifications = [
    { id: 'n1', type: 'job', title: 'New Job Assigned', body: 'CK-43 · Kia Sportage 2022 — Lekki Phase 2', time: '5 min ago', read: false },
    { id: 'n2', type: 'qa', title: 'QA Feedback', body: 'CK-40 report needs revision — check engine section', time: '1 hr ago', read: false },
    { id: 'n3', type: 'sync', title: 'Sync Complete', body: 'CK-39 report synced successfully', time: '3 hrs ago', read: true },
    { id: 'n4', type: 'reminder', title: 'Upcoming Job Reminder', body: 'CK-42 Honda Accord at 1:00 PM today', time: '4 hrs ago', read: true },
    { id: 'n5', type: 'job', title: 'Job Rescheduled', body: 'CK-38 moved to tomorrow 10:00 AM', time: 'Yesterday', read: true },
  ];

  const typeIcon: Record<string, React.ElementType> = {
    job: Briefcase, qa: AlertTriangle, sync: RefreshCw, reminder: Clock,
  };
  const typeColor: Record<string, string> = {
    job: '#1E3A5F', qa: '#D35400', sync: '#1A7A4A', reminder: '#7C3AED',
  };
  const typeBg: Record<string, string> = {
    job: '#EFF6FF', qa: '#FFF7ED', sync: '#F0FDF4', reminder: '#F5F3FF',
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <MobileHeader title="Notifications" subtitle="3 unread" />
      <div className="px-4 py-4 space-y-2">
        {notifications.map(notif => {
          const Icon = typeIcon[notif.type];
          return (
            <div key={notif.id}
              className={`bg-white rounded-2xl border p-4 flex items-start gap-3 shadow-sm ${!notif.read ? 'border-[#1E3A5F]/20' : 'border-gray-100'}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: typeBg[notif.type] }}>
                <Icon size={18} style={{ color: typeColor[notif.type] }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>{notif.title}</p>
                  {!notif.read && <span className="w-2 h-2 bg-[#1E3A5F] rounded-full flex-shrink-0 mt-1" />}
                </div>
                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{notif.body}</p>
                <p className="text-gray-300 text-[10px] mt-1.5">{notif.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Screen: Profile ──────────────────────────────────────────────────────────
function ProfileScreen() {
  const stats = [
    { label: 'Total Jobs', value: '142' },
    { label: 'This Month', value: '18' },
    { label: 'Avg Score', value: '4.9' },
    { label: 'Pass Rate', value: '94%' },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <MobileHeader title="My Profile" />

      {/* Profile hero */}
      <div className="bg-[#1E3A5F] px-5 pt-4 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#2E75B6] flex items-center justify-center text-white font-bold text-xl shadow-lg">
            EO
          </div>
          <div>
            <p className="text-white font-bold text-lg">Emeka Okonkwo</p>
            <p className="text-blue-200 text-sm">Field Inspector · Lagos Zone</p>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={12} className={i <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400/30'} />
              ))}
              <span className="text-blue-200 text-xs ml-1">4.9</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-5">
          {stats.map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-2.5 text-center">
              <p className="text-white font-bold text-base">{s.value}</p>
              <p className="text-blue-200 text-[9px] mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 -mt-4">
        {/* Certifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="font-bold text-gray-900 text-sm mb-3">Certifications</p>
          <div className="space-y-2">
            {[
              { label: 'Carschek Certified Inspector', level: 'Level 3', color: '#1A7A4A' },
              { label: 'Engine Specialist', level: 'Advanced', color: '#2E75B6' },
              { label: 'Electrical Systems', level: 'Intermediate', color: '#7C3AED' },
            ].map(cert => (
              <div key={cert.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${cert.color}15` }}>
                  <Award size={16} style={{ color: cert.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{cert.label}</p>
                  <p className="text-xs text-gray-400">{cert.level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {[
            { icon: Bell, label: 'Notifications', sub: 'Job alerts & reminders' },
            { icon: WifiOff, label: 'Offline Mode', sub: 'Download jobs for offline use' },
            { icon: Shield, label: 'Privacy & Security', sub: 'Account security settings' },
            { icon: Settings, label: 'App Settings', sub: 'Language, theme, display' },
          ].map((item, idx) => (
            <button key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
              <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <item.icon size={17} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                <p className="text-gray-400 text-xs">{item.sub}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>

        {/* Admin link */}
        <a href="/admin-dashboard"
          className="w-full bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 flex items-center gap-3 active:opacity-90">
          <div className="w-10 h-10 bg-[#1E3A5F] rounded-xl flex items-center justify-center flex-shrink-0">
            <BarChart2 size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#1E3A5F] text-sm">Switch to Admin Dashboard</p>
            <p className="text-blue-400 text-xs">View full admin panel</p>
          </div>
          <ArrowRight size={16} className="text-[#1E3A5F]" />
        </a>

        {/* Logout */}
        <button className="w-full bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-center gap-2 active:opacity-90">
          <LogOut size={16} className="text-red-500" />
          <span className="font-bold text-red-600 text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function InspectorMobileApp() {
  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const [inspectScreen, setInspectScreen] = useState<InspectScreen>('job-list');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleStartInspection = (job: Job) => {
    setSelectedJob(job);
    setInspectScreen('inspection-hub');
    setActiveTab('Inspect');
  };

  const handleGoTo = (screen: InspectScreen) => {
    setInspectScreen(screen);
  };

  const handleBack = () => {
    if (inspectScreen === 'inspection-hub') {
      setInspectScreen('job-list');
      setActiveTab('Jobs');
    } else if (
      inspectScreen === 'vehicle-photos' ||
      inspectScreen === 'damage-photos' ||
      inspectScreen === 'checklist' ||
      inspectScreen === 'grading' ||
      inspectScreen === 'sync-review'
    ) {
      setInspectScreen('inspection-hub');
    } else {
      setInspectScreen('job-list');
    }
  };

  const renderInspectContent = () => {
    if (inspectScreen === 'job-list' || !selectedJob) {
      return <JobsScreen onStartInspection={handleStartInspection} />;
    }
    if (inspectScreen === 'inspection-hub') {
      return <InspectionHub job={selectedJob} onBack={handleBack} onGoTo={handleGoTo} />;
    }
    if (inspectScreen === 'vehicle-photos') {
      return <VehiclePhotosScreen onBack={handleBack} />;
    }
    if (inspectScreen === 'damage-photos') {
      return <DamagePhotosScreen onBack={handleBack} />;
    }
    if (inspectScreen === 'checklist') {
      return <ChecklistScreen onBack={handleBack} />;
    }
    if (inspectScreen === 'grading') {
      return <GradingScreen onBack={handleBack} onSubmit={() => setInspectScreen('sync-review')} />;
    }
    if (inspectScreen === 'sync-review') {
      return <SyncReviewScreen job={selectedJob} onBack={handleBack} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 430, margin: '0 auto', position: 'relative' }}>
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden" style={{ minHeight: '100vh' }}>
        {activeTab === 'Home' && (
          <HomeScreen onNavigate={(tab) => {
            setActiveTab(tab);
            if (tab === 'Inspect') setInspectScreen('job-list');
          }} />
        )}
        {activeTab === 'Jobs' && (
          <JobsScreen onStartInspection={handleStartInspection} />
        )}
        {activeTab === 'Inspect' && renderInspectContent()}
        {activeTab === 'Notifications' && <NotificationsScreen />}
        {activeTab === 'Profile' && <ProfileScreen />}
      </div>

      <BottomNav active={activeTab} onChange={(tab) => {
        setActiveTab(tab);
        if (tab === 'Jobs') setInspectScreen('job-list');
        if (tab === 'Inspect' && inspectScreen === 'job-list') setInspectScreen('job-list');
      }} />
    </div>
  );
}
