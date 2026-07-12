// /app/hooks/useAuthorization.ts

'use client'

import { useMemo } from 'react'

import { useAuthStore } from '@/app/store/useAuthStore'

import { hasPermission } from '@/app/lib/auth/permissions'

export function useAuthorization() {
  const operator = useAuthStore((state) => state.operator)

  const role = operator?.role

  return useMemo(
    () => ({
      role,

      can(permission: string) {
        return hasPermission(role, permission)
      },

      isAdmin: role === 'admin',

      isSupervisor: role === 'supervisor',

      isAgent: role === 'agent',
    }),
    [role],
  )
}