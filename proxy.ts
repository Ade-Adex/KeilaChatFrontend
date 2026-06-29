// /proxy.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  /**
   * Preserve callbackUrl behavior
   */
  if (pathname === '/dashboard') {
    return NextResponse.next()
  }

  /**
   * Optional:
   * redirect root to signin
   */
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/signin', '/signup', '/dashboard/:path*'],
}
