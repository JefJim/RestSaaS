import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || 'myplatform.localhost';

  // Define platform domains
  const platformDomains = ['myplatform.localhost', 'myplatform.com', 'www.myplatform.com'];

  // Check if this is a platform domain
  const isPlatformDomain = platformDomains.some(domain => hostname.includes(domain));

  if (!isPlatformDomain) {
    // Not a platform domain, let it pass through
    return NextResponse.next();
  }

  // Extract the tenant slug from the hostname
  let currentHost = hostname.split(':')[0]; // Remove port

  // Remove platform domain parts
  currentHost = currentHost
    .replace('.myplatform.localhost', '')
    .replace('.myplatform.com', '')
    .replace('www.', '');

  // If currentHost is empty or is the base domain, it's not a tenant
  if (!currentHost || platformDomains.some(domain => currentHost === domain.split('.')[0])) {
    return NextResponse.next();
  }

  // Validate tenant slug format (alphanumeric, hyphens, underscores)
  const slugRegex = /^[a-zA-Z0-9_-]+$/;
  if (!slugRegex.test(currentHost)) {
    // Invalid slug format, redirect to 404 or home
    return NextResponse.redirect(new URL('/', req.url));
  }

  // For admin and platform routes, don't rewrite
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/platform')) {
    return NextResponse.next();
  }

  // Rewrite to tenant route
  const tenantPath = `/${currentHost}${url.pathname}`;
  return NextResponse.rewrite(new URL(tenantPath, req.url));
}
