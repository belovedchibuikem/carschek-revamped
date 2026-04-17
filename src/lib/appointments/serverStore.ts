import { APPOINTMENTS_SEED } from './seed';
import type { Appointment, AppointmentStatus, CallStatus, ServiceType } from './types';
import { generateBookingId } from './logic';

declare global {
  // eslint-disable-next-line no-var
  var __carschekAppointmentStore: Appointment[] | undefined;
}

function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

export function getAppointmentStore(): Appointment[] {
  if (!globalThis.__carschekAppointmentStore) {
    globalThis.__carschekAppointmentStore = deepClone(APPOINTMENTS_SEED);
  }
  return globalThis.__carschekAppointmentStore;
}

export function findAppointmentById(id: string): Appointment | undefined {
  return getAppointmentStore().find(a => a.id === id);
}

export { findCarIdByVinOrPlate } from './lookup';

function nextAppointmentId(): string {
  const rows = getAppointmentStore();
  let max = 200;
  for (const r of rows) {
    const m = /^APT-(\d+)$/.exec(r.id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `APT-${max + 1}`;
}

function uniqueBookingId(): string {
  const rows = getAppointmentStore();
  for (let i = 0; i < 50; i++) {
    const b = generateBookingId();
    if (!rows.some(r => r.bookingId === b)) return b;
  }
  return generateBookingId();
}

export type CreateAppointmentInput = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> & {
  bookingId?: string;
};

export function createAppointment(input: CreateAppointmentInput): Appointment {
  const store = getAppointmentStore();
  const now = new Date().toISOString();
  const row: Appointment = {
    ...input,
    id: nextAppointmentId(),
    bookingId: (input.bookingId && input.bookingId.trim()) || uniqueBookingId(),
    createdAt: now,
    updatedAt: now,
  };
  store.push(row);
  return row;
}

export type PatchAppointmentInput = Partial<
  Omit<Appointment, 'id' | 'bookingId' | 'createdAt'>
>;

export function patchAppointment(id: string, patch: PatchAppointmentInput): Appointment | null {
  const store = getAppointmentStore();
  const idx = store.findIndex(a => a.id === id);
  if (idx < 0) return null;
  const prev = store[idx];
  const next: Appointment = {
    ...prev,
    ...patch,
    id: prev.id,
    bookingId: prev.bookingId,
    createdAt: prev.createdAt,
    updatedAt: new Date().toISOString(),
  };
  store[idx] = next;
  return next;
}

export function deleteAppointment(id: string): boolean {
  const store = getAppointmentStore();
  const idx = store.findIndex(a => a.id === id);
  if (idx < 0) return false;
  store.splice(idx, 1);
  return true;
}

/** Map JSON body fields to full Appointment shape with defaults */
export function normalizeAppointmentPayload(body: Record<string, unknown>, existing?: Appointment): Appointment {
  const now = new Date().toISOString();
  const g = (k: string, d: unknown = '') => (body[k] !== undefined && body[k] !== null ? body[k] : d);
  const gb = (k: string, d = false) => Boolean(body[k] ?? d);
  const baseRow: Appointment =
    existing ??
    ({
      id: '',
      bookingId: '',
      salutation: 'Mr',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      agreeToSmsMarketing: false,
      agreedToEmailMarketing: false,
      make: '',
      model: '',
      year: new Date().getFullYear(),
      transmission: 'Automatic',
      vinNumber: '',
      serviceType: 'Inspection' as ServiceType,
      status: 'pending' as AppointmentStatus,
      location: '',
      serviceAddress: '',
      slot: now,
      bookingSource: 'Website',
      callStatus: 'Not Called' as CallStatus,
      createdAt: now,
      updatedAt: now,
      createdBy: 'USR-001',
    } as Appointment);

  return {
    ...baseRow,
    salutation: String(g('salutation', baseRow.salutation)),
    firstName: String(g('firstName', baseRow.firstName)),
    lastName: String(g('lastName', baseRow.lastName)),
    email: String(g('email', baseRow.email)),
    phone: String(g('phone', baseRow.phone)),
    phone2: body.phone2 !== undefined ? String(body.phone2) : baseRow.phone2,
    customerAddress:
      body.customerAddress !== undefined ? String(body.customerAddress || '') : baseRow.customerAddress,
    agreeToSmsMarketing: gb('agreeToSmsMarketing', baseRow.agreeToSmsMarketing),
    agreedToEmailMarketing: gb('agreedToEmailMarketing', baseRow.agreedToEmailMarketing),
    make: String(g('make', baseRow.make)),
    model: String(g('model', baseRow.model)),
    year: Number(g('year', baseRow.year)) || baseRow.year,
    trim: body.trim !== undefined ? String(body.trim) : baseRow.trim,
    transmission: String(g('transmission', baseRow.transmission)),
    vinNumber: String(g('vinNumber', baseRow.vinNumber)).replace(/\s/g, '').toUpperCase(),
    plateNumber: body.plateNumber !== undefined ? String(body.plateNumber) : baseRow.plateNumber,
    serviceType: (g('serviceType', baseRow.serviceType) as ServiceType) || baseRow.serviceType,
    status: (g('status', baseRow.status) as AppointmentStatus) || baseRow.status,
    location: String(g('location', baseRow.location)),
    serviceAddress: String(g('serviceAddress', baseRow.serviceAddress)),
    slot: String(g('slot', baseRow.slot)),
    bookingSource: String(g('bookingSource', baseRow.bookingSource)),
    callStatus: (g('callStatus', baseRow.callStatus) as CallStatus) || baseRow.callStatus,
    rejectionReason:
      body.rejectionReason !== undefined ? String(body.rejectionReason) : baseRow.rejectionReason,
    notes: body.notes !== undefined ? String(body.notes) : baseRow.notes,
    linkedCarId: body.linkedCarId !== undefined ? String(body.linkedCarId || '') || undefined : baseRow.linkedCarId,
    linkedInspectionId:
      body.linkedInspectionId !== undefined
        ? String(body.linkedInspectionId || '') || undefined
        : baseRow.linkedInspectionId,
    createdBy: String(g('createdBy', baseRow.createdBy)),
  };
}
