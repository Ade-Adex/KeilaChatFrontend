// /app/components/guards/RouteGuard.tsx


'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import PermissionDenied from '@/app/components/guards/PermissionDenied'
import PropertyRequired from '@/app/components/guards/PropertyRequired'
import { RoutePermissions } from '@/app/lib/auth/routePermissions'
import { useAuthorization } from '@/app/hooks/useAuthorization'
import { useAuthStore } from '@/app/store/useAuthStore'

interface RouteGuardProps {
  children: ReactNode
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const pathname = usePathname()
  const route = RoutePermissions[pathname as keyof typeof RoutePermissions]

  // Get the logged in operator data directly from your central client state
  const operator = useAuthStore((state) => state.operator)
  const { can, isAdmin } = useAuthorization()

  // If the path isn't protected, let them pass
  if (!route) {
    return <>{children}</>
  }

  /*
   * 1. Dynamic RBAC Permission Check
   */
  if (!can(route.permission)) {
    return <PermissionDenied />
  }

  /*
   * 2. Layout Property Requirement Check
   */
  if (!route.requiresProperty) {
    return <>{children}</>
  }

  /*
   * 3. Unified Property Assignment Check (Admin, Supervisor, and Agent)
   *
   * Both Admins and Agents use `assignedProperties`. If it is empty,
   * it means the workspace doesn't have an environment set up yet.
   */
  const assignedProperties = operator?.assignedProperties ?? []

  if (assignedProperties.length === 0) {
    return <PropertyRequired mode={isAdmin ? 'admin' : 'operator'} />
  }

  return <>{children}</>
}