import { NextResponse } from 'next/server';

/** Placeholder AI endpoint — replace with real vision service. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { image?: string };
    if (!body?.image || typeof body.image !== 'string') {
      return NextResponse.json({ error: 'image required' }, { status: 400 });
    }
    return NextResponse.json({
      defect: 'Surface panel deformation',
      confidence: 0.84,
      suggestedSeverity: 'Major' as const,
      description:
        'Visible panel deformation consistent with impact damage — verify extent in natural light',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
}
