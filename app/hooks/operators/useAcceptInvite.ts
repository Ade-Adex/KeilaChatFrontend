// /app/hooks/operators/useAcceptInvite.ts

'use client'

import { useState, useCallback } from 'react'

import { verifyInvite, acceptInvite } from '@/app/lib/api/operators.api'

export function useAcceptInvite() {
  const [verifying, setVerifying] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const verifyToken = useCallback(async (token: string) => {
    try {
      setVerifying(true)

      return await verifyInvite(token)
    } finally {
      setVerifying(false)
    }
  }, [])

  const activateAccount = useCallback(
    async (
      token: string,
      firstName: string,
      lastName: string,
      password: string,
    ) => {
      try {
        setSubmitting(true)

        return await acceptInvite({
          token,
          firstName,
          lastName,
          password,
        })
      } finally {
        setSubmitting(false)
      }
    },
    [],
  )

  return {
    verifyToken,
    activateAccount,
    verifying,
    submitting,
  }
}