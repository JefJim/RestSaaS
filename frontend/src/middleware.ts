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
  const hostname = req.headers.get('host') || '';

  // Get root domain from environment (e.g., "localhost:3000" or "tablehive.com")
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  // 1. Skip if it's the base platform domain without a subdomain
  if (hostname === rootDomain || hostname === `www.${rootDomain.split(':')[0]}`) {
     return NextResponse.next();
  }

  // 2. Extract subdomain/tenant slug
  // hostname = "pizzaluna.localhost:3000"
  // rootDomain = "localhost:3000"
  const currentHost = hostname.replace(`.${rootDomain}`, '');

  // 3. If there was no subdomain (currentHost === hostname), it's not a tenant URL
  if (currentHost === hostname) {
    return NextResponse.next();
  }

  // 4. Validate tenant slug format (alphanumeric, hyphens)
  const slugRegex = /^[a-zA-Z0-9_-]+$/;
  if (!slugRegex.test(currentHost)) {
    return NextResponse.next(); 
  }

  // 5. Exclude admin and platform routes from being rewritten (keep them global)
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/platform')) {
    return NextResponse.next();
  }

  // 6. Rewrite request to the [tenantSlug] dynamic route
  // e.g., /menu -> /pizzaluna/menu
  const tenantPath = `/${currentHost}${url.pathname}`;
  return NextResponse.rewrite(new URL(tenantPath, req.url));
}
