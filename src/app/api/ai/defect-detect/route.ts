import { NextResponse } from 'next/server';

export type DefectDetectResponse = {
  defect: string;
  confidence: number;
  suggestedSeverity: 'Minor' | 'Major' | 'Critical';
  description: string;
  provider: 'stub' | 'openai' | 'disabled';
  requiresHumanConfirm: true;
};

const STUB: DefectDetectResponse = {
  defect: 'Surface panel deformation',
  confidence: 0.84,
  suggestedSeverity: 'Major',
  description:
    'Visible panel deformation consistent with impact damage — verify extent in natural light. Suggestion only; confirm before applying.',
  provider: 'stub',
  requiresHumanConfirm: true,
};

function visionEnabled(): boolean {
  const raw = (process.env.NEXT_PUBLIC_PHASE1_VISION_ASSIST ?? 'true').trim().toLowerCase();
  return raw !== 'false' && raw !== '0' && raw !== 'off';
}

/**
 * Phase 1 vision assist.
 * - Default / no key → deterministic stub (existing UX continues).
 * - OPENAI_API_KEY or CARSCHEK_VISION_API_KEY → optional OpenAI vision call; falls back to stub on error.
 * Never auto-applies severity; client must keep human confirm.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { image?: string };
    if (!body?.image || typeof body.image !== 'string') {
      return NextResponse.json({ error: 'image required' }, { status: 400 });
    }

    if (!visionEnabled()) {
      return NextResponse.json({
        ...STUB,
        provider: 'disabled' as const,
        description: 'Vision assist disabled by flag — describe the defect manually.',
        confidence: 0,
      } satisfies DefectDetectResponse);
    }

    const apiKey = process.env.CARSCHEK_VISION_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(STUB);
    }

    try {
      const live = await callOpenAiVision(apiKey, body.image);
      if (live) return NextResponse.json(live);
    } catch {
      /* fall through to stub — never break capture UX */
    }

    return NextResponse.json(STUB);
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
}

async function callOpenAiVision(apiKey: string, imageBase64: string): Promise<DefectDetectResponse | null> {
  const model = process.env.CARSCHEK_VISION_MODEL || 'gpt-4o-mini';
  const dataUrl = imageBase64.startsWith('data:')
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You assist vehicle inspectors. Return JSON only: {"defect":string,"confidence":0-1,"suggestedSeverity":"Minor"|"Major"|"Critical","description":string}. Be conservative. This is a suggestion for human confirmation.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this vehicle damage photo for inspection notes.' },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) return null;
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content) as {
    defect?: string;
    confidence?: number;
    suggestedSeverity?: string;
    description?: string;
  };

  const sevRaw = String(parsed.suggestedSeverity || 'Major');
  const suggestedSeverity =
    sevRaw === 'Critical' || sevRaw === 'Minor' || sevRaw === 'Major'
      ? (sevRaw as DefectDetectResponse['suggestedSeverity'])
      : 'Major';

  return {
    defect: String(parsed.defect || 'Possible surface damage'),
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5)),
    suggestedSeverity,
    description: String(
      parsed.description || 'Vision suggestion — verify in natural light before applying.'
    ),
    provider: 'openai',
    requiresHumanConfirm: true,
  };
}
