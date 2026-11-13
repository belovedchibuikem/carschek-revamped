/**
 * Edge middleware — role redirects + optional auth guard.
 *
 * Production defaults (set in host env / .env.production):
 *   NEXT_PUBLIC_ENABLE_AUTH_GUARD=true
 *   NEXT_PUBLIC_DISABLE_MIDDLEWARE=false
 *
 * Local WAMP: keep the same unless you need to bypass while wiring auth.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PREFIXES = [
  '/authentication-screen',
  '/login',
  '/auth/',
  '/api/',
  '/403',
  '/server-error',
  '/_next',
  '/favicon',
  '/static',
];

export function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DISABLE_MIDDLEWARE === 'true') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const role = request.cookies.get('carschek-role')?.value;
  const authed = request.cookies.get('carschek-auth')?.value === '1' || role;

  const adminPrefixes = [
    '/dashboard',
    '/cars',
    '/orders',
    '/finance',
    '/settings',
    '/customers',
    '/reports',
    '/listings',
    '/deals',
    '/auctions',
    '/crm',
    '/offers',
    '/activity',
    '/notifications',
    '/reference',
    '/users',
    '/inspectors',
    '/vehicle-valuation',
    '/vehicle-outcomes',
    '/ai-training',
    '/scanner-ingest',
    '/vehicle-listings',
    '/inspector-management',
    '/inspection-orders-management',
    '/inspection-reports-qa',
    '/admin-dashboard',
    '/app-navigation',
    '/my-reports',
  ];
  const isAdminArea = adminPrefixes.some(p => pathname === p || pathname.startsWith(`${p}/`));
  const staffOnly =
    pathname === '/users' ||
    pathname.startsWith('/users/') ||
    pathname === '/settings' ||
    pathname.startsWith('/settings/');

  // Staff management: super-admin + ops-manager only
  if (staffOnly && role && role !== 'super-admin' && role !== 'ops-manager') {
    return NextResponse.redirect(new URL(role === 'inspector' ? '/inspector/jobs' : '/403', request.url));
  }

  // Inspector role: keep on PWA / inspector flows; redirect core admin away
  if (
    role === 'inspector' &&
    isAdminArea &&
    !pathname.startsWith('/inspector') &&
    !pathname.startsWith('/inspector-app') &&
    !pathname.startsWith('/authentication-screen') &&
    !pathname.startsWith('/403')
  ) {
    return NextResponse.redirect(new URL('/inspector/jobs', request.url));
  }

  // Customers / dealers only see their assigned reports
  if (role === 'customer') {
    const allowed =
      pathname === '/my-reports' ||
      pathname.startsWith('/my-reports/') ||
      pathname.startsWith('/reports/') ||
      pathname.startsWith('/authentication-screen');
    if (!allowed) {
      return NextResponse.redirect(new URL('/my-reports', request.url));
    }
  }

  // Finance role: block inspector PWA shell (use admin finance instead)
  if (role === 'finance' && (pathname.startsWith('/inspector/') || pathname.startsWith('/inspector-app/'))) {
    return NextResponse.redirect(new URL('/finance', request.url));
  }

  // Inspector-only: keep on inspector routes if role is inspector
  if (pathname.startsWith('/inspector/') && !pathname.startsWith('/inspector-app')) {
    if (role === 'inspector' && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/inspector/jobs', request.url));
    }
  }

  if (process.env.NEXT_PUBLIC_ENABLE_AUTH_GUARD === 'true' && !authed && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/authentication-screen', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
