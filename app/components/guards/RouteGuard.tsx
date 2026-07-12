// /app/components/guards/RouteGuard.tsx


'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import { Loader, Center } from '@mantine/core'

import { useAuthorization } from '@/app/hooks/useAuthorization'
import { usePropertySetup } from '@/app/hooks/settings/usePropertySetup'

import { RoutePermissions } from '@/app/lib/auth/routePermissions'

import PermissionDenied from '@/app/components/guards/PermissionDenied'
import PropertyRequired from '@/app/components/guards/PropertyRequired'

interface RouteGuardProps {
  children: ReactNode
}

export default function RouteGuard({
  children,
}: RouteGuardProps) {
  const pathname = usePathname()

  const { loading, property } = usePropertySetup()

  const { can } = useAuthorization()

  const route =
    RoutePermissions[
      pathname as keyof typeof RoutePermissions
    ]

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

  if (!can(route.permission)) {
    return <PermissionDenied />
  }

  if (route.requiresProperty && !property?._id) {
    return <PropertyRequired />
  }

  return <>{children}</>
}