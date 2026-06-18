'use client';
import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import AppLogo from '@/components/ui/AppLogo';
import { CheckCircle, XCircle, AlertTriangle, Download, Share2, Link, Printer, Mail, MessageSquare } from 'lucide-react';

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

// ─── Modern Report Template ───────────────────────────────────────────────────
function ModernReport() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const score = 73;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden" id="modern-report-content">
      {/* Navy top border */}
      <div className="h-2 bg-[#ff5722]" />

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#E5E7EB]">
        <div>
          <AppLogo size={52} />
          <p className="text-xs text-[#6B7280] mt-0.5">Vehicle Inspection Report</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-[#1F2937]">Report #CS-2026-4521</p>
          <p className="text-xs text-[#6B7280]">15 April 2026</p>
        </div>
      </div>

      {/* Vehicle hero */}
      <div className="relative">
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
      <div className="px-8 py-6 bg-[#F9FAFB] border-y border-[#E5E7EB]">
        <div className="flex flex-col items-center">
          <ScoreGauge score={score} size={140} />
          <div className="grid grid-cols-4 gap-4 mt-5 w-full max-w-sm">
            {[{ label: 'Body', score: 68 }, { label: 'Engine', score: 72 }, { label: 'Interior', score: 85 }, { label: 'Electrical', score: 79 }].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-sm font-bold text-[#1F2937]">{s.score}</p>
                <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden my-1">
                  <div className="h-full bg-[#ff8a65] rounded-full" style={{ width: `${s.score}%` }} />
                </div>
                <p className="text-xs text-[#6B7280]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inspection summary strip */}
      <div className="px-8 py-4 bg-[#ff5722] flex flex-wrap gap-4">
        {[['Inspector', 'Emeka Okonkwo'], ['Zone', 'Lekki'], ['Date', '15 Apr 2026'], ['Duration', '8min 42sec'], ['Report #', 'CS-2026-4521']].map(([k, v]) => (
          <div key={k}>
            <span className="text-white/50 text-xs">{k}: </span>
            <span className="text-white text-xs font-semibold">{v}</span>
          </div>
        ))}
      </div>

      {/* Critical findings */}
      <div className="px-8 py-5">
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
            <div key={s.name} className="border border-[#E5E7EB] rounded-xl overflow-hidden">
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
                <div className="px-3 pb-3 border-t border-[#E5E7EB]">
                  {defects.filter(d => d.section === s.name).map((d, i) => (
                    <div key={i} className="mt-2 text-xs">
                      <span className="font-medium text-[#1F2937]">{d.item}: </span>
                      <span className="text-[#6B7280]">{d.desc}</span>
                    </div>
                  ))}
                  {defects.filter(d => d.section === s.name).length === 0 && (
                    <p className="mt-2 text-xs text-[#1A7A4A]">All items passed ✓</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Defect gallery */}
      <div className="px-8 py-4 border-t border-[#E5E7EB]">
        <h3 className="font-bold text-[#1F2937] mb-4">Defect Photos</h3>
        <div className="grid grid-cols-2 gap-3">
          {defects.filter(d => d.severity !== 'Minor').map((d, i) => (
            <div key={i} className="bg-[#F4F6F8] rounded-xl overflow-hidden border border-[#E5E7EB]">
              <div className="h-28 bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB] flex items-center justify-center">
                <p className="text-[#6B7280] text-xs">📷 Photo {i + 1}</p>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-[#1F2937] truncate">{d.item}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${d.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{d.severity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-6 bg-[#F9FAFB] border-t border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#ff5722] flex items-center justify-center text-white font-bold">EO</div>
            <div>
              <p className="font-bold text-[#1F2937]">Emeka Okonkwo</p>
              <p className="text-xs text-[#6B7280]">Cert #INS-001 · Apr 15, 2026 10:38 AM</p>
              <div className="mt-1">
                <svg viewBox="0 0 120 30" className="w-24 h-6">
                  <path d="M5,20 Q15,5 25,18 Q35,30 45,15 Q55,5 65,18 Q75,28 85,12 Q95,2 115,15" fill="none" stroke="#ff5722" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#ff5722] rounded-xl flex items-center justify-center mb-1 p-1">
              <div className="grid grid-cols-5 gap-0.5 w-full h-full">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`rounded-[1px] ${[0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24].includes(i) ? 'bg-white' : 'bg-[#ff5722]'}`} />
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
        <div className="border-b-4 border-[#ff5722] px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <AppLogo size={56} />
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
        <div className="grid grid-cols-2 gap-0 border-b border-[#E5E7EB]">
          {/* Left column */}
          <div className="border-r border-[#E5E7EB] p-6">
            <h3 className="text-sm font-bold text-[#ff5722] uppercase tracking-widest mb-3 border-b border-[#E5E7EB] pb-2" style={{ fontFamily: 'Georgia, serif' }}>Vehicle Information</h3>
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
            <h3 className="text-sm font-bold text-[#ff5722] uppercase tracking-widest mb-3 border-b border-[#E5E7EB] pb-2" style={{ fontFamily: 'Georgia, serif' }}>Inspection Summary</h3>
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
        <div className="p-6">
          <h3 className="text-sm font-bold text-[#ff5722] uppercase tracking-widest mb-3 border-b border-[#E5E7EB] pb-2" style={{ fontFamily: 'Georgia, serif' }}>Detailed Inspection Results</h3>
          <table className="w-full text-xs border border-[#E5E7EB]" style={{ fontFamily: 'Arial, sans-serif' }}>
            <thead>
              <tr className="bg-[#ff5722] text-white">
                <th className="text-left py-2 px-3 font-semibold">Section</th>
                <th className="text-center py-2 px-3 font-semibold">Pass</th>
                <th className="text-center py-2 px-3 font-semibold">Fail</th>
                <th className="text-center py-2 px-3 font-semibold">Total</th>
                <th className="text-left py-2 px-3 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody>
              {sectionResults.map((s, i) => (
                <tr key={s.name} className={`border-b border-[#E5E7EB] ${i % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}`}>
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

        {/* Defects table */}
        <div className="px-6 pb-6">
          <h3 className="text-sm font-bold text-[#ff5722] uppercase tracking-widest mb-3 border-b border-[#E5E7EB] pb-2" style={{ fontFamily: 'Georgia, serif' }}>Defects Found</h3>
          <table className="w-full text-xs border border-[#E5E7EB]" style={{ fontFamily: 'Arial, sans-serif' }}>
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
                <tr key={i} className="border-t border-[#E5E7EB]">
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

        {/* Footer */}
        <div className="border-t-2 border-[#ff5722] px-6 py-4 bg-[#F9FAFB]">
          <div className="flex items-center justify-between" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div>
              <p className="text-xs font-bold text-[#1F2937]">Emeka Okonkwo · Cert #INS-001</p>
              <svg viewBox="0 0 120 25" className="w-24 h-5 mt-1">
                <path d="M5,18 Q15,4 25,15 Q35,26 45,12 Q55,3 65,15 Q75,25 85,10 Q95,1 115,12" fill="none" stroke="#ff5722" strokeWidth="1.5" strokeLinecap="round" />
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportTemplatesPage() {
  const [template, setTemplate] = useState<'modern' | 'classic'>('modern');
  const [toast, setToast] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const reportContentRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    // Open print dialog — browser will offer Save as PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const contentId = template === 'modern' ? 'modern-report-content' : 'classic-report-content';
    const reportEl = document.getElementById(contentId);
    const reportHTML = reportEl ? reportEl.outerHTML : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Carschek Inspection Report CS-2026-4521</title>
          <meta charset="utf-8" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Inter, Arial, sans-serif; background: white; color: #1F2937; }
            @page { margin: 0; size: A4; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            .h-2 { height: 8px; }
            .bg-\\[\\#ff5722\\] { background-color: #ff5722 !important; }
            .bg-\\[\\#F9FAFB\\] { background-color: #F9FAFB !important; }
            .bg-\\[\\#F4F6F8\\] { background-color: #F4F6F8 !important; }
            .text-\\[\\#ff5722\\] { color: #ff5722 !important; }
            .text-\\[\\#1F2937\\] { color: #1F2937 !important; }
            .text-\\[\\#6B7280\\] { color: #6B7280 !important; }
            .text-\\[\\#1A7A4A\\] { color: #1A7A4A !important; }
            .text-\\[\\#C0392B\\] { color: #C0392B !important; }
            .text-\\[\\#D35400\\] { color: #D35400 !important; }
            .border-\\[\\#E5E7EB\\] { border-color: #E5E7EB !important; }
            .border-\\[\\#C0392B\\] { border-color: #C0392B !important; }
            .bg-red-50 { background-color: #FEF2F2 !important; }
            .text-red-700 { color: #B91C1C !important; }
            .bg-red-100 { background-color: #FEE2E2 !important; }
            .bg-orange-100 { background-color: #FFEDD5 !important; }
            .text-orange-700 { color: #C2410C !important; }
            .text-white { color: white !important; }
            .text-white\\/50 { color: rgba(255,255,255,0.5) !important; }
            .bg-\\[\\#ff8a65\\] { background-color: #ff8a65 !important; }
            .bg-\\[\\#E5E7EB\\] { background-color: #E5E7EB !important; }
            .bg-\\[\\#D1D5DB\\] { background-color: #D1D5DB !important; }
            .bg-gradient-to-br { background: linear-gradient(135deg, #E5E7EB, #D1D5DB) !important; }
            button { display: none !important; }
            .print\\:hidden { display: none !important; }
          </style>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" />
        </head>
        <body>
          ${reportHTML}
          <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setToast('Opening print dialog — choose "Save as PDF" to download');
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
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 no-print">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Customer-Facing Report Templates</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">Modern (visual-first) and Classic (print-ready) report templates</p>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Template toggle */}
            <div className="flex items-center gap-1 bg-[#F4F6F8] p-1 rounded-xl border border-[#E5E7EB]">
              <button onClick={() => setTemplate('modern')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${template === 'modern' ? 'bg-white text-[#ff5722] shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'}`}>
                Modern
              </button>
              <button onClick={() => setTemplate('classic')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${template === 'classic' ? 'bg-white text-[#ff5722] shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'}`}>
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
                      <Mail size={15} className="text-[#ff8a65]" /> Share via Email
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
              className="flex items-center gap-2 px-5 py-2 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <Download size={15} />
              Download PDF
            </button>
          </div>
        </div>

        {/* Report info banner */}
        <div className="no-print bg-[#F0F7FF] border border-[#BFDBFE] rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#ff8a65] rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#ff5722]">Report #CS-2026-4521 — QA Approved</p>
              <p className="text-xs text-[#6B7280]">2019 Toyota Camry LE · KJA 234 AA · Carschek Score: 73/100 · Valid until 14 Jul 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <span className="w-2 h-2 rounded-full bg-[#1A7A4A] inline-block" />
            Delivered to customer on 15 Apr 2026
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
