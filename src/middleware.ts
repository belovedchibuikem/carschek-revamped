import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PREFIXES = [
  '/authentication-screen',
  '/login',
  '/auth/',
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

  const adminPrefixes = ['/dashboard', '/cars', '/orders', '/finance', '/settings', '/customers', '/reports', '/listings', '/deals', '/auctions', '/crm', '/offers', '/activity', '/notifications', '/reference', '/vehicle-listings', '/inspector-management', '/inspection-orders-management', '/inspection-reports-qa', '/admin-dashboard', '/app-navigation'];
  const isAdminArea = adminPrefixes.some(p => pathname === p || pathname.startsWith(`${p}/`));

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
