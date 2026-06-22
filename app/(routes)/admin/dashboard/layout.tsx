'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingOverlay } from '@mantine/core'
import { useAuthStore } from '@/app/store/useAuthStore'
import DashboardShell from '@/app/components/dashboard/DashboardShell'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const authLoading = useAuthStore((state) => state.loading)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)

  useEffect(() => {
    if (hasHydrated && !authLoading && !user) {
      router.replace('/signin')
    }
  }, [user, authLoading, hasHydrated, router])

  if (!hasHydrated || authLoading) {
    return (
      <div className="h-screen w-screen relative bg-background">
        <LoadingOverlay
          visible
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={{ color: 'var(--primary)', type: 'bars' }}
        />
      </div>
    )
  }

  if (!user) return null

  // Renders inside the global providers context perfectly
  return <DashboardShell>{children}</DashboardShell>
}
