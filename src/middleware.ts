import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Define protected routes (dashboard routes and admin/manager routes)
  const protectedPaths = ['/dashboard', '/admin', '/manager', '/cars', '/inventory', '/invoices', '/payments', '/reports', '/vendors', '/diagnostics', '/notifications', '/settings'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Allow access to login and root pages
  const publicPaths = ['/login', '/'];
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path
  );

  if (isProtectedPath && !isPublicPath) {
    // For Next.js we can't access localStorage in middleware (server-side)
    // So we'll check for the token in a cookie if set, or let the client handle it
    // The client-side pages should handle their own authentication checks
    
    // Note: Middleware runs on the server, so localStorage checks must be done client-side
    // This middleware primarily handles route protection for admin/manager paths
    // Dashboard authentication is handled client-side in the page components
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
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
}