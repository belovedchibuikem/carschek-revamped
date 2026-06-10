'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';

import { Plus, Search, X, Filter } from 'lucide-react';
import { MODELS, BRANDS } from '@/lib/mockData';
import { toast } from 'sonner';

export default function ModelsPage() {
  const pathname = usePathname();
  const [models, setModels] = useState(MODELS);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [groupByBrand, setGroupByBrand] = useState(false);
  const [newModel, setNewModel] = useState({ brandId: '', name: '', bodyTypes: [] as string[], active: true });

  const BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Convertible', 'Bus'];

  const filtered = models.filter(m => {
    const q = search.toLowerCase();
    return (!q || m.name.toLowerCase().includes(q) || m.brandName.toLowerCase().includes(q)) &&
      (!brandFilter || m.brandId === brandFilter);
  });

  const handleAdd = () => {
    if (!newModel.brandId || !newModel.name) { toast.error('Brand and model name are required'); return; }
    const brand = BRANDS.find(b => b.id === newModel.brandId);
    const model = { id: `m${Date.now()}`, brandId: newModel.brandId, brandName: brand?.name || '', name: newModel.name, bodyTypes: newModel.bodyTypes, cars: 0, active: newModel.active, yearFrom: 1990, yearTo: new Date().getFullYear() };
    setModels(prev => [...prev, model]);
    setShowAddModal(false);
    setNewModel({ brandId: '', name: '', bodyTypes: [], active: true });
    toast.success(`Model "${newModel.name}" added`);
  };

  const toggleBodyType = (bt: string) => {
    setNewModel(prev => ({
      ...prev,
      bodyTypes: prev.bodyTypes.includes(bt) ? prev.bodyTypes.filter(x => x !== bt) : [...prev.bodyTypes, bt],
    }));
  };

  const groupedModels = BRANDS.map(b => ({
    brand: b,
    models: filtered.filter(m => m.brandId === b.id),
  })).filter(g => g.models.length > 0);

  return (
    <AppLayout currentPath={pathname}>
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-heading font-semibold text-[#1F2937]">Add Model</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8]"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Brand *</label>
                <select value={newModel.brandId} onChange={e => setNewModel(p => ({ ...p, brandId: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30">
                  <option value="">Select brand…</option>
                  {BRANDS.filter(b => b.active).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Model Name *</label>
                <input value={newModel.name} onChange={e => setNewModel(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-2">Body Types</label>
                <div className="flex flex-wrap gap-2">
                  {BODY_TYPES.map(bt => (
                    <button key={bt} onClick={() => toggleBodyType(bt)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${newModel.bodyTypes.includes(bt) ? 'bg-[#ff5722] text-white border-[#ff5722]' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#ff8a65]'}`}>
                      {bt}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newModel.active} onChange={e => setNewModel(p => ({ ...p, active: e.target.checked }))} className="w-4 h-4 rounded" />
                <span className="text-sm text-[#1F2937]">Active</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={handleAdd} className="flex-1 px-4 py-2.5 bg-[#ff5722] text-white rounded-lg text-sm font-semibold hover:bg-[#e64a19]">Add Model</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Car Models</h1>
            <p className="text-sm text-[#6B7280]">{filtered.length} models in system</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setGroupByBrand(g => !g)}
              className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm font-medium transition-colors ${groupByBrand ? 'bg-[#ff5722] text-white border-[#ff5722]' : 'border-[#E5E7EB] text-[#6B7280] hover:bg-[#F4F6F8]'}`}>
              <Filter size={14} /> Group by Brand
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all min-h-[44px]">
              <Plus size={16} /> Add Model
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search models…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
          </div>
          <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30">
            <option value="">All Brands</option>
            {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          {groupByBrand ? (
            <div>
              {groupedModels.map(g => (
                <div key={g.brand.id}>
                  <div className="px-4 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-xs font-bold">{g.brand.logo}</div>
                    <span className="text-sm font-semibold text-[#1F2937]">{g.brand.name}</span>
                    <span className="text-xs text-[#6B7280]">{g.models.length} models</span>
                  </div>
                  {g.models.map(m => (
                    <div key={m.id} className="flex items-center gap-4 px-4 py-3 border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                      <span className="text-sm font-medium text-[#1F2937] flex-1">{m.name}</span>
                      <div className="flex gap-1">
                        {m.bodyTypes.map(bt => <span key={bt} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{bt}</span>)}
                      </div>
                      <span className="text-xs text-[#6B7280]">{m.cars} cars</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{m.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  {['Model', 'Brand', 'Body Types', 'Cars', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1F2937]">{m.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-[10px] font-bold">
                          {BRANDS.find(b => b.id === m.brandId)?.logo}
                        </div>
                        <span className="text-[#6B7280]">{m.brandName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {m.bodyTypes.map(bt => <span key={bt} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{bt}</span>)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">{m.cars}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {m.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
