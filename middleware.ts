import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('user')
  const isAuthPage = request.nextUrl.pathname === '/login' || 
                    request.nextUrl.pathname === '/signup' || 
                    request.nextUrl.pathname === '/'

  if (isAuthPage && currentUser) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!isAuthPage && !currentUser) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/signup', '/dashboard/:path*']
} 