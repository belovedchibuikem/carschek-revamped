import type { Appointment } from './types';

const MS_DAY = 86_400_000;

export function isAppointmentConfirmed(a: Appointment): boolean {
  if (a.callStatus === 'Called & Confirmed') return true;
  if (a.status === 'confirmed') return true;
  return false;
}

export function isAppointmentUnconfirmed(a: Appointment): boolean {
  return !isAppointmentConfirmed(a);
}

export function isInspectedAppointment(a: Appointment): boolean {
  return (
    isAppointmentConfirmed(a) &&
    a.serviceType === 'Inspection' &&
    !!a.linkedInspectionId &&
    !!a.linkedCarId
  );
}

export function appointmentStatusBadge(a: Appointment): {
  key: 'confirmed' | 'pending' | 'rejected' | 'no-answer' | 'cancelled';
  label: string;
  className: string;
} {
  if (a.status === 'cancelled') {
    return { key: 'cancelled', label: 'Cancelled', className: 'bg-gray-100 text-gray-600' };
  }
  if (a.status === 'rejected' || a.callStatus === 'Called & Rejected') {
    return { key: 'rejected', label: 'Rejected', className: 'bg-red-50 text-red-700' };
  }
  if (isAppointmentConfirmed(a)) {
    return { key: 'confirmed', label: 'Confirmed', className: 'bg-green-50 text-green-700' };
  }
  if (a.callStatus === 'Called - No Answer') {
    return { key: 'no-answer', label: 'Called — No Answer', className: 'bg-gray-100 text-gray-700' };
  }
  return { key: 'pending', label: 'Pending', className: 'bg-amber-50 text-amber-800' };
}

export function callStatusBadgeClass(callStatus: string | null | undefined): string {
  switch (callStatus) {
    case 'Called & Confirmed':
      return 'bg-green-50 text-green-800 font-semibold';
    case 'Called & Rejected':
      return 'bg-red-50 text-red-800 font-semibold';
    case 'Called - No Answer':
      return 'bg-gray-100 text-gray-700 font-semibold';
    case 'Rescheduled':
      return 'bg-blue-50 text-blue-800 font-semibold';
    case 'Not Called':
    default:
      return 'bg-amber-50 text-amber-900 font-semibold';
  }
}

export function formatSlotDisplay(slotIso: string): string {
  const d = new Date(slotIso);
  if (Number.isNaN(d.getTime())) return slotIso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min} · My Car Status`;
}

export function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function slotLabelForDialog(slotIso: string): string {
  const d = new Date(slotIso);
  if (Number.isNaN(d.getTime())) return slotIso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} at ${hh}:${min}`;
}

export function isSlotInPast(slotIso: string): boolean {
  const t = new Date(slotIso).getTime();
  if (Number.isNaN(t)) return false;
  return t < Date.now();
}

export function generateBookingId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 12; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

export function normalizeNigerianPhone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('234')) return `+${d}`;
  if (d.startsWith('0') && d.length >= 10) return `+234${d.slice(1)}`;
  if (d.length >= 10) return `+234${d}`;
  return raw.trim();
}

export function validateVin(v: string): { ok: boolean; message?: string } {
  const x = v.replace(/\s/g, '').toUpperCase();
  if (x.length !== 17) return { ok: false, message: 'VIN must be exactly 17 characters' };
  if (/[IOQ]/.test(x)) return { ok: false, message: 'VIN cannot contain I, O, or Q' };
  return { ok: true };
}

export type AppointmentKpiStats = {
  total: number;
  confirmed: number;
  unconfirmed: number;
  todayCount: number;
  nextTodaySlot: string | null;
  readyToInspect: number;
  notCalled: number;
  oldestNotCalledDays: number | null;
  confirmedTodayDelta: number;
  monthNew: number;
};

export function computeAppointmentKpis(rows: Appointment[], now = new Date()): AppointmentKpiStats {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = startOfToday + MS_DAY;
  const confirmed = rows.filter(isAppointmentConfirmed);
  const unconfirmed = rows.filter(isAppointmentUnconfirmed);

  const todayRows = rows.filter(r => {
    const t = new Date(r.slot).getTime();
    return !Number.isNaN(t) && t >= startOfToday && t < endOfToday;
  });

  const todaySorted = [...todayRows].sort((a, b) => new Date(a.slot).getTime() - new Date(b.slot).getTime());
  const nextSlot = todaySorted.find(r => new Date(r.slot).getTime() >= now.getTime());

  const readyToInspect = rows.filter(
    r =>
      isAppointmentConfirmed(r) &&
      r.serviceType === 'Inspection' &&
      !r.linkedInspectionId
  ).length;

  const notCalledRows = rows.filter(r => r.callStatus === 'Not Called');
  const notCalled = notCalledRows.length;
  let oldestNotCalledDays: number | null = null;
  for (const r of notCalledRows) {
    const c = new Date(r.createdAt).getTime();
    if (Number.isNaN(c)) continue;
    const days = Math.floor((now.getTime() - c) / MS_DAY);
    if (oldestNotCalledDays === null || days > oldestNotCalledDays) oldestNotCalledDays = days;
  }

  const confirmedToday = confirmed.filter(r => {
    const u = new Date(r.updatedAt).getTime();
    return !Number.isNaN(u) && u >= startOfToday && u < endOfToday && r.callStatus === 'Called & Confirmed';
  }).length;

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthNew = rows.filter(r => new Date(r.createdAt).getTime() >= monthStart).length;

  return {
    total: rows.length,
    confirmed: confirmed.length,
    unconfirmed: unconfirmed.length,
    todayCount: todayRows.length,
    nextTodaySlot: nextSlot ? slotLabelForDialog(nextSlot.slot) : null,
    readyToInspect,
    notCalled,
    oldestNotCalledDays,
    confirmedTodayDelta: confirmedToday,
    monthNew,
  };
}
