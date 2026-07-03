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

  // 🎯 Read user data directly from your Zustand client cache
  const user = useAuthStore((state) => state.operator)

  useEffect(() => {
    async function verifyAccessSequence() {
      // 1. Check if the user is authenticated via cookies
      const authenticated = await checkAuth()
      if (!authenticated) {
        router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
        return
      }

      // 2. Client-side RBAC Guard
      const restrictedRoutes = ['/dashboard/setup', '/dashboard/contacts']
      const attemptsAccessingRestricted = restrictedRoutes.some((route) =>
        pathname.startsWith(route),
      )

      // Validate against the Zustand-managed user object
      if (attemptsAccessingRestricted && user?.role !== 'admin') {
        router.replace('/dashboard?error=unauthorized_access')
        return
      }

      setChecking(false)
    }

    verifyAccessSequence()
  }, [pathname, router, user?.role]) // 🎯 Tracks role changes dynamically

  if (checking) {
    return (
      <div className="h-screen w-screen relative bg-background">
        <LoadingOverlay visible overlayProps={{ blur: 1 }} />
      </div>
    )
  }

  return <DashboardShell>{children}</DashboardShell>
}