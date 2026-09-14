import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

function upstreamBase(): string {
  return (process.env.API_UPSTREAM_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '')
    .trim()
    .replace(/\/$/, '');
}

function isSelfProxy(request: NextRequest, dest: URL): boolean {
  const incomingHost = (request.headers.get('host') || '').split(':')[0].toLowerCase();
  const destHost = dest.hostname.toLowerCase();
  if (incomingHost && destHost === incomingHost) return true;
  const vercel = (process.env.VERCEL_URL || '').replace(/^https?:\/\//, '').split(':')[0].toLowerCase();
  if (vercel && destHost === vercel) return true;
  return false;
}

async function proxy(request: NextRequest, path: string[]) {
  const base = upstreamBase();
  if (!base || !/^https?:\/\//i.test(base)) {
    return NextResponse.json(
      {
        message:
          'API upstream is not configured. Set API_UPSTREAM_URL or NEXT_PUBLIC_API_BASE_URL to the Laravel origin (e.g. https://webapp.carschek.com/api/v1).',
      },
      { status: 500 }
    );
  }

  let dest: URL;
  try {
    dest = new URL(base);
  } catch {
    return NextResponse.json({ message: 'Invalid API upstream URL.' }, { status: 500 });
  }

  if (isSelfProxy(request, dest)) {
    return NextResponse.json(
      {
        message:
          'API upstream points at this Next.js app. Set NEXT_PUBLIC_API_BASE_URL to the Laravel API (e.g. https://webapp.carschek.com/api/v1).',
      },
      { status: 500 }
    );
  }

  const suffix = (path ?? []).map(segment => encodeURIComponent(segment)).join('/');
  const url = new URL(suffix ? `${base}/${suffix}` : base);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (HOP_BY_HOP.has(k) || k === 'origin' || k === 'referer' || k === 'cookie') return;
    headers.set(key, value);
  });

  const method = request.method.toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD';
  const body = hasBody ? await request.arrayBuffer() : undefined;

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(url, {
      method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      redirect: 'manual',
      cache: 'no-store',
    });
  } catch (err) {
    return NextResponse.json(
      {
        message: 'Laravel API is unreachable from the app host.',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }

  const outHeaders = new Headers();
  upstreamRes.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (HOP_BY_HOP.has(k) || k === 'content-encoding' || k === 'content-length') return;
    outHeaders.set(key, value);
  });

  return new NextResponse(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers: outHeaders,
  });
}

async function handler(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(request, path ?? []);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;
