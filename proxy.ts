// /proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const isAuthenticated = request.cookies.has('auth_token')
  const isAuthPage = pathname === '/signin' || pathname === '/signup'

  // Rule A: Prevent active users from hitting login/signup pages
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // Rule B: Anonymous Wildcard Blockade
  if (pathname.startsWith('/admin/dashboard')) {
    if (!isAuthenticated) {
      const signInUrl = new URL('/signin', request.url)
      const targetPath =
        pathname +
        (searchParams.toString() ? `?${searchParams.toString()}` : '')
      signInUrl.searchParams.set('callbackUrl', targetPath)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/signin', '/signup', '/admin/dashboard/:path*'],
}
