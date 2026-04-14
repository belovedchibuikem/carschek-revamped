'use client';
import React, { useState } from 'react';
import { Plus, MoreHorizontal, X, Upload, ChevronDown, ChevronRight, Eye, Edit2, Trash2, Power } from 'lucide-react';

const MOCK_BRANDS = [
  { id: 1, name: 'Toyota', country: '🇯🇵 Japan', models: 12, cars: 34, active: true },
  { id: 2, name: 'Honda', country: '🇯🇵 Japan', models: 8, cars: 21, active: true },
  { id: 3, name: 'Mercedes-Benz', country: '🇩🇪 Germany', models: 15, cars: 18, active: true },
  { id: 4, name: 'Ford', country: '🇺🇸 USA', models: 9, cars: 12, active: true },
  { id: 5, name: 'Lexus', country: '🇯🇵 Japan', models: 7, cars: 9, active: true },
  { id: 6, name: 'Hyundai', country: '🇰🇷 South Korea', models: 6, cars: 7, active: true },
  { id: 7, name: 'BMW', country: '🇩🇪 Germany', models: 11, cars: 14, active: true },
  { id: 8, name: 'Kia', country: '🇰🇷 South Korea', models: 5, cars: 4, active: false },
];

const MOCK_MODELS = [
  { id: 1, name: 'Camry', brand: 'Toyota', bodyType: 'Sedan', cars: 15, active: true },
  { id: 2, name: 'Corolla', brand: 'Toyota', bodyType: 'Sedan', cars: 12, active: true },
  { id: 3, name: 'Accord', brand: 'Honda', bodyType: 'Sedan', cars: 9, active: true },
  { id: 4, name: 'Civic', brand: 'Honda', bodyType: 'Sedan', cars: 7, active: true },
  { id: 5, name: 'C300', brand: 'Mercedes-Benz', bodyType: 'Sedan', cars: 6, active: true },
  { id: 6, name: 'GLE', brand: 'Mercedes-Benz', bodyType: 'SUV', cars: 4, active: true },
  { id: 7, name: 'Explorer', brand: 'Ford', bodyType: 'SUV', cars: 5, active: true },
  { id: 8, name: 'RX350', brand: 'Lexus', bodyType: 'SUV', cars: 8, active: true },
];

const MOCK_YEARS = Array.from({ length: 20 }, (_, i) => ({
  year: 2024 - i,
  cars: Math.floor(Math.random() * 20),
  active: true,
}));

type Tab = 'brands' | 'models' | 'years';

export default function ReferenceDataModule() {
  const [activeTab, setActiveTab] = useState<Tab>('brands');
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [newYear, setNewYear] = useState('');
  const [years, setYears] = useState(MOCK_YEARS);
  const [groupByBrand, setGroupByBrand] = useState(false);
  const [brandFilter, setBrandFilter] = useState('All Brands');
  const [collapsedBrands, setCollapsedBrands] = useState<string[]>([]);
  const [openBrandMenu, setOpenBrandMenu] = useState<number | null>(null);
  const [openModelMenu, setOpenModelMenu] = useState<number | null>(null);

  const addYear = () => {
    const y = parseInt(newYear);
    if (y >= 1990 && y <= 2025 && !years.find(yr => yr.year === y)) {
      setYears(prev => [{ year: y, cars: 0, active: true }, ...prev].sort((a, b) => b.year - a.year));
      setNewYear('');
    }
  };

  const toggleBrandCollapse = (brand: string) => {
    setCollapsedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const filteredModels = brandFilter === 'All Brands' ? MOCK_MODELS : MOCK_MODELS.filter(m => m.brand === brandFilter);
  const brandGroups = [...new Set(filteredModels.map(m => m.brand))];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1E3A5F]">Reference Data</h1>
      </div>

      {/* Tab Nav */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex border-b border-gray-100 px-4">
          {([['brands', 'Vehicle Brands'], ['models', 'Car Models'], ['years', 'Car Years']] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === id ? 'text-[#1E3A5F] border-b-2 border-[#1E3A5F]' : 'text-gray-500 hover:text-gray-700'}`}>{label}</button>
          ))}
        </div>

        <div className="p-5">
          {/* BRANDS */}
          {activeTab === 'brands' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-[#1E3A5F]">Vehicle Brands</h2>
                  <span className="bg-[#1E3A5F]/10 text-[#1E3A5F] text-xs font-semibold px-2 py-0.5 rounded-full">{MOCK_BRANDS.length}</span>
                </div>
                <button onClick={() => setShowBrandModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-semibold hover:bg-[#162d4a] transition-colors">
                  <Plus size={14} /> Add Brand
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {MOCK_BRANDS.map(brand => (
                  <div key={brand.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-400">
                        {brand.name[0]}
                      </div>
                      <div className="relative">
                        <button
                          onClick={e => { e.stopPropagation(); setOpenBrandMenu(openBrandMenu === brand.id ? null : brand.id); }}
                          className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                        {openBrandMenu === brand.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1">
                            <button
                              onClick={() => setOpenBrandMenu(null)}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <Eye size={14} className="text-gray-400" /> View Details
                            </button>
                            <button
                              onClick={() => setOpenBrandMenu(null)}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <Edit2 size={14} className="text-gray-400" /> Edit Brand
                            </button>
                            <button
                              onClick={() => setOpenBrandMenu(null)}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <Power size={14} className="text-gray-400" /> {brand.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <hr className="my-1 border-gray-100" />
                            <button
                              onClick={() => setOpenBrandMenu(null)}
                              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                              <Trash2 size={14} /> Delete Brand
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-gray-800 text-sm">{brand.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{brand.models} models • {brand.cars} cars</p>
                    <p className="text-xs text-gray-400 mt-0.5">{brand.country}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${brand.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-[10px] text-gray-400">{brand.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODELS */}
          {activeTab === 'models' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-[#1E3A5F]">Car Models</h2>
                  <span className="bg-[#1E3A5F]/10 text-[#1E3A5F] text-xs font-semibold px-2 py-0.5 rounded-full">{MOCK_MODELS.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option>All Brands</option>
                    {[...new Set(MOCK_MODELS.map(m => m.brand))].map(b => <option key={b}>{b}</option>)}
                  </select>
                  <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={groupByBrand} onChange={e => setGroupByBrand(e.target.checked)} className="rounded" />
                    Group by Brand
                  </label>
                  <button onClick={() => setShowModelModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-semibold hover:bg-[#162d4a] transition-colors">
                    <Plus size={14} /> Add Model
                  </button>
                </div>
              </div>

              {groupByBrand ? (
                <div className="space-y-3">
                  {brandGroups.map(brand => (
                    <div key={brand} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button onClick={() => toggleBrandCollapse(brand)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <span className="font-semibold text-sm text-[#1E3A5F]">{brand}</span>
                        {collapsedBrands.includes(brand) ? <ChevronRight size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                      </button>
                      {!collapsedBrands.includes(brand) && (
                        <table className="w-full text-sm">
                          <tbody className="divide-y divide-gray-50">
                            {filteredModels.filter(m => m.brand === brand).map(model => (
                              <tr key={model.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-2.5 font-medium text-gray-800">{model.name}</td>
                                <td className="px-4 py-2.5"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{model.bodyType}</span></td>
                                <td className="px-4 py-2.5 text-xs text-gray-500">{model.cars} cars</td>
                                <td className="px-4 py-2.5"><div className={`w-8 h-4 rounded-full transition-colors ${model.active ? 'bg-green-400' : 'bg-gray-200'}`} /></td>
                                <td className="px-4 py-2.5 relative">
                                  <button
                                    onClick={e => { e.stopPropagation(); setOpenModelMenu(openModelMenu === model.id ? null : model.id); }}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <MoreHorizontal size={14} />
                                  </button>
                                  {openModelMenu === model.id && (
                                    <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1">
                                      <button onClick={() => setOpenModelMenu(null)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                        <Edit2 size={14} className="text-gray-400" /> Edit Model
                                      </button>
                                      <button onClick={() => setOpenModelMenu(null)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                        <Power size={14} className="text-gray-400" /> {model.active ? 'Deactivate' : 'Activate'}
                                      </button>
                                      <hr className="my-1 border-gray-100" />
                                      <button onClick={() => setOpenModelMenu(null)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                                        <Trash2 size={14} /> Delete Model
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden border border-gray-100 rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Model Name', 'Brand', 'Body Type', 'Cars in System', 'Active', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredModels.map(model => (
                        <tr key={model.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-800">{model.name}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400">{model.brand[0]}</div>
                              <span className="text-sm text-gray-600">{model.brand}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{model.bodyType}</span></td>
                          <td className="px-4 py-3 text-gray-600">{model.cars}</td>
                          <td className="px-4 py-3">
                            <div className={`w-8 h-4 rounded-full cursor-pointer transition-colors ${model.active ? 'bg-green-400' : 'bg-gray-200'}`} />
                          </td>
                          <td className="px-4 py-3 relative">
                            <button
                              onClick={e => { e.stopPropagation(); setOpenModelMenu(openModelMenu === model.id ? null : model.id); }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <MoreHorizontal size={14} />
                            </button>
                            {openModelMenu === model.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1">
                                <button onClick={() => setOpenModelMenu(null)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                  <Edit2 size={14} className="text-gray-400" /> Edit Model
                                </button>
                                <button onClick={() => setOpenModelMenu(null)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                  <Power size={14} className="text-gray-400" /> {model.active ? 'Deactivate' : 'Activate'}
                                </button>
                                <hr className="my-1 border-gray-100" />
                                <button onClick={() => setOpenModelMenu(null)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                                  <Trash2 size={14} /> Delete Model
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* YEARS */}
          {activeTab === 'years' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-[#1E3A5F]">Car Years</h2>
                  <span className="bg-[#1E3A5F]/10 text-[#1E3A5F] text-xs font-semibold px-2 py-0.5 rounded-full">{years.length}</span>
                </div>
                <button onClick={() => {
                  const batch = Array.from({ length: 35 }, (_, i) => ({ year: 2024 - i, cars: 0, active: true }));
                  setYears(batch);
                }} className="text-xs text-[#1E3A5F] hover:underline">Add years 1990–2024</button>
              </div>

              {/* Inline Add */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newYear}
                  onChange={e => setNewYear(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addYear()}
                  placeholder="e.g. 2025"
                  min={1990}
                  max={2025}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
                />
                <button onClick={addYear} className="flex items-center gap-1.5 px-3 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-semibold hover:bg-[#162d4a] transition-colors">
                  <Plus size={14} /> Add Year
                </button>
                <span className="text-xs text-gray-400">Press Enter to add</span>
              </div>

              <div className="overflow-hidden border border-gray-100 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Year', 'Active', 'Cars Registered', 'Delete'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {years.slice(0, 20).map(yr => (
                      <tr key={yr.year} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-gray-800 text-base">{yr.year}</td>
                        <td className="px-4 py-3">
                          <div className={`w-8 h-4 rounded-full cursor-pointer transition-colors ${yr.active ? 'bg-green-400' : 'bg-gray-200'}`} />
                        </td>
                        <td className="px-4 py-3 text-gray-600">{yr.cars}</td>
                        <td className="px-4 py-3">
                          <button
                            disabled={yr.cars > 0}
                            title={yr.cars > 0 ? `Cannot delete — ${yr.cars} cars registered` : 'Delete year'}
                            className={`text-xs px-2 py-1 rounded-md transition-colors ${yr.cars > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cross-reference callout */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-xs font-bold text-blue-700 mb-2">How these are used</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-blue-600">
          <p><span className="font-semibold">Brand:</span> Car Registration → Brand dropdown | Car List filters | Reports</p>
          <p><span className="font-semibold">Model:</span> Car Registration → Model dropdown (filtered by Brand) | Car List filters</p>
          <p><span className="font-semibold">Year:</span> Car Registration → Year dropdown | Car List filters | Market analytics</p>
        </div>
      </div>

      {/* Add Brand Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#1E3A5F]">Add Brand</h3>
              <button onClick={() => setShowBrandModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Brand Name *</label>
                <input type="text" placeholder="e.g. Toyota" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Logo</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-xs text-gray-400 hover:border-[#1E3A5F]/30 transition-colors cursor-pointer">
                  <Upload size={16} className="mx-auto mb-1" />
                  Drag & drop or click to upload
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Country of Origin</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option>🇯🇵 Japan</option><option>🇩🇪 Germany</option><option>🇺🇸 USA</option><option>🇰🇷 South Korea</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" /> Active
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowBrandModal(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => setShowBrandModal(false)} className="flex-1 py-2 bg-[#1E3A5F] text-white rounded-xl text-sm font-bold hover:bg-[#162d4a] transition-colors">Save Brand</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Model Modal */}
      {showModelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#1E3A5F]">Add Car Model</h3>
              <button onClick={() => setShowModelModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Brand *</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="">Select brand...</option>
                  {MOCK_BRANDS.map(b => <option key={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Model Name *</label>
                <input type="text" placeholder="e.g. Camry" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Body Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Convertible', 'Bus', 'Other'].map(b => (
                    <button key={b} className="px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition-colors">{b}</button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" /> Active
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModelModal(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => setShowModelModal(false)} className="flex-1 py-2 bg-[#1E3A5F] text-white rounded-xl text-sm font-bold hover:bg-[#162d4a] transition-colors">Save Model</button>
            </div>
          </div>
        </div>
      )}

      {/* Click-outside to close menus */}
      {(openBrandMenu || openModelMenu) && (
        <div className="fixed inset-0 z-10" onClick={() => { setOpenBrandMenu(null); setOpenModelMenu(null); }} />
      )}
    </div>
  );
}
