import { NextResponse } from 'next/server';
import {
  deleteAppointment,
  findAppointmentById,
  normalizeAppointmentPayload,
  patchAppointment,
} from '@/lib/appointments/serverStore';
import { isSlotInPast, validateVin } from '@/lib/appointments/logic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const row = findAppointmentById(id);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ appointment: row });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const existing = findAppointmentById(id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  try {
    const body = (await req.json()) as Record<string, unknown>;
    if (body.vinNumber !== undefined) {
      const vinCheck = validateVin(String(body.vinNumber ?? ''));
      if (!vinCheck.ok) return NextResponse.json({ error: vinCheck.message }, { status: 400 });
    }
    if (body.slot !== undefined && isSlotInPast(String(body.slot))) {
      return NextResponse.json({ error: 'Slot cannot be in the past' }, { status: 400 });
    }
    const merged = normalizeAppointmentPayload({ ...existing, ...body }, existing);
    const { id: _i, bookingId: _b, createdAt: _ca, updatedAt: _ua, ...patch } = merged;
    void _i;
    void _b;
    void _ca;
    void _ua;
    const updated = patchAppointment(id, patch);
    return NextResponse.json({ appointment: updated });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const ok = deleteAppointment(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
