// export { auth as middleware } from "next-auth/middleware" // Option 1: Basic, protects all routes by default

// Option 2: More granular control with a custom middleware function
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Define public paths that don't require authentication
  const publicPaths = [
    '/', // Homepage
    '/login',
    '/register',
    '/explorar', // Assuming 'explorar' is public
    // Add other public paths like /api/public-endpoint, /images, /styles, etc.
    '/images/:path*',
    '/styles/:path*',
    '/favicon.ico',
  ];

  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => {
    if (path.includes(':path*')) {
      // Handle dynamic segments like /images/*
      const basePath = path.split('/:path*')[0];
      return pathname.startsWith(basePath);
    }
    return pathname === path;
  });

  // Allow requests to NextAuth API routes and public paths
  if (pathname.startsWith('/api/auth/') || isPublicPath) {
    return NextResponse.next();
  }

  // If no token and trying to access a protected route, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname); // Optional: redirect back after login
    return NextResponse.redirect(loginUrl);
  }

  // If token exists, allow access
  return NextResponse.next();
}

// Specify which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (NextAuth.js routes) - already handled above, but good to be explicit
     * This ensures middleware runs on pages and API routes that need protection.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
