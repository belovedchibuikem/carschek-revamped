'use client';
import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { MapPin, Phone, Navigation, Play, Eye, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, AlertTriangle, Mic, Camera, Pen, Share2, Flag, Home, Briefcase, Bell, User, Send, LogOut, Download, FileText, Zap, X, Plus, Trash2, Image, RotateCcw, Check, Edit } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ─── Types ────────────────────────────────────────────────────────────────────
type JobStatus = 'Upcoming' | 'En Route' | 'In Progress' | 'Awaiting QA' | 'Completed';
type CheckResult = 'pass' | 'fail' | 'na' | null;
type Severity = 'Minor' | 'Major' | 'Critical' | null;
type TabName = 'Home' | 'Jobs' | 'Notifications' | 'Profile';
type CameraStep = 'idle' | 'capture' | 'analyzing' | 'results' | 'done';

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

interface VehiclePhotoItem {
  id: string;
  name: string;
  captured: boolean;
  aiAnalyzed?: boolean;
  aiResult?: string;
}

interface DamagePhotoItem {
  id: string;
  name: string;
  comment: string;
  captured: boolean;
  aiSeverity?: string;
  aiDescription?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const jobs: Job[] = [
  { id: '#1901', status: 'En Route', vehicle: '2019 Toyota Camry', plate: 'KJA 234 AA', customer: 'Adaeze Mensah', phone: '+234 801 ***4521', time: '10:30 AM', timeFromNow: '15 min from now', location: '45 Admiralty Way, Lekki Phase 1', distance: '3.2 km away' },
  { id: '#1902', status: 'Upcoming', vehicle: '2020 Honda Accord', plate: 'LND 891 KK', customer: 'Chidi Nwosu', phone: '+234 802 ***7834', time: '1:00 PM', timeFromNow: '2h 45min from now', location: '12 Ozumba Mbadiwe Ave, VI', distance: '8.1 km away' },
  { id: '#1903', status: 'Completed', vehicle: '2018 Ford Ranger', plate: 'ABJ 445 FC', customer: 'Fatima Bello', phone: '+234 803 ***2267', time: '8:00 AM', timeFromNow: 'Completed', location: '3 Wuse Zone 5, Abuja', distance: '—' },
];

const VEHICLE_PHOTO_NAMES = [
  'Car Overview', 'Car Front', 'Car Front Left', 'Car Front Right',
  'Car Back', 'Car Back Left', 'Car Back Right',
  'Car Inside Front', 'Car Inside Back', 'Car Motor', 'Car Tire',
];

const initialVehiclePhotos: VehiclePhotoItem[] = VEHICLE_PHOTO_NAMES.map((name, i) => ({
  id: `vp${i + 1}`,
  name,
  captured: false,
}));

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
  { id: 's13', name: 'Vehicle Photos', items: 11, timeEst: '~3 min', status: 'not-started' },
  { id: 's14', name: 'Damage Photos', items: 0, timeEst: '~2 min', status: 'not-started' },
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
    Upcoming: 'bg-[#1E3A5F] text-white',
    'En Route': 'bg-purple-600 text-white',
    'In Progress': 'bg-[#D35400] text-white',
    'Awaiting QA': 'bg-teal-600 text-white',
    Completed: 'bg-[#1A7A4A] text-white',
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${map[status]}`}>{status}</span>;
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({ activeTab, onTabChange }: { activeTab: TabName; onTabChange: (tab: TabName) => void }) {
  const navItems: { icon: React.ElementType; label: TabName }[] = [
    { icon: Home, label: 'Home' },
    { icon: Briefcase, label: 'Jobs' },
    { icon: Bell, label: 'Notifications' },
    { icon: User, label: 'Profile' },
  ];
  return (
    <div className="fixed bottom-0 bg-white border-t border-[#E5E7EB] px-4 py-2 grid grid-cols-4 gap-1 z-30" style={{ maxWidth: 375, width: '100%' }}>
      {navItems.map(n => (
        <button key={n.label} onClick={() => onTabChange(n.label)}
          className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all min-h-[48px] ${activeTab === n.label ? 'text-[#1E3A5F]' : 'text-[#6B7280]'}`}>
          <n.icon size={20} />
          <span className="text-[10px] font-medium">{n.label}</span>
          {activeTab === n.label && <span className="w-1 h-1 rounded-full bg-[#1E3A5F]" />}
        </button>
      ))}
    </div>
  );
}

// ─── PWA Header ───────────────────────────────────────────────────────────────
function PWAHeader({ onLogout }: { onLogout: () => void }) {
  const [showLogout, setShowLogout] = useState(false);
  return (
    <div className="bg-[#1E3A5F] px-4 pt-10 pb-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-white font-bold text-lg tracking-tight">CARSCHEK</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-white text-xs font-medium">Online</span>
          </div>
          <div className="relative">
            <button onClick={() => setShowLogout(v => !v)}
              className="w-9 h-9 rounded-full bg-[#2E75B6] flex items-center justify-center text-white text-sm font-bold">
              EO
            </button>
            {showLogout && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-[#E5E7EB] z-50 w-40">
                <div className="px-4 py-3 border-b border-[#E5E7EB]">
                  <p className="text-xs font-bold text-[#1F2937]">Emeka Okonkwo</p>
                  <p className="text-[10px] text-[#6B7280]">Inspector</p>
                </div>
                <button onClick={onLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#C0392B] font-medium hover:bg-red-50 rounded-b-xl">
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI Camera Capture (reusable) ─────────────────────────────────────────────
function AICameraCapture({
  label,
  onCaptureDone,
  onCancel,
  enableAI = false,
}: {
  label: string;
  onCaptureDone: (aiResult?: { description: string; severity: string }) => void;
  onCancel: () => void;
  enableAI?: boolean;
}) {
  const [step, setStep] = useState<CameraStep>('capture');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const capturePhoto = () => {
    if (enableAI) {
      setStep('analyzing');
      setAnalysisProgress(0);
      const timings = [
        { delay: 600, progress: 35 },
        { delay: 1400, progress: 70 },
        { delay: 2200, progress: 100 },
      ];
      timings.forEach(t => setTimeout(() => setAnalysisProgress(t.progress), t.delay));
      setTimeout(() => setStep('results'), 2800);
    } else {
      setStep('done');
      setTimeout(() => onCaptureDone(), 300);
    }
  };

  if (step === 'capture') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col" style={{ maxWidth: 375, margin: '0 auto' }}>
        <div className="flex items-center justify-between px-4 pt-10 pb-3">
          <button onClick={onCancel} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <X size={18} className="text-white" />
          </button>
          <p className="text-white text-sm font-semibold">{label}</p>
          {enableAI && (
            <div className="flex items-center gap-1 bg-[#2E75B6]/80 px-2 py-1 rounded-full">
              <Zap size={10} className="text-white" />
              <span className="text-white text-[10px] font-medium">AI On</span>
            </div>
          )}
          {!enableAI && <div className="w-9" />}
        </div>
        <div className="flex-1 relative flex items-center justify-center bg-gray-900">
          <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 flex items-center justify-center">
            <div className="text-gray-400 text-xs">Camera Feed</div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-dashed border-white/60 rounded-xl w-56 h-40 flex items-end justify-center pb-2">
              <span className="text-white text-[10px] bg-black/50 px-2 py-0.5 rounded-full">Position within frame</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-8 bg-black">
          <button onClick={capturePhoto} className="w-18 h-18 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center" style={{ width: 72, height: 72 }}>
            <div className="w-14 h-14 rounded-full bg-white" />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center gap-5" style={{ maxWidth: 375, margin: '0 auto' }}>
        <div className="bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 w-full h-48 flex items-center justify-center">
          <div className="text-gray-400 text-xs">Captured Photo</div>
        </div>
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-[#2E75B6]/30 border-t-[#2E75B6] animate-spin" />
          <Zap size={18} className="text-[#2E75B6] absolute inset-0 m-auto" />
        </div>
        <p className="text-white text-sm font-semibold">Carschek AI is analysing...</p>
        <div className="space-y-2 w-48">
          {[{ label: 'Detecting defects...', threshold: 0 }, { label: 'Classifying severity...', threshold: 35 }, { label: 'Done', threshold: 70 }].map((s, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs transition-all ${analysisProgress >= s.threshold ? 'text-white' : 'text-white/30'}`}>
              {analysisProgress >= s.threshold && analysisProgress >= (i === 2 ? 100 : s.threshold + 1) ? (
                <CheckCircle size={13} className="text-[#1A7A4A] flex-shrink-0" />
              ) : analysisProgress >= s.threshold ? (
                <div className="w-3 h-3 rounded-full border-2 border-[#2E75B6] border-t-transparent animate-spin flex-shrink-0" />
              ) : (
                <div className="w-3 h-3 rounded-full border-2 border-white/20 flex-shrink-0" />
              )}
              {s.label}
            </div>
          ))}
        </div>
        <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-[#2E75B6] rounded-full transition-all duration-500" style={{ width: `${analysisProgress}%` }} />
        </div>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col" style={{ maxWidth: 375, margin: '0 auto' }}>
        <div className="relative flex-shrink-0" style={{ height: 200 }}>
          <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="border-2 border-red-500 rounded-lg w-28 h-16 relative">
                <div className="absolute -top-5 left-0 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap">Possible dent detected</div>
                <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-red-400" />
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-red-400" />
                <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-red-400" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-red-400" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center gap-2">
            <AlertTriangle size={15} className="text-[#D35400]" />
            <span className="text-sm font-bold text-[#1F2937]">AI Detected: 1 possible defect</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-red-50 rounded-xl p-3 border border-red-100">
              <p className="text-xs font-semibold text-[#C0392B] mb-1">Possible dent / body deformation</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-[#6B7280]">87% confidence</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D35400] rounded-full" style={{ width: '87%' }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#6B7280]">Suggested severity:</span>
                <span className="text-[10px] font-bold text-[#C0392B] bg-red-100 px-2 py-0.5 rounded-full">Major</span>
              </div>
            </div>
            <p className="text-[10px] text-[#6B7280] italic">"Minor dent and paint scratch detected, approximately 15cm"</p>
            <div className="space-y-2">
              <button onClick={() => onCaptureDone({ description: 'Minor dent and paint scratch, approximately 15cm', severity: 'Major' })}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1A7A4A] text-white text-xs font-semibold rounded-xl">
                <Check size={13} /> Apply AI Result
              </button>
              <button onClick={() => onCaptureDone()}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2E75B6] text-white text-xs font-semibold rounded-xl">
                <Edit size={13} /> Enter Manually
              </button>
              <button onClick={onCancel}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-xs font-medium rounded-xl">
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Screen: Vehicle Photos Section ──────────────────────────────────────────
function VehiclePhotosSection({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
  const [photos, setPhotos] = useState<VehiclePhotoItem[]>(initialVehiclePhotos);
  const [activeCapture, setActiveCapture] = useState<string | null>(null);

  const captured = photos.filter(p => p.captured).length;

  const handleCaptureDone = (id: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, captured: true, aiAnalyzed: false } : p));
    setActiveCapture(null);
  };

  const handleRetake = (id: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, captured: false } : p));
  };

  const photoIcon = (name: string) => {
    if (name.includes('Front Left') || name.includes('Front Right')) return '🚗';
    if (name.includes('Front')) return '🚘';
    if (name.includes('Back Left') || name.includes('Back Right')) return '🚙';
    if (name.includes('Back')) return '🚗';
    if (name.includes('Inside')) return '🪑';
    if (name.includes('Motor')) return '⚙️';
    if (name.includes('Tire')) return '🔵';
    return '📷';
  };

  return (
    <div className="bg-[#F4F6F8] min-h-screen flex flex-col" style={{ maxWidth: 375, margin: '0 auto' }}>
      {activeCapture && (
        <AICameraCapture
          label={photos.find(p => p.id === activeCapture)?.name || ''}
          onCaptureDone={() => handleCaptureDone(activeCapture)}
          onCancel={() => setActiveCapture(null)}
          enableAI={false}
        />
      )}

      <div className="bg-white border-b border-[#E5E7EB] px-4 pt-10 pb-3 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="w-9 h-9 bg-[#F4F6F8] rounded-xl flex items-center justify-center min-h-[48px] min-w-[48px]">
            <ChevronLeft size={18} className="text-[#1F2937]" />
          </button>
          <div className="flex-1">
            <p className="font-bold text-[#1F2937] text-base">Vehicle Photos</p>
            <p className="text-xs text-[#6B7280]">{captured}/{photos.length} photos captured</p>
          </div>
          <div className="flex items-center gap-1 bg-[#EFF6FF] px-2.5 py-1 rounded-full">
            <Image size={12} className="text-[#2E75B6]" />
            <span className="text-[#2E75B6] text-xs font-semibold">{captured}/{photos.length}</span>
          </div>
        </div>
        <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div className="h-full bg-[#2E75B6] rounded-full transition-all" style={{ width: `${(captured / photos.length) * 100}%` }} />
        </div>
      </div>

      <div className="px-4 py-3 bg-[#EFF6FF] border-b border-[#BFDBFE]">
        <p className="text-xs text-[#1E3A5F] font-medium flex items-center gap-1.5">
          <Camera size={12} /> Capture all 11 standard vehicle photos for the inspection report
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-28">
        <div className="grid grid-cols-2 gap-3">
          {photos.map((photo, idx) => (
            <div key={photo.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all ${photo.captured ? 'border-[#1A7A4A]' : 'border-[#E5E7EB]'}`}>
              <div className={`h-24 flex items-center justify-center relative ${photo.captured ? 'bg-gradient-to-br from-green-50 to-emerald-100' : 'bg-gradient-to-br from-[#F4F6F8] to-[#E5E7EB]'}`}>
                {photo.captured ? (
                  <>
                    <div className="text-center">
                      <span className="text-3xl">{photoIcon(photo.name)}</span>
                    </div>
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#1A7A4A] rounded-full flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <Camera size={24} className="text-[#9CA3AF] mx-auto mb-1" />
                    <p className="text-[10px] text-[#9CA3AF]">Tap to capture</p>
                  </div>
                )}
                <div className="absolute top-2 left-2 w-5 h-5 bg-[#1E3A5F] rounded-full flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">{idx + 1}</span>
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold text-[#1F2937] leading-tight mb-2">{photo.name}</p>
                {photo.captured ? (
                  <button onClick={() => handleRetake(photo.id)}
                    className="w-full py-1.5 border border-[#E5E7EB] rounded-lg text-[10px] font-medium text-[#6B7280] flex items-center justify-center gap-1">
                    <RotateCcw size={10} /> Retake
                  </button>
                ) : (
                  <button onClick={() => setActiveCapture(photo.id)}
                    className="w-full py-1.5 bg-[#1E3A5F] rounded-lg text-[10px] font-semibold text-white flex items-center justify-center gap-1.5 min-h-[32px]">
                    <Camera size={10} /> Capture
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 bg-white border-t border-[#E5E7EB] p-4 space-y-2" style={{ maxWidth: 375, width: '100%' }}>
        <p className="text-xs text-center text-[#6B7280]">{captured} of {photos.length} photos captured</p>
        <button onClick={onComplete}
          className={`w-full py-3.5 rounded-2xl text-sm font-bold min-h-[48px] transition-all ${captured === photos.length ? 'bg-[#1A7A4A] text-white' : 'bg-[#E5E7EB] text-[#6B7280]'}`}>
          {captured === photos.length ? 'Section Complete ✓' : `Capture ${photos.length - captured} more photo${photos.length - captured !== 1 ? 's' : ''}`}
        </button>
        <button onClick={onBack} className="w-full py-2.5 bg-[#F4F6F8] text-[#6B7280] rounded-xl text-xs font-medium min-h-[44px]">
          ← Back to Sections
        </button>
      </div>
    </div>
  );
}

// ─── Screen: Damage Photos Section ───────────────────────────────────────────
function DamagePhotosSection({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
  const [damagePhotos, setDamagePhotos] = useState<DamagePhotoItem[]>([]);
  const [activeCapture, setActiveCapture] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingAIResult, setPendingAIResult] = useState<{ description: string; severity: string } | undefined>();

  const addDamagePhoto = () => {
    if (!newName.trim()) return;
    const id = `dp${Date.now()}`;
    setDamagePhotos(prev => [...prev, { id, name: newName.trim(), comment: newComment.trim(), captured: false }]);
    setNewName('');
    setNewComment('');
    setShowAddModal(false);
    setActiveCapture(id);
  };

  const handleCaptureDone = (id: string, aiResult?: { description: string; severity: string }) => {
    setDamagePhotos(prev => prev.map(p => p.id === id ? {
      ...p,
      captured: true,
      aiSeverity: aiResult?.severity,
      aiDescription: aiResult?.description,
      comment: aiResult?.description ? (p.comment || aiResult.description) : p.comment,
    } : p));
    setActiveCapture(null);
    setPendingAIResult(undefined);
  };

  const removePhoto = (id: string) => {
    setDamagePhotos(prev => prev.filter(p => p.id !== id));
  };

  const severityColor = (sev?: string) => {
    if (sev === 'Critical') return 'bg-red-100 text-red-700';
    if (sev === 'Major') return 'bg-orange-100 text-orange-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="bg-[#F4F6F8] min-h-screen flex flex-col" style={{ maxWidth: 375, margin: '0 auto' }}>
      {activeCapture && (
        <AICameraCapture
          label={damagePhotos.find(p => p.id === activeCapture)?.name || 'Damage Photo'}
          onCaptureDone={(aiResult) => handleCaptureDone(activeCapture, aiResult)}
          onCancel={() => setActiveCapture(null)}
          enableAI={true}
        />
      )}

      <div className="bg-white border-b border-[#E5E7EB] px-4 pt-10 pb-3 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="w-9 h-9 bg-[#F4F6F8] rounded-xl flex items-center justify-center min-h-[48px] min-w-[48px]">
            <ChevronLeft size={18} className="text-[#1F2937]" />
          </button>
          <div className="flex-1">
            <p className="font-bold text-[#1F2937] text-base">Damage Photos</p>
            <p className="text-xs text-[#6B7280]">{damagePhotos.length} damage photo{damagePhotos.length !== 1 ? 's' : ''} added</p>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-[#C0392B] text-white px-3 py-2 rounded-xl text-xs font-semibold min-h-[40px]">
            <Plus size={13} /> Add
          </button>
        </div>
      </div>

      <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
        <p className="text-xs text-amber-800 font-medium flex items-center gap-1.5">
          <Zap size={12} className="text-amber-600" /> AI-powered defect detection is active for damage photos
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-28 space-y-3">
        {damagePhotos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-[#F4F6F8] rounded-2xl flex items-center justify-center mb-4">
              <Camera size={28} className="text-[#9CA3AF]" />
            </div>
            <p className="text-sm font-semibold text-[#6B7280] mb-1">No damage photos yet</p>
            <p className="text-xs text-[#9CA3AF] mb-5">Tap "Add" to capture a defect photo with AI analysis</p>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-[#C0392B] text-white rounded-2xl text-sm font-semibold min-h-[48px]">
              <Plus size={15} /> Add Damage Photo
            </button>
          </div>
        )}

        {damagePhotos.map((photo, idx) => (
          <div key={photo.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${photo.captured ? 'border-[#C0392B]/30' : 'border-[#E5E7EB]'}`}>
            <div className="flex items-start gap-3 p-3">
              <div className={`w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center relative overflow-hidden ${photo.captured ? 'bg-gradient-to-br from-red-50 to-orange-100' : 'bg-[#F4F6F8]'}`}>
                {photo.captured ? (
                  <>
                    <AlertTriangle size={24} className="text-[#D35400]" />
                    <div className="absolute top-1 right-1 w-4 h-4 bg-[#C0392B] rounded-full flex items-center justify-center">
                      <Check size={8} className="text-white" />
                    </div>
                  </>
                ) : (
                  <Camera size={20} className="text-[#9CA3AF]" />
                )}
                <div className="absolute bottom-1 left-1 bg-[#1E3A5F] text-white text-[8px] font-bold px-1 rounded">#{idx + 1}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <p className="text-sm font-bold text-[#1F2937] leading-tight">{photo.name}</p>
                  <button onClick={() => removePhoto(photo.id)} className="w-6 h-6 flex items-center justify-center text-[#9CA3AF] hover:text-[#C0392B] flex-shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
                {photo.aiSeverity && (
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${severityColor(photo.aiSeverity)}`}>
                    {photo.aiSeverity} · AI Detected
                  </span>
                )}
                {photo.comment && (
                  <p className="text-[11px] text-[#6B7280] mt-1 leading-relaxed line-clamp-2">{photo.comment}</p>
                )}
                {!photo.comment && !photo.captured && (
                  <p className="text-[11px] text-[#9CA3AF] mt-1 italic">No comment yet</p>
                )}
              </div>
            </div>
            <div className="px-3 pb-3 flex gap-2">
              {!photo.captured ? (
                <button onClick={() => setActiveCapture(photo.id)}
                  className="flex-1 py-2 bg-[#C0392B] text-white rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[36px]">
                  <Camera size={12} /> Capture + AI Scan
                </button>
              ) : (
                <button onClick={() => setActiveCapture(photo.id)}
                  className="flex-1 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-2xl text-xs font-medium flex items-center justify-center gap-1.5 min-h-[36px]">
                  <RotateCcw size={12} /> Retake
                </button>
              )}
              <button onClick={() => setEditingId(photo.id)}
                className="flex-1 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-2xl text-xs font-medium flex items-center justify-center gap-1.5 min-h-[36px]">
                <Edit size={12} /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Damage Photo Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" style={{ maxWidth: 375, margin: '0 auto' }}>
          <div className="bg-white rounded-t-3xl p-6 w-full">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-bold text-[#1F2937]">Add Damage Photo</p>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 bg-[#F4F6F8] rounded-full flex items-center justify-center">
                <X size={15} className="text-[#6B7280]" />
              </button>
            </div>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest block mb-1.5">Damage Name *</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Front Bumper Dent, Hood Scratch..."
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest block mb-1.5">Comment (optional)</label>
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  rows={2}
                  placeholder="Describe the damage..."
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 resize-none"
                />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <Zap size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">After saving, you'll be taken to the camera. AI will automatically detect and classify the defect.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3.5 border border-[#E5E7EB] rounded-2xl font-semibold text-[#6B7280] min-h-[48px]">Cancel</button>
              <button onClick={addDamagePhoto} disabled={!newName.trim()}
                className={`flex-1 py-3.5 rounded-2xl text-sm font-bold min-h-[48px] flex items-center justify-center gap-2 ${newName.trim() ? 'bg-[#C0392B] text-white' : 'bg-[#E5E7EB] text-[#9CA3AF]'}`}>
                <Camera size={15} /> Save & Capture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Comment Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" style={{ maxWidth: 375, margin: '0 auto' }}>
          <div className="bg-white rounded-t-3xl p-6 w-full">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-bold text-[#1F2937]">Edit Damage Details</p>
              <button onClick={() => setEditingId(null)} className="w-8 h-8 bg-[#F4F6F8] rounded-full flex items-center justify-center">
                <X size={15} className="text-[#6B7280]" />
              </button>
            </div>
            {(() => {
              const photo = damagePhotos.find(p => p.id === editingId);
              if (!photo) return null;
              return (
                <div className="space-y-3 mb-5">
                  <div>
                    <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest block mb-1.5">Damage Name</label>
                    <input
                      defaultValue={photo.name}
                      onChange={e => setDamagePhotos(prev => prev.map(p => p.id === editingId ? { ...p, name: e.target.value } : p))}
                      className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest block mb-1.5">Comment</label>
                    <textarea
                      defaultValue={photo.comment}
                      onChange={e => setDamagePhotos(prev => prev.map(p => p.id === editingId ? { ...p, comment: e.target.value } : p))}
                      rows={3}
                      className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 resize-none"
                    />
                  </div>
                </div>
              );
            })()}
            <button onClick={() => setEditingId(null)} className="w-full py-3.5 bg-[#1E3A5F] text-white rounded-2xl text-sm font-bold min-h-[48px]">Save Changes</button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 bg-white border-t border-[#E5E7EB] p-4 space-y-2" style={{ maxWidth: 375, width: '100%' }}>
        <button onClick={() => setShowAddModal(true)}
          className="w-full py-3 border-2 border-dashed border-[#C0392B] text-[#C0392B] rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 min-h-[48px]">
          <Plus size={15} /> Add Another Damage Photo
        </button>
        <button onClick={onComplete}
          className="w-full py-3.5 bg-[#1A7A4A] text-white rounded-2xl text-sm font-bold min-h-[48px]">
          {damagePhotos.length === 0 ? 'Skip — No Damage Found ✓' : `Done — ${damagePhotos.length} Damage Photo${damagePhotos.length !== 1 ? 's' : ''} ✓`}
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Jobs ────────────────────────────────────────────────────────────────
function JobsTab({ onJobSelect }: { onJobSelect: (job: Job) => void }) {
  const [filter, setFilter] = useState<'All' | 'Upcoming' | 'Completed'>('All');
  const filtered = filter === 'All' ? jobs : jobs.filter(j => j.status === filter || (filter === 'Upcoming' && (j.status === 'Upcoming' || j.status === 'En Route')));
  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="px-4 pt-4 pb-2">
        <p className="text-base font-bold text-[#1F2937] mb-3">All Jobs</p>
        <div className="flex gap-2">
          {(['All', 'Upcoming', 'Completed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f ? 'bg-[#1E3A5F] text-white' : 'bg-[#F4F6F8] text-[#6B7280]'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 space-y-3">
        {filtered.map(job => (
          <div key={job.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <JobStatusChip status={job.status} />
              <span className="text-xs text-[#6B7280] font-medium">{job.time}</span>
            </div>
            <p className="text-base font-bold text-[#1F2937]">{job.vehicle}</p>
            <p className="text-sm font-mono font-semibold text-[#2E75B6]">{job.plate}</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-[#6B7280]">👤 {job.customer}</p>
              <p className="text-sm text-[#6B7280] flex items-center gap-1">
                <MapPin size={12} className="text-[#C0392B]" /> {job.location}
              </p>
            </div>
            <button onClick={() => onJobSelect(job)}
              className={`w-full mt-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 min-h-[48px] ${job.status === 'Completed' ? 'bg-[#F4F6F8] text-[#6B7280]' : 'bg-[#1E3A5F] text-white'}`}>
              {job.status === 'Completed' ? <><Eye size={14} /> View Report</> : <><Play size={14} /> Start Inspection</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Notifications ───────────────────────────────────────────────────────
function NotificationsTab() {
  const notifications = [
    { id: 1, type: 'job', title: 'New Job Assigned', desc: 'Order #1904 — 2021 Toyota Corolla assigned to you', time: '5 min ago', read: false },
    { id: 2, type: 'qa', title: 'Report Approved', desc: 'Your report for Order #1899 has been approved by QA', time: '1h ago', read: false },
    { id: 3, type: 'system', title: 'Schedule Updated', desc: 'Your 3:00 PM inspection has been rescheduled to 4:00 PM', time: '2h ago', read: true },
    { id: 4, type: 'job', title: 'Job Reminder', desc: 'Order #1902 starts in 30 minutes — Chidi Nwosu', time: '3h ago', read: true },
    { id: 5, type: 'qa', title: 'Report Flagged', desc: 'QA flagged Order #1897 for additional photos', time: 'Yesterday', read: true },
  ];
  const typeIcon = (t: string) => t === 'job' ? '🔧' : t === 'qa' ? '✅' : '📢';
  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <p className="text-base font-bold text-[#1F2937]">Notifications</p>
        <button className="text-xs text-[#2E75B6] font-medium">Mark all read</button>
      </div>
      <div className="px-4 space-y-2">
        {notifications.map(n => (
          <div key={n.id} className={`bg-white rounded-2xl border p-4 ${!n.read ? 'border-[#2E75B6]/30 bg-blue-50/30' : 'border-[#E5E7EB]'}`}>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{typeIcon(n.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[#1F2937]">{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#2E75B6] flex-shrink-0" />}
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">{n.desc}</p>
                <p className="text-[10px] text-[#9CA3AF] mt-1">{n.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Profile ─────────────────────────────────────────────────────────────
function ProfileTab({ onLogout }: { onLogout: () => void }) {
  const stats = [
    { label: 'Total Jobs', value: '247' },
    { label: 'This Month', value: '18' },
    { label: 'Avg Score', value: '87' },
    { label: 'Rating', value: '4.9' },
  ];
  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="bg-[#1E3A5F] px-4 pb-6 -mt-0">
        <div className="flex flex-col items-center pt-2">
          <div className="w-20 h-20 rounded-full bg-[#2E75B6] flex items-center justify-center text-white text-2xl font-black mb-3">EO</div>
          <p className="text-white font-bold text-xl">Emeka Okonkwo</p>
          <p className="text-white/60 text-sm mt-0.5">Inspector · ID: INS-001</p>
          <div className="flex items-center gap-1.5 mt-2 bg-white/10 px-3 py-1 rounded-full">
            <CheckCircle size={12} className="text-green-400" />
            <span className="text-white text-xs font-medium">Certified Inspector</span>
          </div>
        </div>
      </div>
      <div className="bg-white mx-4 -mt-4 rounded-2xl shadow-sm border border-[#E5E7EB] p-4 grid grid-cols-4 gap-2">
        {stats.map(s => (
          <div key={s.label} className="text-center">
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-[#6B7280]">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="px-4 mt-4 space-y-3">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-3">Personal Info</p>
          {[['Email', 'emeka.inspector@carschek.com'], ['Phone', '+234 801 234 5678'], ['Zone', 'Lagos Island & Lekki'], ['Joined', 'March 2024']].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
              <span className="text-xs text-[#6B7280]">{k}</span>
              <span className="text-xs font-medium text-[#1F2937]">{v}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-3">Certifications</p>
          {[['Carschek Certified Inspector', 'Valid until Dec 2026'], ['Advanced Diagnostics', 'Valid until Jun 2026']].map(([cert, validity]) => (
            <div key={cert} className="flex items-center gap-3 py-2 border-b border-[#F3F4F6] last:border-0">
              <CheckCircle size={16} className="text-[#1A7A4A] flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#1F2937]">{cert}</p>
                <p className="text-[10px] text-[#6B7280]">{validity}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onLogout}
          className="w-full py-4 bg-red-50 border border-red-200 text-[#C0392B] rounded-2xl text-sm font-bold flex items-center justify-center gap-2 min-h-[56px]">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Screen 1: Inspector Home ─────────────────────────────────────────────────
function InspectorHome({ onJobSelect, activeTab, onTabChange, onLogout }: {
  onJobSelect: (job: Job) => void;
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
  onLogout: () => void;
}) {
  return (
    <div className="bg-[#F4F6F8] min-h-screen flex flex-col" style={{ maxWidth: 375, margin: '0 auto' }}>
      <PWAHeader onLogout={onLogout} />
      {activeTab === 'Home' && (
        <>
          <div className="bg-[#1E3A5F] px-4 pb-4">
            <div className="bg-white/10 rounded-2xl p-4">
              <p className="text-white text-xl font-bold">Good morning, Emeka 👋</p>
              <p className="text-white/70 text-sm mt-0.5">Thursday, April 10, 2026 · Clear skies in Lagos</p>
            </div>
          </div>
          <div className="bg-white mx-4 -mt-3 rounded-2xl shadow-sm border border-[#E5E7EB] p-4 grid grid-cols-4 gap-2">
            {[
              { label: 'Jobs Today', value: '3', color: 'text-[#1F2937]' },
              { label: 'Completed', value: '1', color: 'text-[#1A7A4A]' },
              { label: 'Pending', value: '2', color: 'text-[#D35400]' },
              { label: 'Avg Score', value: '87', color: 'text-[#2E75B6]' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-[#6B7280]">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto pb-24">
            <p className="text-sm font-semibold text-[#6B7280] uppercase tracking-widest">Today's Jobs</p>
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <JobStatusChip status={job.status} />
                  <span className="text-xs text-[#6B7280] font-medium">{job.time}</span>
                </div>
                <p className="text-base font-bold text-[#1F2937]">{job.vehicle}</p>
                <p className="text-sm font-mono font-semibold text-[#2E75B6]">{job.plate}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-[#6B7280]">👤 {job.customer} · {job.phone}</p>
                  <p className="text-sm text-[#6B7280]">⏱ {job.timeFromNow}</p>
                  <p className="text-sm text-[#6B7280] flex items-center gap-1">
                    <MapPin size={12} className="text-[#C0392B]" /> {job.location}
                    <span className="text-[#2E75B6] font-medium ml-1">{job.distance}</span>
                  </p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 py-2.5 bg-[#F4F6F8] text-[#1F2937] rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 min-h-[48px]">
                    <Navigation size={14} /> Navigate
                  </button>
                  <button onClick={() => onJobSelect(job)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 min-h-[48px] ${job.status === 'Completed' ? 'bg-[#F4F6F8] text-[#6B7280]' : 'bg-[#1E3A5F] text-white'}`}>
                    {job.status === 'Completed' ? <><Eye size={14} /> View</> : <><Play size={14} /> Start</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {activeTab === 'Jobs' && <JobsTab onJobSelect={onJobSelect} />}
      {activeTab === 'Notifications' && <NotificationsTab />}
      {activeTab === 'Profile' && <ProfileTab onLogout={onLogout} />}
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}

// ─── Screen 2: Job Detail ─────────────────────────────────────────────────────
function JobDetail({ job, onBack, onStart }: { job: Job; onBack: () => void; onStart: () => void }) {
  const [confirmStart, setConfirmStart] = useState(false);
  const [notes, setNotes] = useState('');
  return (
    <div className="bg-[#F4F6F8] min-h-screen flex flex-col" style={{ maxWidth: 375, margin: '0 auto' }}>
      <div className="bg-[#1E3A5F] px-4 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center min-h-[48px] min-w-[48px]">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <p className="text-white font-bold text-lg">Order {job.id}</p>
          <JobStatusChip status={job.status} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
          <p className="text-3xl font-black text-[#1E3A5F] tracking-widest font-mono">{job.plate}</p>
          <p className="text-lg font-bold text-[#1F2937] mt-1">{job.vehicle}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-5 h-5 rounded-full bg-white border-2 border-[#E5E7EB]" style={{ backgroundColor: '#F5F5DC' }} />
            <span className="text-sm text-[#6B7280]">Beige · 87,450 km</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-3">Customer</p>
          <p className="text-base font-bold text-[#1F2937]">{job.customer}</p>
          <a href={`tel:${job.phone}`} className="flex items-center gap-2 mt-2 text-[#2E75B6] font-medium text-sm min-h-[48px]">
            <Phone size={16} /> {job.phone}
          </a>
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-amber-700">⚠ Special Note</p>
            <p className="text-xs text-amber-600 mt-0.5">Customer requests extra attention to engine bay — previous mechanic flagged oil leak</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="bg-gradient-to-br from-green-100 to-blue-100 h-32 flex items-center justify-center relative">
            <div className="text-center">
              <MapPin size={28} className="text-[#C0392B] mx-auto" />
              <p className="text-xs font-medium text-[#1F2937] mt-1">Tap to open navigation</p>
            </div>
          </div>
          <div className="p-3 flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">{job.location}</p>
            <span className="text-xs font-semibold text-[#2E75B6]">{job.distance}</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-2">Inspector Notes</p>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="Add job-specific notes before starting..."
            className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 resize-none" />
        </div>
      </div>
      <div className="fixed bottom-0 bg-white border-t border-[#E5E7EB] p-4" style={{ maxWidth: 375, width: '100%' }}>
        {job.status !== 'Completed' ? (
          <button onClick={() => setConfirmStart(true)}
            className="w-full py-4 bg-[#1E3A5F] text-white rounded-2xl text-base font-bold flex items-center justify-center gap-2 min-h-[56px]">
            <Play size={18} /> START INSPECTION
          </button>
        ) : (
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-[#F4F6F8] text-[#1F2937] rounded-2xl text-sm font-bold min-h-[48px]">View Report</button>
            <button className="flex-1 py-3 bg-[#2E75B6] text-white rounded-2xl text-sm font-bold min-h-[48px] flex items-center justify-center gap-1.5">
              <Share2 size={14} /> Share
            </button>
          </div>
        )}
      </div>
      {confirmStart && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" style={{ maxWidth: 375, margin: '0 auto' }}>
          <div className="bg-white rounded-t-3xl p-6 w-full">
            <p className="text-lg font-bold text-[#1F2937] mb-2">Ready to start?</p>
            <p className="text-sm text-[#6B7280] mb-6">Starting timer and locking this job to you. Ready?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmStart(false)} className="flex-1 py-3.5 border border-[#E5E7EB] rounded-2xl font-semibold text-[#6B7280] min-h-[48px]">Cancel</button>
              <button onClick={() => { setConfirmStart(false); onStart(); }} className="flex-1 py-3.5 bg-[#1E3A5F] text-white rounded-2xl font-bold min-h-[48px]">Start</button>
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

  const statusDot = (s: Section['status']) => {
    if (s === 'not-started') return <span className="w-3 h-3 rounded-full bg-[#E5E7EB] border-2 border-[#D1D5DB]" />;
    if (s === 'in-progress') return <span className="w-3 h-3 rounded-full bg-[#D35400]" />;
    if (s === 'complete-pass') return <CheckCircle size={14} className="text-[#1A7A4A]" />;
    return <XCircle size={14} className="text-[#C0392B]" />;
  };

  const sectionIcon = (name: string) => {
    if (name === 'Vehicle Photos') return '📷';
    if (name === 'Damage Photos') return '⚠️';
    return null;
  };

  return (
    <div className="bg-[#F4F6F8] min-h-screen flex flex-col" style={{ maxWidth: 375, margin: '0 auto' }}>
      <div className="bg-[#1E3A5F] px-4 pt-10 pb-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-bold text-base">2019 Toyota Camry</p>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
            <Clock size={14} className="text-white" />
            <span className="text-white font-bold text-base">{fmt(elapsed)}</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="#2E75B6" strokeWidth="8"
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

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {/* Standard sections 1-12 */}
        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-2">Inspection Checklist</p>
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {sections.slice(0, 12).map(s => (
            <button key={s.id} onClick={() => onSectionSelect(s)}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-3 text-left active:scale-95 transition-transform shadow-sm">
              <div className="flex justify-end mb-2">{statusDot(s.status)}</div>
              <p className="text-xs font-bold text-[#1F2937] leading-tight">{s.name}</p>
              <p className="text-[10px] text-[#6B7280] mt-1">{s.items} items</p>
              <p className="text-[10px] text-[#6B7280]">{s.timeEst}</p>
            </button>
          ))}
        </div>

        {/* Photo sections 13-14 */}
        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-2">Photo Documentation</p>
        <div className="space-y-2.5">
          {sections.slice(12).map(s => (
            <button key={s.id} onClick={() => onSectionSelect(s)}
              className={`w-full bg-white rounded-2xl border p-4 text-left active:scale-95 transition-transform shadow-sm flex items-center gap-3 ${s.id === 's14' ? 'border-[#C0392B]/20' : 'border-[#2E75B6]/20'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${s.id === 's14' ? 'bg-red-50' : 'bg-blue-50'}`}>
                {sectionIcon(s.name)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-[#1F2937]">{s.name}</p>
                  {statusDot(s.status)}
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {s.id === 's13' ? '11 standard vehicle photos' : 'Dynamic — add damage photos with AI scan'}
                </p>
                <p className="text-[10px] text-[#6B7280]">{s.timeEst}</p>
              </div>
              {s.id === 's14' && (
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                  <Zap size={10} className="text-amber-600" />
                  <span className="text-[10px] text-amber-700 font-semibold">AI</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 bg-white border-t border-[#E5E7EB] p-4 space-y-2" style={{ maxWidth: 375, width: '100%' }}>
        <button onClick={onFinish} className="w-full py-3.5 bg-[#1E3A5F] text-white rounded-2xl text-sm font-bold min-h-[48px]">
          Finish & Review
        </button>
        <button onClick={() => setAllPassModal(true)} className="w-full py-3 border border-[#E5E7EB] text-[#6B7280] rounded-2xl text-sm font-medium min-h-[48px]">
          ALL PASS (mark remaining)
        </button>
      </div>

      {allPassModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" style={{ maxWidth: 375, margin: '0 auto' }}>
          <div className="bg-white rounded-t-3xl p-6 w-full">
            <p className="text-lg font-bold text-[#1F2937] mb-2">Mark All Remaining as Pass?</p>
            <p className="text-sm text-[#6B7280] mb-6">This will mark {sections.filter(s => s.status === 'not-started').length} sections as fully passing.</p>
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
          <div className="h-full bg-[#2E75B6] rounded-full transition-all" style={{ width: `${(done / items.length) * 100}%` }} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 pb-28">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-[#1F2937]">{item.name}</p>
                <button className="w-8 h-8 flex items-center justify-center text-[#6B7280]">
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
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${btnClass(item.singleResult === 'pass', 'pass')}`}>✓ PASS</button>
                  <button onClick={() => setResult(item.id, 'single', 'fail')}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${btnClass(item.singleResult === 'fail', 'fail')}`}>✗ FAIL</button>
                  <button onClick={() => setResult(item.id, 'single', 'na')}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${btnClass(item.singleResult === 'na', 'na')}`}>⊘ N/A</button>
                </div>
              )}
            </div>
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
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none resize-none" />
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
      <div className="fixed bottom-0 bg-white border-t border-[#E5E7EB] p-4 space-y-2" style={{ maxWidth: 375, width: '100%' }}>
        <p className="text-xs text-center text-[#6B7280]">{done} / {items.length} items completed</p>
        <button onClick={onNext}
          className={`w-full py-3.5 rounded-2xl text-sm font-bold min-h-[48px] transition-all ${done === items.length ? 'bg-[#1A7A4A] text-white' : 'bg-[#E5E7EB] text-[#6B7280]'}`}>
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
      <div className="bg-[#1E3A5F] px-4 pt-10 pb-5">
        <p className="text-white font-bold text-xl mb-4">Review & Submit</p>
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
        {/* Photo summary */}
        <div className="bg-white rounded-2xl border border-[#2E75B6]/20 p-4">
          <p className="font-bold text-[#1F2937] mb-3 flex items-center gap-2">
            <Camera size={15} className="text-[#2E75B6]" /> Photo Documentation
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-[#F3F4F6]">
              <div className="flex items-center gap-2">
                <span className="text-base">📷</span>
                <span className="text-sm text-[#1F2937]">Vehicle Photos</span>
              </div>
              <span className="text-xs font-semibold text-[#1A7A4A]">11 captured</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span className="text-sm text-[#1F2937]">Damage Photos</span>
              </div>
              <span className="text-xs font-semibold text-[#C0392B]">2 defects</span>
            </div>
          </div>
        </div>
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
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
          <p className="font-bold text-[#1F2937] mb-3">Inspector Sign-Off</p>
          <div className="border-2 border-dashed border-[#E5E7EB] rounded-2xl h-28 flex items-center justify-center relative overflow-hidden"
            onClick={() => setSigned(true)}>
            {signed ? (
              <div className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 280 100" className="w-full h-full p-4">
                  <path d="M20,60 Q40,20 60,50 Q80,80 100,40 Q120,10 140,50 Q160,80 180,45 Q200,20 220,55 Q240,75 260,50" fill="none" stroke="#1E3A5F" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            ) : (
              <div className="text-center">
                <Pen size={24} className="text-[#E5E7EB] mx-auto mb-1" />
                <p className="text-sm text-[#6B7280]">Tap to sign</p>
              </div>
            )}
          </div>
          {signed && <button onClick={() => setSigned(false)} className="mt-2 text-xs text-[#C0392B] hover:underline">Clear</button>}
        </div>
      </div>
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
          <button className="w-full py-4 bg-[#D35400] text-white rounded-2xl text-base font-bold min-h-[56px]">
            Save & Submit When Online
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Template Selector Modal ──────────────────────────────────────────────────
function TemplateSelector({ onSelect, onClose }: { onSelect: (template: 'classic' | 'modern') => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" style={{ maxWidth: 375, margin: '0 auto' }}>
      <div className="bg-white rounded-t-3xl p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <p className="text-lg font-bold text-[#1F2937]">Choose Report Template</p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F4F6F8]">
            <X size={16} className="text-[#6B7280]" />
          </button>
        </div>
        <p className="text-sm text-[#6B7280] mb-5">Select a template style for your PDF report</p>
        <div className="space-y-3 mb-5">
          <button onClick={() => onSelect('classic')}
            className="w-full border-2 border-[#E5E7EB] hover:border-[#1E3A5F] rounded-2xl p-4 text-left transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-16 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                <div className="h-3 bg-[#1E3A5F]" />
                <div className="p-1.5 space-y-1">
                  <div className="h-1.5 bg-[#E5E7EB] rounded w-full" />
                  <div className="h-1 bg-[#E5E7EB] rounded w-3/4" />
                  <div className="h-1 bg-[#E5E7EB] rounded w-1/2" />
                  <div className="h-3 bg-[#F4F6F8] rounded mt-1" />
                  <div className="h-1 bg-[#E5E7EB] rounded w-full" />
                  <div className="h-1 bg-[#E5E7EB] rounded w-2/3" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={16} className="text-[#1E3A5F]" />
                  <p className="font-bold text-[#1F2937]">Classic</p>
                </div>
                <p className="text-xs text-[#6B7280]">Traditional layout with navy header, structured table format, and formal typography</p>
              </div>
            </div>
          </button>
          <button onClick={() => onSelect('modern')}
            className="w-full border-2 border-[#E5E7EB] hover:border-[#2E75B6] rounded-2xl p-4 text-left transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-16 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                <div className="h-2 bg-gradient-to-r from-[#1E3A5F] to-[#2E75B6]" />
                <div className="p-1.5 space-y-1">
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded-full bg-[#E5E7EB]" />
                    <div className="flex-1 space-y-0.5 pt-0.5">
                      <div className="h-1 bg-[#E5E7EB] rounded w-full" />
                      <div className="h-1 bg-[#E5E7EB] rounded w-2/3" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-0.5 mt-1">
                    <div className="h-3 bg-[#F4F6F8] rounded" />
                    <div className="h-3 bg-[#F4F6F8] rounded" />
                  </div>
                  <div className="h-1 bg-[#E5E7EB] rounded w-full" />
                  <div className="h-1 bg-[#E5E7EB] rounded w-3/4" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={16} className="text-[#2E75B6]" />
                  <p className="font-bold text-[#1F2937]">Modern</p>
                </div>
                <p className="text-xs text-[#6B7280]">Contemporary design with gradient accents, card-based layout, and visual score gauge</p>
              </div>
            </div>
          </button>
        </div>
        <button onClick={onClose} className="w-full py-3 border border-[#E5E7EB] text-[#6B7280] rounded-2xl text-sm font-medium min-h-[48px]">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── PDF Generation helpers ───────────────────────────────────────────────────

async function renderHTMLtoPDF(htmlContent: string, filename: string): Promise<void> {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    container.style.cssText =
      'position:fixed;left:-9999px;top:0;width:794px;background:#fff;z-index:-1;overflow:visible;';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    // Wait for fonts/layout/images to settle
    setTimeout(async () => {
      try {
        // ── 1. Capture the full document at 2× resolution ──────────────────
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794,
          windowWidth: 794,
          scrollY: 0,
          scrollX: 0,
        });

        // ── 2. Compute scale factors ────────────────────────────────────────
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageW = pdf.internal.pageSize.getWidth();   // 210 mm
        const pageH = pdf.internal.pageSize.getHeight();  // 297 mm
        const marginMM = 8;                               // top/bottom margin per page
        const usableH = pageH - marginMM * 2;             // mm of content per page

        // px (at scale:1) → mm
        const containerRect = container.getBoundingClientRect();
        const totalPxH = containerRect.height;            // real px height of content
        const pxToMM = pageW / 794;                       // 794 CSS px = 210 mm

        // ── 3. Collect all atomic block elements and their top/bottom in mm ─
        //    We query every direct and nested block-level element that could
        //    be a natural break candidate.  We want the LEAF-level blocks so
        //    we never split inside a card/row/grid-cell.
        const BLOCK_SELECTORS = [
          // grid rows / photo rows — keep whole row together
          '.photos-grid-3 > *',
          '.photos-grid-2 > *',
          '.vehicle-grid > *',
          '.grid-2 > *',
          // table rows
          'tr',
          // defect / damage / info cards
          '.damage-card',
          '.critical-card',
          '.critical-box',
          '.score-card',
          '.score-section',
          '.footer-card',
          '.footer',
          // section headings
          '.section-title',
          'h1, h2, h3',
          // generic top-level children of .page
          '.page > *',
        ];

        // Build a flat list of {topMM, bottomMM} for every matched element,
        // deduplicated by DOM node so parent+child don't both appear.
        const seen = new Set<Element>();
        const blocks: { topMM: number; bottomMM: number }[] = [];

        for (const sel of BLOCK_SELECTORS) {
          container.querySelectorAll<HTMLElement>(sel).forEach((el) => {
            if (seen.has(el)) return;
            seen.add(el);
            const r = el.getBoundingClientRect();
            const topMM = (r.top - containerRect.top) * pxToMM;
            const bottomMM = (r.bottom - containerRect.top) * pxToMM;
            if (bottomMM > topMM) {
              blocks.push({ topMM, bottomMM });
            }
          });
        }

        // Sort by topMM ascending
        blocks.sort((a, b) => a.topMM - b.topMM);

        // ── 4. Compute safe page-break positions ───────────────────────────
        //    Walk through blocks; whenever adding the next block would exceed
        //    the current page's usable height, insert a break BEFORE that block.
        //    The break Y is placed at the gap between the previous block's
        //    bottom and the current block's top (midpoint of the gap).
        const pageBreaksMM: number[] = [];   // Y positions (in mm) where pages cut
        let pageStartMM = 0;

        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];
          const blockHeightMM = block.bottomMM - block.topMM;
          const usedOnPage = block.bottomMM - pageStartMM;

          if (usedOnPage > usableH && i > 0) {
            // Find the gap before this block to place the cut
            const prevBottom = blocks[i - 1].bottomMM;
            const gapMid = prevBottom + (block.topMM - prevBottom) / 2;
            const breakY = Math.max(pageStartMM + usableH * 0.5, gapMid);
            pageBreaksMM.push(breakY);
            pageStartMM = breakY;
          }

          // If a single block is taller than a full page, we still have to
          // break somewhere — break right before it starts (best effort).
          if (blockHeightMM > usableH && block.topMM > pageStartMM) {
            pageBreaksMM.push(block.topMM);
            pageStartMM = block.topMM;
          }
        }

        // ── 5. Build page slice boundaries (in scaled canvas pixels) ───────
        //    Convert each break Y (mm) → canvas px (scale:2).
        const mmToScaledPx = (mm: number) => (mm / pxToMM) * 2;

        const sliceBoundaries: number[] = [0];
        for (const breakMM of pageBreaksMM) {
          sliceBoundaries.push(mmToScaledPx(breakMM));
        }
        sliceBoundaries.push(canvas.height);

        // ── 6. Render each page slice into the PDF ─────────────────────────
        for (let p = 0; p < sliceBoundaries.length - 1; p++) {
          if (p > 0) pdf.addPage();

          const srcY = Math.round(sliceBoundaries[p]);
          const srcH = Math.round(sliceBoundaries[p + 1]) - srcY;
          if (srcH <= 0) continue;

          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = srcH;
          const ctx = sliceCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
          }

          const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95);
          // Height of this slice in mm
          const sliceHeightMM = (srcH / 2) * pxToMM;
          pdf.addImage(sliceData, 'JPEG', 0, marginMM, pageW, sliceHeightMM);
        }

        pdf.save(filename);
      } finally {
        document.body.removeChild(container);
        resolve();
      }
    }, 600);
  });
}

async function generateClassicPDF(): Promise<void> {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Carschek Inspection Report — Classic</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Georgia', serif; color: #1F2937; background: #fff; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px; }
  .header { background: #1E3A5F; color: white; padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; }
  .header-logo { font-size: 24px; font-weight: 900; letter-spacing: 2px; }
  .header-sub { font-size: 11px; opacity: 0.7; margin-top: 2px; }
  .header-right { text-align: right; font-size: 12px; opacity: 0.8; }
  .score-section { background: #F9FAFB; border: 1px solid #E5E7EB; padding: 24px; margin: 24px 0; display: flex; align-items: center; gap: 32px; }
  .score-circle { width: 100px; height: 100px; border-radius: 50%; border: 8px solid #1A7A4A; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .score-num { font-size: 32px; font-weight: 900; color: #1F2937; }
  .score-denom { font-size: 11px; color: #6B7280; }
  .score-label { font-size: 18px; font-weight: 700; color: #1A7A4A; }
  .score-sub { font-size: 12px; color: #6B7280; margin-top: 4px; }
  .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1E3A5F; border-bottom: 2px solid #1E3A5F; padding-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #1E3A5F; color: white; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 8px 12px; border-bottom: 1px solid #F3F4F6; }
  tr:nth-child(even) td { background: #F9FAFB; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; }
  .badge-critical { background: #FEE2E2; color: #C0392B; }
  .badge-major { background: #FEF3C7; color: #D35400; }
  .badge-minor { background: #FEF9C3; color: #92400E; }
  .vehicle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
  .vehicle-item { background: #F9FAFB; border: 1px solid #E5E7EB; padding: 10px 14px; }
  .vehicle-label { font-size: 10px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; }
  .vehicle-value { font-size: 13px; font-weight: 600; color: #1F2937; margin-top: 2px; }
  .critical-box { background: #FEF2F2; border: 1px solid #FECACA; padding: 12px 16px; margin: 12px 0; }
  .critical-title { font-size: 12px; font-weight: 700; color: #C0392B; margin-bottom: 6px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; }
  .inspector-info { font-size: 11px; color: #6B7280; }
  .qr-placeholder { width: 60px; height: 60px; border: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #6B7280; text-align: center; }
  .validity { font-size: 10px; color: #6B7280; margin-top: 8px; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="header-logo">CARSCHEK</div>
      <div class="header-sub">Vehicle Inspection Report</div>
    </div>
    <div class="header-right">
      <div>Report #CS-2026-4521</div>
      <div>15 April 2026</div>
    </div>
  </div>

  <div class="score-section">
    <div class="score-circle">
      <div class="score-num">73</div>
      <div class="score-denom">/100</div>
    </div>
    <div>
      <div class="score-label">GOOD CONDITION</div>
      <div class="score-sub">Carschek Score — 27-Point Methodology</div>
      <div style="margin-top:8px;font-size:12px;color:#6B7280;">210 items inspected · 8 defects found · 4 N/A</div>
    </div>
  </div>

  <div class="section-title">Vehicle Information</div>
  <div class="vehicle-grid">
    <div class="vehicle-item"><div class="vehicle-label">Vehicle</div><div class="vehicle-value">2019 Toyota Camry LE</div></div>
    <div class="vehicle-item"><div class="vehicle-label">Plate Number</div><div class="vehicle-value">KJA 234 AA</div></div>
    <div class="vehicle-item"><div class="vehicle-label">Mileage</div><div class="vehicle-value">87,450 km</div></div>
    <div class="vehicle-item"><div class="vehicle-label">Colour</div><div class="vehicle-value">Beige</div></div>
    <div class="vehicle-item"><div class="vehicle-label">VIN</div><div class="vehicle-value">JTMBF3EH4JD123456</div></div>
    <div class="vehicle-item"><div class="vehicle-label">Inspection Date</div><div class="vehicle-value">15 April 2026</div></div>
  </div>

  <div class="critical-box">
    <div class="critical-title">&#9888; Critical Issues Requiring Immediate Attention</div>
    <div style="font-size:12px;color:#1F2937;">Engine Bay &#8594; Valve Cover Seal: Oil leak from valve cover gasket — requires immediate attention</div>
  </div>

  <div class="section-title">Defects Summary</div>
  <table>
    <thead><tr><th>Section</th><th>Item</th><th>Severity</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td>Body Frame</td><td>Front Rail (Right)</td><td><span class="badge badge-major">Major</span></td><td>Visible dent on right front rail, approximately 15cm</td></tr>
      <tr><td>Body Frame</td><td>Door Sill (Left)</td><td><span class="badge badge-minor">Minor</span></td><td>Surface rust on left door sill</td></tr>
      <tr><td>Engine Bay</td><td>Valve Cover Seal</td><td><span class="badge badge-critical">Critical</span></td><td>Oil leak from valve cover gasket — requires immediate attention</td></tr>
      <tr><td>Transmission</td><td>Fluid Level</td><td><span class="badge badge-major">Major</span></td><td>Transmission fluid below minimum level</td></tr>
    </tbody>
  </table>

  <div class="section-title">Inspection Sections</div>
  <table>
    <thead><tr><th>Section</th><th>Items</th><th>Pass</th><th>Fail</th><th>Result</th></tr></thead>
    <tbody>
      <tr><td>Body Frame</td><td>12</td><td>10</td><td>2</td><td><span class="badge badge-major">Issues Found</span></td></tr>
      <tr><td>Engine Bay</td><td>15</td><td>14</td><td>1</td><td><span class="badge badge-critical">Critical</span></td></tr>
      <tr><td>Transmission</td><td>8</td><td>7</td><td>1</td><td><span class="badge badge-major">Issues Found</span></td></tr>
      <tr><td>Suspension</td><td>10</td><td>10</td><td>0</td><td><span class="badge" style="background:#D1FAE5;color:#1A7A4A;">Pass</span></td></tr>
      <tr><td>Brakes</td><td>8</td><td>8</td><td>0</td><td><span class="badge" style="background:#D1FAE5;color:#1A7A4A;">Pass</span></td></tr>
      <tr><td>Tyres</td><td>6</td><td>6</td><td>0</td><td><span class="badge" style="background:#D1FAE5;color:#1A7A4A;">Pass</span></td></tr>
      <tr><td>Lights</td><td>10</td><td>10</td><td>0</td><td><span class="badge" style="background:#D1FAE5;color:#1A7A4A;">Pass</span></td></tr>
      <tr><td>Interior</td><td>14</td><td>14</td><td>0</td><td><span class="badge" style="background:#D1FAE5;color:#1A7A4A;">Pass</span></td></tr>
    </tbody>
  </table>

  <div class="section-title">Vehicle Photos (11)</div>
  <p style="font-size:11px;color:#6B7280;margin-bottom:12px;">11 standard vehicle photos captured during inspection</p>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">
    ${VEHICLE_PHOTO_NAMES.map((name, i) => `
      <div style="border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;">
        <div style="height:70px;background:linear-gradient(135deg,#E5E7EB,#D1D5DB);display:flex;align-items:center;justify-content:center;font-size:20px;">
          ${['🚗','🚘','🚗','🚗','🚗','🚗','🚗','🪑','🪑','⚙️','🔵'][i]}
        </div>
        <div style="padding:5px 7px;background:#F9FAFB;">
          <p style="font-size:9px;font-weight:700;color:#1F2937;margin:0;">${name}</p>
          <p style="font-size:8px;color:#1A7A4A;margin:2px 0 0;">&#10003; Captured</p>
        </div>
      </div>
    `).join('')}
  </div>

  <div class="section-title">Damage Photos (2)</div>
  <p style="font-size:11px;color:#6B7280;margin-bottom:12px;">Defect photos captured with AI-assisted analysis</p>
  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:16px;">
    <div style="border:1px solid #FECACA;border-radius:10px;overflow:hidden;">
      <div style="height:90px;background:linear-gradient(135deg,#FEF2F2,#FECACA);display:flex;align-items:center;justify-content:center;font-size:28px;">⚠️</div>
      <div style="padding:8px 10px;background:#FFF5F5;">
        <p style="font-size:10px;font-weight:700;color:#1F2937;margin:0;">Front Bumper Dent</p>
        <span style="display:inline-block;font-size:9px;font-weight:700;background:#FEE2E2;color:#C0392B;padding:1px 6px;border-radius:10px;margin:3px 0;">Major · AI Detected</span>
        <p style="font-size:9px;color:#6B7280;margin:3px 0 0;line-height:1.4;">Minor dent and paint scratch on front bumper, right side approximately 15cm</p>
      </div>
    </div>
    <div style="border:1px solid #FED7AA;border-radius:10px;overflow:hidden;">
      <div style="height:90px;background:linear-gradient(135deg,#FFF7ED,#FED7AA);display:flex;align-items:center;justify-content:center;font-size:28px;">⚠️</div>
      <div style="padding:8px 10px;background:#FFFBF5;">
        <p style="font-size:10px;font-weight:700;color:#1F2937;margin:0;">Door Sill Rust</p>
        <span style="display:inline-block;font-size:9px;font-weight:700;background:#FEF3C7;color:#D35400;padding:1px 6px;border-radius:10px;margin:3px 0;">Minor · AI Detected</span>
        <p style="font-size:9px;color:#6B7280;margin:3px 0 0;line-height:1.4;">Surface rust on left door sill, minor corrosion</p>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="inspector-info">
      <div style="font-weight:700;font-size:13px;color:#1F2937;">Emeka Okonkwo</div>
      <div>Inspector ID: INS-001 · Carschek Certified</div>
      <div class="validity">This report is valid for 90 days from inspection date</div>
    </div>
    <div style="text-align:center;">
      <div class="qr-placeholder">QR CODE Verify</div>
    </div>
  </div>
</div>
`;
  return renderHTMLtoPDF(html, 'Carschek-Report-CS-2026-4521-Classic.pdf');
}

async function generateModernPDF(): Promise<void> {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Carschek Inspection Report — Modern</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1F2937; background: #F4F6F8; }
  .page { max-width: 800px; margin: 0 auto; padding: 24px; }
  .header-card { background: linear-gradient(135deg, #1E3A5F 0%, #2E75B6 100%); border-radius: 16px; padding: 28px 32px; color: white; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
  .logo { font-size: 22px; font-weight: 900; letter-spacing: 2px; }
  .logo-sub { font-size: 11px; opacity: 0.7; margin-top: 2px; }
  .report-meta { text-align: right; font-size: 12px; opacity: 0.8; }
  .score-card { background: white; border-radius: 16px; padding: 24px; margin-bottom: 16px; display: flex; align-items: center; gap: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .score-ring { position: relative; width: 110px; height: 110px; flex-shrink: 0; }
  .score-ring svg { transform: rotate(-90deg); }
  .score-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .score-num { font-size: 34px; font-weight: 900; color: #1F2937; line-height: 1; }
  .score-denom { font-size: 11px; color: #6B7280; }
  .score-label { font-size: 20px; font-weight: 800; color: #1A7A4A; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .card-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; margin-bottom: 12px; }
  .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #F3F4F6; font-size: 12px; }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: #6B7280; }
  .info-value { font-weight: 600; color: #1F2937; }
  .critical-card { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 14px 16px; margin: 12px 0; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; }
  .badge-critical { background: #FEE2E2; color: #C0392B; }
  .badge-major { background: #FEF3C7; color: #D35400; }
  .badge-minor { background: #FEF9C3; color: #92400E; }
  .badge-pass { background: #D1FAE5; color: #1A7A4A; }
  .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1E3A5F; border-bottom: 2px solid #1E3A5F; padding-bottom: 6px; margin: 20px 0 12px; }
  .photos-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
  .photos-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
  .photo-card { border: 1px solid #E5E7EB; border-radius: 10px; overflow: hidden; }
  .photo-thumb { height: 70px; background: linear-gradient(135deg, #E5E7EB, #D1D5DB); display: flex; align-items: center; justify-content: center; font-size: 22px; }
  .photo-label { padding: 5px 7px; background: #F9FAFB; }
  .photo-name { font-size: 9px; font-weight: 700; color: #1F2937; margin: 0; }
  .photo-status { font-size: 8px; color: #1A7A4A; margin: 2px 0 0; }
  .damage-card { border-radius: 10px; overflow: hidden; }
  .damage-thumb { height: 90px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
  .damage-label { padding: 8px 10px; }
  .footer-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); display: flex; justify-content: space-between; align-items: center; }
  .inspector-name { font-size: 15px; font-weight: 700; color: #1F2937; }
  .inspector-sub { font-size: 11px; color: #6B7280; margin-top: 2px; }
  .qr-box { width: 64px; height: 64px; border: 1px solid #E5E7EB; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #6B7280; text-align: center; }
</style>
</head>
<body>
<div class="page">
  <div class="header-card">
    <div>
      <div class="logo">CARSCHEK</div>
      <div class="logo-sub">Vehicle Inspection Report</div>
    </div>
    <div class="report-meta">
      <div style="font-weight:600;">Report #CS-2026-4521</div>
      <div>15 April 2026</div>
    </div>
  </div>

  <div class="score-card">
    <div class="score-ring">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r="46" fill="none" stroke="#E5E7EB" stroke-width="10"/>
        <circle cx="55" cy="55" r="46" fill="none" stroke="#1A7A4A" stroke-width="10"
          stroke-dasharray="${2 * Math.PI * 46}" stroke-dashoffset="${2 * Math.PI * 46 * (1 - 73 / 100)}"
          stroke-linecap="round"/>
      </svg>
      <div class="score-inner">
        <div class="score-num">73</div>
        <div class="score-denom">/100</div>
      </div>
    </div>
    <div style="flex:1;">
      <div class="score-label">GOOD CONDITION</div>
      <div style="font-size:12px;color:#6B7280;margin-top:4px;">210 items · 8 defects · 4 N/A · 11 vehicle photos · 2 damage photos</div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-title">Vehicle Details</div>
      <div class="info-row"><span class="info-label">Make/Model</span><span class="info-value">2019 Toyota Camry LE</span></div>
      <div class="info-row"><span class="info-label">Plate</span><span class="info-value">KJA 234 AA</span></div>
      <div class="info-row"><span class="info-label">Mileage</span><span class="info-value">87,450 km</span></div>
      <div class="info-row"><span class="info-label">Colour</span><span class="info-value">Beige</span></div>
      <div class="info-row"><span class="info-label">VIN</span><span class="info-value">JTMBF3EH4JD...</span></div>
    </div>
    <div class="card">
      <div class="card-title">Inspection Details</div>
      <div class="info-row"><span class="info-label">Date</span><span class="info-value" style="color:#1A7A4A;">15 April 2026</span></div>
      <div class="info-row"><span class="info-label">Location</span><span class="info-value" style="color:#1A7A4A;">Lekki Phase 1</span></div>
      <div class="info-row"><span class="info-label">Customer</span><span class="info-value" style="color:#1A7A4A;">Adaeze Mensah</span></div>
      <div class="info-row"><span class="info-label">Duration</span><span class="info-value" style="color:#1A7A4A;">47 minutes</span></div>
      <div class="info-row"><span class="info-label">Status</span><span class="info-value" style="color:#1A7A4A;">Awaiting QA</span></div>
    </div>
  </div>

  <div class="critical-card">
    <div style="font-size:12px;font-weight:700;color:#C0392B;margin-bottom:6px;">&#9888; 1 Critical Issue — Requires Immediate Attention</div>
    <div style="font-size:12px;color:#1F2937;">Engine Bay &#8594; Valve Cover Seal: Oil leak from valve cover gasket</div>
  </div>

  <div class="section-title">Vehicle Photos (11)</div>
  <p style="font-size:11px;color:#6B7280;margin-bottom:12px;">Standard vehicle documentation photos captured during inspection</p>
  <div class="photos-grid-3">
    ${VEHICLE_PHOTO_NAMES.map((name, i) => `
      <div class="photo-card">
        <div class="photo-thumb">${['🚗','🚘','🚗','🚗','🚗','🚗','🚗','🪑','🪑','⚙️','🔵'][i]}</div>
        <div class="photo-label">
          <p class="photo-name">${name}</p>
          <p class="photo-status">&#11003; Captured</p>
        </div>
      </div>
    `).join('')}
  </div>

  <div class="section-title">Damage Photos (2)</div>
  <p style="font-size:11px;color:#6B7280;margin-bottom:12px;">Defect photos captured with AI-assisted analysis and classification</p>
  <div class="photos-grid-2">
    <div class="damage-card" style="border:1px solid #FECACA;">
      <div class="damage-thumb" style="background:linear-gradient(135deg,#FEF2F2,#FECACA);">⚠️</div>
      <div class="damage-label" style="background:#FFF5F5;">
        <p style="font-size:10px;font-weight:700;color:#1F2937;margin:0;">Front Bumper Dent</p>
        <span style="display:inline-block;font-size:9px;font-weight:700;background:#FEE2E2;color:#C0392B;padding:1px 6px;border-radius:10px;margin:3px 0;">Major · AI Detected</span>
        <p style="font-size:9px;color:#6B7280;margin:3px 0 0;line-height:1.4;">Minor dent and paint scratch on front bumper, right side approximately 15cm</p>
      </div>
    </div>
    <div class="damage-card" style="border:1px solid #FED7AA;">
      <div class="damage-thumb" style="background:linear-gradient(135deg,#FFF7ED,#FED7AA);">⚠️</div>
      <div class="damage-label" style="background:#FFFBF5;">
        <p style="font-size:10px;font-weight:700;color:#1F2937;margin:0;">Door Sill Rust</p>
        <span style="display:inline-block;font-size:9px;font-weight:700;background:#FEF3C7;color:#D35400;padding:1px 6px;border-radius:10px;margin:3px 0;">Minor · AI Detected</span>
        <p style="font-size:9px;color:#6B7280;margin:3px 0 0;line-height:1.4;">Surface rust on left door sill, minor corrosion</p>
      </div>
    </div>
  </div>

  <div class="footer-card">
    <div>
      <div class="inspector-name">Emeka Okonkwo</div>
      <div class="inspector-sub">Inspector ID: INS-001 · Carschek Certified</div>
      <div style="font-size:10px;color:#9CA3AF;margin-top:4px;">This report is valid for 90 days · Verify at carschek.com/verify/CS-2026-4521</div>
    </div>
    <div class="qr-box">QR CODE Verify</div>
  </div>
</div>
`;
  return renderHTMLtoPDF(html, 'Carschek-Report-CS-2026-4521-Modern.pdf');
}

// ─── Screen 6: Report Preview ─────────────────────────────────────────────────
function ReportPreview({ onBack }: { onBack: () => void }) {
  const [flagModal, setFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const score = 73;
  const scoreColor = '#1A7A4A';

  const handleTemplateSelect = async (template: 'classic' | 'modern') => {
    setShowTemplateSelector(false);
    setPdfLoading(true);
    try {
      if (template === 'classic') await generateClassicPDF();
      else await generateModernPDF();
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="bg-[#F4F6F8] min-h-screen flex flex-col" style={{ maxWidth: 375, margin: '0 auto' }}>
      <div className="bg-[#1E3A5F] px-4 pt-10 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 bg-[#F4F6F8] rounded-xl flex items-center justify-center min-h-[48px] min-w-[48px]">
            <ChevronLeft size={18} className="text-[#1F2937]" />
          </button>
          <p className="text-white font-bold text-base">Report Preview</p>
        </div>
        <button className="flex items-center gap-1.5 bg-white/10 px-3 py-2 rounded-xl text-white text-sm font-medium min-h-[48px]">
          <Share2 size={14} /> Share
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="bg-white mx-4 mt-4 rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          {/* Report header */}
          <div className="bg-[#1E3A5F] p-4">
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
                    <div className="h-full bg-[#2E75B6] rounded-full" style={{ width: `${s.score}%` }} />
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

          {/* Critical */}
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

          {/* Vehicle Photos preview */}
          <div className="p-4 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-[#1F2937] text-sm flex items-center gap-1.5">
                <Camera size={14} className="text-[#2E75B6]" /> Vehicle Photos
              </p>
              <span className="text-xs font-semibold text-[#1A7A4A] bg-green-50 px-2 py-0.5 rounded-full">11 captured</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {VEHICLE_PHOTO_NAMES.slice(0, 8).map((name, i) => (
                <div key={i} className="aspect-square bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB] rounded-lg flex items-center justify-center relative overflow-hidden">
                  <span className="text-lg">{['🚗','🚘','🚗','🚗','🚗','🚗','🚗','🪑'][i]}</span>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-1 py-0.5">
                    <p className="text-white text-[7px] font-medium truncate">{name.replace('Car ', '')}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#6B7280] mt-2 text-center">+3 more photos in full report</p>
          </div>

          {/* Damage Photos preview */}
          <div className="p-4 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-[#1F2937] text-sm flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-[#C0392B]" /> Damage Photos
              </p>
              <span className="text-xs font-semibold text-[#C0392B] bg-red-50 px-2 py-0.5 rounded-full">2 defects</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Front Bumper Dent', severity: 'Major', color: 'from-red-50 to-red-100', badge: 'bg-red-100 text-red-700', emoji: '⚠️' },
                { name: 'Door Sill Rust', severity: 'Minor', color: 'from-orange-50 to-orange-100', badge: 'bg-orange-100 text-orange-700', emoji: '⚠️' },
              ].map((d, i) => (
                <div key={i} className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                  <div className={`h-16 bg-gradient-to-br ${d.color} flex items-center justify-center text-2xl`}>{d.emoji}</div>
                  <div className="p-2">
                    <p className="text-[10px] font-bold text-[#1F2937] leading-tight">{d.name}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${d.badge}`}>{d.severity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#F9FAFB]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-sm font-bold">EO</div>
              <div>
                <p className="text-sm font-bold text-[#1F2937]">Emeka Okonkwo</p>
                <p className="text-xs text-[#6B7280]">Inspector ID: INS-001 · Certified</p>
              </div>
            </div>
            <div className="border border-dashed border-[#E5E7EB] rounded-lg p-3 flex items-center justify-center gap-2">
              <div className="w-12 h-12 bg-[#E5E7EB] rounded-lg flex items-center justify-center">
                <p className="text-[8px] text-[#6B7280] text-center leading-tight">QR&lt;br/&gt;CODE</p>
              </div>
              <p className="text-xs text-[#6B7280]">Scan to verify at carschek.com</p>
            </div>
            <p className="text-[10px] text-[#6B7280] text-center mt-2">This report is valid for 90 days from inspection date</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 bg-white border-t border-[#E5E7EB] p-4 space-y-2" style={{ maxWidth: 375, width: '100%' }}>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              const text = encodeURIComponent('Your Carschek Vehicle Inspection Report is ready. View it here: https://carschek.com/reports/CS-2026-4521');
              window.open(`https://wa.me/?text=${text}`, '_blank');
            }}
            className="py-3 bg-[#25D366] text-white rounded-2xl text-xs font-bold min-h-[48px] flex items-center justify-center gap-1">
            📡 WhatsApp
          </button>
          <button
            onClick={() => {
              window.open('sms:?body=' + encodeURIComponent('Your Carschek report is ready: https://carschek.com/reports/CS-2026-4521'), '_blank');
            }}
            className="py-3 bg-[#2E75B6] text-white rounded-2xl text-xs font-bold min-h-[48px] flex items-center justify-center gap-1">
            📱 SMS
          </button>
          <button
            onClick={() => setShowTemplateSelector(true)}
            disabled={pdfLoading}
            className={`py-3 rounded-2xl text-xs font-bold min-h-[48px] flex items-center justify-center gap-1 transition-all ${pdfLoading ? 'bg-[#1E3A5F]/60 text-white cursor-not-allowed' : 'bg-[#1E3A5F] text-white'}`}>
            {pdfLoading ? (
              <>
                <div className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Generating…
              </>
            ) : (
              <><Download size={13} /> PDF</>
            )}
          </button>
        </div>
        <button onClick={() => setFlagModal(true)}
          className="w-full py-3 border border-[#C0392B] text-[#C0392B] rounded-2xl text-xs font-bold min-h-[48px] flex items-center justify-center gap-1.5">
          <Flag size={14} /> Flag for QA Review
        </button>
      </div>

      {showTemplateSelector && (
        <TemplateSelector onSelect={handleTemplateSelect} onClose={() => setShowTemplateSelector(false)} />
      )}

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
        className="w-full py-4 bg-[#1E3A5F] text-white rounded-2xl text-base font-bold min-h-[56px]">
        View Report Preview
      </button>
    </div>
  );
}

// ─── Logout Screen ────────────────────────────────────────────────────────────
function LogoutScreen({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="bg-[#F4F6F8] min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ maxWidth: 375, margin: '0 auto' }}>
      <div className="w-20 h-20 bg-[#1E3A5F] rounded-full flex items-center justify-center mb-6">
        <LogOut size={36} className="text-white" />
      </div>
      <h2 className="text-2xl font-black text-[#1F2937] mb-2">Signed Out</h2>
      <p className="text-[#6B7280] text-sm mb-8">You have been successfully signed out of Carschek Inspector.</p>
      <a href="/authentication-screen"
        className="block w-full py-4 bg-[#1E3A5F] text-white rounded-2xl text-base font-bold min-h-[56px] text-center">
        Sign In Again
      </a>
      <button onClick={onCancel} className="mt-3 w-full py-3 border border-[#E5E7EB] text-[#6B7280] rounded-2xl text-sm font-medium min-h-[48px]">
        Cancel
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type Screen = 'home' | 'job-detail' | 'section-overview' | 'section-checklist' | 'vehicle-photos' | 'damage-photos' | 'review-submit' | 'success' | 'report-preview' | 'logged-out';

export default function InspectorPWAPage() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('Home');

  const handleTabChange = (tab: TabName) => {
    setActiveTab(tab);
    setScreen('home');
  };

  const handleLogout = () => {
    setScreen('logged-out');
  };

  const handleSectionSelect = (s: Section) => {
    if (s.id === 's13') {
      setScreen('vehicle-photos');
    } else if (s.id === 's14') {
      setScreen('damage-photos');
    } else {
      setSelectedSection(s);
      setScreen('section-checklist');
    }
  };

  return (
    <AppLayout currentPath="/inspector-pwa">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Inspector PWA — Mobile Screens</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">Mobile-first inspector app (375px viewport simulation)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              ['home', 'Home'], ['job-detail', 'Job Detail'], ['section-overview', 'Sections'],
              ['section-checklist', 'Checklist'], ['vehicle-photos', '📷 Photos'], ['damage-photos', '⚠️ Damage'],
              ['review-submit', 'Review'], ['report-preview', 'Report']
            ] as [Screen, string][]).map(([s, label]) => (
              <button key={s} onClick={() => {
                if (s === 'job-detail' && !selectedJob) setSelectedJob(jobs[0]);
                if (s === 'section-checklist' && !selectedSection) setSelectedSection(sections[0]);
                setScreen(s);
              }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${screen === s ? 'bg-[#1E3A5F] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#2E75B6]'}`}>
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
                <InspectorHome
                  onJobSelect={job => { setSelectedJob(job); setScreen('job-detail'); }}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  onLogout={handleLogout}
                />
              )}
              {screen === 'job-detail' && selectedJob && (
                <JobDetail job={selectedJob} onBack={() => setScreen('home')} onStart={() => setScreen('section-overview')} />
              )}
              {screen === 'section-overview' && (
                <SectionOverview
                  onSectionSelect={handleSectionSelect}
                  onFinish={() => setScreen('review-submit')}
                />
              )}
              {screen === 'section-checklist' && selectedSection && (
                <SectionChecklist section={selectedSection} onBack={() => setScreen('section-overview')} onNext={() => setScreen('section-overview')} />
              )}
              {screen === 'vehicle-photos' && (
                <VehiclePhotosSection onBack={() => setScreen('section-overview')} onComplete={() => setScreen('section-overview')} />
              )}
              {screen === 'damage-photos' && (
                <DamagePhotosSection onBack={() => setScreen('section-overview')} onComplete={() => setScreen('section-overview')} />
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
              {screen === 'logged-out' && (
                <LogoutScreen onCancel={() => setScreen('home')} />
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
