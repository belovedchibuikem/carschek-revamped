'use client';
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronRight, Camera, Clock, User, Shield, History } from 'lucide-react';
import { Report } from './ReportsQAModule';
import { toast } from 'sonner';

const SECTIONS = [
  { id: 'sec-exterior', label: 'Exterior Body', items: 8, passed: 6, failed: 2 },
  { id: 'sec-interior', label: 'Interior Cabin', items: 6, passed: 6, failed: 0 },
  { id: 'sec-engine', label: 'Engine Bay', items: 5, passed: 3, failed: 2 },
  { id: 'sec-transmission', label: 'Transmission', items: 3, passed: 3, failed: 0 },
  { id: 'sec-suspension', label: 'Suspension & Steering', items: 4, passed: 2, failed: 2 },
  { id: 'sec-brakes', label: 'Brakes', items: 3, passed: 2, failed: 1 },
  { id: 'sec-electrical', label: 'Electrical Systems', items: 4, passed: 4, failed: 0 },
  { id: 'sec-tyres', label: 'Tyres & Wheels', items: 4, passed: 3, failed: 1 },
];

const CRITICAL_DEFECTS = [
  { id: 'def-001', section: 'Exterior Body', item: 'Front bumper — deep crack, structural damage', severity: 'Critical' },
  { id: 'def-002', section: 'Engine Bay', item: 'Oil leak from valve cover gasket — active leak', severity: 'High' },
  { id: 'def-003', section: 'Suspension', item: 'Front left ball joint — excessive play', severity: 'Critical' },
  { id: 'def-004', section: 'Brakes', item: 'Rear brake pads — worn below minimum threshold (2mm)', severity: 'High' },
];

const VERSION_HISTORY = [
  { id: 'ver-1', version: 1, timestamp: '10 Apr 2026, 09:48', actor: 'Ngozi Okafor', changes: 'Initial submission', status: 'rejected' },
  { id: 'ver-2', version: 2, timestamp: '10 Apr 2026, 11:15', actor: 'Ngozi Okafor', changes: 'Section 5 corrected — added missing defect photos for suspension', status: 'under-review' },
];

const QA_CHECKLIST_ITEMS = [
  { id: 'chk-photos', label: 'All defect photos present and clear' },
  { id: 'chk-desc', label: 'Defect descriptions are specific and actionable' },
  { id: 'chk-score', label: 'Score calculation verified against defect list' },
  { id: 'chk-customer', label: 'Customer and vehicle information correct' },
];

interface Props { report: Report; onBack: () => void; }

export default function ReportReviewPanel({ report, onBack }: Props) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [activeView, setActiveView] = useState<'review' | 'history' | 'delivery'>('review');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCorrectionsModal, setShowCorrectionsModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [correctionsNote, setCorrectionsNote] = useState('');

  const toggleSection = (id: string) => setExpandedSections(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleCheck = (id: string) => setChecklist(c => ({ ...c, [id]: !c[id] }));
  const allChecked = QA_CHECKLIST_ITEMS.every(i => checklist[i.id]);

  const scoreColor = report.score >= 71 ? '#1A7A4A' : report.score >= 41 ? '#D35400' : '#C0392B';
  const scoreBg = report.score >= 71 ? '#F0FAF4' : report.score >= 41 ? '#FEF6EE' : '#FEF2F2';

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors">
        <ArrowLeft size={16} /> Back to QA Queue
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm flex flex-wrap items-center gap-4 justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-base font-bold text-[#1E3A5F]">{report.id}</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              report.qaStatus === 'approved' ? 'bg-green-50 text-green-700' :
              report.qaStatus === 'rejected' ? 'bg-red-50 text-red-700' :
              report.qaStatus === 'under-review' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
            }`}>{report.qaStatus === 'awaiting' ? 'Awaiting QA' : report.qaStatus === 'under-review' ? 'Under Review' : report.qaStatus === 'approved' ? 'Approved' : 'Rejected'}</span>
            <span className="text-xs text-[#6B7280]">v{report.version}</span>
          </div>
          <p className="text-sm font-semibold text-[#1F2937] mt-1">{report.vehicle}</p>
        </div>
        <div className="flex gap-2">
          {(['review', 'history', 'delivery'] as const).map(v => (
            <button key={`view-${v}`} onClick={() => setActiveView(v)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${activeView === v ? 'bg-[#1E3A5F] text-white' : 'border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F4F6F8]'}`}>
              {v === 'review' ? 'Review' : v === 'history' ? 'Version History' : 'Delivery Log'}
            </button>
          ))}
        </div>
      </div>

      {/* REVIEW VIEW */}
      {activeView === 'review' && (
        <div className="grid grid-cols-1 xl:grid-cols-11 gap-5">
          {/* Left: Report Preview */}
          <div className="xl:col-span-6 space-y-4">
            {/* Score */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#F4F6F8" strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={scoreColor} strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - report.score / 100)}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-heading font-bold tabular-nums" style={{ color: scoreColor }}>{report.score}</span>
                    <span className="text-[9px] text-[#6B7280]">/100</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-heading font-bold text-[#1F2937]">Carschek Score</h2>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: scoreColor }}>
                    {report.score >= 71 ? 'Good Condition' : report.score >= 41 ? 'Fair Condition' : 'Poor Condition'}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">{report.defectsFound} defects found · {SECTIONS.reduce((a, s) => a + s.items, 0)} items inspected</p>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-red-50 rounded-lg text-center">
                      <p className="text-lg font-bold text-[#C0392B] tabular-nums">{CRITICAL_DEFECTS.filter(d => d.severity === 'Critical').length}</p>
                      <p className="text-[9px] text-[#6B7280]">Critical</p>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg text-center">
                      <p className="text-lg font-bold text-[#D35400] tabular-nums">{CRITICAL_DEFECTS.filter(d => d.severity === 'High').length}</p>
                      <p className="text-[9px] text-[#6B7280]">High</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Critical findings */}
            <div className="bg-white rounded-xl border-l-4 border-l-[#C0392B] border border-[#E5E7EB] p-5 shadow-sm">
              <h3 className="text-sm font-heading font-semibold text-[#C0392B] mb-3 flex items-center gap-2">
                <AlertTriangle size={15} /> Critical & High Findings
              </h3>
              <div className="space-y-2">
                {CRITICAL_DEFECTS.map(d => (
                  <div key={d.id} className="flex items-start gap-3 p-2.5 bg-red-50/50 rounded-lg border border-red-100">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${d.severity === 'Critical' ? 'bg-[#C0392B] text-white' : 'bg-[#D35400] text-white'}`}>{d.severity}</span>
                    <div>
                      <p className="text-xs font-semibold text-[#1F2937]">{d.section}</p>
                      <p className="text-[10px] text-[#6B7280]">{d.item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sections accordion */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E7EB]">
                <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Inspection Sections ({SECTIONS.length})</h3>
              </div>
              <div className="divide-y divide-[#F4F6F8]">
                {SECTIONS.map(section => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#F4F6F8]/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {section.failed > 0 ? <XCircle size={15} className="text-[#C0392B]" /> : <CheckCircle size={15} className="text-[#1A7A4A]" />}
                        <span className="text-sm font-medium text-[#1F2937]">{section.label}</span>
                        <span className="text-[10px] text-[#6B7280]">{section.passed}/{section.items} passed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {section.failed > 0 && (
                          <span className="text-[10px] font-bold bg-red-50 text-[#C0392B] px-1.5 py-0.5 rounded-full">{section.failed} fail</span>
                        )}
                        {expandedSections.includes(section.id) ? <ChevronDown size={14} className="text-[#6B7280]" /> : <ChevronRight size={14} className="text-[#6B7280]" />}
                      </div>
                    </button>
                    {expandedSections.includes(section.id) && (
                      <div className="px-5 pb-4 bg-[#F4F6F8]/30">
                        <div className="space-y-1.5">
                          {Array.from({ length: section.items }, (_, i) => {
                            const isFail = i < section.failed;
                            return (
                              <div key={`item-${section.id}-${i}`} className={`flex items-center justify-between p-2 rounded-lg border ${isFail ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                <span className="text-xs text-[#1F2937]">
                                  {isFail ? `${section.label} defect item ${i + 1}` : `${section.label} item ${i + 1}`}
                                </span>
                                {isFail ? <XCircle size={13} className="text-[#C0392B]" /> : <CheckCircle size={13} className="text-[#1A7A4A]" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Photo gallery */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-3 flex items-center gap-2">
                <Camera size={15} className="text-[#2E75B6]" /> Defect Photo Gallery ({report.defectsFound} photos)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: report.defectsFound }, (_, i) => (
                  <div key={`photo-${report.id}-${i}`} className="aspect-square bg-[#F4F6F8] rounded-lg border border-[#E5E7EB] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#2E75B6] transition-colors">
                    <Camera size={20} className="text-[#6B7280]" />
                    <span className="text-[9px] text-[#6B7280]">Photo {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: QA Controls */}
          <div className="xl:col-span-5 space-y-4">
            {/* Metadata */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-3">Report Metadata</h3>
              <div className="space-y-2">
                {[
                  { icon: User, label: 'Inspector', value: report.inspector },
                  { icon: Clock, label: 'Submitted', value: report.submittedAt },
                  { icon: Clock, label: 'Duration', value: '42 minutes' },
                  { icon: Shield, label: 'Version', value: `v${report.version}` },
                  { icon: History, label: 'Time in Queue', value: `${Math.floor(report.minutesInQueue / 60)}h ${report.minutesInQueue % 60}m` },
                ].map(m => (
                  <div key={`meta-${m.label}`} className="flex items-center gap-3 text-xs">
                    <m.icon size={13} className="text-[#6B7280] flex-shrink-0" />
                    <span className="text-[#6B7280] w-24 flex-shrink-0">{m.label}</span>
                    <span className="font-semibold text-[#1F2937]">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* QA Checklist */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-3">QA Checklist</h3>
              <div className="space-y-2.5">
                {QA_CHECKLIST_ITEMS.map(item => (
                  <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!checklist[item.id]}
                      onChange={() => toggleCheck(item.id)}
                      className="w-4 h-4 rounded border-[#E5E7EB] text-[#1A7A4A] focus:ring-[#1A7A4A] mt-0.5"
                    />
                    <span className={`text-xs leading-relaxed ${checklist[item.id] ? 'line-through text-[#6B7280]' : 'text-[#1F2937]'}`}>{item.label}</span>
                  </label>
                ))}
              </div>
              {!allChecked && (
                <p className="mt-3 text-[10px] text-[#D35400] flex items-center gap-1">
                  <AlertTriangle size={10} /> Complete all checklist items before approving
                </p>
              )}
            </div>

            {/* Admin note */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-3">QA Notes</h3>
              <textarea
                rows={3}
                placeholder="Add a QA note visible to the inspector team…"
                className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] resize-none"
              />
            </div>

            {/* Action buttons */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937]">QA Decision</h3>
              <button
                onClick={() => {
                  if (!allChecked) { toast.error('Please complete the QA checklist before approving'); return; }
                  toast.success(`Report ${report.id} approved — generating PDF and notifying customer`);
                }}
                className={`w-full py-3 font-semibold text-sm rounded-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${allChecked ? 'bg-[#1A7A4A] hover:bg-[#155F3A] text-white' : 'bg-gray-100 text-[#6B7280] cursor-not-allowed'}`}
                disabled={!allChecked}
              >
                <CheckCircle size={16} /> Approve & Deliver to Customer
              </button>
              <button
                onClick={() => setShowCorrectionsModal(true)}
                className="w-full py-2.5 border border-[#D35400] text-[#D35400] font-semibold text-sm rounded-xl hover:bg-amber-50 transition-all active:scale-[0.99]"
              >
                Request Corrections
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="w-full py-2.5 border border-[#C0392B] text-[#C0392B] font-semibold text-sm rounded-xl hover:bg-red-50 transition-all active:scale-[0.99]"
              >
                <span className="flex items-center justify-center gap-2"><XCircle size={15} /> Reject Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERSION HISTORY VIEW */}
      {activeView === 'history' && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm animate-fade-in">
          <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-5">Version History</h3>
          <div className="space-y-4">
            {VERSION_HISTORY.map((ver, idx) => (
              <div key={ver.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${ver.status === 'rejected' ? 'bg-[#C0392B]' : 'bg-[#2E75B6]'}`}>v{ver.version}</div>
                  {idx < VERSION_HISTORY.length - 1 && <div className="w-0.5 h-8 bg-[#E5E7EB]" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#1F2937]">Version {ver.version}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{ver.timestamp} · {ver.actor}</p>
                      <p className="text-xs text-[#6B7280] mt-1 italic">{ver.changes}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ver.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                        {ver.status === 'rejected' ? 'Rejected' : 'Under Review'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveView('review');
                          toast.info(`Version ${ver.version} snapshot`, { description: 'Switched to Review tab — compare with current submission.' });
                        }}
                        className="text-xs text-[#2E75B6] hover:underline rounded-sm"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DELIVERY LOG VIEW */}
      {activeView === 'delivery' && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm animate-fade-in space-y-4">
          <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Report Delivery Log</h3>
          <div className="space-y-3">
            {[
              { id: 'dlv-1', channel: 'Email', detail: 'Sent to ngozi.ike@outlook.com', time: '10 Apr 2026, 12:30', icon: '✉️' },
              { id: 'dlv-2', channel: 'SMS', detail: 'Sent to +234 705 221 8834', time: '10 Apr 2026, 12:30', icon: '📱' },
              { id: 'dlv-3', channel: 'Web Link', detail: 'Report link opened 3 times', time: 'Last: 10 Apr 2026, 14:15', icon: '🔗' },
            ].map(d => (
              <div key={d.id} className="flex items-center gap-4 p-3 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB]">
                <span className="text-xl">{d.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#1F2937]">{d.channel}</p>
                  <p className="text-[10px] text-[#6B7280]">{d.detail}</p>
                  <p className="text-[10px] text-[#6B7280]">{d.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={() => toast.info('Resending PDF to customer…')} className="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg hover:bg-[#16304F] transition-all">
              Resend PDF
            </button>
            <button
              onClick={() => {
                const printWindow = window.open('', '_blank');
                if (!printWindow) { toast.error('Pop-up blocked. Please allow pop-ups to download.'); return; }
                printWindow.document.write(`<!DOCTYPE html><html><head><title>Carschek Report ${report.id}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#1F2937;max-width:800px;margin:0 auto}h1{color:#1E3A5F;border-bottom:3px solid #1E3A5F;padding-bottom:12px}table{width:100%;border-collapse:collapse;margin:16px 0}th{background:#1E3A5F;color:white;padding:8px 12px;text-align:left}td{padding:8px 12px;border-bottom:1px solid #E5E7EB}.score{font-size:48px;font-weight:900;color:#1A7A4A;text-align:center}.badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700}.critical{background:#FEE2E2;color:#B91C1C}.high{background:#FFEDD5;color:#C2410C}@media print{body{padding:20px}}</style></head><body><h1>CARSCHEK — Vehicle Inspection Report</h1><p><strong>Report #:</strong> ${report.id} &nbsp;&nbsp; <strong>Order:</strong> ${report.orderId} &nbsp;&nbsp; <strong>Version:</strong> v${report.version}</p><p><strong>Vehicle:</strong> ${report.vehicle}</p><p><strong>Inspector:</strong> ${report.inspector} &nbsp;&nbsp; <strong>Submitted:</strong> ${report.submittedAt}</p><div class="score">${report.score}<span style="font-size:20px;color:#6B7280">/100</span></div><p style="text-align:center;color:#1A7A4A;font-weight:700">${report.score >= 71 ? 'GOOD CONDITION' : report.score >= 41 ? 'FAIR CONDITION' : 'POOR CONDITION'}</p><h2>Defects Found (${report.defectsFound})</h2><table><tr><th>Section</th><th>Item</th><th>Severity</th><th>Description</th></tr><tr><td>Exterior Body</td><td>Front bumper</td><td><span class="badge critical">Critical</span></td><td>Deep crack, structural damage</td></tr><tr><td>Engine Bay</td><td>Valve cover gasket</td><td><span class="badge high">High</span></td><td>Active oil leak</td></tr></table><p style="font-size:11px;color:#6B7280;margin-top:40px;border-top:1px solid #E5E7EB;padding-top:12px">This report is valid for 90 days from inspection date. Verify at carschek.com · info@carschek.com · +234 817 362 4953</p><script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}<\/script></body></html>`);
                printWindow.document.close();
                toast.success('Opening print dialog — choose "Save as PDF" to download');
              }}
              className="px-4 py-2 bg-white border border-[#E5E7EB] text-xs font-semibold text-[#1F2937] rounded-lg hover:bg-[#F4F6F8] transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download PDF
            </button>
            <button onClick={() => { navigator.clipboard?.writeText('https://carschek.com/reports/RPT-501'); toast.success('Report link copied'); }} className="px-4 py-2 border border-[#E5E7EB] text-xs font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-colors">
              Copy Report Link
            </button>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-amber-700">Report expires on <span className="font-semibold">10 Jul 2026</span> (90 days from approval)</p>
            <button
              onClick={() => toast.warning('Report marked as expired — link deactivated')}
              className="px-3 py-1.5 border border-amber-400 text-amber-700 text-[10px] font-semibold rounded-lg hover:bg-amber-100 transition-colors"
            >
              Mark as Expired
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRejectModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in p-6">
            <h3 className="font-heading font-semibold text-[#1F2937] mb-4">Reject Report</h3>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Rejection reason</label>
            <textarea rows={4} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Describe why this report is being rejected…" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2 border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={() => { setShowRejectModal(false); toast.error(`Report ${report.id} rejected — inspector notified`); }} className="flex-1 py-2 bg-[#C0392B] text-white text-sm font-semibold rounded-lg hover:bg-[#A93226]">Reject Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Corrections Modal */}
      {showCorrectionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCorrectionsModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in p-6">
            <h3 className="font-heading font-semibold text-[#1F2937] mb-4">Request Corrections</h3>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">What needs to be corrected?</label>
            <textarea rows={4} value={correctionsNote} onChange={e => setCorrectionsNote(e.target.value)} placeholder="Describe the corrections needed for the inspector…" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowCorrectionsModal(false)} className="flex-1 py-2 border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={() => { setShowCorrectionsModal(false); toast.warning(`Corrections requested from ${report.inspector}`); }} className="flex-1 py-2 bg-[#D35400] text-white text-sm font-semibold rounded-lg hover:bg-[#B84600]">Send to Inspector</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}