// /app/hooks/operators/useInviteOperator.ts
'use client'

import { useOperatorsStore } from '@/app/store/useOperatorsStore'

export function useInviteOperator() {
  const { sendInvite, submitLoading, error } = useOperatorsStore()

  return {
    sendInvite,
    loading: submitLoading,
    error,
  }
}
