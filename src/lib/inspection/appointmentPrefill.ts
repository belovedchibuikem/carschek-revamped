import type { Appointment } from '@/lib/appointments/types';
import { findCarIdByVinOrPlate } from '@/lib/appointments/lookup';
import { storeInspectionPrefill } from '@/lib/inspection/prefillStore';

/** Optional car record fields used to enrich S03 when the appointment is sparse. */
export type CarPrefillSource = {
  brand?: string | null;
  model?: string | null;
  year?: number | string | null;
  plate?: string | null;
  vin?: string | null;
  mileage?: number | string | null;
  colour?: string | null;
  color?: string | null;
  city?: string | null;
  transmission?: string | null;
  bodyType?: string | null;
  body_type?: string | null;
  fuelType?: string | null;
  fuel_type?: string | null;
};

const S01_SERVICE_TYPES = [
  'Pre-Purchase Inspection',
  'Periodic Inspection',
  'Pre-Sale Inspection',
  'Insurance Inspection',
] as const;

const S01_LOCATIONS = [
  'Lagos Island',
  'Lagos Mainland',
  'Abuja Central',
  'Abuja Outskirts',
  'Port Harcourt',
  'Ibadan',
  'Kano',
  'Enugu',
  'Other',
] as const;

const S01_SALUTATIONS = ['Mr', 'Mrs', 'Miss', 'Dr', 'Engr'] as const;

const S03_TRANSMISSIONS = ['Automatic', 'Manual', 'CVT', 'Semi-Automatic'] as const;

const S03_CITIES = [
  'Lagos',
  'Abuja',
  'Port Harcourt',
  'Ibadan',
  'Kano',
  'Enugu',
  'Benin City',
  'Kaduna',
  'Owerri',
  'Warri',
  'Other',
] as const;

const S03_COLOURS = [
  'White',
  'Black',
  'Silver',
  'Grey',
  'Blue',
  'Red',
  'Brown',
  'Gold',
  'Green',
  'Yellow',
  'Orange',
  'Purple',
  'Beige',
  'Pearl White',
  'Navy Blue',
  'Other',
] as const;

function pickOption(value: string | undefined | null, options: readonly string[], fallback?: string): string | undefined {
  if (!value?.trim()) return fallback;
  const v = value.trim();
  const exact = options.find(o => o.toLowerCase() === v.toLowerCase());
  if (exact) return exact;
  const partial = options.find(
    o => o.toLowerCase().includes(v.toLowerCase()) || v.toLowerCase().includes(o.toLowerCase())
  );
  return partial ?? fallback;
}

function mapServiceType(serviceType: string | undefined): string {
  const raw = (serviceType || '').trim();
  const asOption = pickOption(raw, S01_SERVICE_TYPES);
  if (asOption) return asOption;
  const lower = raw.toLowerCase();
  if (lower.includes('sell') || lower.includes('pre-sale')) return 'Pre-Sale Inspection';
  if (lower.includes('insurance')) return 'Insurance Inspection';
  if (lower.includes('periodic') || lower.includes('general')) return 'Periodic Inspection';
  return 'Pre-Purchase Inspection';
}

function cityFromLocation(location: string | undefined | null): string {
  const loc = (location || '').trim();
  if (!loc) return 'Lagos';
  if (/lagos/i.test(loc)) return 'Lagos';
  if (/abuja/i.test(loc)) return 'Abuja';
  if (/port\s*harcourt/i.test(loc)) return 'Port Harcourt';
  return pickOption(loc, S03_CITIES, 'Other') ?? 'Other';
}

function mapInspectorLocation(location: string | undefined | null): string {
  const loc = (location || '').trim();
  const exact = pickOption(loc, S01_LOCATIONS);
  if (exact) return exact;
  if (/lagos/i.test(loc)) return 'Lagos Mainland';
  if (/abuja/i.test(loc)) return 'Abuja Central';
  if (/port\s*harcourt/i.test(loc)) return 'Port Harcourt';
  if (/ibadan/i.test(loc)) return 'Ibadan';
  if (/kano/i.test(loc)) return 'Kano';
  if (/enugu/i.test(loc)) return 'Enugu';
  return 'Other';
}

/**
 * Map a confirmed appointment (+ optional linked car) into S01/S03 checklist field ids.
 * Matches Laravel `BookingConversionService::buildPrefill` with safer dropdown normalization.
 */
export function appointmentToInspectionPrefill(
  a: Appointment,
  car?: CarPrefillSource | null
): Record<string, string> {
  const colour = car?.colour || car?.color || undefined;
  const bodyType = car?.bodyType || car?.body_type || undefined;
  const fuelType = car?.fuelType || car?.fuel_type || undefined;
  const plate = a.plateNumber || car?.plate || undefined;
  const vin = a.vinNumber || car?.vin || undefined;

  const out: Record<string, string | undefined | null> = {
    s01_salutation: pickOption(a.salutation, S01_SALUTATIONS, 'Mr'),
    s01_first_name: a.firstName || undefined,
    s01_last_name: a.lastName || undefined,
    s01_email: a.email || undefined,
    s01_country: 'Nigeria',
    s01_booking_id: a.bookingId || undefined,
    s01_service_type: mapServiceType(a.serviceType),
    s01_inspection_subtype: 'Standard',
    s01_customer_type: 'Individual',
    s01_location: mapInspectorLocation(a.location),
    s01_zone: 'Zone A',

    s03_brand: a.make || car?.brand || undefined,
    s03_model: a.model || car?.model || undefined,
    s03_year: a.year != null ? String(a.year) : car?.year != null ? String(car.year) : undefined,
    s03_transmission: pickOption(a.transmission || car?.transmission || undefined, S03_TRANSMISSIONS),
    s03_chasis_number: vin,
    s03_licence_plate: plate,
    s03_body_type: bodyType || undefined,
    s03_fuel_type: fuelType || undefined,
    s03_exterior_colour: pickOption(colour, S03_COLOURS),
    s03_mileage: car?.mileage != null && String(car.mileage) !== '' ? String(car.mileage) : undefined,
    s03_mileage_unit: 'KILOMETERS',
    s03_city_location: pickOption(car?.city, S03_CITIES) || cityFromLocation(a.location),

    // S02 toggle — Plate Number present? (checklist uses lowercase yes/no/na)
    s02_plate_number: plate ? 'yes' : undefined,
  };

  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(out)) {
    if (v != null && String(v).trim() !== '') clean[k] = String(v);
  }
  return clean;
}

/** Resolve which car / order ids should receive the same prefill blob. */
export function inspectionPrefillJobIds(a: Appointment, carId?: string | null): string[] {
  const ids = new Set<string>();
  const resolvedCar = carId || a.linkedCarId || findCarIdByVinOrPlate(a.vinNumber, a.plateNumber);
  if (resolvedCar) ids.add(resolvedCar);
  if (a.linkedOrderId) ids.add(a.linkedOrderId);
  if (a.linkedInspectionId) ids.add(a.linkedInspectionId);
  ids.add(a.id);
  return [...ids];
}

/** Persist appointment-derived prefill under every id the inspect URL might use. */
export function storeAppointmentInspectionPrefill(
  a: Appointment,
  opts?: {
    car?: CarPrefillSource | null;
    carId?: string | null;
    extraPrefill?: Record<string, string | null | undefined>;
    extraJobIds?: Array<string | null | undefined>;
  }
): Record<string, string> {
  const base = appointmentToInspectionPrefill(a, opts?.car);
  const merged = { ...base };
  if (opts?.extraPrefill) {
    for (const [k, v] of Object.entries(opts.extraPrefill)) {
      if (v != null && String(v).trim() !== '') merged[k] = String(v);
    }
  }
  // Normalize API values that may not match checklist dropdown options
  if (merged.s01_service_type) merged.s01_service_type = mapServiceType(merged.s01_service_type);
  if (merged.s01_location) merged.s01_location = mapInspectorLocation(merged.s01_location);
  if (merged.s03_city_location) {
    merged.s03_city_location = pickOption(merged.s03_city_location, S03_CITIES, cityFromLocation(merged.s03_city_location))!;
  }
  if (merged.s01_salutation) {
    merged.s01_salutation = pickOption(merged.s01_salutation, S01_SALUTATIONS, 'Mr')!;
  }
  if (merged.s03_transmission) {
    const t = pickOption(merged.s03_transmission, S03_TRANSMISSIONS);
    if (t) merged.s03_transmission = t;
    else delete merged.s03_transmission;
  }
  const ids = new Set(inspectionPrefillJobIds(a, opts?.carId));
  for (const id of opts?.extraJobIds ?? []) {
    if (id) ids.add(id);
  }
  for (const jobId of ids) {
    storeInspectionPrefill(jobId, merged);
  }
  return merged;
}
