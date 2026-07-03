// /app/(routes)/dashboard/layout.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

import { LoadingOverlay } from '@mantine/core'

import DashboardShell from '@/app/components/dashboard/DashboardShell'
import { checkAuth } from '@/app/lib/auth/checkAuth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function verify() {
      const authenticated = await checkAuth()

      if (!authenticated) {
        router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
        return
      }

      setChecking(false)
    }

    verify()
  }, [pathname, router])

  if (checking) {
    return (
      <div className="h-screen w-screen relative">
        <LoadingOverlay visible />
      </div>
    )
  }

  return <DashboardShell>{children}</DashboardShell>
}