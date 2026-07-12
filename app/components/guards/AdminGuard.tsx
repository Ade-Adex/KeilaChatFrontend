// /app/components/guards/AdminGuard.tsx

'use client'

import { ReactNode } from 'react'

import { useAuthorization } from '@/app/hooks/useAuthorization'

import PermissionDenied from '@/app/components/guards/PermissionDenied'

interface Props {
  children: ReactNode
}

export default function AdminGuard({ children }: Props) {
  const { isAdmin } = useAuthorization()

  if (!isAdmin) {
    return <PermissionDenied />
  }

  return <>{children}</>
}