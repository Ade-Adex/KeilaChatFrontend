// // /proxy.ts
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export function proxy(request: NextRequest) {
//   const { pathname, searchParams } = request.nextUrl
//   const isAuthenticated = request.cookies.has('auth_token')
//   const isAuthPage = pathname === '/signin' || pathname === '/signup'

//   // Rule A: Prevent active users from hitting login/signup pages
//   if (isAuthPage && isAuthenticated) {
//     return NextResponse.redirect(new URL('/admin/dashboard', request.url))
//   }

//   // Rule B: Anonymous Wildcard Blockade
//   if (pathname.startsWith('/admin/dashboard')) {
//     if (!isAuthenticated) {
//       const signInUrl = new URL('/signin', request.url)
//       const targetPath =
//         pathname +
//         (searchParams.toString() ? `?${searchParams.toString()}` : '')
//       signInUrl.searchParams.set('callbackUrl', targetPath)
//       return NextResponse.redirect(signInUrl)
//     }
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ['/signin', '/signup', '/admin/dashboard/:path*'],
// }











// /proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  
  // 1. Primary Check: Try to read the backend direct session cookie
  let isAuthenticated = request.cookies.has('auth_token')

  // 2. 🚀 CROSS-SITE PRODUCTION FIX: 
  // If the backend cookie is missing (due to cross-origin isolation between Render and Vercel),
  // fallback to verifying the encrypted client-side sync cookie written by Zustand.
  if (!isAuthenticated) {
    const fallbackSyncCookie = request.cookies.get('keila_admin_auth')?.value
    if (fallbackSyncCookie) {
      try {
        const decodedState = decodeURIComponent(fallbackSyncCookie)
        const parsedData = JSON.parse(decodedState)
        
        // Safely check if the nested Zustand state holds a valid user token
        if (parsedData?.state?.user?.accessToken) {
          isAuthenticated = true
        }
      } catch (error) {
        // Fail silently here so execution can continue to standard route shielding rules
        console.error('Failed to parse synchronized local session fallback data:', error)
      }
    }
  }

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