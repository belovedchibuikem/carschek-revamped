import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({
      ok: true,
      inspectionId: id,
      received: body,
      message: 'Flag recorded (demo — persist to DB when API is live)',
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}
