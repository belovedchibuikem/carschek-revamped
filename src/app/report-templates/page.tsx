'use client';
import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { CheckCircle, XCircle, AlertTriangle, Download, Share2, Link, Printer, Mail, MessageSquare, Camera } from 'lucide-react';

// ─── Types & Data ─────────────────────────────────────────────────────────────
interface DefectItem {
  section: string;
  item: string;
  severity: 'Critical' | 'Major' | 'Minor';
  desc: string;
}

interface SectionResult {
  name: string;
  pass: number;
  fail: number;
  total: number;
}

const defects: DefectItem[] = [
  { section: 'Body Frame', item: 'Front Rail (Right)', severity: 'Major', desc: 'Visible dent on right front rail, approximately 15cm' },
  { section: 'Engine Bay', item: 'Valve Cover Seal', severity: 'Critical', desc: 'Oil leak from valve cover gasket — requires immediate attention' },
  { section: 'Transmission', item: 'Fluid Level', severity: 'Major', desc: 'Transmission fluid below minimum level' },
  { section: 'Body Frame', item: 'Door Sill (Left)', severity: 'Minor', desc: 'Surface rust on left door sill' },
];

const sectionResults: SectionResult[] = [
  { name: 'Body Frame', pass: 10, fail: 2, total: 12 },
  { name: 'Engine Bay', pass: 14, fail: 1, total: 15 },
  { name: 'Transmission', pass: 7, fail: 1, total: 8 },
  { name: 'Suspension', pass: 10, fail: 0, total: 10 },
  { name: 'Brakes', pass: 8, fail: 0, total: 8 },
  { name: 'Tyres', pass: 6, fail: 0, total: 6 },
  { name: 'Lights', pass: 10, fail: 0, total: 10 },
  { name: 'Interior', pass: 14, fail: 0, total: 14 },
  { name: 'Electrical', pass: 12, fail: 0, total: 12 },
  { name: 'AC System', pass: 6, fail: 0, total: 6 },
  { name: 'Underbody', pass: 10, fail: 0, total: 10 },
  { name: 'Documents', pass: 5, fail: 0, total: 5 },
];

interface InspectionItem {
  item: string;
  result: 'Pass' | 'Fail' | 'N/A';
  note?: string;
}

const SECTION_ITEMS: Record<string, InspectionItem[]> = {
  'Body Frame': [
    { item: 'Front Rail (Left)', result: 'Pass' },
    { item: 'Front Rail (Right)', result: 'Fail', note: 'Visible dent ~15cm' },
    { item: 'Rear Rail (Left)', result: 'Pass' },
    { item: 'Rear Rail (Right)', result: 'Pass' },
    { item: 'Roof Panel', result: 'Pass' },
    { item: 'Hood / Bonnet', result: 'Pass' },
    { item: 'Front Bumper', result: 'Pass' },
    { item: 'Rear Bumper', result: 'Pass' },
    { item: 'Door Sill (Left)', result: 'Fail', note: 'Surface rust detected' },
    { item: 'Door Sill (Right)', result: 'Pass' },
    { item: 'Boot / Trunk Lid', result: 'Pass' },
    { item: 'Windscreen', result: 'Pass' },
  ],
  'Engine Bay': [
    { item: 'Engine Oil Level', result: 'Pass' },
    { item: 'Coolant Level', result: 'Pass' },
    { item: 'Brake Fluid Level', result: 'Pass' },
    { item: 'Power Steering Fluid', result: 'Pass' },
    { item: 'Battery Condition', result: 'Pass' },
    { item: 'Alternator Belt', result: 'Pass' },
    { item: 'Air Filter', result: 'Pass' },
    { item: 'Radiator Condition', result: 'Pass' },
    { item: 'Valve Cover Seal', result: 'Fail', note: 'Oil leak — immediate attention required' },
    { item: 'Engine Mounts', result: 'Pass' },
    { item: 'Fuel Lines', result: 'Pass' },
    { item: 'Exhaust Manifold', result: 'Pass' },
    { item: 'Timing Belt / Chain', result: 'Pass' },
    { item: 'Spark Plugs', result: 'Pass' },
    { item: 'Throttle Body', result: 'Pass' },
  ],
  'Transmission': [
    { item: 'Transmission Fluid Level', result: 'Fail', note: 'Below minimum level' },
    { item: 'Gear Shifting (Drive)', result: 'Pass' },
    { item: 'Gear Shifting (Reverse)', result: 'Pass' },
    { item: 'Clutch Operation', result: 'N/A', note: 'Automatic transmission' },
    { item: 'Transmission Mounts', result: 'Pass' },
    { item: 'CV Joints', result: 'Pass' },
    { item: 'Drive Shaft', result: 'Pass' },
    { item: 'Differential', result: 'Pass' },
  ],
  'Suspension': [
    { item: 'Front Shock Absorbers', result: 'Pass' },
    { item: 'Rear Shock Absorbers', result: 'Pass' },
    { item: 'Front Springs', result: 'Pass' },
    { item: 'Rear Springs', result: 'Pass' },
    { item: 'Control Arms', result: 'Pass' },
    { item: 'Ball Joints', result: 'Pass' },
    { item: 'Tie Rods', result: 'Pass' },
    { item: 'Sway Bar Links', result: 'Pass' },
    { item: 'Wheel Bearings', result: 'Pass' },
    { item: 'Steering Rack', result: 'Pass' },
  ],
  'Brakes': [
    { item: 'Front Brake Pads', result: 'Pass' },
    { item: 'Rear Brake Pads', result: 'Pass' },
    { item: 'Front Rotors', result: 'Pass' },
    { item: 'Rear Rotors', result: 'Pass' },
    { item: 'Brake Lines', result: 'Pass' },
    { item: 'Handbrake / Parking Brake', result: 'Pass' },
    { item: 'ABS System', result: 'Pass' },
    { item: 'Brake Callipers', result: 'Pass' },
  ],
  'Tyres': [
    { item: 'Front Left Tyre', result: 'Pass' },
    { item: 'Front Right Tyre', result: 'Pass' },
    { item: 'Rear Left Tyre', result: 'Pass' },
    { item: 'Rear Right Tyre', result: 'Pass' },
    { item: 'Spare Tyre', result: 'Pass' },
    { item: 'Tyre Pressure (All)', result: 'Pass' },
  ],
  'Lights': [
    { item: 'Headlights (Low Beam)', result: 'Pass' },
    { item: 'Headlights (High Beam)', result: 'Pass' },
    { item: 'Fog Lights (Front)', result: 'Pass' },
    { item: 'Tail Lights', result: 'Pass' },
    { item: 'Brake Lights', result: 'Pass' },
    { item: 'Reverse Lights', result: 'Pass' },
    { item: 'Indicator Lights (Front)', result: 'Pass' },
    { item: 'Indicator Lights (Rear)', result: 'Pass' },
    { item: 'Interior Cabin Lights', result: 'Pass' },
    { item: 'Dashboard Warning Lights', result: 'Pass' },
  ],
  'Interior': [
    { item: 'Driver Seat Condition', result: 'Pass' },
    { item: 'Passenger Seat Condition', result: 'Pass' },
    { item: 'Rear Seat Condition', result: 'Pass' },
    { item: 'Seatbelts (All)', result: 'Pass' },
    { item: 'Dashboard Condition', result: 'Pass' },
    { item: 'Steering Wheel', result: 'Pass' },
    { item: 'Gear Lever / Shifter', result: 'Pass' },
    { item: 'Door Panels', result: 'Pass' },
    { item: 'Carpets / Floor Mats', result: 'Pass' },
    { item: 'Headliner', result: 'Pass' },
    { item: 'Sun Visor', result: 'Pass' },
    { item: 'Glove Box', result: 'Pass' },
    { item: 'Centre Console', result: 'Pass' },
    { item: 'Boot / Trunk Interior', result: 'Pass' },
  ],
  'Electrical': [
    { item: 'Power Windows', result: 'Pass' },
    { item: 'Central Locking', result: 'Pass' },
    { item: 'Horn', result: 'Pass' },
    { item: 'Wipers (Front)', result: 'Pass' },
    { item: 'Wipers (Rear)', result: 'Pass' },
    { item: 'Radio / Infotainment', result: 'Pass' },
    { item: 'Reverse Camera', result: 'Pass' },
    { item: 'OBD Diagnostic Scan', result: 'Pass' },
    { item: 'Airbag System', result: 'Pass' },
    { item: 'Immobiliser', result: 'Pass' },
    { item: 'USB / Charging Ports', result: 'Pass' },
    { item: 'Instrument Cluster', result: 'Pass' },
  ],
  'AC System': [
    { item: 'AC Cooling Performance', result: 'Pass' },
    { item: 'Blower Fan (All Speeds)', result: 'Pass' },
    { item: 'AC Compressor', result: 'Pass' },
    { item: 'Refrigerant Level', result: 'Pass' },
    { item: 'Cabin Air Filter', result: 'Pass' },
    { item: 'Heater Function', result: 'Pass' },
  ],
  'Underbody': [
    { item: 'Chassis Integrity', result: 'Pass' },
    { item: 'Exhaust System', result: 'Pass' },
    { item: 'Catalytic Converter', result: 'Pass' },
    { item: 'Fuel Tank', result: 'Pass' },
    { item: 'Underbody Rust / Corrosion', result: 'Pass' },
    { item: 'Subframe Condition', result: 'Pass' },
    { item: 'Brake Lines (Underbody)', result: 'Pass' },
    { item: 'Fuel Lines (Underbody)', result: 'Pass' },
    { item: 'Heat Shields', result: 'Pass' },
    { item: 'Undercoating Condition', result: 'Pass' },
  ],
  'Documents': [
    { item: 'Vehicle Registration', result: 'Pass' },
    { item: 'Insurance Certificate', result: 'Pass' },
    { item: 'Road Worthiness', result: 'Pass' },
    { item: 'Proof of Ownership', result: 'Pass' },
    { item: 'Customs Clearance', result: 'Pass' },
  ],
};

const VEHICLE_PHOTO_NAMES = [
  'Car Overview', 'Car Front', 'Car Front Left', 'Car Front Right',
  'Car Back', 'Car Back Left', 'Car Back Right',
  'Car Inside Front', 'Car Inside Back', 'Car Motor', 'Car Tire',
];

const VEHICLE_PHOTO_EMOJIS = ['🚗','🚘','🚗','🚗','🚗','🚗','🚗','🪑','🪑','⚙️','🔵'];

const damagePhotos = [
  { name: 'Front Bumper Dent', severity: 'Major' as const, desc: 'Minor dent and paint scratch on front bumper, right side approximately 15cm', aiDetected: true },
  { name: 'Door Sill Rust', severity: 'Minor' as const, desc: 'Surface rust on left door sill, minor corrosion detected', aiDetected: true },
];

// ─── Score Gauge ──────────────────────────────────────────────────────────────
function ScoreGauge({ score, size = 120 }: { score: number; size?: number }) {
  const r = size * 0.42;
  const color = score >= 71 ? '#1A7A4A' : score >= 41 ? '#D35400' : '#C0392B';
  const label = score >= 71 ? 'GOOD CONDITION' : score >= 41 ? 'FAIR CONDITION' : 'POOR CONDITION';
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={size * 0.1} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={size * 0.1}
            strokeDasharray={`${2 * Math.PI * r}`}
            strokeDashoffset={`${2 * Math.PI * r * (1 - score / 100)}`}
            strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-black leading-none" style={{ fontSize: size * 0.25, color: '#1F2937' }}>{score}</span>
          <span className="text-[#6B7280]" style={{ fontSize: size * 0.1 }}>/100</span>
        </div>
      </div>
      <p className="font-bold mt-2 text-sm" style={{ color }}>{label}</p>
    </div>
  );
}

// ─── Vehicle Photos Grid (shared) ─────────────────────────────────────────────
function VehiclePhotosGrid({ style }: { style: 'modern' | 'classic' }) {
  if (style === 'modern') {
    return (
      <div className="px-8 py-5 border-t border-[#E5E7EB]" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-[#EFF6FF] rounded-lg flex items-center justify-center">
            <Camera size={14} className="text-[#2E75B6]" />
          </div>
          <h3 className="font-bold text-[#1F2937]">Vehicle Photos</h3>
          <span className="ml-auto text-xs font-semibold text-[#1A7A4A] bg-green-50 px-2.5 py-1 rounded-full">11 captured</span>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {VEHICLE_PHOTO_NAMES.slice(0, 8).map((name, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-[#E5E7EB]" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div className="h-16 bg-gradient-to-br from-[#F4F6F8] to-[#E5E7EB] flex items-center justify-center text-2xl">
                {VEHICLE_PHOTO_EMOJIS[i]}
              </div>
              <div className="px-1.5 py-1 bg-white">
                <p className="text-[9px] font-semibold text-[#1F2937] truncate">{name.replace('Car ', '')}</p>
                <p className="text-[8px] text-[#1A7A4A]">✓ Captured</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {VEHICLE_PHOTO_NAMES.slice(8).map((name, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-[#E5E7EB]" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div className="h-16 bg-gradient-to-br from-[#F4F6F8] to-[#E5E7EB] flex items-center justify-center text-2xl">
                {VEHICLE_PHOTO_EMOJIS[i + 8]}
              </div>
              <div className="px-1.5 py-1 bg-white">
                <p className="text-[9px] font-semibold text-[#1F2937] truncate">{name.replace('Car ', '')}</p>
                <p className="text-[8px] text-[#1A7A4A]">✓ Captured</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Classic style
  return (
    <div className="px-6 pb-5" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
      <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-widest mb-3 border-b border-[#E5E7EB] pb-2 flex items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
        <span>📷</span> Vehicle Photos
        <span className="ml-auto text-xs font-semibold text-[#1A7A4A] bg-green-50 px-2 py-0.5 rounded-full normal-case tracking-normal">11 captured</span>
      </h3>
      <div className="grid grid-cols-4 gap-2 mb-2">
        {VEHICLE_PHOTO_NAMES.slice(0, 8).map((name, i) => (
          <div key={i} className="border border-[#E5E7EB] rounded-lg overflow-hidden" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <div className="h-14 bg-gradient-to-br from-[#F4F6F8] to-[#E5E7EB] flex items-center justify-center text-xl">
              {VEHICLE_PHOTO_EMOJIS[i]}
            </div>
            <div className="px-1.5 py-1 bg-[#F9FAFB]">
              <p className="text-[8px] font-semibold text-[#1F2937] truncate">{name.replace('Car ', '')}</p>
              <p className="text-[7px] text-[#1A7A4A]">✓ Captured</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {VEHICLE_PHOTO_NAMES.slice(8).map((name, i) => (
          <div key={i} className="border border-[#E5E7EB] rounded-lg overflow-hidden" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <div className="h-14 bg-gradient-to-br from-[#F4F6F8] to-[#E5E7EB] flex items-center justify-center text-xl">
              {VEHICLE_PHOTO_EMOJIS[i + 8]}
            </div>
            <div className="px-1.5 py-1 bg-[#F9FAFB]">
              <p className="text-[8px] font-semibold text-[#1F2937] truncate">{name.replace('Car ', '')}</p>
              <p className="text-[7px] text-[#1A7A4A]">✓ Captured</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Damage Photos Grid (shared) ──────────────────────────────────────────────
function DamagePhotosGrid({ style }: { style: 'modern' | 'classic' }) {
  const severityConfig = {
    Critical: { bg: 'from-red-50 to-red-100', border: 'border-red-200', badge: 'bg-red-100 text-red-700', cardBg: 'bg-red-50/30' },
    Major: { bg: 'from-orange-50 to-orange-100', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', cardBg: 'bg-orange-50/30' },
    Minor: { bg: 'from-yellow-50 to-yellow-100', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', cardBg: 'bg-yellow-50/20' },
  };

  if (style === 'modern') {
    return (
      <div className="px-8 py-5 border-t border-[#E5E7EB]" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
            <AlertTriangle size={14} className="text-[#C0392B]" />
          </div>
          <h3 className="font-bold text-[#1F2937]">Damage Photos</h3>
          <span className="ml-auto text-xs font-semibold text-[#C0392B] bg-red-50 px-2.5 py-1 rounded-full">{damagePhotos.length} defects</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {damagePhotos.map((photo, i) => {
            const cfg = severityConfig[photo.severity];
            return (
              <div key={i} className={`rounded-2xl border ${cfg.border} overflow-hidden`} style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div className={`h-28 bg-gradient-to-br ${cfg.bg} flex items-center justify-center relative`}>
                  <span className="text-4xl">⚠️</span>
                  {photo.aiDetected && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/80 px-1.5 py-0.5 rounded-full">
                      <span className="text-[8px] font-bold text-[#2E75B6]">⚡ AI</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-3 py-2">
                    <p className="text-white text-[10px] font-bold">{photo.name}</p>
                  </div>
                </div>
                <div className={`p-3 ${cfg.cardBg}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{photo.severity}</span>
                    {photo.aiDetected && <span className="text-[9px] text-[#6B7280]">AI Detected</span>}
                  </div>
                  <p className="text-[10px] text-[#6B7280] leading-relaxed">{photo.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        {damagePhotos.length === 0 && (
          <div className="text-center py-6 text-[#6B7280] text-sm">No damage photos recorded</div>
        )}
      </div>
    );
  }

  // Classic style
  return (
    <div className="px-6 pb-6" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
      <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-widest mb-3 border-b border-[#E5E7EB] pb-2 flex items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
        <span>⚠️</span> Damage Photos
        <span className="ml-auto text-xs font-semibold text-[#C0392B] bg-red-50 px-2 py-0.5 rounded-full normal-case tracking-normal">{damagePhotos.length} defects</span>
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {damagePhotos.map((photo, i) => {
          const cfg = severityConfig[photo.severity];
          return (
            <div key={i} className={`border ${cfg.border} rounded-lg overflow-hidden`} style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div className={`h-24 bg-gradient-to-br ${cfg.bg} flex items-center justify-center relative`}>
                <span className="text-3xl">⚠️</span>
                {photo.aiDetected && (
                  <div className="absolute top-1.5 right-1.5 bg-white/80 px-1.5 py-0.5 rounded-full">
                    <span className="text-[8px] font-bold text-[#2E75B6]">⚡ AI</span>
                  </div>
                )}
              </div>
              <div className={`p-2.5 ${cfg.cardBg}`} style={{ fontFamily: 'Arial, sans-serif' }}>
                <p className="text-xs font-bold text-[#1F2937] mb-1">{photo.name}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>{photo.severity}</span>
                <p className="text-[9px] text-[#6B7280] mt-1.5 leading-relaxed">{photo.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Modern Report Template ───────────────────────────────────────────────────
function ModernReport() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const score = 73;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden" id="modern-report-content">
      {/* Navy top border */}
      <div className="h-2 bg-[#1E3A5F]" />

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#E5E7EB]" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <div>
          <span className="font-black text-xl text-[#1E3A5F] tracking-tight">CARSCHEK</span>
          <p className="text-xs text-[#6B7280] mt-0.5">Vehicle Inspection Report</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-[#1F2937]">Report #CS-2026-4521</p>
          <p className="text-xs text-[#6B7280]">15 April 2026</p>
        </div>
      </div>

      {/* Vehicle hero */}
      <div className="relative" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <div className="h-48 bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-2">🚗</div>
            <p className="text-[#6B7280] text-sm">Vehicle Photo</p>
          </div>
        </div>
        <div className="px-8 py-5">
          <h2 className="text-2xl font-black text-[#1F2937]">2019 Toyota Camry LE</h2>
          <div className="flex flex-wrap gap-4 mt-2">
            {[['Plate', 'KJA 234 AA'], ['Mileage', '87,450 km'], ['Colour', 'Beige'], ['VIN', 'JTMBF3EH4...']].map(([k, v]) => (
              <div key={k}>
                <span className="text-xs text-[#6B7280]">{k}: </span>
                <span className="text-sm font-semibold text-[#1F2937]">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Score card */}
      <div className="px-8 py-6 bg-[#F9FAFB] border-y border-[#E5E7EB]" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <div className="flex flex-col items-center">
          <ScoreGauge score={score} size={140} />
          <div className="grid grid-cols-4 gap-4 mt-5 w-full max-w-sm">
            {[{ label: 'Body', score: 68 }, { label: 'Engine', score: 72 }, { label: 'Interior', score: 85 }, { label: 'Electrical', score: 79 }].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-sm font-bold text-[#1F2937]">{s.score}</p>
                <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden my-1">
                  <div className="h-full bg-[#2E75B6] rounded-full" style={{ width: `${s.score}%` }} />
                </div>
                <p className="text-xs text-[#6B7280]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inspection summary strip */}
      <div className="px-8 py-4 bg-[#1E3A5F] flex flex-wrap gap-4" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        {[['Inspector', 'Emeka Okonkwo'], ['Zone', 'Lekki'], ['Date', '15 Apr 2026'], ['Duration', '8min 42sec'], ['Report #', 'CS-2026-4521']].map(([k, v]) => (
          <div key={k}>
            <span className="text-white/50 text-xs">{k}: </span>
            <span className="text-white text-xs font-semibold">{v}</span>
          </div>
        ))}
      </div>

      {/* Critical findings */}
      <div className="px-8 py-5" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <div className="border border-[#C0392B] rounded-xl p-4 bg-red-50">
          <p className="font-bold text-[#C0392B] flex items-center gap-2 mb-2">
            <AlertTriangle size={16} /> 1 Critical Issue Found
          </p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#1F2937]">Engine Bay → Valve Cover Seal</p>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">Critical</span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">Oil leak from valve cover gasket — requires immediate attention</p>
        </div>
      </div>

      {/* Section cards */}
      <div className="px-8 py-4">
        <h3 className="font-bold text-[#1F2937] mb-4">Inspection Sections</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sectionResults.map(s => (
            <div key={s.name} className="border border-[#E5E7EB] rounded-xl overflow-hidden" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div className={`h-1.5 ${s.fail > 0 ? 'bg-[#C0392B]' : 'bg-[#1A7A4A]'}`} />
              <button className="w-full p-3 text-left hover:bg-[#F9FAFB] transition-colors"
                onClick={() => setExpandedSection(expandedSection === s.name ? null : s.name)}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#1F2937]">{s.name}</p>
                  {s.fail > 0 ? <XCircle size={14} className="text-[#C0392B]" /> : <CheckCircle size={14} className="text-[#1A7A4A]" />}
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">{s.pass} pass · {s.fail} fail · {s.total} total</p>
              </button>
              {expandedSection === s.name && (
                <div className="px-3 pb-3 border-t border-[#E5E7EB] max-h-64 overflow-y-auto">
                  {(SECTION_ITEMS[s.name] || []).map((item, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 py-1.5 border-b border-[#F3F4F6] last:border-0">
                      <span className="text-xs text-[#374151] flex-1">{item.item}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {item.result === 'Pass' && <span className="text-[10px] font-bold text-[#1A7A4A] bg-green-50 px-1.5 py-0.5 rounded-full">✓ Pass</span>}
                        {item.result === 'Fail' && <span className="text-[10px] font-bold text-[#C0392B] bg-red-50 px-1.5 py-0.5 rounded-full">✗ Fail</span>}
                        {item.result === 'N/A' && <span className="text-[10px] font-bold text-[#6B7280] bg-gray-100 px-1.5 py-0.5 rounded-full">N/A</span>}
                      </div>
                    </div>
                  ))}
                  {(SECTION_ITEMS[s.name] || []).filter(i => i.note).map((item, i) => (
                    <div key={`note-${i}`} className="mt-1.5 text-[10px] text-[#D35400] bg-orange-50 rounded px-2 py-1">
                      ⚠ {item.item}: {item.note}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Photos Section */}
      <VehiclePhotosGrid style="modern" />

      {/* Damage Photos Section */}
      <DamagePhotosGrid style="modern" />

      {/* Footer */}
      <div className="px-8 py-6 bg-[#F9FAFB] border-t border-[#E5E7EB]" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white font-bold">EO</div>
            <div>
              <p className="font-bold text-[#1F2937]">Emeka Okonkwo</p>
              <p className="text-xs text-[#6B7280]">Cert #INS-001 · Apr 15, 2026 10:38 AM</p>
              <div className="mt-1">
                <svg viewBox="0 0 120 30" className="w-24 h-6">
                  <path d="M5,20 Q15,5 25,18 Q35,30 45,15 Q55,5 65,18 Q75,28 85,12 Q95,2 115,15" fill="none" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#1E3A5F] rounded-xl flex items-center justify-center mb-1 p-1">
              <div className="grid grid-cols-5 gap-0.5 w-full h-full">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`rounded-[1px] ${[0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24].includes(i) ? 'bg-white' : 'bg-[#1E3A5F]'}`} />
                ))}
              </div>
            </div>
            <p className="text-[9px] text-[#6B7280]">Scan to verify</p>
          </div>
        </div>
        <p className="text-xs text-[#6B7280] mt-4 text-center">This report is valid for 90 days · info@carschek.com · +234 817 362 4953</p>
      </div>
    </div>
  );
}

// ─── Classic Report Template ──────────────────────────────────────────────────
function ClassicReport() {
  const score = 73;
  return (
    <div className="max-w-2xl mx-auto bg-white shadow-xl border border-[#E5E7EB] relative overflow-hidden" style={{ fontFamily: 'Georgia, serif' }} id="classic-report-content">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
        <p className="text-[#E5E7EB] font-black text-5xl tracking-widest" style={{ transform: 'rotate(-35deg)', opacity: 0.15 }}>CARSCHEK VERIFIED</p>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b-4 border-[#1E3A5F] px-8 py-5" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black text-2xl text-[#1E3A5F] tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>CARSCHEK</p>
              <p className="text-xs text-[#6B7280] mt-0.5" style={{ fontFamily: 'Arial, sans-serif' }}>VEHICLE INSPECTION REPORT</p>
            </div>
            <div className="text-right" style={{ fontFamily: 'Arial, sans-serif' }}>
              <p className="text-sm font-bold text-[#1F2937]">Report #CS-2026-4521</p>
              <p className="text-xs text-[#6B7280]">Date: 15 April 2026</p>
              <p className="text-xs text-[#6B7280]">Page 1 of 3</p>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-2 gap-0 border-b border-[#E5E7EB]" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          {/* Left column */}
          <div className="border-r border-[#E5E7EB] p-6">
            <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-widest mb-3 border-b border-[#E5E7EB] pb-2" style={{ fontFamily: 'Georgia, serif' }}>Vehicle Information</h3>
            <table className="w-full text-xs" style={{ fontFamily: 'Arial, sans-serif' }}>
              <tbody>
                {[['Make/Model', '2019 Toyota Camry LE'], ['Plate Number', 'KJA 234 AA'], ['VIN', 'JTMBF3EH4...'], ['Mileage', '87,450 km'], ['Colour', 'Beige'], ['Fuel Type', 'Petrol'], ['Transmission', 'Automatic']].map(([k, v]) => (
                  <tr key={k} className="border-b border-[#F3F4F6]">
                    <td className="py-1.5 text-[#6B7280] font-semibold w-1/2">{k}</td>
                    <td className="py-1.5 text-[#1F2937]">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right column */}
          <div className="p-6">
            <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-widest mb-3 border-b border-[#E5E7EB] pb-2" style={{ fontFamily: 'Georgia, serif' }}>Inspection Summary</h3>
            <div className="flex justify-center mb-3">
              <ScoreGauge score={score} size={100} />
            </div>
            <table className="w-full text-xs" style={{ fontFamily: 'Arial, sans-serif' }}>
              <tbody>
                {[['Inspector', 'Emeka Okonkwo'], ['Date', '15 Apr 2026'], ['Duration', '8min 42sec'], ['Zone', 'Lekki, Lagos'], ['Total Items', '210'], ['Pass', '198'], ['Fail', '8'], ['N/A', '4']].map(([k, v]) => (
                  <tr key={k} className="border-b border-[#F3F4F6]">
                    <td className="py-1.5 text-[#6B7280] font-semibold w-1/2">{k}</td>
                    <td className="py-1.5 text-[#1F2937] font-medium">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Full inspection table */}
        <div className="p-6" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-widest mb-3 border-b border-[#E5E7EB] pb-2" style={{ fontFamily: 'Georgia, serif' }}>Detailed Inspection Results</h3>
          <table className="w-full text-xs border border-[#E5E7EB]" style={{ fontFamily: 'Arial, sans-serif', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-[#1E3A5F] text-white">
                <th className="text-left py-2 px-3 font-semibold">Section</th>
                <th className="text-center py-2 px-3 font-semibold">Pass</th>
                <th className="text-center py-2 px-3 font-semibold">Fail</th>
                <th className="text-center py-2 px-3 font-semibold">Total</th>
                <th className="text-left py-2 px-3 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody>
              {sectionResults.map((s, i) => (
                <tr key={s.name} className={`border-b border-[#E5E7EB] ${i % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}`} style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                  <td className="py-2 px-3 font-medium text-[#1F2937]">{s.name}</td>
                  <td className="py-2 px-3 text-center text-[#1A7A4A] font-bold">{s.pass}</td>
                  <td className="py-2 px-3 text-center text-[#C0392B] font-bold">{s.fail}</td>
                  <td className="py-2 px-3 text-center text-[#6B7280]">{s.total}</td>
                  <td className="py-2 px-3">
                    {s.fail > 0 ? <span className="text-[#C0392B] font-bold">FAIL</span> : <span className="text-[#1A7A4A] font-bold">PASS</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Per-section item breakdown */}
        <div className="px-6 pb-4">
          <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-widest mb-3 border-b border-[#E5E7EB] pb-2" style={{ fontFamily: 'Georgia, serif' }}>Inspection Item Breakdown</h3>
          {sectionResults.map(s => (
            <div key={s.name} className="mb-4" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${s.fail > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <span className="text-xs font-bold text-[#1F2937]" style={{ fontFamily: 'Georgia, serif' }}>{s.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.fail > 0 ? 'bg-red-100 text-[#C0392B]' : 'bg-green-100 text-[#1A7A4A]'}`}>
                  {s.pass}/{s.total} passed
                </span>
              </div>
              <table className="w-full text-xs border border-t-0 border-[#E5E7EB] rounded-b-lg overflow-hidden" style={{ fontFamily: 'Arial, sans-serif', borderCollapse: 'collapse' }}>
                <tbody>
                  {(SECTION_ITEMS[s.name] || []).map((item, i) => (
                    <tr key={i} className={`border-b border-[#F3F4F6] last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}`}>
                      <td className="py-1.5 px-3 text-[#374151]">{item.item}</td>
                      <td className="py-1.5 px-3 text-right w-20">
                        {item.result === 'Pass' && <span className="text-[#1A7A4A] font-bold">✓ Pass</span>}
                        {item.result === 'Fail' && <span className="text-[#C0392B] font-bold">✗ Fail</span>}
                        {item.result === 'N/A' && <span className="text-[#6B7280]">N/A</span>}
                      </td>
                      <td className="py-1.5 px-3 text-[#6B7280] italic">{item.note || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Defects table */}
        <div className="px-6 pb-4" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <h3 className="text-sm font-bold text-[#1E3A5F] uppercase tracking-widest mb-3 border-b border-[#E5E7EB] pb-2" style={{ fontFamily: 'Georgia, serif' }}>Defects Found</h3>
          <table className="w-full text-xs border border-[#E5E7EB]" style={{ fontFamily: 'Arial, sans-serif', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-[#F4F6F8]">
                <th className="text-left py-2 px-3 font-semibold text-[#6B7280]">Section</th>
                <th className="text-left py-2 px-3 font-semibold text-[#6B7280]">Item</th>
                <th className="text-left py-2 px-3 font-semibold text-[#6B7280]">Severity</th>
                <th className="text-left py-2 px-3 font-semibold text-[#6B7280]">Description</th>
              </tr>
            </thead>
            <tbody>
              {defects.map((d, i) => (
                <tr key={i} className="border-t border-[#E5E7EB]" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                  <td className="py-2 px-3 text-[#1F2937]">{d.section}</td>
                  <td className="py-2 px-3 text-[#1F2937]">{d.item}</td>
                  <td className="py-2 px-3">
                    <span className={`font-bold ${d.severity === 'Critical' ? 'text-[#C0392B]' : d.severity === 'Major' ? 'text-[#D35400]' : 'text-yellow-600'}`}>{d.severity}</span>
                  </td>
                  <td className="py-2 px-3 text-[#6B7280]">{d.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vehicle Photos Section */}
        <VehiclePhotosGrid style="classic" />

        {/* Damage Photos Section */}
        <DamagePhotosGrid style="classic" />

        {/* Footer */}
        <div className="border-t-2 border-[#1E3A5F] px-6 py-4 bg-[#F9FAFB]" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <div className="flex items-center justify-between" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div>
              <p className="text-xs font-bold text-[#1F2937]">Emeka Okonkwo · Cert #INS-001</p>
              <svg viewBox="0 0 120 25" className="w-24 h-5 mt-1">
                <path d="M5,18 Q15,4 25,15 Q35,26 45,12 Q55,3 65,15 Q75,25 85,10 Q95,1 115,12" fill="none" stroke="#1E3A5F" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-[10px] text-[#6B7280] mt-0.5">Digital Signature · 15 Apr 2026 10:38 AM</p>
            </div>
            <div className="text-right text-[10px] text-[#6B7280]">
              <p>info@carschek.com · +234 817 362 4953</p>
              <p className="mt-0.5">Valid for 90 days from inspection date</p>
              <p className="mt-2 font-semibold text-[#1F2937]">Version History</p>
              <p>v1.0 — Original · v1.1 — QA Approved</p>
            </div>
          </div>
          <p className="text-center text-[10px] text-[#6B7280] mt-3" style={{ fontFamily: 'Arial, sans-serif' }}>Page 1 of 3</p>
        </div>
      </div>
    </div>
  );
}

// ─── Download Toast ───────────────────────────────────────────────────────────
function DownloadToast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#1F2937] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
      <CheckCircle size={16} className="text-[#1A7A4A]" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

// ─── PDF Generation Helper ────────────────────────────────────────────────────

/** All elements that must never be split across pages */
const ATOMIC_SELECTORS = [
  '[data-pdf-block]',          // explicit atomic blocks
  'tr',                        // table rows
  'thead',                     // table header
  'img',                       // images
  '.pdf-card',                 // defect / info cards
  '.pdf-photo-card',           // individual photo cards
  '.pdf-photo-row',            // photo grid rows
  '.pdf-section-header',       // section headings
  '.pdf-footer',               // signature / footer
  '.pdf-score-block',          // score gauge block
  '.pdf-summary-strip',        // inspection summary strip
  '.pdf-critical-findings',    // critical findings block
];

interface LayoutBlock {
  el: HTMLElement;
  top: number;   // mm from top of content
  height: number; // mm
  isHeading: boolean;
  isFooter: boolean;
}

function pxToMm(px: number, dpi = 96): number {
  return (px / dpi) * 25.4;
}

/**
 * Collect all atomic layout blocks from the cloned element,
 * measure their positions in mm, and return them sorted top-to-bottom.
 */
function collectBlocks(root: HTMLElement, scale: number): LayoutBlock[] {
  const rootRect = root.getBoundingClientRect();
  const blocks: LayoutBlock[] = [];

  // Walk every element; if it matches an atomic selector, record it
  // and skip its children (they're already contained).
  const visited = new WeakSet<Element>();

  function walk(el: HTMLElement) {
    if (visited.has(el)) return;

    const isAtomic = ATOMIC_SELECTORS.some(sel => el.matches(sel));
    if (isAtomic) {
      visited.add(el);
      const rect = el.getBoundingClientRect();
      const topPx = rect.top - rootRect.top;
      blocks.push({
        el,
        top: pxToMm(topPx / scale),
        height: pxToMm(rect.height / scale),
        isHeading: el.classList.contains('pdf-section-header') || el.tagName === 'H2' || el.tagName === 'H3',
        isFooter: el.classList.contains('pdf-footer'),
      });
      return; // don't recurse into atomic blocks
    }

    Array.from(el.children).forEach(child => walk(child as HTMLElement));
  }

  walk(root);
  return blocks.sort((a, b) => a.top - b.top);
}

/**
 * Given layout blocks and page dimensions, compute the Y positions (in mm)
 * where page breaks should occur — always between atomic blocks.
 */
function computePageBreaks(
  blocks: LayoutBlock[],
  pageH: number,
  topMargin: number,
  bottomMargin: number,
  totalContentHeightMM: number,
): number[] {
  const usable = pageH - topMargin - bottomMargin;
  const breaks: number[] = [];
  let pageStart = 0; // mm from top of content where current page starts

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const blockEnd = block.top + block.height;
    const relativeEnd = blockEnd - pageStart;

    // Rule 9: flag oversized elements (handled outside, skip here)
    if (block.height > usable) continue;

    // Rule 5: if a section heading is within 30mm of the bottom, break before it
    if (block.isHeading) {
      const spaceLeft = usable - (block.top - pageStart);
      if (spaceLeft < 30) {
        breaks.push(block.top);
        pageStart = block.top;
        continue;
      }
    }

    // Rule 2: never break between a heading and its first content element
    if (block.isHeading && i + 1 < blocks.length) {
      const next = blocks[i + 1];
      const headingAndFirstContent = block.height + next.height;
      const spaceLeft = usable - (block.top - pageStart);
      if (spaceLeft < headingAndFirstContent) {
        // Move break to before the heading
        breaks.push(block.top);
        pageStart = block.top;
        continue;
      }
    }

    // Rule 7: footer — keep together; if it doesn't fit, break before it
    if (block.isFooter) {
      const spaceLeft = usable - (block.top - pageStart);
      if (spaceLeft < block.height) {
        breaks.push(block.top);
        pageStart = block.top;
      }
      continue;
    }

    // General: if this block overflows the current page, break before it
    if (relativeEnd > usable) {
      breaks.push(block.top);
      pageStart = block.top;
    }
  }

  return breaks;
}

async function generatePDF(contentId: string, filename: string, onProgress: (msg: string) => void) {
  onProgress('Preparing report…');

  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const element = document.getElementById(contentId);
  if (!element) return;

  const A4_WIDTH_PX = 794; // 210mm at 96dpi

  // ── Build off-screen clone ──────────────────────────────────────────────────
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: fixed;
    top: -99999px;
    left: -99999px;
    width: ${A4_WIDTH_PX}px;
    background: white;
    z-index: -1;
  `;
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.cssText = `
    width: ${A4_WIDTH_PX}px;
    max-width: ${A4_WIDTH_PX}px;
    box-shadow: none;
    border-radius: 0;
    overflow: visible;
  `;
  clone.querySelectorAll('button').forEach(btn => btn.remove());

  // Tag atomic elements in the clone so the block collector can find them
  const atomicQuerySelectors = [
    'tr', 'thead', 'img',
    '[style*="breakInside"]',
    '[style*="pageBreakInside"]',
  ];
  atomicQuerySelectors.forEach(sel => {
    clone.querySelectorAll(sel).forEach(el => {
      (el as HTMLElement).setAttribute('data-pdf-block', '1');
    });
  });

  // Also tag the footer, score block, summary strip, critical findings
  const footerEl = clone.querySelector('.px-8.py-6.bg-\\[\\#F9FAFB\\].border-t') ||
                   clone.querySelector('.border-t-2.border-\\[\\#1E3A5F\\]');
  if (footerEl) (footerEl as HTMLElement).classList.add('pdf-footer');

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Force layout
  await new Promise(r => setTimeout(r, 400));

  onProgress('Analysing layout for smart page breaks…');

  // ── Measure blocks ──────────────────────────────────────────────────────────
  // The clone is rendered at A4_WIDTH_PX but the browser may apply devicePixelRatio
  // We use scale=1 for measurement (getBoundingClientRect returns CSS px)
  const cloneRect = clone.getBoundingClientRect();
  const SCALE = cloneRect.width / A4_WIDTH_PX; // should be ~1

  const blocks = collectBlocks(clone, SCALE);

  // PDF page constants (mm)
  const PDF_W = 210;
  const PDF_H = 297;
  const MARGIN = 10;
  const usableH = PDF_H - MARGIN * 2;

  // Total content height in mm
  const totalHeightMM = pxToMm(cloneRect.height / SCALE);

  // Compute smart page break positions (mm from top of content)
  const pageBreaksMM = computePageBreaks(blocks, PDF_H, MARGIN, MARGIN, totalHeightMM);

  // Build page slices: each slice is [startMM, endMM]
  const slices: Array<[number, number]> = [];
  let prev = 0;
  for (const brk of pageBreaksMM) {
    if (brk > prev) slices.push([prev, brk]);
    prev = brk;
  }
  slices.push([prev, totalHeightMM]);

  onProgress('Rendering report canvas…');

  // ── Render full canvas at 2× ────────────────────────────────────────────────
  const canvas = await html2canvas(clone, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: A4_WIDTH_PX,
    windowWidth: A4_WIDTH_PX,
  });

  document.body.removeChild(wrapper);

  onProgress('Building PDF pages…');

  // px per mm on the rendered canvas
  const canvasPxPerMM = canvas.height / totalHeightMM;
  const contentW = PDF_W - MARGIN * 2;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  slices.forEach((slice, idx) => {
    if (idx > 0) pdf.addPage();

    const [startMM, endMM] = slice;
    const sliceHeightMM = Math.min(endMM - startMM, usableH);

    const srcY = Math.round(startMM * canvasPxPerMM);
    const srcH = Math.round(sliceHeightMM * canvasPxPerMM);
    const clampedSrcH = Math.min(srcH, canvas.height - srcY);

    if (clampedSrcH <= 0) return;

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = clampedSrcH;
    const ctx = pageCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, srcY, canvas.width, clampedSrcH, 0, 0, canvas.width, clampedSrcH);
    }

    const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
    const imgH = clampedSrcH / canvasPxPerMM;
    pdf.addImage(imgData, 'JPEG', MARGIN, MARGIN, contentW, imgH);
  });

  onProgress('Saving PDF…');
  pdf.save(filename);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportTemplatesPage() {
  const [template, setTemplate] = useState<'modern' | 'classic'>('modern');
  const [toast, setToast] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setToast('Generating PDF…');

    try {
      const contentId = template === 'modern' ? 'modern-report-content' : 'classic-report-content';
      const filename = `Carschek-Report-CS-2026-4521-${template === 'modern' ? 'Modern' : 'Classic'}.pdf`;
      await generatePDF(contentId, filename, (msg) => setToast(msg));
      setToast('PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      setToast('PDF generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    const link = 'https://carschek.com/reports/CS-2026-4521';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => setToast('Report link copied to clipboard'));
    } else {
      setToast('Report link: ' + link);
    }
    setShowShareMenu(false);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent('Your Carschek Vehicle Inspection Report is ready. View it here: https://carschek.com/reports/CS-2026-4521');
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent('Your Carschek Inspection Report — 2019 Toyota Camry LE');
    const body = encodeURIComponent('Dear Customer,\n\nYour vehicle inspection report is ready.\n\nReport #: CS-2026-4521\nVehicle: 2019 Toyota Camry LE\nCarschek Score: 73/100 — Good Condition\n\nView full report: https://carschek.com/reports/CS-2026-4521\n\nBest regards,\nCarschek Team');
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    setShowShareMenu(false);
  };

  return (
    <AppLayout currentPath="/report-templates">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Customer-Facing Report Templates</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">Modern (visual-first) and Classic (print-ready) report templates</p>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Template toggle */}
            <div className="flex items-center gap-1 bg-[#F4F6F8] p-1 rounded-xl border border-[#E5E7EB]">
              <button onClick={() => setTemplate('modern')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${template === 'modern' ? 'bg-white text-[#1E3A5F] shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'}`}>
                Modern
              </button>
              <button onClick={() => setTemplate('classic')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${template === 'classic' ? 'bg-white text-[#1E3A5F] shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'}`}>
                Classic
              </button>
            </div>

            {/* Share button */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(v => !v)}
                className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#6B7280] hover:bg-[#F4F6F8] transition-colors"
              >
                <Share2 size={15} />
                Share
              </button>
              {showShareMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-20 overflow-hidden">
                    <button onClick={handleShareWhatsApp} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#1F2937] hover:bg-[#F4F6F8] transition-colors">
                      <MessageSquare size={15} className="text-green-600" /> Share via WhatsApp
                    </button>
                    <button onClick={handleShareEmail} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#1F2937] hover:bg-[#F4F6F8] transition-colors">
                      <Mail size={15} className="text-[#2E75B6]" /> Share via Email
                    </button>
                    <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#1F2937] hover:bg-[#F4F6F8] transition-colors border-t border-[#E5E7EB]">
                      <Link size={15} className="text-[#6B7280]" /> Copy Report Link
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Print button */}
            <button
              onClick={() => { window.print(); }}
              className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#6B7280] hover:bg-[#F4F6F8] transition-colors"
            >
              <Printer size={15} />
              Print
            </button>

            {/* Download PDF button */}
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
                isGenerating
                  ? 'bg-[#6B7280] cursor-not-allowed text-white'
                  : 'bg-[#1E3A5F] hover:bg-[#16304F] text-white'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <Download size={15} />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report info banner */}
        <div className="bg-[#F0F7FF] border border-[#BFDBFE] rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2E75B6] rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E3A5F]">Report #CS-2026-4521 — QA Approved</p>
              <p className="text-xs text-[#6B7280]">2019 Toyota Camry LE · KJA 234 AA · Carschek Score: 73/100 · 11 vehicle photos · 2 damage photos</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#6B7280]">
            <div className="flex items-center gap-1.5">
              <Camera size={12} className="text-[#2E75B6]" />
              <span>11 vehicle photos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-[#C0392B]" />
              <span>2 damage photos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1A7A4A] inline-block" />
              Delivered 15 Apr 2026
            </div>
          </div>
        </div>

        {/* Template with crossfade */}
        <div className="relative">
          <div className={`transition-all duration-300 ${template === 'modern' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
            <ModernReport />
          </div>
          <div className={`transition-all duration-300 ${template === 'classic' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
            <ClassicReport />
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && <DownloadToast message={toast} onClose={() => setToast(null)} />}
    </AppLayout>
  );
}
