// /app/(routes)/admin/dashboard/layout.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MantineProvider, LoadingOverlay } from '@mantine/core'
import { ThemeProvider } from 'next-themes'
import { useAuthStore } from '@/app/store/useAuthStore'
import DashboardShell from '@/app/components/dashboard/DashboardShell'
import '@mantine/core/styles.css'

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
    // If client storage hydration is complete, loading is finished, and no active session exists
    if (hasHydrated && !authLoading && !user) {
      router.replace('/signin')
    }
  }, [user, authLoading, hasHydrated, router])

  // Professional Guard: Prevent unauthorized content flashing during hydration/auth checks
  if (!hasHydrated || authLoading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <MantineProvider>
          <div className="h-screen w-screen relative">
            <LoadingOverlay
              visible
              overlayProps={{ blur: 2, opacity: 0.6 }}
              color="blue"
            />
          </div>
        </MantineProvider>
      </ThemeProvider>
    )
  }

  // If a session exists, render the dashboard context with your providers perfectly intact
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <MantineProvider>
        <DashboardShell>{children}</DashboardShell>
      </MantineProvider>
    </ThemeProvider>
  )
}