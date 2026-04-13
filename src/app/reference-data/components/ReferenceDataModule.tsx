'use client';
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, X, MoreHorizontal, Upload } from 'lucide-react';
import { Brand, CarModel, CarYear } from '@/types/domain';

const MOCK_BRANDS: Brand[] = [
  { id: 'b1', name: 'Toyota', countryCode: 'JP', countryName: 'Japan', active: true, modelCount: 12, carCount: 34, createdAt: '2024-01-01', logoUrl: '' },
  { id: 'b2', name: 'Honda', countryCode: 'JP', countryName: 'Japan', active: true, modelCount: 8, carCount: 21, createdAt: '2024-01-01', logoUrl: '' },
  { id: 'b3', name: 'Mercedes-Benz', countryCode: 'DE', countryName: 'Germany', active: true, modelCount: 15, carCount: 18, createdAt: '2024-01-01', logoUrl: '' },
  { id: 'b4', name: 'Ford', countryCode: 'US', countryName: 'United States', active: true, modelCount: 9, carCount: 12, createdAt: '2024-01-01', logoUrl: '' },
  { id: 'b5', name: 'Lexus', countryCode: 'JP', countryName: 'Japan', active: true, modelCount: 7, carCount: 9, createdAt: '2024-01-01', logoUrl: '' },
  { id: 'b6', name: 'BMW', countryCode: 'DE', countryName: 'Germany', active: true, modelCount: 11, carCount: 15, createdAt: '2024-01-01', logoUrl: '' },
  { id: 'b7', name: 'Hyundai', countryCode: 'KR', countryName: 'South Korea', active: false, modelCount: 6, carCount: 7, createdAt: '2024-01-01', logoUrl: '' },
  { id: 'b8', name: 'Kia', countryCode: 'KR', countryName: 'South Korea', active: true, modelCount: 5, carCount: 4, createdAt: '2024-01-01', logoUrl: '' },
];

const MOCK_MODELS: CarModel[] = [
  { id: 'm1', brandId: 'b1', name: 'Camry', bodyTypes: ['Sedan'], active: true, carsInSystem: 12, createdAt: '2024-01-01' },
  { id: 'm2', brandId: 'b1', name: 'Corolla', bodyTypes: ['Sedan', 'Hatchback'], active: true, carsInSystem: 8, createdAt: '2024-01-01' },
  { id: 'm3', brandId: 'b1', name: 'Highlander', bodyTypes: ['SUV'], active: true, carsInSystem: 5, createdAt: '2024-01-01' },
  { id: 'm4', brandId: 'b2', name: 'Accord', bodyTypes: ['Sedan'], active: true, carsInSystem: 9, createdAt: '2024-01-01' },
  { id: 'm5', brandId: 'b2', name: 'CR-V', bodyTypes: ['SUV'], active: true, carsInSystem: 6, createdAt: '2024-01-01' },
  { id: 'm6', brandId: 'b3', name: 'C300', bodyTypes: ['Sedan'], active: true, carsInSystem: 4, createdAt: '2024-01-01' },
  { id: 'm7', brandId: 'b4', name: 'Explorer', bodyTypes: ['SUV'], active: true, carsInSystem: 3, createdAt: '2024-01-01' },
];

const MOCK_YEARS: CarYear[] = Array.from({ length: 20 }, (_, i) => ({
  year: 2024 - i, active: true, carsRegistered: Math.floor(Math.random() * 20), createdAt: '2024-01-01',
}));

type Section = 'brands' | 'models' | 'years';

const FLAG_MAP: Record<string, string> = { JP: '🇯🇵', DE: '🇩🇪', US: '🇺🇸', KR: '🇰🇷', GB: '🇬🇧', FR: '🇫🇷', IT: '🇮🇹', SE: '🇸🇪' };

export default function ReferenceDataModule() {
  const [section, setSection] = useState<Section>('brands');
  const [brands, setBrands] = useState<Brand[]>(MOCK_BRANDS);
  const [models] = useState<CarModel[]>(MOCK_MODELS);
  const [years, setYears] = useState<CarYear[]>(MOCK_YEARS);
  const [brandModal, setBrandModal] = useState<Brand | null | 'new'>(null);
  const [modelModal, setModelModal] = useState<CarModel | null | 'new'>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [newYear, setNewYear] = useState('');
  const [brandView, setBrandView] = useState<'grid' | 'list'>('grid');
  const [groupByBrand, setGroupByBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandCountry, setNewBrandCountry] = useState('');

  const filteredModels = models.filter(m => {
    const matchBrand = !brandFilter || m.brandId === brandFilter;
    const matchSearch = !modelSearch || m.name.toLowerCase().includes(modelSearch.toLowerCase());
    return matchBrand && matchSearch;
  });

  const addYear = () => {
    const y = parseInt(newYear);
    if (y >= 1990 && y <= new Date().getFullYear() && !years.find(yr => yr.year === y)) {
      setYears(prev => [{ year: y, active: true, carsRegistered: 0, createdAt: new Date().toISOString().split('T')[0] }, ...prev].sort((a, b) => b.year - a.year));
      setNewYear('');
    }
  };

  const addBatchYears = () => {
    const existing = new Set(years.map(y => y.year));
    const newYears: CarYear[] = [];
    for (let y = 1990; y <= 2024; y++) {
      if (!existing.has(y)) newYears.push({ year: y, active: true, carsRegistered: 0, createdAt: '2024-01-01' });
    }
    setYears(prev => [...prev, ...newYears].sort((a, b) => b.year - a.year));
  };

  const getBrandName = (id: string) => brands.find(b => b.id === id)?.name ?? id;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Reference Data</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Manage vehicle brands, models, and years used across the platform</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 bg-[#F4F6F8] p-1 rounded-xl w-fit">
        {(['brands','models','years'] as Section[]).map(s => (
          <button key={s} onClick={() => setSection(s)} className={`px-5 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${section === s ? 'bg-white text-[#1E3A5F] shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'}`}>{s}</button>
        ))}
      </div>

      {/* BRANDS */}
      {section === 'brands' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-heading font-bold text-[#1F2937]">Vehicle Brands</h2>
              <span className="bg-[#F4F6F8] text-[#6B7280] text-xs font-bold px-2.5 py-1 rounded-full">{brands.length} brands</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-[#E5E7EB] overflow-hidden">
                <button onClick={() => setBrandView('grid')} className={`px-3 py-1.5 text-xs font-semibold transition-all ${brandView === 'grid' ? 'bg-[#1E3A5F] text-white' : 'bg-white text-[#6B7280]'}`}>Grid</button>
                <button onClick={() => setBrandView('list')} className={`px-3 py-1.5 text-xs font-semibold transition-all ${brandView === 'list' ? 'bg-[#1E3A5F] text-white' : 'bg-white text-[#6B7280]'}`}>List</button>
              </div>
              <button onClick={() => setBrandModal('new')} className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">
                <Plus size={15} /> Add Brand
              </button>
            </div>
          </div>

          {brandView === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {brands.map(brand => (
                <div key={brand.id} className="bg-white rounded-xl border border-[#E5E7EB] p-4 hover:border-[#1E3A5F]/30 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-[#F4F6F8] rounded-full flex items-center justify-center text-lg font-bold text-[#1E3A5F]">
                      {brand.name.charAt(0)}
                    </div>
                    <div className="relative group">
                      <button className="p-1.5 rounded-lg hover:bg-[#F4F6F8] text-[#9CA3AF]"><MoreHorizontal size={14} /></button>
                      <div className="absolute right-0 top-7 z-10 w-36 bg-white rounded-xl shadow-xl border border-[#E5E7EB] py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                        <button onClick={() => setBrandModal(brand)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#374151] hover:bg-[#F4F6F8]"><Edit size={12} /> Edit</button>
                        <button onClick={() => setDeleteConfirm(brand.id)} className={`w-full flex items-center gap-2 px-3 py-2 text-xs ${brand.carCount > 0 ? 'text-[#9CA3AF] cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`} disabled={brand.carCount > 0}><Trash2 size={12} /> Delete</button>
                      </div>
                    </div>
                  </div>
                  <p className="font-bold text-[#1F2937] text-sm">{brand.name}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{brand.modelCount} models • {brand.carCount} cars</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{FLAG_MAP[brand.countryCode] ?? '🌍'} {brand.countryName}</p>
                  <div className="mt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${brand.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{brand.active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <tr>
                    {['Brand','Models','Cars','Country','Status','Created','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {brands.map(brand => (
                    <tr key={brand.id} className="hover:bg-[#F8FAFC] transition-all">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#F4F6F8] rounded-full flex items-center justify-center text-xs font-bold text-[#1E3A5F]">{brand.name.charAt(0)}</div>
                          <span className="font-semibold text-[#1F2937]">{brand.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#374151]">{brand.modelCount}</td>
                      <td className="px-4 py-3 text-[#374151]">{brand.carCount}</td>
                      <td className="px-4 py-3 text-[#374151]">{FLAG_MAP[brand.countryCode] ?? '🌍'} {brand.countryName}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${brand.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{brand.active ? 'Active' : 'Inactive'}</span></td>
                      <td className="px-4 py-3 text-xs text-[#9CA3AF]">{brand.createdAt}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setBrandModal(brand)} className="p-1.5 rounded-lg hover:bg-[#F4F6F8] text-[#6B7280]"><Edit size={13} /></button>
                          <button onClick={() => setDeleteConfirm(brand.id)} disabled={brand.carCount > 0} className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Cross-reference callout */}
          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#374151] mb-2">How brands are used:</p>
            <div className="flex flex-wrap gap-3 text-xs text-[#6B7280]">
              <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-lg">Car Registration → Brand dropdown</span>
              <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-lg">Car List filters</span>
              <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-lg">Reports & Analytics</span>
            </div>
          </div>
        </div>
      )}

      {/* MODELS */}
      {section === 'models' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-heading font-bold text-[#1F2937]">Car Models</h2>
              <span className="bg-[#F4F6F8] text-[#6B7280] text-xs font-bold px-2.5 py-1 rounded-full">{models.length} models</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setGroupByBrand(g => !g)} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${groupByBrand ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'bg-white text-[#6B7280] border-[#E5E7EB]'}`}>
                Group by Brand
              </button>
              <button className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] text-sm font-medium text-[#6B7280] rounded-lg hover:bg-[#F4F6F8]">
                <Upload size={14} /> Import CSV
              </button>
              <button onClick={() => setModelModal('new')} className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">
                <Plus size={15} /> Add Model
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input value={modelSearch} onChange={e => setModelSearch(e.target.value)} placeholder="Search models..." className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
            </div>
            <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none bg-white text-[#374151]">
              <option value="">All Brands</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  {['Model Name','Brand','Body Type','Cars in System','Active','Created','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filteredModels.map(model => (
                  <tr key={model.id} className="hover:bg-[#F8FAFC] transition-all">
                    <td className="px-4 py-3 font-semibold text-[#1F2937]">{model.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#F4F6F8] rounded-full flex items-center justify-center text-[10px] font-bold text-[#1E3A5F]">{getBrandName(model.brandId).charAt(0)}</div>
                        <span className="text-sm text-[#374151]">{getBrandName(model.brandId)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {model.bodyTypes.map(bt => <span key={bt} className="text-[10px] font-semibold px-2 py-0.5 bg-[#F4F6F8] text-[#6B7280] rounded-full">{bt}</span>)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#374151]">{model.carsInSystem}</td>
                    <td className="px-4 py-3">
                      <button className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${model.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${model.active ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#9CA3AF]">{model.createdAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModelModal(model)} className="p-1.5 rounded-lg hover:bg-[#F4F6F8] text-[#6B7280]"><Edit size={13} /></button>
                        <button disabled={model.carsInSystem > 0} className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#374151] mb-2">How models are used:</p>
            <div className="flex flex-wrap gap-3 text-xs text-[#6B7280]">
              <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-lg">Car Registration → Model dropdown (filtered by Brand)</span>
              <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-lg">Car List filters</span>
            </div>
          </div>
        </div>
      )}

      {/* YEARS */}
      {section === 'years' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-heading font-bold text-[#1F2937]">Car Years</h2>
              <span className="bg-[#F4F6F8] text-[#6B7280] text-xs font-bold px-2.5 py-1 rounded-full">{years.length} years</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={addBatchYears} className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] text-sm font-medium text-[#6B7280] rounded-lg hover:bg-[#F4F6F8]">
                Add years 1990–2024
              </button>
            </div>
          </div>

          {/* Inline add */}
          <div className="flex items-center gap-3">
            <input
              value={newYear}
              onChange={e => setNewYear(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addYear()}
              placeholder="Enter year (e.g. 2025)"
              maxLength={4}
              className="px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] w-48"
            />
            <button onClick={addYear} className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">
              <Plus size={15} /> Add Year
            </button>
            <span className="text-xs text-[#9CA3AF]">Press Enter to add</span>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  {['Year','Active','Cars Registered','Created','Delete'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {years.map(yr => (
                  <tr key={yr.year} className="hover:bg-[#F8FAFC] transition-all">
                    <td className="px-4 py-3">
                      <span className="text-lg font-bold text-[#1F2937]">{yr.year}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setYears(prev => prev.map(y => y.year === yr.year ? { ...y, active: !y.active } : y))}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${yr.active ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${yr.active ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-[#374151] font-semibold">{yr.carsRegistered}</td>
                    <td className="px-4 py-3 text-xs text-[#9CA3AF]">{yr.createdAt}</td>
                    <td className="px-4 py-3">
                      <button
                        disabled={yr.carsRegistered > 0}
                        onClick={() => setYears(prev => prev.filter(y => y.year !== yr.year))}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        title={yr.carsRegistered > 0 ? `Cannot delete — ${yr.carsRegistered} cars registered` : 'Delete year'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#374151] mb-2">How years are used:</p>
            <div className="flex flex-wrap gap-3 text-xs text-[#6B7280]">
              <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-lg">Car Registration → Year dropdown</span>
              <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-lg">Car List filters</span>
              <span className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-lg">Market analytics</span>
            </div>
          </div>
        </div>
      )}

      {/* Brand Modal */}
      {brandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-[#1F2937]">{brandModal === 'new' ? 'Add Brand' : 'Edit Brand'}</h2>
              <button onClick={() => setBrandModal(null)} className="p-2 rounded-lg hover:bg-[#F4F6F8] text-[#6B7280]"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Brand Name *</label>
                <input defaultValue={brandModal !== 'new' ? brandModal.name : ''} value={newBrandName} onChange={e => setNewBrandName(e.target.value)} placeholder="e.g. Toyota" className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Country of Origin</label>
                <select value={newBrandCountry} onChange={e => setNewBrandCountry(e.target.value)} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none bg-white">
                  <option value="">Select country...</option>
                  {[['JP','🇯🇵 Japan'],['DE','🇩🇪 Germany'],['US','🇺🇸 United States'],['KR','🇰🇷 South Korea'],['GB','🇬🇧 United Kingdom'],['FR','🇫🇷 France'],['IT','🇮🇹 Italy'],['SE','🇸🇪 Sweden']].map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Logo</label>
                <label className="flex items-center gap-2 p-3 border-2 border-dashed border-[#D1D5DB] rounded-lg cursor-pointer hover:border-[#1E3A5F] transition-all">
                  <Upload size={16} className="text-[#9CA3AF]" />
                  <span className="text-sm text-[#6B7280]">Upload logo (1:1 ratio)</span>
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setBrandModal(null)} className="flex-1 py-2.5 border border-[#E5E7EB] text-sm font-semibold text-[#374151] rounded-xl hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={() => setBrandModal(null)} className="flex-1 py-2.5 bg-[#1E3A5F] text-white text-sm font-bold rounded-xl hover:bg-[#16304F]">Save Brand</button>
            </div>
          </div>
        </div>
      )}

      {/* Model Modal */}
      {modelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-[#1F2937]">{modelModal === 'new' ? 'Add Model' : 'Edit Model'}</h2>
              <button onClick={() => setModelModal(null)} className="p-2 rounded-lg hover:bg-[#F4F6F8] text-[#6B7280]"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Brand *</label>
                <select className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none bg-white">
                  <option value="">Select brand...</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Model Name *</label>
                <input defaultValue={modelModal !== 'new' ? modelModal.name : ''} placeholder="e.g. Camry" className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2">Body Type</label>
                <div className="flex flex-wrap gap-2">
                  {['Sedan','SUV','Hatchback','Pickup','Van','Convertible','Bus','Other'].map(bt => (
                    <button key={bt} className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${modelModal !== 'new' && modelModal.bodyTypes.includes(bt) ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#1E3A5F]'}`}>{bt}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModelModal(null)} className="flex-1 py-2.5 border border-[#E5E7EB] text-sm font-semibold text-[#374151] rounded-xl hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={() => setModelModal(null)} className="flex-1 py-2.5 bg-[#1E3A5F] text-white text-sm font-bold rounded-xl hover:bg-[#16304F]">Save Model</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-heading font-bold text-[#1F2937]">Confirm Delete</h2>
            {(() => {
              const brand = brands.find(b => b.id === deleteConfirm);
              if (brand && (brand.modelCount > 0 || brand.carCount > 0)) {
                return <p className="text-sm text-[#6B7280]">Cannot delete <strong>{brand.name}</strong> — {brand.modelCount} models and {brand.carCount} cars are linked. Remove all models and cars first, or reassign them.</p>;
              }
              return <p className="text-sm text-[#6B7280]">Are you sure you want to delete this brand? This action cannot be undone.</p>;
            })()}
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-[#E5E7EB] text-sm font-semibold text-[#374151] rounded-xl hover:bg-[#F4F6F8]">Cancel</button>
              {(() => {
                const brand = brands.find(b => b.id === deleteConfirm);
                if (!brand || brand.modelCount > 0 || brand.carCount > 0) return null;
                return <button onClick={() => { setBrands(prev => prev.filter(b => b.id !== deleteConfirm)); setDeleteConfirm(null); }} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700">Delete</button>;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Upload({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}
