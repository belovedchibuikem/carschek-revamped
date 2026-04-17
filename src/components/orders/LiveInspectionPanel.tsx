'use client';

import React, { useEffect, useState } from 'react';
import { Activity, MessageSquare, Radio } from 'lucide-react';
import { toast } from 'sonner';

const SECTIONS = ['Engine Bay', 'Body Frame', 'Underbody', 'Electrical', 'Interior'];

type LiveState = {
  section: string;
  pct: number;
  defects: number;
  elapsedSec: number;
};

export default function LiveInspectionPanel({ orderId }: { orderId: string }) {
  const [live, setLive] = useState<LiveState>({
    section: 'Engine Bay',
    pct: 34,
    defects: 2,
    elapsedSec: 1240,
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const tick = window.setInterval(() => {
      setLive(prev => ({
        ...prev,
        pct: Math.min(99, prev.pct + Math.floor(Math.random() * 3)),
        defects: prev.defects + (Math.random() > 0.85 ? 1 : 0),
        elapsedSec: prev.elapsedSec + 15,
        section: SECTIONS[Math.min(SECTIONS.length - 1, Math.floor(prev.pct / 20))] ?? prev.section,
      }));
    }, 15000);
    return () => window.clearInterval(tick);
  }, [orderId]);

  const mm = Math.floor(live.elapsedSec / 60);
  const ss = live.elapsedSec % 60;

  return (
    <div className="bg-gradient-to-br from-[#1E3A5F] to-[#16304F] rounded-xl border border-[#2E75B6]/30 p-5 text-white shadow-lg">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1A7A4A]" />
          </span>
          <span className="text-sm font-semibold">Inspector is active</span>
        </div>
        <span className="text-xs font-mono text-white/80">
          {String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')} elapsed
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wide text-white/60 mb-1">Current section</p>
          <p className="text-sm font-bold flex items-center gap-1.5">
            <Radio size={14} className="text-[#2E75B6]" />
            {live.section}
          </p>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wide text-white/60 mb-1">Completion</p>
          <p className="text-lg font-bold tabular-nums">{live.pct}%</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 col-span-2">
          <p className="text-[10px] uppercase tracking-wide text-white/60 mb-1">Defects logged</p>
          <p className="text-sm font-semibold flex items-center gap-1.5">
            <Activity size={14} className="text-amber-300" />
            {live.defects} items flagged
          </p>
        </div>
      </div>
      <p className="text-[10px] text-white/50 mb-2 font-mono">Live sync · order {orderId} · polls every 15s (mock)</p>
      <div className="flex gap-2">
        <input
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="Message to inspector…"
          className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/15 border border-white/20 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#2E75B6]"
        />
        <button
          type="button"
          onClick={() => {
            if (!msg.trim()) {
              toast.error('Enter a message');
              return;
            }
            toast.success('Message queued for inspector');
            setMsg('');
          }}
          className="shrink-0 px-3 py-2 rounded-lg bg-[#D35400] text-white text-sm font-semibold hover:bg-orange-700 flex items-center gap-1.5"
        >
          <MessageSquare size={16} />
          Send
        </button>
      </div>
    </div>
  );
}
