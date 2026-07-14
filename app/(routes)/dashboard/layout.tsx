
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
  const cachedOperator = useAuthStore((state) => state.operator)

  const [checking, setChecking] = useState(() => !cachedOperator)

  useEffect(() => {
    if (cachedOperator) {
      return
    }

    let active = true

    async function verifyAndHydrate() {
      try {
        const authenticated = await checkAuth()
        if (!active) return

        if (!authenticated) {
          router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
          return
        }

        const res = await getCurrentProfile()
        if (!active) return

        if (res?.success && res.data) {
          setAuth(res.data)
        } else {
          router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
        }
      } catch (err) {
        console.error('Failed to initialize operator dashboard workspace session:', err)
        router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
      } finally {
        if (active) {
          setChecking(false)
        }
      }
    }

    verifyAndHydrate()

    return () => {
      active = false
    }
  }, [router, setAuth]) 

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