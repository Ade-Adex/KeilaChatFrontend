// /app/hooks/operators/useOperators.ts


'use client'

import { useEffect, useCallback } from 'react'
import { useOperatorsStore } from '@/app/store/useOperatorsStore'

export function useOperators() {
  const { 
    operators, 
    loadingOperators, 
    error, 
    fetchOperators 
  } = useOperatorsStore()

  // Auto-load cached operators when any component consumes this hook
  useEffect(() => {
    Promise.resolve().then(() => {
      void fetchOperators()
    })
  }, [fetchOperators])

  const refreshOperators = useCallback(async () => {
    await fetchOperators(true) // Force a fresh network request
  }, [fetchOperators])

  return {
    operators,
    loading: loadingOperators,
    error,
    refreshOperators,
  }
}