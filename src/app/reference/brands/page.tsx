'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';

import { Plus, Search, Grid, List, Edit, Trash2, X } from 'lucide-react';

import { toast } from 'sonner';
import { referenceApi, carsApi } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';

export default function BrandsPage() {
  const pathname = usePathname();
  const { data: brands, setData: setBrands, loading, error, refresh } = useApiList(() => referenceApi.brands());
  const { data: models } = useApiList(() => referenceApi.models());
  const { data: cars } = useApiList(() => carsApi.list());
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newBrand, setNewBrand] = useState({ name: '', country: '', active: true });

  const filtered = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    if (!newBrand.name) { toast.error('Brand name is required'); return; }
    try {
      const created = await referenceApi.storeBrand(newBrand) as (typeof brands)[number];
      setBrands(prev => [...prev, {
        ...created,
        id: (created as { id?: string }).id || `b${Date.now()}`,
        name: newBrand.name,
        country: newBrand.country,
        flag: (created as { flag?: string }).flag || '🌍',
        models: (created as { models?: number }).models ?? 0,
        cars: (created as { cars?: number }).cars ?? 0,
        active: newBrand.active,
        logo: (created as { logo?: string }).logo || newBrand.name[0].toUpperCase(),
      }]);
      setShowAddModal(false);
      setNewBrand({ name: '', country: '', active: true });
      toast.success(`Brand "${newBrand.name}" added successfully`);
      void refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not add brand');
    }
  };

  const handleDelete = async (id: string) => {
    const brand = brands.find(b => b.id === id);
    if (!brand) return;
    const modelCount = models.filter(m => m.brandId === id).length;
    const carCount = cars.filter(c => c.brand === brand.name).length;
    if (modelCount > 0 || carCount > 0) {
      toast.error(`Cannot delete ${brand.name} — ${modelCount} model(s) and ${carCount} car(s) are linked`);
      setDeleteConfirm(null);
      return;
    }
    try {
      await referenceApi.deleteBrand(id);
      setBrands(prev => prev.filter(b => b.id !== id));
      setDeleteConfirm(null);
      toast.success('Brand deleted');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete brand');
    }
  };

  return (
    <AppLayout currentPath={pathname}>
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-heading font-semibold text-[#1F2937]">Add Brand</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8]"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Brand Name *</label>
                <input value={newBrand.name} onChange={e => setNewBrand(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Country</label>
                <input value={newBrand.country} onChange={e => setNewBrand(p => ({ ...p, country: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newBrand.active} onChange={e => setNewBrand(p => ({ ...p, active: e.target.checked }))} className="w-4 h-4 rounded" />
                <span className="text-sm text-[#1F2937]">Active</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F4F6F8] transition-colors">Cancel</button>
              <button onClick={handleAdd} className="flex-1 px-4 py-2.5 bg-[#ff5722] text-white rounded-lg text-sm font-semibold hover:bg-[#e64a19] transition-colors">Add Brand</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-fade-in">
            <h3 className="text-base font-heading font-semibold text-[#1F2937] mb-2">Delete brand?</h3>
            <p className="text-sm text-[#6B7280] mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-[#C0392B] text-white rounded-lg text-sm font-semibold hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Car Brands</h1>
            <p className="text-sm text-[#6B7280]">{filtered.length} brands in system</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#F4F6F8] rounded-lg p-1">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-[#6B7280]'}`}><Grid size={15} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-[#6B7280]'}`}><List size={15} /></button>
            </div>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all min-h-[44px]">
              <Plus size={16} /> Add Brand
            </button>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search brands…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filtered.map(brand => (
              <div key={brand.id} className="bg-white rounded-xl border border-[#E5E7EB] p-4 hover:shadow-md transition-all group relative">
                <div className="w-12 h-12 rounded-full bg-[#ff5722] flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                  {brand.logo}
                </div>
                <p className="text-sm font-semibold text-[#1F2937] text-center">{brand.name}</p>
                <p className="text-xs text-[#6B7280] text-center mt-0.5">{brand.flag} {brand.country}</p>
                <p className="text-xs text-[#9CA3AF] text-center mt-1">{brand.models} models · {brand.cars} cars</p>
                <div className={`mt-2 text-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${brand.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {brand.active ? 'Active' : 'Inactive'}
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <button onClick={() => toast.success(`Edit ${brand.name}`)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-[#E5E7EB] hover:bg-[#F4F6F8]">
                      <Edit size={12} className="text-[#6B7280]" />
                    </button>
                    <button onClick={() => setDeleteConfirm(brand.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-[#E5E7EB] hover:bg-red-50">
                      <Trash2 size={12} className="text-[#C0392B]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  {['Brand', 'Country', 'Models', 'Cars', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(brand => (
                  <tr key={brand.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-xs font-bold">{brand.logo}</div>
                        <span className="font-medium text-[#1F2937]">{brand.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">{brand.flag} {brand.country}</td>
                    <td className="px-4 py-3 text-[#1F2937]">{brand.models}</td>
                    <td className="px-4 py-3 text-[#1F2937]">{brand.cars}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${brand.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {brand.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toast.success(`Edit ${brand.name}`)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8]"><Edit size={14} className="text-[#6B7280]" /></button>
                        <button onClick={() => setDeleteConfirm(brand.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-[#C0392B]" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
