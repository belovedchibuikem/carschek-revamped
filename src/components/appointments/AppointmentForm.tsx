'use client';

import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { BRANDS, MODELS } from '@/lib/mockData';
import { CARS } from '@/lib/mockData';
import { yearOptionsForModelName } from '@/lib/reference/carCascade';
import {
  BOOKING_SOURCES,
  CALL_STATUSES,
  LOCATIONS_SAMPLE,
  SALUTATIONS,
  SERVICE_TYPES,
  TRANSMISSIONS,
} from '@/lib/appointments/constants';
import type { Appointment } from '@/lib/appointments/types';
import { isSlotInPast, normalizeNigerianPhone, validateVin } from '@/lib/appointments/logic';
import { SearchableSelect } from '@/components/shared/SearchableSelect';

export type AppointmentFormValues = {
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phone2: string;
  customerAddress: string;
  agreeToSmsMarketing: boolean;
  agreedToEmailMarketing: boolean;
  make: string;
  model: string;
  year: number;
  trim: string;
  transmission: string;
  vinNumber: string;
  plateNumber: string;
  serviceType: string;
  status: string;
  location: string;
  serviceAddress: string;
  slot: string;
  bookingSource: string;
  callStatus: string;
  rejectionReason: string;
  notes: string;
};

function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function defaultsFromAppointment(a?: Appointment | null): AppointmentFormValues {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const fallbackSlot = now.toISOString().slice(0, 16);
  if (!a) {
    return {
      salutation: 'Mr',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      phone2: '',
      customerAddress: '',
      agreeToSmsMarketing: false,
      agreedToEmailMarketing: false,
      make: 'Toyota',
      model: 'Camry',
      year: 2019,
      trim: '',
      transmission: 'Automatic',
      vinNumber: '',
      plateNumber: '',
      serviceType: 'Inspection',
      status: 'pending',
      location: 'Lagos',
      serviceAddress: '',
      slot: fallbackSlot,
      bookingSource: 'Website',
      callStatus: 'Not Called',
      rejectionReason: '',
      notes: '',
    };
  }
  return {
    salutation: a.salutation,
    firstName: a.firstName,
    lastName: a.lastName,
    email: a.email,
    phone: a.phone,
    phone2: a.phone2 ?? '',
    customerAddress: a.customerAddress ?? '',
    agreeToSmsMarketing: a.agreeToSmsMarketing,
    agreedToEmailMarketing: a.agreedToEmailMarketing,
    make: a.make,
    model: a.model,
    year: a.year,
    trim: a.trim ?? '',
    transmission: a.transmission,
    vinNumber: a.vinNumber,
    plateNumber: a.plateNumber ?? '',
    serviceType: a.serviceType,
    status: a.status,
    location: a.location,
    serviceAddress: a.serviceAddress,
    slot: isoToDatetimeLocal(a.slot),
    bookingSource: a.bookingSource,
    callStatus: a.callStatus,
    rejectionReason: a.rejectionReason ?? '',
    notes: a.notes ?? '',
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = {
  mode: 'create' | 'edit';
  initial?: Appointment | null;
  /** Other appointments (for VIN duplicate check excluding current id in edit) */
  allAppointments: Appointment[];
  excludeId?: string;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
};

export function AppointmentForm({
  mode,
  initial,
  allAppointments,
  excludeId,
  onSubmit,
  onCancel,
  submitLabel,
}: Props) {
  const { register, handleSubmit, watch, setValue, control, formState } = useForm<AppointmentFormValues>({
    defaultValues: defaultsFromAppointment(initial),
  });

  const make = watch('make');
  const model = watch('model');
  const brand = useMemo(() => BRANDS.find(b => b.name === make), [make]);
  const modelOptions = useMemo(
    () => MODELS.filter(m => m.brandId === brand?.id),
    [brand?.id]
  );

  const vinDup = (vin: string) => {
    const v = vin.replace(/\s/g, '').toUpperCase();
    if (v.length !== 17) return null;
    const carHit = CARS.find(c => c.vin.replace(/\s/g, '').toUpperCase() === v);
    if (carHit) return `Matches existing car ${carHit.id}`;
    const aptHit = allAppointments.find(
      a => a.id !== excludeId && a.vinNumber.replace(/\s/g, '').toUpperCase() === v
    );
    if (aptHit) return `Used on appointment ${aptHit.bookingId}`;
    return null;
  };

  const submitInner = async (values: AppointmentFormValues) => {
    const errs: string[] = [];
    if (!values.firstName.trim()) errs.push('First name required');
    if (!values.lastName.trim()) errs.push('Last name required');
    if (!EMAIL_RE.test(values.email.trim())) errs.push('Valid email required');
    const phoneN = normalizeNigerianPhone(values.phone);
    if (phoneN.replace(/\D/g, '').length < 12) errs.push('Valid Nigerian phone required');
    const vinVal = validateVin(values.vinNumber);
    if (!vinVal.ok) errs.push(vinVal.message ?? 'Invalid VIN');
    const dupMsg = vinDup(values.vinNumber);
    if (dupMsg) errs.push(dupMsg);
    const slotIso = new Date(values.slot).toISOString();
    if (isSlotInPast(slotIso)) errs.push('Slot cannot be in the past');
    if (!values.trim.trim()) errs.push('Trim required');
    if (!values.serviceAddress.trim()) errs.push('Service address required');
    if (errs.length) {
      window.alert(errs.join('\n'));
      return;
    }
    await onSubmit({
      salutation: values.salutation,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      phone: phoneN,
      phone2: values.phone2.trim() ? normalizeNigerianPhone(values.phone2) : '',
      customerAddress: values.customerAddress.trim(),
      agreeToSmsMarketing: values.agreeToSmsMarketing,
      agreedToEmailMarketing: values.agreedToEmailMarketing,
      make: values.make,
      model: values.model,
      year: Number(values.year),
      trim: values.trim.trim(),
      transmission: values.transmission,
      vinNumber: values.vinNumber.replace(/\s/g, '').toUpperCase(),
      plateNumber: values.plateNumber.trim(),
      serviceType: values.serviceType,
      status: values.status,
      location: values.location,
      serviceAddress: values.serviceAddress.trim(),
      slot: slotIso,
      bookingSource: values.bookingSource,
      callStatus: values.callStatus,
      rejectionReason: values.rejectionReason.trim(),
      notes: values.notes.trim(),
    });
  };

  const field =
    'w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 bg-white';
  const label = 'block text-xs font-semibold text-[#374151] mb-1.5';

  return (
    <form onSubmit={handleSubmit(submitInner)} className="space-y-8 max-w-4xl">
      <section className="space-y-4">
        <h2 className="text-sm font-heading font-bold text-[#ff5722] border-b border-[#E5E7EB] pb-2">
          Contact details
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Salutation *</label>
            <select {...register('salutation')} className={field}>
              {SALUTATIONS.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>First name *</label>
            <input {...register('firstName')} className={field} />
          </div>
          <div>
            <label className={label}>Last name *</label>
            <input {...register('lastName')} className={field} />
          </div>
          <div>
            <label className={label}>Email *</label>
            <input type="email" {...register('email')} className={field} />
          </div>
          <div>
            <label className={label}>Phone *</label>
            <input {...register('phone')} placeholder="+234…" className={field} />
          </div>
          <div>
            <label className={label}>Phone 2</label>
            <input {...register('phone2')} placeholder="+234…" className={field} />
          </div>
        </div>
        <div>
          <label className={label}>Address</label>
          <input {...register('customerAddress')} className={field} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-[#374151]">
            <input type="checkbox" {...register('agreeToSmsMarketing')} className="rounded border-gray-300" />
            Agree to SMS marketing
          </label>
          <label className="flex items-center gap-2 text-sm text-[#374151]">
            <input type="checkbox" {...register('agreedToEmailMarketing')} className="rounded border-gray-300" />
            Agreed to email marketing
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-heading font-bold text-[#ff5722] border-b border-[#E5E7EB] pb-2">
          Vehicle &amp; lead details
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Make (brand) *</label>
            <Controller
              name="make"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  value={field.value}
                  onChange={v => {
                    field.onChange(v);
                    const b = BRANDS.find(x => x.name === v);
                    const first = MODELS.find(m => m.brandId === b?.id);
                    if (first) setValue('model', first.name);
                  }}
                  options={BRANDS.filter(b => b.active).map(b => ({ value: b.name, label: b.name }))}
                  placeholder="Search or select make…"
                  searchPlaceholder="Search brands…"
                />
              )}
            />
          </div>
          <div>
            <label className={label}>Model *</label>
            <Controller
              name="model"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  value={field.value}
                  onChange={v => {
                    field.onChange(v);
                    // Re-validate year against the new model's production range
                    const allowed = yearOptionsForModelName(make, v).map(o => o.value);
                    const cur = String(watch('year') ?? '');
                    if (cur && !allowed.includes(cur)) setValue('year', '' as unknown as number);
                  }}
                  options={modelOptions.map(m => ({ value: m.name, label: m.name }))}
                  disabled={!brand}
                  placeholder={brand ? 'Search or select model…' : 'Select make first'}
                  searchPlaceholder="Search models…"
                />
              )}
            />
          </div>
          <div>
            <label className={label}>Year *</label>
            <Controller
              name="year"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  value={field.value ? String(field.value) : ''}
                  onChange={v => field.onChange(Number(v))}
                  options={yearOptionsForModelName(make, model)}
                  disabled={!model}
                  placeholder={model ? 'Search or select year…' : 'Select model first'}
                  searchPlaceholder="Search years…"
                />
              )}
            />
          </div>
          <div>
            <label className={label}>Trim *</label>
            <input {...register('trim')} className={field} placeholder="e.g. LE" />
          </div>
          <div>
            <label className={label}>Transmission *</label>
            <select {...register('transmission')} className={field}>
              {TRANSMISSIONS.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>VIN number *</label>
            <input
              {...register('vinNumber')}
              className={`${field} font-mono uppercase`}
              maxLength={17}
              onBlur={e => {
                e.target.value = e.target.value.replace(/\s/g, '').toUpperCase();
              }}
            />
          </div>
          <div>
            <label className={label}>Plate number</label>
            <input {...register('plateNumber')} className={`${field} font-mono`} />
          </div>
          <div>
            <label className={label}>Service type *</label>
            <select {...register('serviceType')} className={field}>
              {SERVICE_TYPES.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-heading font-bold text-[#ff5722] border-b border-[#E5E7EB] pb-2">
          Booking details
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Status *</label>
            <select {...register('status')} className={field}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>
          <div>
            <label className={label}>Location *</label>
            <select {...register('location')} className={field}>
              {LOCATIONS_SAMPLE.map(l => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Full service address *</label>
            <input {...register('serviceAddress')} className={field} />
          </div>
          <div>
            <label className={label}>Slot *</label>
            <input type="datetime-local" {...register('slot')} className={field} />
          </div>
          <div>
            <label className={label}>Booking source *</label>
            <select {...register('bookingSource')} className={field}>
              {BOOKING_SOURCES.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Call status *</label>
            <select {...register('callStatus')} className={field}>
              {CALL_STATUSES.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Rejection reason</label>
            <input {...register('rejectionReason')} className={field} />
          </div>
        </div>
        <div>
          <label className={label}>Notes / special instructions</label>
          <textarea {...register('notes')} rows={3} className={field} />
        </div>
      </section>

      {formState.isSubmitting && <p className="text-sm text-[#6B7280]">Saving…</p>}

      <div className="flex flex-wrap gap-3 justify-end pt-2 border-t border-[#E5E7EB]">
        <button type="button" onClick={onCancel} className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F4F6F8]">
          Cancel
        </button>
        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="px-5 py-2.5 bg-[#ff5722] text-white rounded-lg text-sm font-semibold hover:bg-[#e64a19] disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
