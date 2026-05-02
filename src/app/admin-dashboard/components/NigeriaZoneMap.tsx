'use client';
import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

const ZONES = [
  { id: 'zone-lagos', name: 'Lagos', x: 18, y: 68, inspections: 187, avgScore: 76, radius: 28 },
  { id: 'zone-abuja', name: 'Abuja', x: 52, y: 45, inspections: 94, avgScore: 81, radius: 20 },
  { id: 'zone-ph', name: 'Port Harcourt', x: 42, y: 72, inspections: 61, avgScore: 68, radius: 16 },
  { id: 'zone-ibadan', name: 'Ibadan', x: 24, y: 58, inspections: 48, avgScore: 72, radius: 14 },
  { id: 'zone-kano', name: 'Kano', x: 54, y: 22, inspections: 32, avgScore: 65, radius: 12 },
];

function getScoreColor(score: number) {
  if (score >= 75) return '#1A7A4A';
  if (score >= 60) return '#D35400';
  return '#C0392B';
}

export default function NigeriaZoneMap() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={18} className="text-[#ff8a65]" />
        <h2 className="text-base font-heading font-semibold text-[#1F2937]">Geographic Activity</h2>
      </div>

      <div className="relative bg-[#F4F6F8] rounded-xl overflow-hidden" style={{ height: '220px' }}>
        {/* Simplified Nigeria outline as background text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[#E5E7EB] text-6xl font-bold opacity-30 select-none">🇳🇬</div>
        </div>
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          {ZONES.map(z => {
            const color = getScoreColor(z.avgScore);
            const isHovered = hovered === z.id;
            return (
              <g key={z.id} onMouseEnter={() => setHovered(z.id)} onMouseLeave={() => setHovered(null)}>
                <circle
                  cx={z.x} cy={z.y} r={z.radius / 4}
                  fill={color} fillOpacity={isHovered ? 0.7 : 0.4}
                  stroke={color} strokeWidth="0.5"
                  className="cursor-pointer transition-all duration-150"
                />
                <text x={z.x} y={z.y + z.radius / 4 + 3} textAnchor="middle" fontSize="3" fill="#1F2937" fontWeight="600">
                  {z.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hovered && (() => {
          const z = ZONES.find(z => z.id === hovered);
          if (!z) return null;
          return (
            <div className="absolute top-3 right-3 bg-white border border-[#E5E7EB] rounded-lg shadow-md p-3 text-xs min-w-[140px]">
              <p className="font-semibold text-[#1F2937] mb-2">{z.name}</p>
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-[#6B7280]">Inspections</span>
                  <span className="font-semibold tabular-nums">{z.inspections}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#6B7280]">Avg Score</span>
                  <span className="font-semibold tabular-nums" style={{ color: getScoreColor(z.avgScore) }}>{z.avgScore}/100</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs">
        {[{ color: '#1A7A4A', label: 'Score ≥75' }, { color: '#D35400', label: '60–74' }, { color: '#C0392B', label: '<60' }].map(l => (
          <div key={`legend-${l.label}`} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
            <span className="text-[#6B7280]">{l.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {ZONES.map(z => (
          <div key={`zone-stat-${z.id}`} className="text-center">
            <p className="text-[10px] font-semibold text-[#1F2937] truncate">{z.name}</p>
            <p className="text-xs font-bold tabular-nums text-[#ff8a65]">{z.inspections}</p>
            <p className="text-[9px] text-[#6B7280]">inspections</p>
          </div>
        ))}
      </div>
    </div>
  );
}