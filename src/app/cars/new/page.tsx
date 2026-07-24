'use client';
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, ChevronRight, AlertTriangle, Upload, User, Building2, Factory } from 'lucide-react';
import { NIGERIAN_STATES, SALES_STAFF } from '@/lib/mockData';
import { carsApi, crmApi } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';
import { hydrateReferenceCache, getCachedBrands, getCachedModels } from '@/lib/reference/referenceCache';
import { CAR_DOCUMENT_TYPES } from '@/lib/cars/documents';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { findSimilarVins, platesPossiblyEqual } from '@/lib/duplicates';
import { clearDraft, getGuestUserId, loadDraft, saveDraft } from '@/lib/drafts';
import { validateCarStep0, validateCarStep1, validateCarStep2 } from '@/lib/validation/carNewSteps';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { findModelById, yearOptionsForModelId } from '@/lib/reference/carCascade';
import { appointmentsApi } from '@/lib/api/services';
import { storeAppointmentInspectionPrefill } from '@/lib/inspection/appointmentPrefill';

const STEPS = ['Vehicle Identity', 'Seller Contact', 'Purchase', 'Documents'];
const COLOUR_SWATCHES: { name: string; hex: string }[] = [
  { name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#111827' }, { name: 'Silver', hex: '#C0C0C0' }, { name: 'Grey', hex: '#6B7280' },
  { name: 'Red', hex: '#DC2626' }, { name: 'Blue', hex: '#2563EB' }, { name: 'Navy Blue', hex: '#ff5722' }, { name: 'Green', hex: '#16A34A' },
  { name: 'Brown', hex: '#92400E' }, { name: 'Gold', hex: '#CA8A04' }, { name: 'Beige', hex: '#D6C4A8' }, { name: 'Orange', hex: '#EA580C' },
  { name: 'Yellow', hex: '#EAB308' }, { name: 'Purple', hex: '#7C3AED' }, { name: 'Maroon', hex: '#7F1D1D' }, { name: 'Pearl White', hex: '#F5F0E8' },
];
const BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Convertible', 'Bus'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT', 'Electric'];
const CHANNELS = ['Auction', 'Market Place', 'Offline', 'B2B', 'Other'];

const DRAFT_FORM = 'car_new';

function makeInitialForm() {
  return {
    brandId: '', modelId: '', year: '', yearEnd: '', transmission: 'Automatic', bodyType: 'Sedan',
    mileage: '', colour: '', colourCustom: '', vin: '', plate: '', engineNumber: '', city: '', state: '',
    contactType: 'Individual', firstName: '', lastName: '', email: '', phone: '',
    channel: '', purchaseDate: '', salesPerson: '', purchasePrice: '',
    docs: CAR_DOCUMENT_TYPES.map(d => ({ name: d, comment: '', file: null as File | null, progress: 0 as number, done: false })),
  };
}

type CarDraftPayload = {
  step: number;
  savedAt: number;
  form: Omit<ReturnType<typeof makeInitialForm>, 'docs'> & { docs: { name: string; comment: string }[] };
};

function formatMileageInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 7);
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function NewCarPageInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const inspectAfter = searchParams.get('inspectAfter');
  const fromAppointment = searchParams.get('from') === 'appointment';

  const [apptBanner, setApptBanner] = useState<{ bookingId: string; appointmentId: string } | null>(null);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [draftBanner, setDraftBanner] = useState<'none' | 'prompt'>('none');
  const uid = getGuestUserId();
  const hydrated = useRef(false);

  const [form, setForm] = useState(makeInitialForm);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: inventory } = useApiList(() => carsApi.list());
  const { data: crmContacts } = useApiList(() => crmApi.list());
  const [brands, setBrands] = useState(() => getCachedBrands());
  const [models, setModels] = useState(() => getCachedModels());
  const [, setRefTick] = useState(0);

  useEffect(() => {
    void hydrateReferenceCache().then(() => {
      setBrands(getCachedBrands());
      setModels(getCachedModels());
      setRefTick(t => t + 1);
    });
  }, []);

  const persistDraft = () => {
    const payload: CarDraftPayload = {
      step,
      savedAt: Date.now(),
      form: {
        ...form,
        docs: form.docs.map(d => ({ name: d.name, comment: d.comment })),
      },
    };
    saveDraft(DRAFT_FORM, uid, payload);
  };

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const d = loadDraft<CarDraftPayload>(DRAFT_FORM, uid);
    if (d?.form && d.savedAt) setDraftBanner('prompt');
  }, [uid]);

  // Prefill from the reference quick-registration cascade (?brand=b1&model=m1&year=2018)
  useEffect(() => {
    const qBrand = searchParams.get('brand');
    const qModel = searchParams.get('model');
    const qYear = searchParams.get('year');
    if (!qBrand && !qModel && !qYear) return;
    const brand = brands.find(b => b.id === qBrand);
    const model = models.find(m => m.id === qModel && (!brand || m.brandId === brand.id));
    setForm(prev => ({
      ...prev,
      brandId: brand?.id ?? prev.brandId,
      modelId: model?.id ?? prev.modelId,
      year: qYear && /^\d{4}$/.test(qYear) ? qYear : prev.year,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!appointmentId || !fromAppointment) return;
    let cancelled = false;
    (async () => {
      try {
        const ap = await appointmentsApi.get(appointmentId);
        if (cancelled || !ap) return;
        const brand = brands.find(b => b.name === ap.make);
        const model = models.find(m => m.brandId === brand?.id && m.name === ap.model);
        const stateMatch = NIGERIAN_STATES.find(s => ap.serviceAddress?.includes(s) || ap.location === s);
        setForm(prev => ({
          ...prev,
          brandId: brand?.id ?? prev.brandId,
          modelId: model?.id ?? prev.modelId,
          year: String(ap.year),
          transmission: ap.transmission || prev.transmission,
          vin: ap.vinNumber || prev.vin,
          plate: ap.plateNumber ?? prev.plate,
          firstName: ap.firstName || prev.firstName,
          lastName: ap.lastName || prev.lastName,
          email: ap.email || prev.email,
          phone: ap.phone || prev.phone,
          city: ap.location || prev.city,
          state: stateMatch ?? prev.state,
        }));
        setApptBanner({ bookingId: ap.bookingId, appointmentId: ap.id });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [appointmentId, fromAppointment]);

  const formRef = useRef(form);
  formRef.current = form;
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    const id = window.setInterval(() => {
      const f = formRef.current;
      let s = stepRef.current;
      const hasContent =
        s > 0 ||
        !!f.brandId ||
        f.vin.trim().length > 3 ||
        f.plate.trim().length > 0 ||
        f.firstName.trim().length > 0;
      if (!hasContent) return;
      const payload: CarDraftPayload = {
        step: s,
        savedAt: Date.now(),
        form: {
          ...f,
          docs: f.docs.map(d => ({ name: d.name, comment: d.comment })),
        },
      };
      saveDraft(DRAFT_FORM, uid, payload);
    }, 45_000);
    return () => window.clearInterval(id);
  }, [uid]);

  const restoreDraft = () => {
    const d = loadDraft<CarDraftPayload>(DRAFT_FORM, uid);
    if (!d?.form) return;
    setStep(Math.min(3, Math.max(0, d.step)));
    const f = d.form;
    setForm(prev => ({
      ...prev,
      brandId: f.brandId,
      modelId: f.modelId,
      year: f.year,
      yearEnd: (f as { yearEnd?: string }).yearEnd ?? '',
      transmission: f.transmission,
      bodyType: f.bodyType,
      mileage: f.mileage,
      colour: f.colour,
      colourCustom: (f as { colourCustom?: string }).colourCustom ?? '',
      vin: f.vin,
      plate: f.plate,
      engineNumber: f.engineNumber,
      city: f.city,
      state: f.state,
      contactType: f.contactType,
      firstName: f.firstName,
      lastName: f.lastName,
      email: f.email,
      phone: f.phone,
      channel: f.channel,
      purchaseDate: f.purchaseDate,
      salesPerson: f.salesPerson,
      purchasePrice: f.purchasePrice,
      docs: prev.docs.map((doc, i) => ({
        ...doc,
        comment: f.docs[i]?.comment ?? doc.comment,
      })),
    }));
    setDraftBanner('none');
    toast.success('Draft restored');
  };

  const discardDraftPrompt = () => {
    clearDraft(DRAFT_FORM, uid);
    setDraftBanner('none');
    toast.message('Draft discarded');
  };

  const filteredModels = models.filter(m => m.brandId === form.brandId);

  const vinWarning = useMemo(() => {
    const v = form.vin.trim().toUpperCase();
    if (v.length !== 17 || /[IOQ]/.test(v)) return null;
    const exact = inventory.find(c => c.vin.toUpperCase() === v);
    if (exact) return { kind: 'exact' as const, carId: exact.id };
    const sim = findSimilarVins(v, inventory.map(c => c.vin.toUpperCase()), 2);
    if (sim.length) return { kind: 'similar' as const, vins: sim };
    return null;
  }, [form.vin]);

  const plateClash = useMemo(() => {
    const p = form.plate.trim();
    if (p.length < 3) return null;
    const hit = inventory.find(c => platesPossiblyEqual(c.plate, p));
    return hit ? hit.id : null;
  }, [form.plate]);

  const set = (key: string, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const checkVin = () => {
    const v = form.vin.trim().toUpperCase();
    if (v.length !== 17) return;
    if (/[IOQ]/.test(v)) setErrors(prev => ({ ...prev, vin: 'VIN cannot contain I, O, or Q' }));
  };

  const emailDuplicate = useMemo(
    () => crmContacts.some(c => c.email.toLowerCase() === form.email.trim().toLowerCase() && form.email.trim().length > 0),
    [form.email]
  );

  const validateStepAt = (s: number) => {
    let errs: Record<string, string> = {};
    if (s === 0) {
      const colourVal = form.colour === 'Custom' ? form.colourCustom.trim() : form.colour;
      errs = validateCarStep0(
        {
          brandId: form.brandId,
          modelId: form.modelId,
          year: form.year,
          mileage: form.mileage.replace(/,/g, ''),
          colour: colourVal,
          vin: form.vin,
          plate: form.plate,
        },
        { plateClash: !!plateClash, vinExactDuplicate: vinWarning?.kind === 'exact' }
      );
      if (form.colour === 'Custom' && !form.colourCustom.trim()) errs.colourCustom = 'Enter custom colour';
      if (!form.city.trim()) errs.city = 'City is required';
      if (!form.state) errs.state = 'State is required';
    }
    if (s === 1) {
      errs = validateCarStep1(
        { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
        { emailDuplicate }
      );
    }
    if (s === 2) {
      errs = validateCarStep2({
        channel: form.channel,
        purchaseDate: form.purchaseDate,
        salesPerson: form.salesPerson,
        purchasePrice: form.purchasePrice,
      });
    }
    return errs;
  };

  const validateStep = () => {
    let errs = validateStepAt(step);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep(x => Math.min(3, x + 1));
  };

  const goToStep = (target: number) => {
    if (target === step) return;
    if (target < step) {
      setStep(target);
      setErrors({});
      return;
    }
    let s = step;
    while (s < target) {
      const e = validateStepAt(s);
      if (Object.keys(e).length > 0) {
        setErrors(e);
        setStep(s);
        return;
      }
      s += 1;
    }
    setErrors({});
    setStep(target);
  };

  const saveDraftClick = () => {
    persistDraft();
    setDraftSaved(true);
    toast.success('Draft saved');
    setTimeout(() => setDraftSaved(false), 3000);
  };

  const handleSubmit = async () => {
    for (let s = 0; s <= 2; s++) {
      const e = validateStepAt(s);
      if (Object.keys(e).length > 0) {
        setStep(s);
        setErrors(e);
        toast.error('Complete required fields on all steps');
        return;
      }
    }
    const uploaded = form.docs.filter(d => d.file || d.done).length;
    if (uploaded < 6) {
      setStep(3);
      toast.error('Upload at least 6 of 8 documents');
      return;
    }
    setSaving(true);
    let newCarId = 'CK-49';
    try {
      const brand = brands.find(b => b.id === form.brandId);
      const model = models.find(m => m.id === form.modelId);
      const created = await carsApi.create({
        brand: brand?.name ?? '',
        model: model?.name ?? '',
        year: Number(form.year) || new Date().getFullYear(),
        plate: form.plate,
        vin: form.vin,
        colour: form.colourCustom || form.colour,
        mileage: Number(String(form.mileage).replace(/,/g, '')) || 0,
        city: form.city,
        state: form.state,
        channel: form.channel,
        purchasePrice: Number(form.purchasePrice) || 0,
        status: 'Acquired',
        transmission: form.transmission,
        bodyType: form.bodyType,
        engineNumber: form.engineNumber,
        contactType: form.contactType,
        contactName: [form.firstName, form.lastName].filter(Boolean).join(' '),
        contactEmail: form.email,
        contactPhone: form.phone,
        salesPerson: form.salesPerson,
        purchaseDate: form.purchaseDate,
      });
      newCarId = created.id;
    } catch (e) {
      setSaving(false);
      toast.error(e instanceof Error ? e.message : 'Could not register car');
      return;
    }
    setSaving(false);
    clearDraft(DRAFT_FORM, uid);
    if (fromAppointment && appointmentId) {
      try {
        await appointmentsApi.update(appointmentId, { linkedCarId: newCarId });
        toast.success(`Car ${newCarId} created from Appointment ${apptBanner?.bookingId ?? appointmentId}`);
      } catch {
        toast.success(`${newCarId} created — link appointment manually`);
      }
      if (inspectAfter === '1') {
        try {
          const ap = await appointmentsApi.get(appointmentId);
          if (ap) {
            storeAppointmentInspectionPrefill(ap, {
              carId: newCarId,
              car: {
                brand: brands.find(b => b.id === form.brandId)?.name,
                model: models.find(m => m.id === form.modelId)?.name,
                year: form.year,
                plate: form.plate,
                vin: form.vin,
                colour: form.colour === 'Custom' ? form.colourCustom : form.colour,
                city: form.city,
                transmission: form.transmission,
                bodyType: form.bodyType,
                mileage: form.mileage.replace(/,/g, '') || undefined,
              },
            });
          }
        } catch {
          /* still open inspection */
        }
        router.push(`/inspector-app/inspect/${newCarId}/overview`);
        return;
      }
    } else {
      toast.success(`${newCarId} Created Successfully`);
    }
    router.push(`/cars/${newCarId}`);
  };

  const simulateUpload = (i: number, file: File) => {
    setForm(prev => {
      const next = [...prev.docs];
      next[i] = { ...next[i], file, progress: 8, done: false };
      return { ...prev, docs: next };
    });
    const id = window.setInterval(() => {
      setForm(prev => {
        const next = [...prev.docs];
        const p = next[i].progress + 22;
        if (p >= 100) {
          window.clearInterval(id);
          next[i] = { ...next[i], file, progress: 100, done: true };
          return { ...prev, docs: next };
        }
        next[i] = { ...next[i], progress: p };
        return { ...prev, docs: next };
      });
    }, 100);
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="max-w-3xl mx-auto space-y-6">
        {apptBanner && (
          <div className="rounded-xl border border-[#ff8a65]/30 bg-sky-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-[#ff5722]">
              Pre-filled from appointment{' '}
              <span className="font-mono font-semibold">{apptBanner.bookingId}</span> — review fields then complete registration.
            </p>
            <Link
              href={`/appointments/${apptBanner.appointmentId}`}
              className="text-sm font-semibold text-[#ff8a65] hover:underline shrink-0"
            >
              View appointment →
            </Link>
          </div>
        )}
        {draftBanner === 'prompt' && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-amber-950">
              You have a saved registration draft (local). Restore it or start fresh.
            </p>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={restoreDraft} className="px-3 py-2 text-sm font-semibold rounded-lg bg-[#ff5722] text-white hover:bg-[#e64a19]">
                Restore draft
              </button>
              <button type="button" onClick={discardDraftPrompt} className="px-3 py-2 text-sm font-medium rounded-lg border border-amber-300 text-amber-950 hover:bg-amber-100">
                Discard
              </button>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/cars" className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8] transition-colors">
            <ArrowLeft size={16} className="text-[#6B7280]" />
          </Link>
          <div>
            <h1 className="text-xl font-heading font-bold text-[#1F2937]">Register New Car</h1>
            <p className="text-sm text-[#6B7280]">4-step registration wizard</p>
          </div>
          <button type="button" onClick={saveDraftClick} className="ml-auto text-xs text-[#6B7280] hover:text-[#1F2937] flex items-center gap-1.5 px-3 py-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F8] transition-colors">
            {draftSaved ? <><Check size={12} className="text-[#1A7A4A]" /> Draft saved</> : 'Save as Draft'}
          </button>
        </div>

        {/* Step indicator */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <button
                  type="button"
                  onClick={() => goToStep(i)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${i === step ? 'bg-[#ff5722] text-white' : i < step ? 'text-[#1A7A4A] hover:bg-green-50 cursor-pointer' : 'text-[#6B7280] hover:bg-[#F4F6F8] cursor-pointer'}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i === step ? 'bg-white text-[#ff5722]' : i < step ? 'bg-[#1A7A4A] text-white' : 'bg-[#E5E7EB] text-[#9CA3AF]'}`}>
                    {i < step ? <Check size={10} /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s}</span>
                </button>
                {i < STEPS.length - 1 && <ChevronRight size={14} className="text-[#E5E7EB] flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-5">
          {step === 0 && (
            <>
              <h2 className="text-base font-heading font-semibold text-[#1F2937]">Vehicle Identity</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Brand *</label>
                  <SearchableSelect
                    value={form.brandId}
                    onChange={v => {
                      set('brandId', v);
                      set('modelId', '');
                    }}
                    options={brands.filter(b => b.active).map(b => ({
                      value: b.id,
                      label: `${b.logo} ${b.name}`,
                    }))}
                    placeholder="Search or select brand…"
                    searchPlaceholder="Search brands…"
                    invalid={!!errors.brandId}
                  />
                  {errors.brandId && <p className="text-xs text-[#C0392B] mt-1">{errors.brandId}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Model *</label>
                  <SearchableSelect
                    value={form.modelId}
                    onChange={v => {
                      set('modelId', v);
                      // Re-validate year against the new model's production range
                      const allowed = yearOptionsForModelId(v).map(o => o.value);
                      if (form.year && !allowed.includes(form.year)) set('year', '');
                      if (form.yearEnd && !allowed.includes(form.yearEnd)) set('yearEnd', '');
                    }}
                    options={filteredModels.map(m => ({ value: m.id, label: m.name }))}
                    disabled={!form.brandId}
                    placeholder={form.brandId ? 'Search or select model…' : 'Select brand first'}
                    searchPlaceholder="Search models…"
                    invalid={!!errors.modelId}
                  />
                  {errors.modelId && <p className="text-xs text-[#C0392B] mt-1">{errors.modelId}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Year *</label>
                  <SearchableSelect
                    value={form.year}
                    onChange={v => set('year', v)}
                    options={yearOptionsForModelId(form.modelId)}
                    disabled={!form.modelId}
                    placeholder={form.modelId ? 'Search or select year…' : 'Select model first'}
                    searchPlaceholder="Search years…"
                    invalid={!!errors.year}
                  />
                  {errors.year && <p className="text-xs text-[#C0392B] mt-1">{errors.year}</p>}
                  {form.modelId && findModelById(form.modelId)?.yearFrom ? (
                    <p className="text-[10px] text-[#9CA3AF] mt-1">
                      {findModelById(form.modelId)?.name}: {findModelById(form.modelId)?.yearFrom}–{findModelById(form.modelId)?.yearTo}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Year range (optional)</label>
                  <SearchableSelect
                    value={form.yearEnd || '__same_year__'}
                    onChange={v => set('yearEnd', v === '__same_year__' ? '' : v)}
                    options={[
                      { value: '__same_year__', label: 'Same as year (single model year)' },
                      ...yearOptionsForModelId(form.modelId),
                    ]}
                    disabled={!form.modelId}
                    placeholder="Optional end year…"
                    searchPlaceholder="Search years…"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Mileage (km) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.mileage}
                    onChange={e => set('mileage', formatMileageInput(e.target.value))}
                    placeholder="e.g. 145,000"
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 ${errors.mileage ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`}
                  />
                  {errors.mileage && <p className="text-xs text-[#C0392B] mt-1">{errors.mileage}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-2">Transmission</label>
                <div className="flex flex-wrap gap-2">
                  {TRANSMISSIONS.map(t => (
                    <button key={t} onClick={() => set('transmission', t)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all ${form.transmission === t ? 'bg-[#ff5722] text-white border-[#ff5722]' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#ff8a65]'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-2">Body Type</label>
                <div className="flex flex-wrap gap-2">
                  {BODY_TYPES.map(t => (
                    <button key={t} onClick={() => set('bodyType', t)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all ${form.bodyType === t ? 'bg-[#ff5722] text-white border-[#ff5722]' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#ff8a65]'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-2">Colour *</label>
                <div className="grid grid-cols-8 gap-2 max-w-md">
                  {COLOUR_SWATCHES.map(c => (
                    <button
                      key={c.name}
                      type="button"
                      title={c.name}
                      onClick={() => { set('colour', c.name); setErrors(prev => ({ ...prev, colour: '', colourCustom: '' })); }}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${form.colour === c.name ? 'border-[#ff5722] scale-110 ring-2 ring-[#ff8a65]/30' : 'border-transparent hover:border-[#E5E7EB]'}`}
                      style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => set('colour', 'Custom')}
                  className={`mt-2 px-3 py-1.5 text-xs rounded-lg border ${form.colour === 'Custom' ? 'bg-[#ff5722] text-white border-[#ff5722]' : 'border-[#E5E7EB] text-[#6B7280]'}`}
                >
                  Custom
                </button>
                {form.colour === 'Custom' && (
                  <input
                    value={form.colourCustom}
                    onChange={e => set('colourCustom', e.target.value)}
                    placeholder="Describe colour…"
                    className={`mt-2 w-full px-3 py-2 text-sm border rounded-lg ${errors.colourCustom ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`}
                  />
                )}
                {errors.colour && <p className="text-xs text-[#C0392B] mt-1">{errors.colour}</p>}
                {errors.colourCustom && <p className="text-xs text-[#C0392B] mt-1">{errors.colourCustom}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">VIN * (17 characters)</label>
                  <input type="text" value={form.vin} onChange={e => set('vin', e.target.value.toUpperCase())} onBlur={checkVin}
                    maxLength={17} placeholder="e.g. JTDBE32K413012345"
                    className={`w-full px-3 py-2.5 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 ${errors.vin ? 'border-[#C0392B]' : vinWarning ? 'border-amber-400' : 'border-[#E5E7EB]'}`} />
                  <div className="flex items-center justify-between mt-1">
                    {errors.vin && <p className="text-xs text-[#C0392B]">{errors.vin}</p>}
                    <p className="text-xs text-[#9CA3AF] ml-auto">{form.vin.length}/17</p>
                  </div>
                  {vinWarning && vinWarning.kind === 'similar' && (
                    <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                      <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        Similar VIN(s) in system (possible duplicate): {vinWarning.vins.join(', ')} — verify before saving.
                      </p>
                    </div>
                  )}
                  {vinWarning && vinWarning.kind === 'exact' && (
                    <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                      <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        Duplicate VIN —{' '}
                        <Link href={`/cars/${vinWarning.carId}`} className="underline font-medium">
                          open {vinWarning.carId}
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Licence Plate *</label>
                  <input type="text" value={form.plate} onChange={e => set('plate', e.target.value.toUpperCase())} placeholder="e.g. LND-234-KJ"
                    className={`w-full px-3 py-2.5 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 ${errors.plate ? 'border-[#C0392B]' : plateClash ? 'border-amber-400' : 'border-[#E5E7EB]'}`} />
                  {errors.plate && <p className="text-xs text-[#C0392B] mt-1">{errors.plate}</p>}
                  {plateClash && !errors.plate && (
                    <p className="text-xs text-amber-700 mt-1">
                      Possible plate match: <Link href={`/cars/${plateClash}`} className="underline font-medium">{plateClash}</Link>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Engine Number</label>
                  <input type="text" value={form.engineNumber} onChange={e => set('engineNumber', e.target.value)} placeholder="Optional"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Registered city *</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Lekki"
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 ${errors.city ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`} />
                  {errors.city && <p className="text-xs text-[#C0392B] mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Registered state *</label>
                  <select value={form.state} onChange={e => set('state', e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 ${errors.state ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`}>
                    <option value="">Select state…</option>
                    {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="text-xs text-[#C0392B] mt-1">{errors.state}</p>}
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-base font-heading font-semibold text-[#1F2937]">Seller Contact</h2>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-2">Contact Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'Individual', label: 'Individual', icon: User },
                    { id: 'Dealer', label: 'Dealer', icon: Building2 },
                    { id: 'Corporate', label: 'Corporate', icon: Factory },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => set('contactType', t.id)}
                      className={`flex flex-col items-center gap-2 py-4 text-sm rounded-xl border-2 transition-all ${form.contactType === t.id ? 'border-[#ff5722] bg-[#ff5722]/5 text-[#ff5722] font-semibold' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#ff8a65]'}`}
                    >
                      <t.icon size={22} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">First Name *</label>
                  <input type="text" value={form.firstName} onChange={e => set('firstName', e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 ${errors.firstName ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`} />
                  {errors.firstName && <p className="text-xs text-[#C0392B] mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Last Name *</label>
                  <input type="text" value={form.lastName} onChange={e => set('lastName', e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 ${errors.lastName ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`} />
                  {errors.lastName && <p className="text-xs text-[#C0392B] mt-1">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 ${errors.email ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`} />
                  {errors.email && <p className="text-xs text-[#C0392B] mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Phone * (+234)</label>
                  <div className="flex">
                    <span className="px-3 py-2.5 bg-[#F4F6F8] border border-r-0 border-[#E5E7EB] rounded-l-lg text-sm text-[#6B7280]">+234</span>
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10}
                      className={`flex-1 px-3 py-2.5 text-sm border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 ${errors.phone ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`} />
                  </div>
                  {errors.phone && <p className="text-xs text-[#C0392B] mt-1">{errors.phone}</p>}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-base font-heading font-semibold text-[#1F2937]">Purchase Details</h2>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-2">Purchase Channel *</label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map(c => (
                    <button key={c} onClick={() => set('channel', c)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all ${form.channel === c ? 'bg-[#ff5722] text-white border-[#ff5722]' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#ff8a65]'}`}>
                      {c}
                    </button>
                  ))}
                </div>
                {errors.channel && <p className="text-xs text-[#C0392B] mt-1">{errors.channel}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Purchase Date *</label>
                  <input type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 ${errors.purchaseDate ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`} />
                  {errors.purchaseDate && <p className="text-xs text-[#C0392B] mt-1">{errors.purchaseDate}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Sales Person *</label>
                  <select
                    value={form.salesPerson}
                    onChange={e => set('salesPerson', e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 ${errors.salesPerson ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`}
                  >
                    <option value="">Select…</option>
                    {SALES_STAFF.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.salesPerson && <p className="text-xs text-[#C0392B] mt-1">{errors.salesPerson}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Purchase Price (₦) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm">₦</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.purchasePrice ? Number(form.purchasePrice.replace(/\D/g, '')).toLocaleString('en-NG') : ''}
                      onChange={e => set('purchasePrice', e.target.value.replace(/\D/g, ''))}
                      placeholder="5,000,000"
                      className={`w-full pl-8 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 ${errors.purchasePrice ? 'border-[#C0392B]' : 'border-[#E5E7EB]'}`}
                    />
                  </div>
                  {errors.purchasePrice && <p className="text-xs text-[#C0392B] mt-1">{errors.purchasePrice}</p>}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-base font-heading font-semibold text-[#1F2937]">Documents</h2>
              <p className="text-sm text-[#6B7280]">Upload supporting documents. At least 6 of 8 required for listing.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {form.docs.map((doc, i) => (
                  <div
                    key={doc.name}
                    className="border border-[#E5E7EB] rounded-xl p-4 space-y-3"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) simulateUpload(i, file);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#1F2937]">{doc.name}</p>
                      {doc.done && <span className="text-xs text-[#1A7A4A] font-semibold flex items-center gap-1"><Check size={12} /> Uploaded</span>}
                    </div>
                    <textarea
                      placeholder="Add comment…"
                      value={doc.comment}
                      onChange={e => {
                        const newDocs = [...form.docs];
                        newDocs[i] = { ...newDocs[i], comment: e.target.value };
                        setForm(prev => ({ ...prev, docs: newDocs }));
                      }}
                      rows={2}
                      className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                    />
                    {doc.progress > 0 && doc.progress < 100 && (
                      <div className="h-2 rounded-full bg-[#F4F6F8] overflow-hidden">
                        <div className="h-full bg-[#ff8a65] transition-all" style={{ width: `${doc.progress}%` }} />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <label className="flex flex-col items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-[#E5E7EB] rounded-lg text-xs text-[#6B7280] hover:border-[#ff8a65] cursor-pointer transition-colors">
                        <Upload size={14} /> Drag & drop or <span className="text-[#ff8a65] font-semibold">Select File(s)</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) simulateUpload(i, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] disabled:opacity-40 transition-colors">
            <ArrowLeft size={15} /> Back
          </button>
          {step < 3 ? (
            <button onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all">
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1A7A4A] text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60 transition-all">
              {saving ? 'Registering…' : 'Submit & Register Car'}
              {!saving && <Check size={15} />}
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function NewCarPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-[#6B7280]">Loading registration…</div>}>
      <NewCarPageInner />
    </Suspense>
  );
}
