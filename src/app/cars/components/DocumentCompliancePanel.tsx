'use client';

import React, { useCallback, useState } from 'react';
import { X, FileText, ImageIcon, Check, Upload } from 'lucide-react';
import { CAR_DOCUMENT_TYPES } from '@/lib/cars/documents';
import { toast } from 'sonner';

export type DocComplianceStatus = 'Missing' | 'Uploaded-Awaiting' | 'Approved' | 'Rejected';

type DocRow = {
  name: string;
  status: DocComplianceStatus;
  comment: string;
};

const STATUS_CLASS: Record<DocComplianceStatus, string> = {
  Missing: 'bg-red-100 text-red-700',
  'Uploaded-Awaiting': 'bg-amber-100 text-amber-800',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-800',
};

export default function DocumentCompliancePanel({
  open,
  onClose,
  initialDocs,
}: {
  open: boolean;
  onClose: () => void;
  initialDocs?: DocRow[];
}) {
  const [docs, setDocs] = useState<DocRow[]>(() =>
    initialDocs ??
      CAR_DOCUMENT_TYPES.map((name, i) => ({
        name,
        status: (i < 5 ? 'Approved' : i < 7 ? 'Uploaded-Awaiting' : 'Missing') as DocComplianceStatus,
        comment: '',
      }))
  );

  const requiredMissing = docs.filter(
    d => ['Vehicle Registration', 'Proof of Ownership', 'Insurance Certificate', 'Road Worthiness'].includes(d.name) && d.status === 'Missing'
  ).length;

  const setComment = useCallback((name: string, comment: string) => {
    setDocs(prev => prev.map(d => (d.name === name ? { ...d, comment } : d)));
  }, []);

  const setStatus = useCallback((name: string, status: DocComplianceStatus) => {
    setDocs(prev => prev.map(d => (d.name === name ? { ...d, status } : d)));
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-lg font-heading font-semibold text-[#1F2937]">Document compliance</h2>
            <p className="text-xs text-[#6B7280]">Review, upload, approve or reject each document</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-[#F4F6F8] text-[#6B7280]">
            <X size={18} />
          </button>
        </div>

        {requiredMissing > 0 && (
          <div className="mx-5 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Compliance gate: {requiredMissing} required document(s) still missing. Listing may be blocked.
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {docs.map(doc => (
            <div key={doc.name} className="rounded-xl border border-[#E5E7EB] p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#1F2937]">{doc.name}</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_CLASS[doc.status]}`}>
                    {doc.status}
                  </span>
                </div>
                <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-[#F4F6F8] text-[#9CA3AF]">
                  {doc.status === 'Approved' ? <ImageIcon size={22} /> : <FileText size={22} />}
                </div>
              </div>
              <textarea
                value={doc.comment}
                onChange={e => setComment(doc.name, e.target.value)}
                placeholder="Comment…"
                rows={2}
                className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
              />
              {(doc.status === 'Missing' || doc.status === 'Rejected') && (
                <label className="flex flex-col items-center justify-center gap-2 w-full py-6 border-2 border-dashed border-[#E5E7EB] rounded-lg text-xs text-[#6B7280] hover:border-[#ff8a65] cursor-pointer">
                  <Upload size={16} />
                  Drag & drop or Select File(s)
                  <input type="file" className="hidden" onChange={() => setStatus(doc.name, 'Uploaded-Awaiting')} />
                </label>
              )}
              {doc.status === 'Uploaded-Awaiting' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus(doc.name, 'Approved');
                      toast.success(`${doc.name} approved`);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1A7A4A] text-white text-xs font-semibold"
                  >
                    <Check size={12} /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const reason = window.prompt('Rejection reason');
                      if (reason) {
                        setStatus(doc.name, 'Rejected');
                        toast.message(`Rejected: ${reason}`);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#C0392B] text-[#C0392B] text-xs font-semibold"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
