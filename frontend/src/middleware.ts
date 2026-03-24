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

  // Get hostname (e.g., 'pizzaluna.myplatform.localhost:3000')
  const hostname = req.headers.get('host') || 'myplatform.localhost';

  // Extract the tenant slug from the hostname
  // For local: pizzaluna.myplatform.localhost -> pizzaluna
  const currentHost = hostname.replace(`.myplatform.localhost`, '').replace(`.myplatform.com`, '').split(':')[0];

  // If the request isn't for the root domain (myplatform) and isn't www
  if (currentHost !== 'myplatform.localhost' && currentHost !== 'myplatform' && currentHost !== 'www' && currentHost !== 'localhost') {
    // If the path is /admin or /platform, let it route normally to those folders
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/platform')) {
      return NextResponse.next();
    }

    // Rewrite to the dynamic [tenantSlug] directory
    // e.g. pizzaluna.localhost/menu -> /[tenantSlug]/menu
    return NextResponse.rewrite(new URL(`/${currentHost}${url.pathname}`, req.url));
  }

  return NextResponse.next();
}
