import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

const AUTH_ROUTES = new Set(['/login', '/register'])

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  if (AUTH_ROUTES.has(request.nextUrl.pathname)) {
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Content-Security-Policy', [
      "default-src 'self'",
      "img-src 'self' data: blob: https://image.tmdb.org",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-eval'",
      "connect-src 'self' http://localhost:8000 http://127.0.0.1:8000",
      "frame-ancestors 'none'",
    ].join('; '))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
