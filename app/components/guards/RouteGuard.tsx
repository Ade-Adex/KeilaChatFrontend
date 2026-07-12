// /app/components/guards/RouteGuard.tsx

// 'use client'

// import { ReactNode } from 'react'
// import { usePathname } from 'next/navigation'

// import { Loader, Center } from '@mantine/core'

// import { useAuthorization } from '@/app/hooks/useAuthorization'
// import { usePropertySetup } from '@/app/hooks/settings/usePropertySetup'

// import { RoutePermissions } from '@/app/lib/auth/routePermissions'

// import PermissionDenied from '@/app/components/guards/PermissionDenied'
// import PropertyRequired from '@/app/components/guards/PropertyRequired'

// interface RouteGuardProps {
//   children: ReactNode
// }

// export default function RouteGuard({
//   children,
// }: RouteGuardProps) {
//   const pathname = usePathname()

//   const { loading, property } = usePropertySetup()

//   const { can } = useAuthorization()

//   const route =
//     RoutePermissions[
//       pathname as keyof typeof RoutePermissions
//     ]

//   if (!route) {
//     return <>{children}</>
//   }

//   if (loading) {
//     return (
//       <Center h={500}>
//         <Loader />
//       </Center>
//     )
//   }

//   if (!can(route.permission)) {
//     return <PermissionDenied />
//   }

//   if (route.requiresProperty && !property?._id) {
//     return <PropertyRequired />
//   }

//   return <>{children}</>
// }








// /app/components/guards/RouteGuard.tsx


'use client'

import type { ReactNode } from 'react'

import { Center, Loader } from '@mantine/core'

import { usePathname } from 'next/navigation'

import PermissionDenied from '@/app/components/guards/PermissionDenied'
import PropertyRequired from '@/app/components/guards/PropertyRequired'

import { RoutePermissions } from '@/app/lib/auth/routePermissions'

import { useAuthorization } from '@/app/hooks/useAuthorization'
import { usePropertySetup } from '@/app/hooks/settings/usePropertySetup'
import { useAuthStore } from '@/app/store/useAuthStore'

interface RouteGuardProps {
  children: ReactNode
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const pathname = usePathname()

  const route = RoutePermissions[pathname as keyof typeof RoutePermissions]

  const { loading, property } = usePropertySetup()

  const operator = useAuthStore((state) => state.operator)

  const { can, isAdmin } = useAuthorization()

  if (!route) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <Center h={500}>
        <Loader />
      </Center>
    )
  }

  /*
   * Permission Check
   */

  if (!can(route.permission)) {
    return <PermissionDenied />
  }

  /*
   * Route does not require any property.
   */

  if (!route.requiresProperty) {
    return <>{children}</>
  }

  /*
   * ADMIN
   *
   * Admin owns the account.
   * If there are no properties,
   * the admin should create one.
   */

  if (isAdmin) {
    if (!property?._id) {
      return <PropertyRequired mode="admin" />
    }

    return <>{children}</>
  }

  /*
   * SUPERVISOR / AGENT
   *
   * They NEVER create properties.
   * They only need assignments.
   */

  const assignedProperties = operator?.assignedProperties ?? []

  if (assignedProperties.length === 0) {
    return <PropertyRequired mode="operator" />
  }

  return <>{children}</>
}