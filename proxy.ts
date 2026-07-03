// /proxy.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const RESTRICTED_ADMIN_ROUTES = ['/dashboard/setup', '/dashboard/contacts']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Root Security Boundary Redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // 2. Extract your production HTTP-only access cookie
  const accessToken = request.cookies.get('access_token')?.value

  // 3. Fail-Safe Global Auth Interception
  if (pathname.startsWith('/dashboard') && !accessToken) {
    const loginUrl = new URL('/signin', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 4. Strict Role-Based Access Control Enforcement (RBAC)
  const isTargetingRestrictedPath = RESTRICTED_ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route),
  )

  if (isTargetingRestrictedPath && accessToken) {
    try {
      // Decode JWT crypt-segment seamlessly at the Edge network layer
      const base64Url = accessToken.split('.')[1]
      if (!base64Url) throw new Error('Malformed token envelope')

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      )

      const payload = JSON.parse(jsonPayload)

      // 🛡️ If the token is valid but the role is NOT an admin, eject them immediately
      if (payload?.role !== 'admin') {
        return NextResponse.redirect(
          new URL('/dashboard?error=access_denied', request.url),
        )
      }
    } catch (err) {
      console.error('[Edge Guard RBAC Violation Triggered]:', err)
      return NextResponse.redirect(
        new URL('/dashboard?error=invalid_security_session', request.url),
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  // Catch all potential paths explicitly to ensure no gaps for attackers
  matcher: ['/', '/signin', '/signup', '/dashboard/:path*'],
}