'use client';
import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, ChevronDown, Calculator, Info } from 'lucide-react';
import {
  brandOptionsByName,
  modelOptionsByName,
  yearOptionsForModelName,
} from '@/lib/reference/carCascade';

interface Props { onBack: () => void; }

const COMP_SALES = [
  { id: 'comp-1', vehicle: '2019 Toyota Camry', mileage: 72000, score: 79, price: 5100000, date: '28 Mar 2026', zone: 'Lekki' },
  { id: 'comp-2', vehicle: '2019 Toyota Camry', mileage: 65000, score: 84, price: 5350000, date: '15 Mar 2026', zone: 'VI' },
  { id: 'comp-3', vehicle: '2019 Toyota Camry', mileage: 81000, score: 71, price: 4900000, date: '02 Mar 2026', zone: 'Lagos Island' },
  { id: 'comp-4', vehicle: '2020 Toyota Camry', mileage: 48000, score: 88, price: 6200000, date: '20 Feb 2026', zone: 'Ikoyi' },
];

export default function PricingGuidanceTool({ onBack }: Props) {
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('Camry');
  const [year, setYear] = useState('2019');
  const [mileage, setMileage] = useState('68000');
  const [score, setScore] = useState('82');
  const [hasResult, setHasResult] = useState(false);

  const estimatedMin = 4800000;
  const estimatedMax = 5500000;
  const estimatedMid = Math.round((estimatedMin + estimatedMax) / 2);
  const askingPrice = 5200000;

  const pricePosition = ((askingPrice - estimatedMin) / (estimatedMax - estimatedMin)) * 100;
  const isAbove = askingPrice > estimatedMax;
  const isBelow = askingPrice < estimatedMin;
  const isFair = !isAbove && !isBelow;

  const handleEstimate = () => {
    if (!make || !model || !year || !mileage || !score) return;
    setHasResult(true);
  };

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors">
        <ArrowLeft size={16} /> Back to Listings
      </button>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#ff5722] flex items-center justify-center">
          <Calculator size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-heading font-bold text-[#1F2937]">Pricing Guidance Tool</h1>
          <p className="text-sm text-[#6B7280]">Estimate fair market value based on Carschek sales data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Input form */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Vehicle Details</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Make</label>
                <div className="relative">
                  <select
                    value={make}
                    onChange={e => { setMake(e.target.value); setModel(''); setYear(''); }}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] appearance-none bg-white transition-all"
                  >
                    <option value="">Select make…</option>
                    {brandOptionsByName().map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Model</label>
                <div className="relative">
                  <select
                    value={model}
                    onChange={e => { setModel(e.target.value); setYear(''); }}
                    disabled={!make}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] appearance-none bg-white transition-all disabled:opacity-50 disabled:bg-[#F9FAFB]"
                  >
                    <option value="">{make ? 'Select model…' : 'Select make first'}</option>
                    {modelOptionsByName(make).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Year</label>
                <div className="relative">
                  <select
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    disabled={!model}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] appearance-none bg-white transition-all disabled:opacity-50 disabled:bg-[#F9FAFB]"
                  >
                    <option value="">{model ? 'Select year…' : 'Select model first'}</option>
                    {yearOptionsForModelName(make, model).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Mileage (km)</label>
                <input type="number" value={mileage} onChange={e => setMileage(e.target.value)} placeholder="e.g. 68000" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Carschek Score (0–100)</label>
              <input type="number" min="0" max="100" value={score} onChange={e => setScore(e.target.value)} placeholder="e.g. 82" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] transition-all" />
              <p className="text-[10px] text-[#6B7280] mt-1">Higher score = better condition = higher estimated value</p>
            </div>
            <button
              onClick={handleEstimate}
              className="w-full py-3 bg-[#ff5722] text-white text-sm font-semibold rounded-xl hover:bg-[#e64a19] transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Calculator size={15} /> Estimate Market Price
            </button>
          </div>
        </div>

        {/* Result */}
        {hasResult ? (
          <div className="space-y-4">
            {/* Price range card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Estimated Market Value</h3>
                <span className="text-[10px] bg-blue-50 text-[#ff8a65] border border-blue-200 px-2 py-0.5 rounded-full font-semibold">Based on {COMP_SALES.length} recent sales</span>
              </div>

              <div className="text-center mb-5">
                <p className="text-3xl font-heading font-bold text-[#ff5722]">₦{estimatedMin.toLocaleString()} – ₦{estimatedMax.toLocaleString()}</p>
                <p className="text-sm text-[#6B7280] mt-1">Fair price range for {year} {make} {model}</p>
              </div>

              {/* Number line */}
              <div className="mb-5">
                <div className="flex justify-between text-[10px] text-[#6B7280] mb-1.5">
                  <span>Below Market</span>
                  <span>Fair Price Range</span>
                  <span>Above Market</span>
                </div>
                <div className="relative h-8 bg-[#F4F6F8] rounded-full overflow-hidden border border-[#E5E7EB]">
                  {/* Fair range highlight */}
                  <div className="absolute top-0 bottom-0 bg-green-100 border-x border-green-300" style={{ left: '25%', right: '25%' }} />
                  {/* Asking price marker */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-[#ff5722] rounded-full"
                    style={{ left: `${Math.min(Math.max(pricePosition * 0.5 + 25, 5), 95)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-[#1F2937]">₦{askingPrice.toLocaleString()} asking</span>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-[#6B7280] mt-1">
                  <span>₦{(estimatedMin * 0.85).toLocaleString()}</span>
                  <span className="text-[#1A7A4A] font-semibold">₦{estimatedMin.toLocaleString()} – ₦{estimatedMax.toLocaleString()}</span>
                  <span>₦{(estimatedMax * 1.15).toLocaleString()}</span>
                </div>
              </div>

              {/* Verdict */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${isFair ? 'bg-green-50 border-green-200' : isAbove ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                {isFair ? <TrendingUp size={18} className="text-[#1A7A4A]" /> : isAbove ? <TrendingUp size={18} className="text-[#D35400]" /> : <TrendingDown size={18} className="text-[#ff8a65]" />}
                <div>
                  <p className={`text-sm font-semibold ${isFair ? 'text-[#1A7A4A]' : isAbove ? 'text-[#D35400]' : 'text-[#ff8a65]'}`}>
                    {isFair ? '✓ Fair Price' : isAbove ? '⚠ Slightly Above Market' : '↓ Below Market Value'}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {isFair ? 'The asking price is within the fair market range.' : isAbove ?'Consider reducing price to attract more buyers.': 'This is a competitive price — likely to sell quickly.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Comparable sales */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
                <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Recent Comparable Sales</h3>
                <Info size={13} className="text-[#6B7280]" />
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F4F6F8] text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    <th className="px-4 py-3 text-left">Vehicle</th>
                    <th className="px-4 py-3 text-right">Mileage</th>
                    <th className="px-4 py-3 text-center">Score</th>
                    <th className="px-4 py-3 text-right">Sale Price</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F6F8]">
                  {COMP_SALES.map(comp => (
                    <tr key={comp.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-[#1F2937]">{comp.vehicle}</td>
                      <td className="px-4 py-3 text-right text-xs text-[#6B7280]">{comp.mileage.toLocaleString()} km</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold ${comp.score >= 71 ? 'text-[#1A7A4A]' : 'text-[#D35400]'}`}>{comp.score}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-[#1F2937] tabular-nums">₦{comp.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-[#6B7280] hidden sm:table-cell">{comp.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-10 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-[#F4F6F8] rounded-2xl flex items-center justify-center mb-4 border border-[#E5E7EB]">
              <Calculator size={24} className="text-[#6B7280]" />
            </div>
            <h3 className="text-base font-heading font-semibold text-[#1F2937] mb-1">Enter vehicle details</h3>
            <p className="text-sm text-[#6B7280] max-w-xs">Fill in the form and click "Estimate Market Price" to see the fair value range and comparable sales.</p>
          </div>
        )}
      </div>
    </div>
  );
}
