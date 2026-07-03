// // /app/(routes)/dashboard/layout.tsx

// 'use client'

// import { useEffect, useState } from 'react'
// import { useRouter, usePathname } from 'next/navigation'

// import { LoadingOverlay } from '@mantine/core'

// import DashboardShell from '@/app/components/dashboard/DashboardShell'
// import { checkAuth } from '@/app/lib/auth/checkAuth'

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const router = useRouter()
//   const pathname = usePathname()

//   const [checking, setChecking] = useState(true)

//   useEffect(() => {
//     async function verify() {
//       const authenticated = await checkAuth()

//       if (!authenticated) {
//         router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
//         return
//       }

//       setChecking(false)
//     }

//     verify()
//   }, [pathname, router])

//   if (checking) {
//     return (
//       <div className="h-screen w-screen relative">
//         <LoadingOverlay visible />
//       </div>
//     )
//   }

//   return <DashboardShell>{children}</DashboardShell>
// }

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

import { LoadingOverlay } from '@mantine/core'

import DashboardShell from '@/app/components/dashboard/DashboardShell'
import { checkAuth } from '@/app/lib/auth/checkAuth'
import { useAuthStore } from '@/app/store/useAuthStore' // 🎯 Import your auth store

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  // 🎯 Grab the login function to automatically hydrate global state on page reloads
  const setAuth = useAuthStore((state) => state.login)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function verify() {
      // 🎯 Deconstruct properties from our updated checkAuth result
      const { authenticated, account, operator } = await checkAuth()

      if (!authenticated || !account || !operator) {
        router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`)
        return
      }

      // 🎯 Hydrate your Zustand auth store so the rest of the application has user context
      setAuth(account, operator)
      setChecking(false)
    }

    verify()
  }, [pathname, router, setAuth])

  if (checking) {
    return (
      <div className="h-screen w-screen relative bg-background">
        <LoadingOverlay visible overlayProps={{ blur: 1 }} />
      </div>
    )
  }

  return <DashboardShell>{children}</DashboardShell>
}