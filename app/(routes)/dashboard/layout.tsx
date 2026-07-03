// /app/(routes)/dashboard/layout.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LoadingOverlay } from '@mantine/core'
import DashboardShell from '@/app/components/dashboard/DashboardShell'
import { checkAuth } from '@/app/lib/auth/checkAuth'
import { useAuthStore } from '@/app/store/useAuthStore'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  // Read state safely from the hydrated Zustand identity storage
  const user = useAuthStore((state) => state.operator)

  useEffect(() => {
    async function verifyAccessSequence() {
      // 1. Silent token state health check verification
      const authenticated = await checkAuth()

      if (!authenticated) {
        router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
        return
      }

      // 2. Client-side layout level block
      const adminRoutes = ['/dashboard/setup', '/dashboard/contacts']
      const isRestrictedPath = adminRoutes.some((route) =>
        pathname.startsWith(route),
      )

      if (isRestrictedPath && user?.role !== 'admin') {
        router.replace('/dashboard?error=unauthorized_view')
        return
      }

      setChecking(false)
    }

    verifyAccessSequence()
  }, [pathname, router, user?.role])

  if (checking) {
    return (
      <div className="h-screen w-screen relative bg-background">
        <LoadingOverlay visible overlayProps={{ blur: 1 }} />
      </div>
    )
  }

  return <DashboardShell>{children}</DashboardShell>
}