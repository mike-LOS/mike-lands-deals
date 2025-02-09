import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = ['/', '/register']

// List of routes that require authentication
const protectedRoutes = ['/api/chat']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    console.log('🔓 Public route accessed:', pathname);
    return NextResponse.next()
  }

  // Check if the route requires authentication
  const requiresAuth = protectedRoutes.some(route => pathname.startsWith(route))
  if (!requiresAuth) {
    return NextResponse.next()
  }

  // Check for authorization header with wallet address
  const authHeader = request.headers.get('Authorization')
  console.log('🔑 Auth header check:', {
    path: pathname,
    hasAuth: !!authHeader,
    authType: authHeader?.split(' ')[0],
  });

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Missing or invalid auth header');
    return new Response('Unauthorized', { status: 401 })
  }

  // Log the token (first 10 chars only for security)
  const token = authHeader.split(' ')[1];
  console.log('🎫 Token received:', token.substring(0, 10) + '...');

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
