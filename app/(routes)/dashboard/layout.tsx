// /app/(routes)/dashboard/layout.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LoadingOverlay } from '@mantine/core'

import DashboardShell from '@/app/components/dashboard/DashboardShell'
import { checkAuth } from '@/app/lib/auth/checkAuth'
import { getCurrentProfile } from '@/app/lib/api/auth.api' 
import { useAuthStore } from '@/app/store/useAuthStore'
import RouteGuard from '@/app/components/guards/RouteGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  
  const setAuth = useAuthStore((state) => state.login)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function verifyAndHydrate() {
      try {
        // 1. Check if token cookies are valid (or refresh them)
        const authenticated = await checkAuth()

        if (!authenticated) {
          router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
          return
        }

        // 2. Fetch fresh user information directly from database records via /me
        const res = await getCurrentProfile()

        if (res?.success && res.data) {
          setAuth(res.data)
          setChecking(false)
        } else {
          router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
        }
      } catch (err) {
        console.error('Failed to initialize operator dashboard workspace session:', err)
        router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
      }
    }

    verifyAndHydrate()
  }, [pathname, router, setAuth])

  if (checking) {
    return (
      <div className="h-screen w-screen relative">
        <LoadingOverlay visible overlayProps={{ blur: 1 }} />
      </div>
    )
  }

  return (
    <RouteGuard>
      <DashboardShell>{children}</DashboardShell>
    </RouteGuard>
  )
}