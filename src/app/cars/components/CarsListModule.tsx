'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Upload, Download, ChevronDown, X, Copy, MoreHorizontal, AlertTriangle, Diamond, CheckSquare, Square, ChevronLeft, ChevronRight, Settings2, Car, Trash2, Flag } from 'lucide-react';

const MOCK_CARS = [
  { id: 'CK-41', make: 'Toyota', model: 'Camry', year: 2011, transmission: 'Automatic', body: 'Sedan', colour: 'Silver', vin: 'JT2BF22K1W0123456', plate: 'LSD260JE', physicalStatus: 'At Buyer', purchaseChannel: 'Auction', purchasePrice: 5000000, purchaseDate: '2024-12-01', soldPrice: 5100000, margin: 1.96, score: 73, warnings: 2, duplicate: true, docs: { uploaded: 6, required: 8 }, createdAt: '02/12/2024', createdBy: 'Promise Ndem' },
  { id: 'CK-40', make: 'Honda', model: 'Accord', year: 2015, transmission: 'Automatic', body: 'Sedan', colour: 'Black', vin: '1HGCR2F3XFA123456', plate: 'ABJ441KA', physicalStatus: 'Listed', purchaseChannel: 'Market Place', purchasePrice: 6500000, purchaseDate: '2024-11-15', soldPrice: null, margin: null, score: 85, warnings: 0, duplicate: false, docs: { uploaded: 8, required: 8 }, createdAt: '15/11/2024', createdBy: 'Adaeze Mensah' },
  { id: 'CK-39', make: 'Mercedes-Benz', model: 'C300', year: 2018, transmission: 'Automatic', body: 'Sedan', colour: 'White', vin: 'WDDWF4KB0JR123456', plate: 'LND823GH', physicalStatus: 'Sold', purchaseChannel: 'B2B', purchasePrice: 18000000, purchaseDate: '2024-10-20', soldPrice: 19500000, margin: 8.33, score: 91, warnings: 0, duplicate: false, docs: { uploaded: 8, required: 8 }, createdAt: '20/10/2024', createdBy: 'Chukwuemeka Obi' },
  { id: 'CK-38', make: 'Toyota', model: 'Corolla', year: 2019, transmission: 'Manual', body: 'Sedan', colour: 'Blue', vin: '2T1BURHE0JC123456', plate: 'KJA112BC', physicalStatus: 'Acquired', purchaseChannel: 'Offline', purchasePrice: 4200000, purchaseDate: '2024-12-10', soldPrice: null, margin: null, score: null, warnings: 1, duplicate: false, docs: { uploaded: 2, required: 8 }, createdAt: '10/12/2024', createdBy: 'Promise Ndem' },
  { id: 'CK-37', make: 'Ford', model: 'Explorer', year: 2016, transmission: 'Automatic', body: 'SUV', colour: 'Red', vin: '1FM5K8D84GGA12345', plate: 'OYO334FE', physicalStatus: 'At Inspector', purchaseChannel: 'Auction', purchasePrice: 9800000, purchaseDate: '2024-11-28', soldPrice: null, margin: null, score: 62, warnings: 3, duplicate: false, docs: { uploaded: 5, required: 8 }, createdAt: '28/11/2024', createdBy: 'Fatima Bello' },
  { id: 'CK-36', make: 'Lexus', model: 'RX350', year: 2020, transmission: 'Automatic', body: 'SUV', colour: 'Pearl', vin: '2T2BZMCA8LC123456', plate: 'EKO991LS', physicalStatus: 'Listed', purchaseChannel: 'Market Place', purchasePrice: 28000000, purchaseDate: '2024-09-05', soldPrice: null, margin: null, score: 88, warnings: 0, duplicate: false, docs: { uploaded: 8, required: 8 }, createdAt: '05/09/2024', createdBy: 'Adaeze Mensah' },
  { id: 'CK-35', make: 'Hyundai', model: 'Tucson', year: 2017, transmission: 'Automatic', body: 'SUV', colour: 'Grey', vin: 'KM8J3CA46HU123456', plate: 'RVS220HY', physicalStatus: 'Cancelled', purchaseChannel: 'Offline', purchasePrice: 7500000, purchaseDate: '2024-08-14', soldPrice: null, margin: null, score: 55, warnings: 1, duplicate: false, docs: { uploaded: 4, required: 8 }, createdAt: '14/08/2024', createdBy: 'Chukwuemeka Obi' },
];

const STATUS_STYLES: Record<string, string> = {
  'Acquired': 'bg-[#1E3A5F] text-white',
  'At Inspector': 'bg-purple-100 text-purple-700',
  'At Buyer': 'bg-amber-100 text-amber-700',
  'Listed': 'bg-teal-100 text-teal-700',
  'Sold': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-red-100 text-red-700',
};

const SCORE_COLOR = (s: number | null) => {
  if (s === null) return 'bg-gray-100 text-gray-400';
  if (s >= 80) return 'bg-green-100 text-green-700';
  if (s >= 60) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

const formatNaira = (n: number) => `₦${n.toLocaleString()}`;

export default function CarsListModule() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [copiedVin, setCopiedVin] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [duplicateConfirm, setDuplicateConfirm] = useState<string | null>(null);
  const [showAuctionModal, setShowAuctionModal] = useState<string | null>(null);
  const [auctionPrice, setAuctionPrice] = useState('');
  const [platformFee, setPlatformFee] = useState(15);

  const filtered = MOCK_CARS.filter(c =>
    !search || [c.id, c.vin, c.plate, c.make, c.model].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleRow = (id: string) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  const toggleAll = () => setSelectedRows(selectedRows.length === filtered.length ? [] : filtered.map(c => c.id));

  const copyVin = (vin: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(vin);
    setCopiedVin(vin);
    setTimeout(() => setCopiedVin(null), 1500);
  };

  const handleMenuAction = (action: string, car: typeof MOCK_CARS[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenu(null);
    switch (action) {
      case 'view':
        router.push(`/cars/${car.id}`);
        break;
      case 'edit':
        router.push(`/cars/${car.id}?edit=true`);
        break;
      case 'inspection': router.push('/inspection-orders-management');
        break;
      case 'grade': router.push('/inspector-app');
        break;
      case 'auction':
        if (car.docs.uploaded >= 6) {
          setShowAuctionModal(car.id);
          setAuctionPrice('');
        }
        break;
      case 'marketplace':
        if (car.score !== null) {
          router.push('/vehicle-listings');
        }
        break;
      case 'duplicate':
        setDuplicateConfirm(car.id);
        break;
      case 'delete':
        setDeleteConfirm(car.id);
        break;
    }
  };

  const carForModal = (id: string | null) => MOCK_CARS.find(c => c.id === id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Cars</h1>
          <span className="bg-[#1E3A5F]/10 text-[#1E3A5F] text-sm font-semibold px-2.5 py-0.5 rounded-full">{MOCK_CARS.length} vehicles</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Upload size={15} /> Import CSV
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export
          </button>
          <a href="/cars/register" className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-semibold hover:bg-[#162d4a] transition-colors">
            <Plus size={15} /> Register New Car
          </a>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by VIN, plate, make, model..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
            />
          </div>
          {(['Brand', 'Model', 'Year', 'Status', 'Purchase Channel', 'Sales Channel'] as const).map(f => (
            <button key={f} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              {f} <ChevronDown size={13} />
            </button>
          ))}
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Date Range <ChevronDown size={13} />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Settings2 size={14} /> Columns
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedRows.length > 0 && (
        <div className="bg-[#1E3A5F] text-white rounded-xl px-4 py-3 flex items-center gap-4 shadow-lg">
          <span className="font-semibold text-sm">{selectedRows.length} car{selectedRows.length > 1 ? 's' : ''} selected</span>
          <div className="flex items-center gap-2 ml-2">
            {['Assign Inspector', 'Export Selected', 'Change Status'].map(a => (
              <button key={a} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors">{a}</button>
            ))}
            <button className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg text-xs font-medium transition-colors">Delete Selected</button>
          </div>
          <button onClick={() => setSelectedRows([])} className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors"><X size={16} /></button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 z-10">
              <tr>
                <th className="w-10 px-3 py-3">
                  <button onClick={toggleAll} className="text-gray-400 hover:text-[#1E3A5F]">
                    {selectedRows.length === filtered.length && filtered.length > 0 ? <CheckSquare size={16} className="text-[#1E3A5F]" /> : <Square size={16} />}
                  </button>
                </th>
                {['CK ID', 'Vehicle', 'VIN', 'Plate', 'Physical Status', 'Purchase', 'Sold', 'Score', 'Flags', 'Docs', 'Created', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Car size={28} className="text-gray-300" />
                      </div>
                      <p className="font-semibold text-gray-500">No cars found</p>
                      <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
                      <a href="/cars/register" className="mt-1 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-semibold hover:bg-[#162d4a] transition-colors">Register First Car</a>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(car => (
                <tr
                  key={car.id}
                  onClick={() => router.push(`/cars/${car.id}`)}
                  className={`group hover:bg-gray-50/80 hover:shadow-sm transition-all cursor-pointer ${car.duplicate ? 'border-l-2 border-amber-400' : ''} ${selectedRows.includes(car.id) ? 'bg-blue-50/40' : ''}`}
                >
                  <td className="px-3 py-3">
                    <button onClick={e => { e.stopPropagation(); toggleRow(car.id); }} className="text-gray-400 hover:text-[#1E3A5F]">
                      {selectedRows.includes(car.id) ? <CheckSquare size={16} className="text-[#1E3A5F]" /> : <Square size={16} />}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-xs font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md inline-block">{car.id}</span>
                      {car.duplicate && (
                        <span className="text-[10px] text-amber-600 flex items-center gap-0.5"><Diamond size={9} fill="currentColor" /> Possible duplicate</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-gray-800">{car.make} {car.model} {car.year}</p>
                    <p className="text-xs text-gray-400">{car.transmission} • {car.body} • {car.colour}</p>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-gray-600 truncate max-w-[100px]" title={car.vin}>{car.vin.slice(0, 10)}…</span>
                      <button onClick={e => copyVin(car.vin, e)} className="text-gray-300 hover:text-teal-600 transition-colors">
                        <Copy size={12} />
                      </button>
                      {copiedVin === car.vin && <span className="text-[10px] text-teal-600">Copied!</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-bold text-gray-700 font-mono text-xs">{car.plate}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[car.physicalStatus]}`}>{car.physicalStatus}</span>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-xs font-medium text-gray-700">{formatNaira(car.purchasePrice)}</p>
                    <p className="text-[10px] text-gray-400">{car.purchaseDate}</p>
                  </td>
                  <td className="px-3 py-3">
                    {car.soldPrice ? (
                      <>
                        <p className="text-xs font-medium text-gray-700">{formatNaira(car.soldPrice)}</p>
                        <p className={`text-[10px] font-semibold ${car.margin! > 0 ? 'text-green-600' : 'text-red-500'}`}>{car.margin}% margin</p>
                      </>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-3">
                    {car.score !== null ? (
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${SCORE_COLOR(car.score)}`}>{car.score}</span>
                    ) : (
                      <span className="text-[10px] text-gray-400">Not Graded</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      {car.warnings > 0 && (
                        <span className="flex items-center gap-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                          <AlertTriangle size={10} /> {car.warnings}
                        </span>
                      )}
                      {car.duplicate && (
                        <span className="bg-amber-50 text-amber-500 p-0.5 rounded">
                          <Diamond size={10} fill="currentColor" />
                        </span>
                      )}
                      {car.warnings === 0 && !car.duplicate && <span className="text-gray-300 text-xs">—</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${car.docs.uploaded >= car.docs.required ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {car.docs.uploaded}/{car.docs.required}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-[10px] text-gray-500">{car.createdAt}</p>
                    <p className="text-[10px] text-gray-400">{car.createdBy}</p>
                  </td>
                  <td className="px-3 py-3 relative" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === car.id ? null : car.id); }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenu === car.id && (
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1">
                        <button
                          onClick={e => handleMenuAction('view', car, e)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <Car size={14} className="text-gray-400" /> View Full Details
                        </button>
                        <button
                          onClick={e => handleMenuAction('edit', car, e)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <Settings2 size={14} className="text-gray-400" /> Edit Car
                        </button>
                        <button
                          onClick={e => handleMenuAction('inspection', car, e)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <Search size={14} className="text-gray-400" /> Link / View Inspection
                        </button>
                        <button
                          onClick={e => handleMenuAction('grade', car, e)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <AlertTriangle size={14} className="text-gray-400" /> Grade Car
                        </button>
                        <button
                          onClick={e => handleMenuAction('auction', car, e)}
                          disabled={car.docs.uploaded < 6}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${car.docs.uploaded < 6 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                          title={car.docs.uploaded < 6 ? 'Requires at least 6 documents' : ''}
                        >
                          <span className="text-gray-400 text-base leading-none">🔨</span> Start Auction
                          {car.docs.uploaded < 6 && <span className="ml-auto text-[10px] text-gray-300">Docs incomplete</span>}
                        </button>
                        <button
                          onClick={e => handleMenuAction('marketplace', car, e)}
                          disabled={car.score === null}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${car.score === null ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                          title={car.score === null ? 'Car must be graded first' : ''}
                        >
                          <span className="text-gray-400 text-base leading-none">🏪</span> Push to Marketplace
                          {car.score === null && <span className="ml-auto text-[10px] text-gray-300">Not graded</span>}
                        </button>
                        <button
                          onClick={e => handleMenuAction('duplicate', car, e)}
                          className="w-full text-left px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-2"
                        >
                          <Flag size={14} /> Mark as Duplicate
                        </button>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={e => handleMenuAction('delete', car, e)}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <span className="text-xs text-gray-500">Showing 1–{Math.min(perPage, filtered.length)} of {filtered.length} results</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              Per page:
              {[25, 50, 100].map(n => (
                <button key={n} onClick={() => setPerPage(n)} className={`px-2 py-1 rounded-md transition-colors ${perPage === n ? 'bg-[#1E3A5F] text-white' : 'hover:bg-gray-100'}`}>{n}</button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"><ChevronLeft size={15} /></button>
              {[1, 2].map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-[#1E3A5F] text-white' : 'hover:bg-gray-100 text-gray-600'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"><ChevronRight size={15} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Delete Car</h3>
                <p className="text-xs text-gray-500">{carForModal(deleteConfirm)?.id} — {carForModal(deleteConfirm)?.make} {carForModal(deleteConfirm)?.model}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">Are you sure you want to delete this car record? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Duplicate Modal */}
      {duplicateConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Flag size={18} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Mark as Duplicate</h3>
                <p className="text-xs text-gray-500">{carForModal(duplicateConfirm)?.id} — {carForModal(duplicateConfirm)?.make} {carForModal(duplicateConfirm)?.model}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">This will flag the car as a potential duplicate. You can link it to an existing record.</p>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Link to existing car (optional)</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="">Select a car...</option>
                {MOCK_CARS.filter(c => c.id !== duplicateConfirm).map(c => (
                  <option key={c.id} value={c.id}>{c.id} — {c.make} {c.model} {c.year}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDuplicateConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => setDuplicateConfirm(null)} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors">Mark as Duplicate</button>
            </div>
          </div>
        </div>
      )}

      {/* Start Auction Modal */}
      {showAuctionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#1E3A5F]">Start Auction</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {carForModal(showAuctionModal)?.make} {carForModal(showAuctionModal)?.model} {carForModal(showAuctionModal)?.year} — {showAuctionModal}
                  </p>
                </div>
                <button onClick={() => setShowAuctionModal(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 text-xl leading-none">×</button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Auction Starting Price (₦) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₦</span>
                  <input type="number" value={auctionPrice} onChange={e => setAuctionPrice(e.target.value)} placeholder="0" className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Platform Fee %</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {[1, 5, 10, 15, 20].map(f => (
                    <button key={f} onClick={() => setPlatformFee(f)} className={`flex-1 py-2 text-xs font-bold transition-colors ${platformFee === f ? 'bg-[#1E3A5F] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{f}%</button>
                  ))}
                </div>
                {auctionPrice && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">₦{parseInt(auctionPrice).toLocaleString()} × (1 - {platformFee}%) = <span className="font-bold text-[#1E3A5F]">₦{(parseInt(auctionPrice) * (1 - platformFee / 100)).toLocaleString()}</span></p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Amount after platform fee (visible to bidders)</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Auction End Date & Time</label>
                <input type="datetime-local" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20" />
              </div>
              {auctionPrice && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs font-bold text-amber-700 mb-1">Auction Summary</p>
                  <p className="text-xs text-amber-600">Starting Bid: ₦{parseInt(auctionPrice).toLocaleString()} | Platform Fee: {platformFee}% | Bidders See: ₦{(parseInt(auctionPrice) * (1 - platformFee / 100)).toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowAuctionModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Close</button>
              <button className="flex-1 py-2.5 border border-[#1E3A5F] text-[#1E3A5F] rounded-xl text-sm font-semibold hover:bg-[#1E3A5F]/5 transition-colors">Save Draft</button>
              <button
                onClick={() => { setShowAuctionModal(null); router.push('/auctions'); }}
                className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors"
              >
                Push to Auction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click-outside to close menus */}
      {openMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}
