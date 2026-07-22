'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  AlertTriangle,
  MoreHorizontal,
  FileText,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { formatNaira } from '@/lib/mockData';
import { carsApi, auctionsApi, listingsApi, reportsApi } from '@/lib/api/services';
import { useApiResource, useApiList } from '@/hooks/useApiResource';
import { CarschekScore } from '@/components/shared/CarschekScore';
import { toast } from 'sonner';
import DuplicateResolutionModal, { carToDuplicateSnapshot } from '@/components/cars/DuplicateResolutionModal';
import { StatusStepper } from '@/components/cars/StatusStepper';
import DocumentCompliancePanel from '@/app/cars/components/DocumentCompliancePanel';
import AuctionSetupModal from '@/app/cars/components/AuctionSetupModal';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import {
  brandOptionsByName,
  modelOptionsByName,
  yearOptionsForModelName,
} from '@/lib/reference/carCascade';

const PIPELINE_STAGES = ['Acquired', 'Inspection Linked', 'At Buyer', 'Listed', 'Sold'] as const;
const TABS = ['Main Data', 'Purchase', 'Sales', 'Channel'];
const TAB_IDS = ['main', 'purchase', 'sales', 'channel'] as const;

const WARNINGS_MOCK = ['Title discrepancy noted', 'Mileage vs service history variance', 'Insurance expiry within 30 days'];

function CarDetailPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const carId = params.id as string;
  const { data: car, loading: carLoading, error: carError } = useApiResource(() => carsApi.get(carId), [carId]);
  const { data: auctions } = useApiList(() => auctionsApi.list());
  const { data: listings } = useApiList(() => listingsApi.list());
  const { data: reports } = useApiList(() => reportsApi.list());
  const { data: allCars } = useApiList(() => carsApi.list());

  const activeTab = useMemo(() => {
    const t = searchParams.get('tab');
    if (!t) return 0;
    const idx = TAB_IDS.indexOf(t as (typeof TAB_IDS)[number]);
    return idx >= 0 ? idx : 0;
  }, [searchParams]);

  const setTab = (i: number) => {
    const id = TAB_IDS[i] ?? 'main';
    router.replace(`${pathname}?tab=${id}`, { scroll: false });
  };

  const auction = useMemo(() => (car ? auctions.find(a => a.carId === car.id) : undefined), [car, auctions]);
  const listing = useMemo(() => (car ? listings.find(l => l.carId === car.id) : undefined), [car, listings]);

  const [editMain, setEditMain] = useState(false);
  const [editContact, setEditContact] = useState(false);
  const [editData, setEditData] = useState<Awaited<ReturnType<typeof carsApi.get>> | null>(null);
  const [contact, setContact] = useState({
    name: 'Adaeze Mensah',
    email: 'adaeze@gmail.com',
    phone: '+2348012345678',
    type: 'Individual',
  });
  const [currentStage, setCurrentStage] = useState(0);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [warningsOpen, setWarningsOpen] = useState(false);
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [tabDirty, setTabDirty] = useState<Record<number, boolean>>({});
  const [marketplaceVisibility, setMarketplaceVisibility] = useState<'Not Visible' | 'Visible' | 'Featured'>('Visible');
  const [featuredToggle, setFeaturedToggle] = useState(false);
  const [newListPrice, setNewListPrice] = useState('');
  const [pctOff, setPctOff] = useState<1 | 5 | 10 | 15 | 20>(5);
  const [carHydrated, setCarHydrated] = useState(false);

  // Hydrate car-dependent local state once loaded
  useEffect(() => {
    if (!car || carHydrated) return;
    setEditData({ ...car });
    setCurrentStage(PIPELINE_STAGES.indexOf(car.status as (typeof PIPELINE_STAGES)[number]));
    setMarketplaceVisibility((listing?.visibility as 'Not Visible' | 'Visible' | 'Featured') ?? 'Visible');
    setFeaturedToggle(listing?.featured ?? false);
    setNewListPrice(String(listing?.price ?? car.salePrice ?? car.purchasePrice ?? ''));
    setSellingPrice(car.salePrice ?? 0);
    setPurchasePrices([{ id: '1', amount: car.purchasePrice, type: 'Final', date: car.createdAt, by: 'Promise Ndem' }]);
    setCarHydrated(true);
  }, [car, listing, carHydrated]);

  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [purchasePrices, setPurchasePrices] = useState<
    { id: string; amount: number; type: 'Ear' | 'Final' | 'Revised'; date: string; by: string }[]
  >([]);
  const [addingPrice, setAddingPrice] = useState(false);
  const [newPriceRow, setNewPriceRow] = useState({ amount: '', type: 'Ear\' as \'Ear\' | \'Final\' | \'Revised', date: '' });
  const [paymentStatus, setPaymentStatus] = useState<'Done' | 'Pending' | 'Overdue'>('Done');
  const [sellingPrice, setSellingPrice] = useState(0);
  const [salePaymentStatus, setSalePaymentStatus] = useState<'Done' | 'Pending' | 'Overdue'>('Done');
  const [handoverSeller, setHandoverSeller] = useState('');
  const [handoverBuyer, setHandoverBuyer] = useState('');
  const [auctionModalOpen, setAuctionModalOpen] = useState(false);
  const [duplicateDismissed, setDuplicateDismissed] = useState(false);

  const matchCar = useMemo(() => {
    if (!car) return null;
    const vinMatch = allCars.find(c => c.id !== car.id && c.vin === car.vin);
    if (vinMatch) return vinMatch;
    if (car.hasDuplicate) return allCars.find(c => c.id !== car.id) ?? null;
    return null;
  }, [car, allCars]);

  const duplicateMatchCount = useMemo(
    () => (car ? allCars.filter(c => c.id !== car.id && (c.vin === car.vin || c.plate === car.plate)).length : 0),
    [car, allCars]
  );

  const linkedInspection = useMemo(() => (car ? reports.some(r => (r as { carId?: string }).carId === car.id) : false), [car, reports]);

  useEffect(() => {
    setDuplicateDismissed(false);
  }, [car?.id]);

  const computedMarketPrice = useMemo(() => {
    const n = Number(newListPrice.replace(/\D/g, '')) || 0;
    return Math.round(n * (1 - pctOff / 100));
  }, [newListPrice, pctOff]);

  const anyDirty = editMain || editContact || Object.values(tabDirty).some(Boolean);

  useEffect(() => {
    if (!car) return;
    setEditData({ ...car });
    setCurrentStage(PIPELINE_STAGES.indexOf(car.status as (typeof PIPELINE_STAGES)[number]));
    setSellingPrice(car.salePrice ?? 0);
  }, [car]);

  if (carLoading || !car || !editData) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="p-8 text-sm text-[#6B7280]">{carError || 'Loading car…'}</div>
      </AppLayout>
    );
  }

  const margin =
    car.salePrice || sellingPrice
      ? ((((sellingPrice || car.salePrice || 0) - car.purchasePrice) / car.purchasePrice) * 100).toFixed(2)
      : null;

  const oldMarketPrice = listing?.price ?? car.salePrice ?? car.purchasePrice;

  const markDirty = (tab: number) => setTabDirty(d => ({ ...d, [tab]: true }));

  const handleHeaderSave = () => {
    setEditMain(false);
    setEditContact(false);
    setTabDirty({});
    toast.success('Changes saved');
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-0">
        <div className="sticky top-0 z-20 bg-white border-b border-[#E5E7EB] -mx-4 md:-mx-6 xl:-mx-8 px-4 md:px-6 xl:px-8 min-h-[80px] mb-6">
          <div className="max-w-screen-2xl mx-auto py-3">
            <div className="flex flex-wrap items-start gap-3">
              <Link href="/cars" className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8] transition-colors flex-shrink-0">
                <ArrowLeft size={16} className="text-[#6B7280]" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">{car.id}</span>
                  <h1 className="text-lg font-heading font-bold text-[#1F2937]">
                    {car.brand} {car.model} {car.year}
                  </h1>
                  <span className="text-xs text-[#6B7280] bg-[#F4F6F8] px-2 py-1 rounded-full">📍 {car.city}, {car.state}</span>
                  {(duplicateMatchCount > 0 || car.hasDuplicate) && !duplicateDismissed && (
                    <button
                      type="button"
                      onClick={() => setDuplicateOpen(true)}
                      className="flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full hover:bg-amber-200 transition-colors"
                    >
                      <AlertTriangle size={11} /> Potential Duplicate ({Math.max(duplicateMatchCount, matchCar ? 1 : 0)})
                    </button>
                  )}
                  {car.warnings > 0 && (
                    <button
                      type="button"
                      onClick={() => setWarningsOpen(true)}
                      className="flex items-center gap-1 text-xs font-semibold text-orange-800 bg-orange-100 px-2.5 py-1 rounded-full hover:bg-orange-200 transition-colors"
                    >
                      ⚠ {car.warnings} Warnings
                    </button>
                  )}
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${car.docs >= 6 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Docs: {car.docs}/8
                  </span>
                </div>
                <p className="text-xs text-[#6B7280]">
                  Purchased {formatNaira(car.purchasePrice)}
                  {car.salePrice || sellingPrice ? (
                    <>
                      {' '}
                      · Sold {formatNaira(car.salePrice || sellingPrice)}
                      {margin !== null && (
                        <span className={`font-semibold ml-1 ${parseFloat(margin) >= 0 ? 'text-[#1A7A4A]' : 'text-[#C0392B]'}`}>
                          · Margin {parseFloat(margin) >= 0 ? '+' : ''}
                          {margin}%
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[#9CA3AF]"> · Sold — · Margin —</span>
                  )}
                </p>
              </div>
              <CarschekScore score={car.score} size={48} className="flex-shrink-0 hidden sm:flex" />
              <div className="flex items-center gap-2">
                {anyDirty && (
                  <button
                    type="button"
                    onClick={handleHeaderSave}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1A7A4A] text-white text-sm font-semibold rounded-lg shadow-[0_0_12px_rgba(26,122,74,0.45)] hover:bg-green-700 transition-all"
                  >
                    <Save size={14} /> Save Changes
                  </button>
                )}
                <div className="relative">
                  <button type="button" onClick={() => setMenuOpen(o => !o)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8] transition-colors">
                    <MoreHorizontal size={16} className="text-[#6B7280]" />
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-[#E5E7EB] z-50 py-1 animate-fade-in">
                        <button type="button" onClick={() => { router.push('/inspector-app'); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F4F6F8]">
                          Grade Car
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            setAuctionModalOpen(true);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F4F6F8]"
                        >
                          Start Auction
                        </button>
                        <button type="button" onClick={() => { router.push('/listings'); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F4F6F8]">
                          Marketplace
                        </button>
                        <button type="button" onClick={() => { toast.error('Delete from list view'); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-[#C0392B] hover:bg-red-50">
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 overflow-x-auto pb-1">
              <StatusStepper
                carId={car.id}
                currentStageIndex={currentStage}
                onStageIndexChange={setCurrentStage}
                linkedInspection={linkedInspection}
                carschekScore={car.score}
                docsUploaded={car.docs}
              />
            </div>
          </div>
        </div>

        {warningsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setWarningsOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-base font-heading font-semibold text-[#1F2937] mb-3">Warnings ({car.warnings})</h3>
              <ul className="space-y-2 text-sm text-[#374151]">
                {WARNINGS_MOCK.slice(0, car.warnings).map(w => (
                  <li key={w} className="flex gap-2">
                    <AlertTriangle size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    {w}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => setWarningsOpen(false)} className="mt-5 w-full py-2.5 bg-[#ff5722] text-white rounded-lg text-sm font-semibold">
                Close
              </button>
            </div>
          </div>
        )}

        {duplicateOpen && matchCar && (
          <DuplicateResolutionModal
            open
            onClose={() => setDuplicateOpen(false)}
            current={carToDuplicateSnapshot(car, 'Promise Ndem', formatNaira)}
            match={carToDuplicateSnapshot(matchCar, 'Promise Ndem', formatNaira)}
            duplicateCount={Math.max(duplicateMatchCount, 1)}
            onMarkUnique={() => {
              setDuplicateDismissed(true);
              setDuplicateOpen(false);
            }}
            onMerge={() => setDuplicateDismissed(true)}
            onDeleteMatching={() => setDuplicateDismissed(true)}
          />
        )}

        <AuctionSetupModal
          open={auctionModalOpen}
          onClose={() => setAuctionModalOpen(false)}
          carId={car.id}
          vehicleTitle={`${car.brand} ${car.model} ${car.year}`}
          docsComplete={car.docs >= 6}
        />

        <DocumentCompliancePanel open={complianceOpen} onClose={() => setComplianceOpen(false)} />

        <div className="flex gap-1 border-b border-[#E5E7EB] mb-6 overflow-x-auto sticky top-[80px] z-10 bg-white -mx-4 md:-mx-6 px-4 md:px-6">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              onClick={() => setTab(i)}
              className={`relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
                activeTab === i ? 'border-[#ff5722] text-[#ff5722]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
              }`}
            >
              {tab}
              {tabDirty[i] && <span className="absolute top-2 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Car Details</h3>
                {!editMain ? (
                  <button type="button" onClick={() => setEditMain(true)} className="flex items-center gap-1.5 text-xs text-[#ff8a65] hover:underline">
                    <Edit size={12} /> Edit
                  </button>
                ) : (
                  <button type="button" onClick={() => { setEditMain(false); setEditData({ ...car }); }} className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#C0392B]">
                    <X size={12} /> Cancel
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Brand', key: 'brand' as const, value: car.brand },
                  { label: 'Model', key: 'model' as const, value: car.model },
                  { label: 'Year', key: 'year' as const, value: String(car.year) },
                  { label: 'Colour', key: 'colour' as const, value: car.colour },
                  { label: 'Mileage', key: 'mileage' as const, value: String(car.mileage) },
                  { label: 'VIN', key: 'vin' as const, value: car.vin, mono: true },
                  { label: 'Plate', key: 'plate' as const, value: car.plate, mono: true },
                ].map(field => {
                  const editValue = String((editData as Record<string, unknown>)[field.key] ?? field.value);
                  // Brand → Model → Year are reference-driven cascading selects, not free text.
                  const cascadeSelect =
                    field.key === 'brand' ? (
                      <SearchableSelect
                        value={editValue}
                        onChange={v => {
                          setEditData(prev => (prev ? { ...prev, brand: v, model: '' } : prev));
                          markDirty(0);
                        }}
                        options={brandOptionsByName()}
                        placeholder="Select brand…"
                        className="flex-1"
                        aria-label="Brand"
                      />
                    ) : field.key === 'model' ? (
                      <SearchableSelect
                        value={editValue}
                        onChange={v => {
                          setEditData(prev => (prev ? { ...prev, model: v } : prev));
                          markDirty(0);
                        }}
                        options={modelOptionsByName(String((editData as Record<string, unknown>).brand ?? car.brand))}
                        disabled={!(editData as Record<string, unknown>).brand && !car.brand}
                        placeholder="Select model…"
                        className="flex-1"
                        aria-label="Model"
                      />
                    ) : field.key === 'year' ? (
                      <SearchableSelect
                        value={editValue}
                        onChange={v => {
                          setEditData(prev => (prev ? { ...prev, year: Number(v) } : prev));
                          markDirty(0);
                        }}
                        options={yearOptionsForModelName(
                          String((editData as Record<string, unknown>).brand ?? car.brand),
                          String((editData as Record<string, unknown>).model ?? car.model)
                        )}
                        placeholder="Select year…"
                        className="flex-1"
                        aria-label="Year"
                      />
                    ) : null;
                  return (
                    <div key={field.key} className="flex items-center justify-between py-2 border-b border-[#F4F6F8] last:border-0 gap-2">
                      <span className="text-xs text-[#6B7280] w-24 flex-shrink-0">{field.label}</span>
                      {editMain ? (
                        cascadeSelect ?? (
                          <input
                            value={editValue}
                            onChange={e => {
                              setEditData(prev => (prev ? { ...prev, [field.key]: e.target.value } : prev));
                              markDirty(0);
                            }}
                            className={`flex-1 text-sm px-2 py-1 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 text-right ${field.mono ? 'font-mono text-xs' : ''}`}
                          />
                        )
                      ) : (
                        <span className={`text-sm font-medium text-[#1F2937] text-right ${field.mono ? 'font-mono text-xs' : ''}`}>{field.value}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {editMain && (
                <button
                  type="button"
                  onClick={() => {
                    setEditMain(false);
                    markDirty(0);
                    toast.success('Car details updated');
                  }}
                  className="mt-4 w-full py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all"
                >
                  Save
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Contact</h3>
                {!editContact ? (
                  <button type="button" onClick={() => setEditContact(true)} className="text-xs text-[#ff8a65] hover:underline flex items-center gap-1">
                    <Edit size={12} /> Edit
                  </button>
                ) : (
                  <button type="button" onClick={() => setEditContact(false)} className="text-xs text-[#6B7280]">
                    Cancel
                  </button>
                )}
              </div>
              <div className="space-y-3 text-sm">
                {(['name', 'email', 'phone', 'type'] as const).map(k => (
                  <div key={k} className="flex justify-between gap-2 border-b border-[#F4F6F8] pb-2">
                    <span className="text-xs text-[#6B7280] capitalize">{k}</span>
                    {editContact ? (
                      <input
                        className="flex-1 text-right border border-[#E5E7EB] rounded px-2 py-1 text-sm"
                        value={contact[k]}
                        onChange={e => {
                          setContact(c => ({ ...c, [k]: e.target.value }));
                          markDirty(0);
                        }}
                      />
                    ) : (
                      <span className="font-medium text-[#1F2937] text-right">{contact[k]}</span>
                    )}
                  </div>
                ))}
              </div>
              <Link href="/crm" className="mt-4 inline-flex items-center gap-1 text-xs text-[#ff8a65] hover:underline">
                <ExternalLink size={12} /> Open in CRM
              </Link>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Carschek Score</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <CarschekScore score={car.score} size={88} />
                  <div className="min-w-0">
                    <p className="text-xs text-[#6B7280]">Based on inspection data</p>
                    <Link href="/reports" className="text-xs text-[#ff8a65] hover:underline mt-1 block">
                      View reports →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Car Documents</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${car.docs >= 6 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {car.docs}/8
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setComplianceOpen(true)}
                  className="w-full py-2.5 border border-[#ff5722] text-[#ff5722] text-sm font-semibold rounded-lg hover:bg-[#ff5722]/5 flex items-center justify-center gap-2"
                >
                  <FileText size={14} /> Open Document Review
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Purchase</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Channel</span>
                  <span className="font-medium">{car.channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Date</span>
                  <span>{car.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Location</span>
                  <span>
                    {car.city}, {car.state}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Comments</span>
                  <span className="text-right max-w-[60%]">—</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Purchase prices</h3>
                <button type="button" onClick={() => setAddingPrice(!addingPrice)} className="text-xs text-[#ff8a65] font-semibold">
                  + Add Price
                </button>
              </div>
              <ul className="space-y-2">
                {purchasePrices.map(p => (
                  <li key={p.id} className="flex items-start justify-between gap-2 py-2 border-b border-[#F4F6F8] text-sm">
                    <div>
                      <p className="font-semibold">{formatNaira(p.amount)}</p>
                      <p className="text-[10px] text-[#9CA3AF]">
                        <span className="font-semibold text-[#374151]">{p.type}</span> · {p.date} · {p.by}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-red-400 hover:text-[#C0392B] text-lg leading-none"
                      onClick={() => {
                        if (window.confirm('Remove this price row?')) setPurchasePrices(x => x.filter(r => r.id !== p.id));
                      }}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              {addingPrice && (
                <div className="mt-3 p-3 bg-[#F9FAFB] rounded-lg space-y-2 border border-[#E5E7EB]">
                  <input
                    placeholder="Amount"
                    className="w-full text-sm border rounded px-2 py-1.5"
                    value={newPriceRow.amount}
                    onChange={e => setNewPriceRow(r => ({ ...r, amount: e.target.value }))}
                  />
                  <select
                    className="w-full text-sm border rounded px-2 py-1.5"
                    value={newPriceRow.type}
                    onChange={e => setNewPriceRow(r => ({ ...r, type: e.target.value as 'Ear' | 'Final' | 'Revised' }))}
                  >
                    <option value="Ear">Ear</option>
                    <option value="Final">Final</option>
                    <option value="Revised">Revised</option>
                  </select>
                  <input type="date" className="w-full text-sm border rounded px-2 py-1.5" value={newPriceRow.date} onChange={e => setNewPriceRow(r => ({ ...r, date: e.target.value }))} />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex-1 py-1.5 bg-[#ff5722] text-white text-xs rounded-lg"
                      onClick={() => {
                        const n = Number(newPriceRow.amount.replace(/\D/g, ''));
                        if (!n || !newPriceRow.date) return;
                        setPurchasePrices(x => [
                          ...x,
                          { id: `np-${Date.now()}`, amount: n, type: newPriceRow.type as 'Ear' | 'Final' | 'Revised', date: newPriceRow.date, by: 'You' },
                        ]);
                        setAddingPrice(false);
                        markDirty(1);
                        toast.success('Price added');
                      }}
                    >
                      Save
                    </button>
                    <button type="button" className="flex-1 py-1.5 border text-xs rounded-lg" onClick={() => setAddingPrice(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-3">Purchase payments</h3>
              <p className="text-xl font-bold text-[#1F2937]">{formatNaira(car.purchasePrice)}</p>
              <select
                value={paymentStatus}
                onChange={e => {
                  setPaymentStatus(e.target.value as typeof paymentStatus);
                  markDirty(1);
                }}
                className="mt-2 text-sm border border-[#E5E7EB] rounded-lg px-2 py-1"
              >
                <option value="Done">Done</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
              <p className="text-xs text-[#6B7280] mt-2">Date: {car.createdAt} · Method: Bank Transfer</p>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-3">Purchase documents</h3>
              <label className="block text-xs text-[#6B7280] mb-1">Handover from seller date</label>
              <input
                type="date"
                value={handoverSeller}
                onChange={e => {
                  setHandoverSeller(e.target.value);
                  markDirty(1);
                }}
                className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2"
              />
              <button type="button" onClick={() => toast.success('Handover date saved')} className="mt-3 w-full py-2 bg-[#ff5722] text-white text-sm rounded-lg">
                Save
              </button>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Selling</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Channel</span>
                  <span>Market Place</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Sold to</span>
                  <span>Buyer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Date</span>
                  <span>{car.salePrice ? car.createdAt : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Invoice #</span>
                  <span className="font-mono text-xs">INV-2026-001</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Selling price</h3>
              <p className="text-xs text-[#6B7280] mb-1">Purchase (reference)</p>
              <p className="text-sm text-[#9CA3AF] mb-3">{formatNaira(car.purchasePrice)}</p>
              <label className="text-xs text-[#6B7280]">Selling price (₦)</label>
              <input
                type="number"
                className="w-full mt-1 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm font-semibold"
                value={sellingPrice || ''}
                onChange={e => {
                  setSellingPrice(Number(e.target.value));
                  markDirty(2);
                }}
              />
              {margin !== null && (
                <p className={`mt-2 text-lg font-bold ${parseFloat(margin) >= 0 ? 'text-[#1A7A4A]' : 'text-[#C0392B]'}`}>
                  Margin {parseFloat(margin) >= 0 ? '+' : ''}
                  {margin}%
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-3">Selling payments</h3>
              <p className="text-xl font-bold">{formatNaira(sellingPrice || car.salePrice || 0)}</p>
              <select
                value={salePaymentStatus}
                onChange={e => {
                  setSalePaymentStatus(e.target.value as typeof salePaymentStatus);
                  markDirty(2);
                }}
                className="mt-2 text-sm border rounded-lg px-2 py-1"
              >
                <option value="Done">Done</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-3">Handover</h3>
              <input
                type="date"
                value={handoverBuyer}
                onChange={e => {
                  setHandoverBuyer(e.target.value);
                  markDirty(2);
                }}
                className="w-full text-sm border rounded-lg px-3 py-2 mb-3"
              />
              <button
                type="button"
                onClick={() => router.push(`/cars/${car.id}/proof-of-sale`)}
                className="w-full py-2.5 border border-[#ff5722] text-[#ff5722] text-sm font-semibold rounded-lg hover:bg-[#ff5722]/5"
              >
                Generate Proof of Sale (PDF preview)
              </button>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Car auction</h3>
              {!auction && (
                <div className="text-center py-6">
                  <p className="text-sm text-[#6B7280] mb-4">No active auction</p>
                  <button
                    type="button"
                    onClick={() => setAuctionModalOpen(true)}
                    className="px-5 py-2.5 bg-[#D35400] text-white text-sm font-semibold rounded-lg hover:bg-orange-700"
                  >
                    Start Auction
                  </button>
                </div>
              )}
              {auction && auction.status === 'Active' && (
                <div className="space-y-3 text-sm">
                  <p>
                    Current: <strong>{formatNaira(auction.currentBid)}</strong> · Bids: {auction.bidCount}
                  </p>
                  <p className="text-xs text-[#6B7280]">Ends {new Date(auction.endsAt).toLocaleString()}</p>
                  <Link href={`/auctions/${auction.id}`} className="text-[#ff8a65] text-sm font-medium inline-flex items-center gap-1">
                    View Bids <ExternalLink size={12} />
                  </Link>
                  <button type="button" onClick={() => toast.success('Auction ended (demo)')} className="block w-full py-2 border border-[#C0392B] text-[#C0392B] rounded-lg text-sm">
                    End Auction
                  </button>
                </div>
              )}
              {auction && auction.status !== 'Active' && (
                <div className="space-y-3">
                  <p className="text-sm text-[#6B7280]">Auction ended — reserve {auction.reserveMet ? 'met' : 'not met'}</p>
                  <button type="button" onClick={() => router.push('/deals')} className="w-full py-2.5 bg-[#ff5722] text-white rounded-lg text-sm">
                    Create Deal
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Marketplace</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-2">Visibility</label>
                  <div className="flex gap-2 flex-wrap">
                    {(['Not Visible', 'Visible', 'Featured'] as const).map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setMarketplaceVisibility(v);
                          markDirty(3);
                          toast.success(`Visibility: ${v}`);
                        }}
                        className={`flex-1 min-w-[90px] py-2 text-xs font-medium rounded-lg border transition-all ${
                          marketplaceVisibility === v ? 'bg-[#ff5722] text-white border-[#ff5722]' : 'border-[#E5E7EB] text-[#6B7280]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#374151]">Featured listing</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedToggle(f => !f);
                      markDirty(3);
                    }}
                    className={`relative w-11 h-6 rounded-full transition-colors ${featuredToggle ? 'bg-[#1A7A4A]' : 'bg-[#E5E7EB]'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${featuredToggle ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">New Price (₦)</label>
                  <input
                    type="text"
                    value={newListPrice}
                    onChange={e => {
                      setNewListPrice(e.target.value.replace(/\D/g, ''));
                      markDirty(3);
                    }}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-2">Percentage off</label>
                  <div className="flex gap-2 flex-wrap">
                    {([1, 5, 10, 15, 20] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setPctOff(p);
                          markDirty(3);
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${pctOff === p ? 'bg-[#ff5722] text-white border-[#ff5722]' : 'border-[#E5E7EB]'}`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-[#F4F6F8] rounded-lg">
                  <p className="text-xs text-[#6B7280]">New marketplace price (after {pctOff}%)</p>
                  <p className="text-lg font-bold text-[#1A7A4A]">{formatNaira(computedMarketPrice)}</p>
                  <p className="text-xs text-[#9CA3AF] line-through mt-1">Old: {formatNaira(oldMarketPrice)}</p>
                </div>
                <button
                  type="button"
                  disabled={marketplaceLoading || !Number(newListPrice)}
                  onClick={async () => {
                    setMarketplaceLoading(true);
                    await new Promise(r => setTimeout(r, 800));
                    setMarketplaceLoading(false);
                    toast.success('Marketplace listing updated');
                  }}
                  className="w-full py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {marketplaceLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Update Marketplace Listing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default function CarDetailPage() {
  return (
    <Suspense
      fallback={
        <AppLayout currentPath="/cars">
          <div className="p-8 text-sm text-[#6B7280]">Loading vehicle…</div>
        </AppLayout>
      }
    >
      <CarDetailPageContent />
    </Suspense>
  );
}
