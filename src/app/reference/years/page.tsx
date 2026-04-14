'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';

import { Plus, Search, X } from 'lucide-react';
import { MODELS, BRANDS, YEARS, CARS, formatNaira, getScoreColor } from '@/lib/mockData';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function YearsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [years, setYears] = useState(YEARS);
  const [newYear, setNewYear] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [batchModal, setBatchModal] = useState(false);
  const [batchStart, setBatchStart] = useState('1990');
  const [batchEnd, setBatchEnd] = useState('2025');

  const filteredBrands = BRANDS.filter(b => b.active && b.name.toLowerCase().includes(brandSearch.toLowerCase()));
  const filteredModels = MODELS.filter(m => m.brandId === selectedBrand && m.name.toLowerCase().includes(modelSearch.toLowerCase()));

  const selectedBrandData = BRANDS.find(b => b.id === selectedBrand);
  const selectedModelData = MODELS.find(m => m.id === selectedModel);

  const carsForModel = selectedModel ? CARS.filter(c => {
    const model = MODELS.find(m => m.id === selectedModel);
    return model && c.model === model.name;
  }) : [];

  const addYear = () => {
    let y = parseInt(newYear);
    if (!y || y < 1900 || y > 2030) { toast.error('Enter a valid year (1900–2030)'); return; }
    if (years.find(yr => yr.year === y)) { toast.error('Year already exists'); return; }
    setYears(prev => [{ id: `y${Date.now()}`, year: y, active: true, cars: 0 }, ...prev].sort((a, b) => b.year - a.year));
    setNewYear('');
    toast.success(`Year ${y} added`);
  };

  const addBatch = () => {
    const start = parseInt(batchStart);
    const end = parseInt(batchEnd);
    if (start > end) { toast.error('Start year must be less than end year'); return; }
    const newYears = [];
    for (let y = start; y <= end; y++) {
      if (!years.find(yr => yr.year === y)) {
        newYears.push({ id: `y${Date.now()}-${y}`, year: y, active: true, cars: 0 });
      }
    }
    setYears(prev => [...prev, ...newYears].sort((a, b) => b.year - a.year));
    setBatchModal(false);
    toast.success(`Added ${newYears.length} years (${start}–${end})`);
  };

  const toggleYear = (id: string) => {
    setYears(prev => prev.map(y => y.id === id ? { ...y, active: !y.active } : y));
  };

  const handleYearSelect = (year: number) => {
    if (!selectedBrand || !selectedModel) { toast.error('Please select a brand and model first'); return; }
    toast.success(`Opening registration for ${selectedBrandData?.name} ${selectedModelData?.name} ${year}`);
    router.push(`/cars/new?brand=${selectedBrand}&model=${selectedModel}&year=${year}`);
  };

  const avgScore = carsForModel.length > 0 ? Math.round(carsForModel.reduce((s, c) => s + c.score, 0) / carsForModel.length) : 0;
  const avgPrice = carsForModel.length > 0 ? Math.round(carsForModel.reduce((s, c) => s + c.purchasePrice, 0) / carsForModel.length) : 0;

  return (
    <AppLayout currentPath={pathname}>
      {batchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setBatchModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-heading font-semibold text-[#1F2937]">Add Years in Batch</h3>
              <button onClick={() => setBatchModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8]"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">From Year</label>
                <input type="number" value={batchStart} onChange={e => setBatchStart(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">To Year</label>
                <input type="number" value={batchEnd} onChange={e => setBatchEnd(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
              </div>
            </div>
            <p className="text-xs text-[#6B7280] mb-4">Will add {Math.max(0, parseInt(batchEnd) - parseInt(batchStart) + 1)} years</p>
            <div className="flex gap-3">
              <button onClick={() => setBatchModal(false)} className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={addBatch} className="flex-1 px-4 py-2.5 bg-[#1E3A5F] text-white rounded-lg text-sm font-semibold hover:bg-[#16304F]">Add Years</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Car Years & Quick Registration</h1>
            <p className="text-sm text-[#6B7280]">Manage years and register cars in under 60 seconds</p>
          </div>
          <button onClick={() => setBatchModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">
            <Plus size={16} /> Add Years Batch
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Year list */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h2 className="text-base font-heading font-semibold text-[#1F2937] mb-4">Year Management</h2>
            <div className="flex gap-2 mb-4">
              <input type="number" value={newYear} onChange={e => setNewYear(e.target.value)} onKeyDown={e => e.key === 'Enter' && addYear()}
                placeholder="Enter year (e.g. 2026)" className="flex-1 px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
              <button onClick={addYear} className="px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">Add</button>
            </div>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {years.slice(0, 20).map(y => (
                <div key={y.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#F4F6F8] transition-colors">
                  <span className="text-base font-bold text-[#1F2937]">{y.year}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#6B7280]">{y.cars} cars</span>
                    <button onClick={() => toggleYear(y.id)}
                      className={`w-10 h-5 rounded-full transition-all relative ${y.active ? 'bg-[#1A7A4A]' : 'bg-[#E5E7EB]'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${y.active ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Registration */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h2 className="text-base font-heading font-semibold text-[#1F2937] mb-1">Quick Car Registration</h2>
            <p className="text-xs text-[#6B7280] mb-4">Select Brand → Model → Year to register in under 60 seconds</p>
            <div className="grid grid-cols-3 gap-3 h-64">
              {/* Column 1: Brands */}
              <div className="flex flex-col">
                <div className="relative mb-2">
                  <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input value={brandSearch} onChange={e => setBrandSearch(e.target.value)} placeholder="Search…"
                    className="w-full pl-7 pr-2 py-1.5 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2E75B6]/30" />
                </div>
                <div className="flex-1 overflow-y-auto space-y-0.5">
                  {filteredBrands.map(b => (
                    <button key={b.id} onClick={() => { setSelectedBrand(b.id); setSelectedModel(null); }}
                      className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-all ${selectedBrand === b.id ? 'bg-[#1E3A5F] text-white' : 'hover:bg-[#F4F6F8] text-[#1F2937]'}`}>
                      {b.logo} {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Column 2: Models */}
              <div className="flex flex-col">
                <div className="relative mb-2">
                  <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input value={modelSearch} onChange={e => setModelSearch(e.target.value)} placeholder="Search…"
                    className="w-full pl-7 pr-2 py-1.5 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2E75B6]/30" />
                </div>
                <div className="flex-1 overflow-y-auto space-y-0.5">
                  {!selectedBrand ? (
                    <p className="text-xs text-[#9CA3AF] text-center mt-4">Select brand first</p>
                  ) : filteredModels.map(m => (
                    <button key={m.id} onClick={() => setSelectedModel(m.id)}
                      className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-all ${selectedModel === m.id ? 'bg-[#1E3A5F] text-white' : 'hover:bg-[#F4F6F8] text-[#1F2937]'}`}>
                      {m.name}
                      <span className="block text-[10px] opacity-60">{m.bodyTypes[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Column 3: Years */}
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-[#374151] mb-2">Year</p>
                <div className="flex-1 overflow-y-auto">
                  {!selectedModel ? (
                    <p className="text-xs text-[#9CA3AF] text-center mt-4">Select model first</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-1">
                      {years.filter(y => y.active).slice(0, 20).map(y => (
                        <button key={y.id} onClick={() => handleYearSelect(y.year)}
                          className="relative py-1.5 text-xs font-semibold bg-[#F4F6F8] hover:bg-[#1E3A5F] hover:text-white rounded-lg transition-all text-[#1F2937]">
                          {y.year}
                          {y.cars > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2E75B6] text-white text-[9px] rounded-full flex items-center justify-center">{y.cars}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats bar */}
            {selectedModel && carsForModel.length > 0 && (
              <div className="mt-4 p-3 bg-[#F4F6F8] rounded-xl">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-[#1F2937]">{carsForModel.length}</p>
                    <p className="text-[10px] text-[#6B7280]">Cars in system</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: getScoreColor(avgScore) }}>{avgScore}</p>
                    <p className="text-[10px] text-[#6B7280]">Avg score</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1F2937]">{formatNaira(avgPrice)}</p>
                    <p className="text-[10px] text-[#6B7280]">Avg price</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
