import { NextResponse } from 'next/server';

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let body: { status?: string } = {};
  try {
    body = (await req.json()) as { status?: string };
  } catch {
    /* empty body ok for mock */
  }
  return NextResponse.json({
    ok: true,
    carId: id,
    status: body.status ?? null,
    auditLoggedAt: new Date().toISOString(),
  });
}
