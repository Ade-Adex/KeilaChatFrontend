// /proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // ✅ PRIMARY AUTH: backend httpOnly cookies
  const hasAccessToken = request.cookies.has('access_token')
  const hasRefreshToken = request.cookies.has('refresh_token')

  const isAuthenticated = hasAccessToken || hasRefreshToken

  const isAuthPage = pathname === '/signin' || pathname === '/signup'

  /**
   * 🚫 If already logged in → block auth pages
   */
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  /**
   * 🔐 Protect dashboard routes
   */
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/signin', request.url)

      const callbackUrl =
        pathname +
        (searchParams.toString() ? `?${searchParams.toString()}` : '')

      loginUrl.searchParams.set('callbackUrl', callbackUrl)

      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

/**
 * IMPORTANT: correct matcher syntax
 */
export const config = {
  matcher: ['/signin', '/signup', '/dashboard/:path*'],
}
