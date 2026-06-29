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

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verify = async () => {
      const authenticated = await checkAuth()

      if (!authenticated) {
        router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
        return
      }

      setLoading(false)
    }

    verify()
  }, [pathname, router])

  if (loading) {
    return (
      <div className="h-screen w-screen relative">
        <LoadingOverlay visible />
      </div>
    )
  }

  return <DashboardShell>{children}</DashboardShell>
}