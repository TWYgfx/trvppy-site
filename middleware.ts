import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Minimal middleware to allow Next/Vercel internal validation requests to reach
 * the public pages that we revalidate (/, /products/*).
 *
 * It checks for headers that Vercel sets when proxying to a deployment and
 * allows those requests to pass through without any auth gating. Keep this
 * conservative — only bypass for known hosts/headers.
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Only consider bypass for the specific routes we revalidate
  if (!(pathname === '/' || pathname.startsWith('/products/'))) {
    return NextResponse.next();
  }

  // Gather indicators that the request was proxied by Vercel to this deployment
  const vercelDeploymentHeader = req.headers.get('x-vercel-deployment-url');
  const vercelScHost = req.headers.get('x-vercel-sc-host');
  const host = req.headers.get('host') || '';
  const vercelUrl = process.env.VERCEL_URL || '';

  const looksLikeVercelProxy = Boolean(
    vercelDeploymentHeader || vercelScHost || (vercelUrl && host.includes(vercelUrl))
  );

  if (looksLikeVercelProxy) {
    // Helpful debug log so we can see when the middleware is allowing a Vercel proxied request
    try {
      console.debug('[middleware] Vercel proxy detected, bypassing auth for', { vercelDeploymentHeader, vercelScHost, host, vercelUrl });
    } catch {}
    // Allow internal Vercel validation requests to pass so revalidation can succeed
    return NextResponse.next();
  }

  // ...existing auth or other middleware logic can go here. For now, do nothing
  // and allow the app's own auth to run (or reject) as it did before.
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/products/:path*'],
};
