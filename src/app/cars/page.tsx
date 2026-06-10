'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckSquare,
  Square,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Car,
  Settings2,
  X,
} from 'lucide-react';
import { CARS, formatNaira, STATUS_COLORS } from '@/lib/mockData';
import { CircularScoreProgress } from '@/components/shared/CircularScoreProgress';
import { toast } from 'sonner';
import { downloadCsv } from '@/lib/csv';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTableHotkeys } from '@/hooks/useTableHotkeys';
import { FilterPresetBar } from '@/components/shared/FilterPresetBar';
import { InlineSelectCell, InlineNumberCell } from '@/components/shared/InlineEdit';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import DuplicateResolutionModal, { carToDuplicateSnapshot } from '@/components/cars/DuplicateResolutionModal';
import AuctionSetupModal from '@/app/cars/components/AuctionSetupModal';

const PIPELINE_STAGES = ['Acquired', 'Inspection Linked', 'At Buyer', 'Listed', 'Sold'];
const CHANNELS = ['Auction', 'Market Place', 'Offline', 'B2B', 'Other'];

type CarRow = (typeof CARS)[number];

type ColKey =
  | 'ckId' |'vehicle' |'plate' |'status' |'purchase' |'sales' |'score' |'docs' |'vin' |'year' |'channel' |'created' |'warnings';

const ALL_COLUMNS: { key: ColKey; label: string; defaultOn: boolean }[] = [
  { key: 'ckId', label: 'CK ID', defaultOn: true },
  { key: 'vehicle', label: 'Vehicle', defaultOn: true },
  { key: 'plate', label: 'Plate', defaultOn: true },
  { key: 'status', label: 'Status Pipeline', defaultOn: true },
  { key: 'purchase', label: 'Purchase', defaultOn: true },
  { key: 'sales', label: 'Sales', defaultOn: true },
  { key: 'score', label: 'Score', defaultOn: true },
  { key: 'docs', label: 'Docs', defaultOn: true },
  { key: 'vin', label: 'VIN', defaultOn: false },
  { key: 'year', label: 'Year', defaultOn: false },
  { key: 'channel', label: 'Channel', defaultOn: false },
  { key: 'created', label: 'Created', defaultOn: false },
  { key: 'warnings', label: 'Warnings', defaultOn: false },
];

type SortKey = 'id' | 'vehicle' | 'plate' | 'created' | 'score';

function parseDate(s: string) {
  const t = Date.parse(s);
  return Number.isNaN(t) ? 0 : t;
}

function findDuplicateMatch(car: CarRow): CarRow | null {
  const other = CARS.find(c => c.id !== car.id && (c.vin === car.vin || c.hasDuplicate));
  return other ?? CARS.find(c => c.id !== car.id) ?? null;
}

function CarsPageInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cars, setCars] = useState(CARS);
  // Filters initialise from the URL so views are shareable; changes write back below.
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') ?? '');
  const [brandFilter, setBrandFilter] = useState(() => searchParams.get('brand') ?? '');
  const [modelFilter, setModelFilter] = useState(() => searchParams.get('model') ?? '');
  const [yearFilter, setYearFilter] = useState(() => searchParams.get('year') ?? '');
  const [channelFilter, setChannelFilter] = useState(() => searchParams.get('channel') ?? '');
  const [dateFrom, setDateFrom] = useState(() => searchParams.get('from') ?? '');
  const [dateTo, setDateTo] = useState(() => searchParams.get('to') ?? '');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CarRow | null>(null);
  const [duplicateFor, setDuplicateFor] = useState<CarRow | null>(null);
  const [auctionModalCar, setAuctionModalCar] = useState<CarRow | null>(null);
  const [columnPanel, setColumnPanel] = useState(false);
  const [visibleCols, setVisibleCols] = useState<Record<ColKey, boolean>>(() => {
    const o = {} as Record<ColKey, boolean>;
    ALL_COLUMNS.forEach(c => {
      o[c.key] = c.defaultOn;
    });
    return o;
  });

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const brandOptions = useMemo(() => [...new Set(cars.map(c => c.brand))].sort(), [cars]);
  const modelOptions = useMemo(() => {
    const list = brandFilter ? cars.filter(c => c.brand === brandFilter) : cars;
    return [...new Set(list.map(c => c.model))].sort();
  }, [cars, brandFilter]);
  // Year options cascade off brand/model: only years of matching inventory
  const yearOptions = useMemo(() => {
    let list = cars;
    if (brandFilter) list = list.filter(c => c.brand === brandFilter);
    if (modelFilter) list = list.filter(c => c.model === modelFilter);
    return [...new Set(list.map(c => String(c.year)))].sort((a, b) => Number(b) - Number(a));
  }, [cars, brandFilter, modelFilter]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(k);
      setSortDir('asc');
    }
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, brandFilter, modelFilter, yearFilter, channelFilter, dateFrom, dateTo]);

  const presetParams = useMemo(
    () => ({
      q: debouncedSearch,
      status: statusFilter,
      brand: brandFilter,
      model: modelFilter,
      year: yearFilter,
      channel: channelFilter,
      from: dateFrom,
      to: dateTo,
    }),
    [debouncedSearch, statusFilter, brandFilter, modelFilter, yearFilter, channelFilter, dateFrom, dateTo]
  );

  // One-way write: filters → URL (state never re-reads it, so no loop)
  useEffect(() => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(presetParams)) {
      if (v) p.set(k, v);
    }
    const qs = p.toString();
    const current = window.location.search.replace(/^\?/, '');
    if (qs === current) return;
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [presetParams, pathname, router]);

  const applyPreset = useCallback((params: Record<string, string>) => {
    setSearch(params.q ?? '');
    setStatusFilter(params.status ?? '');
    setBrandFilter(params.brand ?? '');
    setModelFilter(params.model ?? '');
    setYearFilter(params.year ?? '');
    setChannelFilter(params.channel ?? '');
    setDateFrom(params.from ?? '');
    setDateTo(params.to ?? '');
    setPage(1);
  }, []);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return cars.filter(c => {
      const matchSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.plate.toLowerCase().includes(q) ||
        c.vin.toLowerCase().includes(q);
      const matchStatus = !statusFilter || c.status === statusFilter;
      const matchBrand = !brandFilter || c.brand === brandFilter;
      const matchModel = !modelFilter || c.model === modelFilter;
      const matchYear = !yearFilter || String(c.year) === yearFilter;
      const matchChannel = !channelFilter || c.channel === channelFilter;
      const t = parseDate(c.createdAt);
      const fromOk = !dateFrom || t >= parseDate(dateFrom);
      const toOk = !dateTo || t <= parseDate(dateTo + 'T23:59:59');
      return matchSearch && matchStatus && matchBrand && matchModel && matchYear && matchChannel && fromOk && toOk;
    });
  }, [cars, debouncedSearch, statusFilter, brandFilter, modelFilter, yearFilter, channelFilter, dateFrom, dateTo]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const list = [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'id':
          cmp = a.id.localeCompare(b.id);
          break;
        case 'vehicle':
          cmp = `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
          break;
        case 'plate':
          cmp = a.plate.localeCompare(b.plate);
          break;
        case 'created':
          cmp = parseDate(a.createdAt) - parseDate(b.createdAt);
          break;
        case 'score':
          cmp = a.score - b.score;
          break;
        default:
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const isFiltering = search !== debouncedSearch;
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const pageClamped = Math.min(page, totalPages);
  const paginated = sorted.slice((pageClamped - 1) * perPage, pageClamped * perPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  const toggleAll = () =>
    setSelectedIds(selectedIds.length === paginated.length ? [] : paginated.map(c => c.id));

  const removeCar = (id: string) => setCars(prev => prev.filter(c => c.id !== id));

  const handleDelete = (row: CarRow) => {
    removeCar(row.id);
    setDeleteConfirm(null);
    toast.success(`Car ${row.id} deleted successfully`);
  };

  const exportCSV = () => {
    const rows: (string | number)[][] = [
      ['CK ID', 'Brand', 'Model', 'Year', 'Plate', 'Status', 'Score', 'Purchase Price', 'Sale Price', 'Channel', 'Created'],
    ];
    filtered.forEach(c =>
      rows.push([
        c.id,
        c.brand,
        c.model,
        c.year,
        c.plate,
        c.status,
        c.score,
        c.purchasePrice,
        c.salePrice ?? '',
        c.channel,
        c.createdAt,
      ])
    );
    downloadCsv('cars-export.csv', rows);
    toast.success('CSV exported successfully');
  };

  // ── Inline edits (optimistic, with undo) ────────────────────────────────

  const updateCarInline = useCallback((id: string, label: string, mutate: (c: CarRow) => CarRow) => {
    setCars(prev => {
      const before = prev.find(c => c.id === id);
      if (!before) return prev;
      toast.success(`${id}: ${label}`, {
        duration: 10_000,
        action: {
          label: 'Undo',
          onClick: () => {
            setCars(cur => cur.map(c => (c.id === id ? before : c)));
            toast.message('Reverted');
          },
        },
      });
      return prev.map(c => (c.id === id ? mutate(c) : c));
    });
  }, []);

  const exportSelectedCSV = () => {
    const rows: (string | number)[][] = [
      ['CK ID', 'Brand', 'Model', 'Year', 'Plate', 'Status', 'Score', 'Purchase Price', 'Sale Price', 'Channel', 'Created'],
    ];
    cars
      .filter(c => selectedIds.includes(c.id))
      .forEach(c =>
        rows.push([c.id, c.brand, c.model, c.year, c.plate, c.status, c.score, c.purchasePrice, c.salePrice ?? '', c.channel, c.createdAt])
      );
    downloadCsv('cars-selection-export.csv', rows);
    toast.success(`Exported ${selectedIds.length} selected car(s)`);
    setSelectedIds([]);
  };

  const handleBulkStatusChange = (status: string) => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setCars(prev => {
      const snapshot = prev.filter(c => ids.includes(c.id));
      toast.success(`Status → ${status} — ${ids.length} car(s)`, {
        duration: 30_000,
        action: {
          label: 'Undo',
          onClick: () => {
            setCars(cur => cur.map(c => snapshot.find(s => s.id === c.id) ?? c));
            toast.message('Reverted');
          },
        },
      });
      return prev.map(c => (ids.includes(c.id) ? { ...c, status: status as CarRow['status'] } : c));
    });
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    const ids = [...selectedIds];
    const removed = cars.filter(c => ids.includes(c.id));
    setCars(prev => prev.filter(c => !ids.includes(c.id)));
    setSelectedIds([]);
    toast.success(`${ids.length} car(s) removed`, {
      duration: 30_000,
      action: {
        label: 'Undo',
        onClick: () => {
          setCars(prev => {
            const next = [...prev];
            for (const r of removed) {
              if (!next.some(c => c.id === r.id)) next.push(r);
            }
            return next;
          });
          toast.message('Restored');
        },
      },
    });
  };

  const menuNavigate = (path: string) => {
    router.push(path);
    setOpenMenu(null);
  };

  const duplicateMatchCount = (car: CarRow) =>
    cars.filter(c => c.id !== car.id && (c.vin === car.vin || c.plate === car.plate)).length;

  const activeColCount = ALL_COLUMNS.filter(c => visibleCols[c.key]).length;

  // ── Keyboard navigation (j/k move, Enter open, e edit) ──────────────────
  const hotkeysEnabled = !deleteConfirm && !duplicateFor && !auctionModalCar && !columnPanel && !openMenu && !isFiltering;
  const { activeIndex } = useTableHotkeys({
    rowCount: paginated.length,
    enabled: hotkeysEnabled,
    onOpen: i => {
      const car = paginated[i];
      if (car) router.push(`/cars/${car.id}`);
    },
    onEdit: i => {
      const car = paginated[i];
      if (car) router.push(`/cars/${car.id}?edit=1`);
    },
  });

  const renderCell = (car: CarRow, key: ColKey) => {
    switch (key) {
      case 'ckId':
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-[#ff5722]">{car.id}</span>
            {car.hasDuplicate && (
              <button
                type="button"
                title="Potential duplicate"
                onClick={e => {
                  e.stopPropagation();
                  setDuplicateFor(car);
                }}
                className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-amber-800 hover:bg-amber-200"
              >
                <AlertTriangle size={12} />
              </button>
            )}
          </div>
        );
      case 'vehicle':
        return (
          <div>
            <p className="font-medium text-[#1F2937]">
              {car.brand} {car.model}
            </p>
            <p className="text-xs text-[#6B7280]">
              {car.year} · {car.colour}
            </p>
          </div>
        );
      case 'plate':
        return <span className="font-mono text-xs text-[#6B7280]">{car.plate}</span>;
      case 'status':
        return (
          <InlineSelectCell
            value={car.status}
            options={PIPELINE_STAGES.map(s => ({ value: s, label: s }))}
            onCommit={v => updateCarInline(car.id, `Status → ${v}`, c => ({ ...c, status: v as CarRow['status'] }))}
            ariaLabel={`status for ${car.id}`}
          >
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[car.status] || 'bg-gray-100 text-gray-700'}`}>
              {car.status}
            </span>
          </InlineSelectCell>
        );
      case 'purchase':
        return <span className="text-sm text-[#1F2937] font-medium">{formatNaira(car.purchasePrice)}</span>;
      case 'sales':
        return (
          <InlineNumberCell
            value={car.salePrice ?? null}
            onCommit={v => updateCarInline(car.id, `Sale price → ${formatNaira(v)}`, c => ({ ...c, salePrice: v }))}
            ariaLabel={`sale price for ${car.id}`}
          >
            <span className="text-sm text-[#6B7280]">{car.salePrice ? formatNaira(car.salePrice) : '—'}</span>
          </InlineNumberCell>
        );
      case 'score':
        return <CircularScoreProgress score={car.score} size={56} />;
      case 'docs':
        return (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${car.docs >= 6 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {car.docs}/8
          </span>
        );
      case 'vin':
        return <span className="font-mono text-[10px] text-[#6B7280] max-w-[120px] truncate block">{car.vin}</span>;
      case 'year':
        return <span className="text-sm text-[#1F2937]">{car.year}</span>;
      case 'channel':
        return <span className="text-xs text-[#374151]">{car.channel}</span>;
      case 'created':
        return <span className="text-xs text-[#6B7280] whitespace-nowrap">{car.createdAt}</span>;
      case 'warnings':
        return car.warnings > 0 ? (
          <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-semibold">{car.warnings}⚠</span>
        ) : (
          <span className="text-xs text-[#9CA3AF]">—</span>
        );
      default:
        return null;
    }
  };

  const sortableHeader = (label: string, sk: SortKey | null) => {
    if (!sk) {
      return <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{label}</span>;
    }
    return (
      <button type="button" onClick={() => toggleSort(sk)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap hover:text-[#1F2937]">
        {label}
        <ArrowUpDown size={12} className={sortKey === sk ? 'text-[#ff8a65]' : 'opacity-50'} />
      </button>
    );
  };

  const colMeta: Partial<Record<ColKey, SortKey | null>> = {
    ckId: 'id',
    vehicle: 'vehicle',
    plate: 'plate',
    created: 'created',
    score: 'score',
  };

  return (
    <AppLayout currentPath={pathname}>
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-fade-in">
            <h3 className="text-base font-heading font-semibold text-[#1F2937] mb-2">
              Delete {deleteConfirm.id} {deleteConfirm.brand} {deleteConfirm.model} {deleteConfirm.year}?
            </h3>
            <p className="text-sm text-[#6B7280] mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#1F2937] hover:bg-[#F4F6F8] transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-[#C0392B] text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {auctionModalCar && (
        <AuctionSetupModal
          open
          onClose={() => setAuctionModalCar(null)}
          carId={auctionModalCar.id}
          vehicleTitle={`${auctionModalCar.brand} ${auctionModalCar.model} ${auctionModalCar.year}`}
          docsComplete={auctionModalCar.docs >= 6}
        />
      )}

      {duplicateFor && findDuplicateMatch(duplicateFor) && (
        <DuplicateResolutionModal
          open
          onClose={() => setDuplicateFor(null)}
          current={carToDuplicateSnapshot(duplicateFor, 'Promise Ndem', formatNaira)}
          match={carToDuplicateSnapshot(findDuplicateMatch(duplicateFor)!, 'Promise Ndem', formatNaira)}
          duplicateCount={duplicateMatchCount(duplicateFor)}
          onMarkUnique={() => {
            setCars(prev => prev.map(c => (c.id === duplicateFor.id ? { ...c, hasDuplicate: false } : c)));
          }}
          onMerge={masterId => {
            const m = findDuplicateMatch(duplicateFor);
            if (!m) return;
            const victim = masterId === duplicateFor.id ? m.id : duplicateFor.id;
            removeCar(victim);
          }}
          onDeleteMatching={id => removeCar(id)}
        />
      )}

      {columnPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setColumnPanel(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-heading font-semibold text-[#1F2937]">Column settings</h3>
              <button type="button" onClick={() => setColumnPanel(false)} className="p-1 rounded-lg hover:bg-[#F4F6F8]">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-[#6B7280] mb-3">Toggle columns (13 total). Actions always visible.</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {ALL_COLUMNS.map(c => (
                <label key={c.key} className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleCols[c.key]}
                    onChange={() => setVisibleCols(v => ({ ...v, [c.key]: !v[c.key] }))}
                  />
                  {c.label}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                const o = {} as Record<ColKey, boolean>;
                ALL_COLUMNS.forEach(x => {
                  o[x.key] = x.defaultOn;
                });
                setVisibleCols(o);
              }}
              className="mt-4 text-xs text-[#ff8a65] hover:underline"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Cars</h1>
            <p className="text-sm text-[#6B7280]">{filtered.length} vehicles in system</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
              <Download size={15} /> Export
            </button>
            <Link href="/cars/new" className="flex items-center gap-2 px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all min-h-[44px]">
              <Plus size={16} /> Register New Car
            </Link>
          </div>
        </div>

        <div className={`bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col gap-3 relative ${isFiltering ? 'pb-8' : ''}`}>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by ID, brand, plate, VIN…"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#F4F6F8] border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 focus:border-[#ff8a65]"
              />
              {isFiltering && <p className="absolute bottom-2 left-4 text-[11px] text-[#6B7280]">Filtering…</p>}
            </div>
            <select
              value={brandFilter}
              onChange={e => {
                setBrandFilter(e.target.value);
                setModelFilter('');
                setYearFilter('');
                setPage(1);
              }}
              className="px-3 py-2.5 text-sm bg-[#F4F6F8] border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
            >
              <option value="">All Brands</option>
              {brandOptions.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select value={modelFilter} onChange={e => { setModelFilter(e.target.value); setYearFilter(''); setPage(1); }} className="px-3 py-2.5 text-sm bg-[#F4F6F8] border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30">
              <option value="">All Models</option>
              {modelOptions.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select value={yearFilter} onChange={e => { setYearFilter(e.target.value); setPage(1); }} className="px-3 py-2.5 text-sm bg-[#F4F6F8] border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30">
              <option value="">All Years</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2.5 text-sm bg-[#F4F6F8] border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30">
              <option value="">All Statuses</option>
              {PIPELINE_STAGES.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select value={channelFilter} onChange={e => { setChannelFilter(e.target.value); setPage(1); }} className="px-3 py-2.5 text-sm bg-[#F4F6F8] border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30">
              <option value="">All Channels</option>
              {CHANNELS.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="flex gap-2 items-center">
              <div>
                <label className="block text-[10px] text-[#6B7280] mb-0.5">From</label>
                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="px-2 py-2 text-sm border border-[#E5E7EB] rounded-lg" />
              </div>
              <div>
                <label className="block text-[10px] text-[#6B7280] mb-0.5">To</label>
                <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="px-2 py-2 text-sm border border-[#E5E7EB] rounded-lg" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setColumnPanel(true)}
              className="flex items-center gap-2 px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8]"
            >
              <Settings2 size={15} /> Column settings
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterPresetBar pageKey="cars" currentParams={presetParams} onApply={applyPreset} />
            {(search || statusFilter || brandFilter || modelFilter || yearFilter || channelFilter || dateFrom || dateTo) && (
              <button
                onClick={() => applyPreset({})}
                className="text-sm text-[#C0392B] hover:bg-red-50 rounded-lg px-2 py-1 w-fit"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="bg-[#ff5722] text-white rounded-xl px-4 py-3 flex items-center gap-4 animate-fade-in">
            <span className="text-sm font-medium">{selectedIds.length} selected</span>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <select
                value=""
                onChange={e => e.target.value && handleBulkStatusChange(e.target.value)}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium text-white border-0 focus:outline-none focus:ring-2 focus:ring-white/40 [&>option]:text-[#1F2937]"
              >
                <option value="">Change status…</option>
                {PIPELINE_STAGES.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {['Push to Marketplace', 'Export selection', 'Delete'].map(action => (
                <button
                  key={action}
                  onClick={() => {
                    if (action === 'Delete') {
                      handleBulkDelete();
                      return;
                    }
                    if (action === 'Export selection') {
                      exportSelectedCSV();
                      return;
                    }
                    toast.success(`${action} queued for ${selectedIds.length} car(s)`);
                    setSelectedIds([]);
                  }}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
                >
                  {action}
                </button>
              ))}
              <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-white/60 hover:text-white text-xs">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-4 py-3 text-left w-10">
                    <button type="button" onClick={toggleAll} className="flex items-center">
                      {selectedIds.length === paginated.length && paginated.length > 0 ? (
                        <CheckSquare size={16} className="text-[#ff8a65]" />
                      ) : (
                        <Square size={16} className="text-[#9CA3AF]" />
                      )}
                    </button>
                  </th>
                  {ALL_COLUMNS.filter(c => visibleCols[c.key]).map(c => (
                    <th key={c.key} className="px-4 py-3 text-left whitespace-nowrap">
                      {sortableHeader(c.label, colMeta[c.key] ?? null)}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isFiltering && (
                  <tr>
                    <td colSpan={activeColCount + 2} className="p-0">
                      <TableSkeleton rows={6} cols={activeColCount + 2} />
                    </td>
                  </tr>
                )}
                {!isFiltering &&
                  paginated.map((car, idx) => (
                    <tr
                      key={car.id}
                      role="button"
                      tabIndex={0}
                      ref={idx === activeIndex ? el => el?.scrollIntoView({ block: 'nearest' }) : undefined}
                      onMouseEnter={() => router.prefetch(`/cars/${car.id}`)}
                      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 73px' }}
                      onClick={() => router.push(`/cars/${car.id}`)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') router.push(`/cars/${car.id}`);
                      }}
                      className={`border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors cursor-pointer ${car.hasDuplicate ? 'border-l-4 border-l-amber-400' : ''} ${
                        idx === activeIndex ? 'bg-[#FFF3EE] ring-1 ring-inset ring-[#ff8a65]/40' : ''
                      }`}
                    >
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <button type="button" onClick={() => toggleSelect(car.id)}>
                          {selectedIds.includes(car.id) ? <CheckSquare size={16} className="text-[#ff8a65]" /> : <Square size={16} className="text-[#9CA3AF]" />}
                        </button>
                      </td>
                      {ALL_COLUMNS.filter(c => visibleCols[c.key]).map(c => (
                        <td key={c.key} className="px-4 py-3 align-top">
                          {renderCell(car, c.key)}
                        </td>
                      ))}
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setOpenMenu(openMenu === car.id ? null : car.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors"
                          >
                            <MoreHorizontal size={16} className="text-[#6B7280]" />
                          </button>
                          {openMenu === car.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-[#E5E7EB] z-50 py-1 animate-fade-in">
                                {[
                                  { label: 'View', icon: Eye, onClick: () => menuNavigate(`/cars/${car.id}`) },
                                  { label: 'Edit', icon: Edit, onClick: () => menuNavigate(`/cars/${car.id}?edit=1`) },
                                ].map(item => (
                                  <button
                                    key={item.label}
                                    type="button"
                                    onClick={item.onClick}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1F2937] hover:bg-[#F4F6F8] transition-colors text-left"
                                  >
                                    <item.icon size={14} className="text-[#6B7280]" /> {item.label}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    menuNavigate(`/orders`);
                                    toast.info(`Link inspection for ${car.id}`, { description: 'Select an order or create from this car.' });
                                  }}
                                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-[#F4F6F8]"
                                >
                                  Link Inspection
                                </button>
                                <button type="button" onClick={() => { menuNavigate('/inspector-app'); }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-[#F4F6F8]">
                                  Grade Car
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (car.docs < 6) {
                                      toast.error('Need at least 6 documents');
                                      setOpenMenu(null);
                                      return;
                                    }
                                    setAuctionModalCar(car);
                                    setOpenMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-[#F4F6F8]"
                                >
                                  Start Auction
                                </button>
                                <button type="button" onClick={() => { menuNavigate('/listings'); toast.success('Marketplace'); }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-[#F4F6F8]">
                                  Push to Marketplace
                                </button>
                                <button type="button" onClick={() => { setDuplicateFor(car); setOpenMenu(null); }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-[#F4F6F8]">
                                  Mark as Duplicate
                                </button>
                                <div className="border-t border-[#E5E7EB] mt-1 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteConfirm(car);
                                      setOpenMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#C0392B] hover:bg-red-50 transition-colors text-left"
                                  >
                                    <Trash2 size={14} /> Delete
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                {!isFiltering && paginated.length === 0 && (
                  <tr>
                    <td colSpan={activeColCount + 2} className="px-4 py-16 text-center text-[#6B7280]">
                      <Car size={40} className="mx-auto mb-3 text-[#E5E7EB]" />
                      <p className="font-medium">No cars found</p>
                      <p className="text-sm mt-1">
                        Try adjusting your filters or{' '}
                        <Link href="/cars/new" className="text-[#ff8a65] hover:underline">
                          register a new car
                        </Link>
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="hidden md:block px-4 py-2 text-[11px] text-[#9CA3AF] border-t border-[#F4F6F8]">
            <kbd className="font-mono">j</kbd>/<kbd className="font-mono">k</kbd> navigate · <kbd className="font-mono">Enter</kbd> open · <kbd className="font-mono">e</kbd> edit
          </p>
          <div className="px-4 py-3 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#6B7280]">
              Showing {sorted.length === 0 ? 0 : (pageClamped - 1) * perPage + 1}–{Math.min(pageClamped * perPage, sorted.length)} of {sorted.length}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                Per page:
                {[25, 50, 100].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setPerPage(n);
                      setPage(1);
                    }}
                    className={`px-2 py-1 rounded-md ${perPage === n ? 'bg-[#ff5722] text-white' : 'hover:bg-[#F4F6F8]'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={pageClamped === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {(() => {
                  const nums: number[] = [];
                  for (let p = 1; p <= totalPages; p++) {
                    if (p === 1 || p === totalPages || Math.abs(p - pageClamped) <= 2) nums.push(p);
                  }
                  const uniq = [...new Set(nums)].sort((a, b) => a - b);
                  const items: (number | 'gap')[] = [];
                  for (let i = 0; i < uniq.length; i++) {
                    if (i > 0 && uniq[i] - uniq[i - 1] > 1) items.push('gap');
                    items.push(uniq[i]);
                  }
                  return items.map((p, i) =>
                    p === 'gap' ? (
                      <span key={`gap-${i}`} className="px-1 text-[#9CA3AF]">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`min-w-[2rem] h-8 px-1 flex items-center justify-center rounded-lg text-sm transition-colors ${
                          pageClamped === p ? 'bg-[#ff5722] text-white' : 'hover:bg-[#F4F6F8] text-[#6B7280]'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  );
                })()}
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={pageClamped === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function CarsPage() {
  return (
    <Suspense
      fallback={
        <AppLayout currentPath="/cars">
          <div className="min-h-[40vh] flex items-center justify-center text-sm text-[#6B7280]">Loading cars…</div>
        </AppLayout>
      }
    >
      <CarsPageInner />
    </Suspense>
  );
}
