// /app/(routes)/admin/dashboard/layout.tsx
'use client'

import { usePathname } from 'next/navigation'
import { LoadingOverlay } from '@mantine/core'
import { useAuthStore } from '@/app/store/useAuthStore'
import DashboardShell from '@/app/components/dashboard/DashboardShell'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const authLoading = useAuthStore((state) => state.loading)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)

  const isAcceptInviteRoute = pathname === '/admin/dashboard/accept-invite'

  // Block paint cycle execution completely until client storage engine has finished matching hydration
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

  // Industrial exception layout style for new operators configuring profiles
  if (isAcceptInviteRoute) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  // Default layout wrapper injection for secure work views
  return <DashboardShell>{children}</DashboardShell>
}
