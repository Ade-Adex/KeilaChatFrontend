// /app/hooks/operators/useInviteOperator.ts

'use client'

import { useState } from 'react'

import { inviteOperator } from '@/app/lib/api/operators.api'

export function useInviteOperator() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendInvite = async (
    email: string,
    role: 'admin' | 'supervisor' | 'agent',
    assignedProperties: string[],
  ) => {
    try {
      setLoading(true)

      await inviteOperator({
        email,
        role,
        assignedProperties,
      })

      setError(null)

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send invitation')

      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    sendInvite,
    loading,
    error,
  }
}