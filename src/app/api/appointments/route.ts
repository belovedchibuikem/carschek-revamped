import { NextResponse } from 'next/server';
import { createAppointment, getAppointmentStore, normalizeAppointmentPayload } from '@/lib/appointments/serverStore';
import { isSlotInPast, validateVin } from '@/lib/appointments/logic';
import type { Appointment } from '@/lib/appointments/types';

export async function GET() {
  const appointments = getAppointmentStore();
  return NextResponse.json({ appointments });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const vinCheck = validateVin(String(body.vinNumber ?? ''));
    if (!vinCheck.ok) {
      return NextResponse.json({ error: vinCheck.message }, { status: 400 });
    }
    if (isSlotInPast(String(body.slot ?? ''))) {
      return NextResponse.json({ error: 'Slot cannot be in the past' }, { status: 400 });
    }
    const normalized = normalizeAppointmentPayload(body) as Appointment;
    if (
      !normalized.salutation ||
      !normalized.firstName ||
      !normalized.lastName ||
      !normalized.email ||
      !normalized.phone ||
      !normalized.make ||
      !normalized.model ||
      !normalized.year ||
      !normalized.transmission ||
      !normalized.vinNumber ||
      !normalized.serviceType ||
      !normalized.status ||
      !normalized.location ||
      !normalized.serviceAddress ||
      !normalized.slot ||
      !normalized.bookingSource ||
      !normalized.callStatus
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const { id: _id, createdAt: _c, updatedAt: _u, ...createPayload } = normalized;
    const created = createAppointment(createPayload);
    return NextResponse.json({ appointment: created });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
