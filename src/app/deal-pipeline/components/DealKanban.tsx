'use client';
import React, { useState } from 'react';
import { Clock, Eye } from 'lucide-react';
import { Deal } from './DealPipelineModule';

const STAGES: { id: Deal['stage']; label: string; color: string; bg: string }[] = [
  { id: 'interest', label: 'Interest', color: '#6B7280', bg: '#F4F6F8' },
  { id: 'offer', label: 'Offer Made', color: '#2E75B6', bg: '#EFF6FF' },
  { id: 'negotiating', label: 'Negotiating', color: '#D35400', bg: '#FEF6EE' },
  { id: 'payment', label: 'Payment Received', color: '#1A7A4A', bg: '#F0FAF4' },
  { id: 'handover', label: 'Handover Scheduled', color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'completed', label: 'Completed', color: '#1E3A5F', bg: '#EFF6FF' },
];

const SCORE_COLOR = (s: number) => s >= 71 ? '#1A7A4A' : s >= 41 ? '#D35400' : '#C0392B';

interface Props { deals: Deal[]; onViewDeal: (deal: Deal) => void; }

export default function DealKanban({ deals, onViewDeal }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [localDeals, setLocalDeals] = useState<Deal[]>(deals);

  const handleDragStart = (id: string) => setDraggingId(id);
  const handleDragEnd = () => setDraggingId(null);

  const handleDrop = (stage: Deal['stage']) => {
    if (!draggingId) return;
    setLocalDeals(prev => prev.map(d => d.id === draggingId ? { ...d, stage, minutesInStage: 0 } : d));
    setDraggingId(null);
  };

  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60); const m = mins % 60;
    return `${h}h ${m > 0 ? `${m}m` : ''}`.trim();
  };

  const isOverdue = (deal: Deal) => deal.minutesInStage > deal.slaMins;
  const isWarning = (deal: Deal) => !isOverdue(deal) && deal.minutesInStage > deal.slaMins * 0.75;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#1F2937]">Deal Pipeline</h1>
          <p className="text-sm text-[#6B7280]">{localDeals.filter(d => d.stage !== 'completed').length} active deals · ₦{localDeals.reduce((a, d) => a + (d.agreedPrice || d.offerPrice), 0).toLocaleString()} total value</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs text-[#6B7280]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1A7A4A]" />On track</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D35400]" />Approaching SLA</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#C0392B]" />Overdue</span>
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
        {STAGES.map(stage => {
          const stageDeals = localDeals.filter(d => d.stage === stage.id);
          const totalValue = stageDeals.reduce((a, d) => a + (d.agreedPrice || d.offerPrice), 0);

          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-72 flex flex-col"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(stage.id)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-heading font-semibold text-[#1F2937]">{stage.label}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: stage.bg, color: stage.color }}>
                    {stageDeals.length}
                  </span>
                </div>
                {totalValue > 0 && (
                  <span className="text-[10px] text-[#6B7280] font-mono">₦{(totalValue / 1000000).toFixed(1)}M</span>
                )}
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-3 min-h-[120px]">
                {stageDeals.map(deal => {
                  const overdue = isOverdue(deal);
                  const warning = isWarning(deal);
                  const urgencyColor = overdue ? '#C0392B' : warning ? '#D35400' : '#1A7A4A';
                  const urgencyBg = overdue ? 'border-l-[#C0392B]' : warning ? 'border-l-[#D35400]' : 'border-l-[#1A7A4A]';

                  return (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => handleDragStart(deal.id)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white rounded-xl border border-[#E5E7EB] border-l-4 ${urgencyBg} p-4 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${draggingId === deal.id ? 'opacity-50 scale-95' : ''}`}
                    >
                      {/* Vehicle */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 bg-[#F4F6F8] rounded-lg border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-[#6B7280]">{deal.make[0]}{deal.model[0]}</span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#1F2937] leading-tight">{deal.vehicle}</p>
                            <p className="text-[10px] font-mono text-[#6B7280]">{deal.plate}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ color: SCORE_COLOR(deal.score), backgroundColor: `${SCORE_COLOR(deal.score)}15` }}>
                          {deal.score}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mb-3">
                        <p className="text-sm font-heading font-bold text-[#1F2937] tabular-nums">
                          ₦{(deal.agreedPrice || deal.offerPrice).toLocaleString()}
                        </p>
                        {deal.agreedPrice && deal.agreedPrice !== deal.listedPrice && (
                          <p className="text-[10px] text-[#6B7280] line-through">₦{deal.listedPrice.toLocaleString()}</p>
                        )}
                      </div>

                      {/* Buyer & Seller */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex -space-x-1.5">
                          <div className="w-6 h-6 rounded-full bg-[#1E3A5F] border-2 border-white flex items-center justify-center text-white text-[8px] font-bold z-10">{deal.buyerAvatar}</div>
                          <div className="w-6 h-6 rounded-full bg-[#2E75B6] border-2 border-white flex items-center justify-center text-white text-[8px] font-bold">{deal.sellerAvatar}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-[#6B7280] truncate">{deal.buyerName} → {deal.sellerName}</p>
                        </div>
                      </div>

                      {/* Agent & Time */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-[#D35400] flex items-center justify-center text-white text-[8px] font-bold">{deal.agentAvatar}</div>
                          <span className="text-[10px] text-[#6B7280]">{deal.agentName.split(' ')[0]}</span>
                        </div>
                        <div className="flex items-center gap-1" style={{ color: urgencyColor }}>
                          <Clock size={10} />
                          <span className="text-[10px] font-semibold">{deal.stage === 'completed' ? 'Done' : formatTime(deal.minutesInStage)}</span>
                        </div>
                      </div>

                      {/* View button */}
                      <button
                        onClick={() => onViewDeal(deal)}
                        className="mt-3 w-full py-1.5 border border-[#E5E7EB] text-[10px] font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] hover:text-[#1F2937] transition-all flex items-center justify-center gap-1"
                      >
                        <Eye size={11} /> View Deal
                      </button>
                    </div>
                  );
                })}

                {/* Empty column placeholder */}
                {stageDeals.length === 0 && (
                  <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-6 flex flex-col items-center justify-center text-center opacity-50">
                    <p className="text-xs text-[#6B7280]">No deals in this stage</p>
                    <p className="text-[10px] text-[#6B7280] mt-0.5">Drag a card here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
