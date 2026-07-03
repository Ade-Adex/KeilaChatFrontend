// /proxy.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_ONLY_ROUTES = ['/dashboard/setup', '/dashboard/contacts']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // 🎯 Target your actual backend HTTP-only cookie name
  const accessToken = request.cookies.get('access_token')?.value

  // 1. Fallback Auth Guard: Block access if the access token is missing
  if (pathname.startsWith('/dashboard') && !accessToken) {
    const loginUrl = new URL('/signin', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Edge-Level RBAC Enforcement
  const isRestrictedPath = ADMIN_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route),
  )

  if (isRestrictedPath && accessToken) {
    try {
      // Decode the JWT access_token payload segment safely at the edge
      const base64Url = accessToken.split('.')[1]
      if (!base64Url) throw new Error('Malformed token structure')

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      )

      const payload = JSON.parse(jsonPayload)

      // 🛡️ Lock down route access if user role is not admin
      if (payload?.role !== 'admin') {
        return NextResponse.redirect(
          new URL('/dashboard?error=unauthorized', request.url),
        )
      }
    } catch (err) {
      console.error('[Proxy RBAC Security Interception Error]:', err)
      return NextResponse.redirect(
        new URL('/dashboard?error=invalid_session', request.url),
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/signin', '/signup', '/dashboard/:path*'],
}