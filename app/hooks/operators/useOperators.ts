// /app/hooks/operators/useOperators.ts


'use client'

import { useCallback, useEffect, useState } from 'react'

import { getOperators, } from '@/app/lib/api/operators.api'
import { OperatorData } from '@/app/types/operator'

export function useOperators() {
  const [operators, setOperators] = useState<OperatorData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

 const loadOperators = useCallback(async (signal?: AbortSignal) => {
   try {
     setLoading(true)

     const res = await getOperators()

     if (signal?.aborted) return

     setOperators(res.data)

     setError(null)
   } catch (err) {
     if (signal?.aborted) return

     setError(err instanceof Error ? err.message : 'Failed to load operators')
   } finally {
     if (!signal?.aborted) {
       setLoading(false)
     }
   }
 }, [])

useEffect(() => {
  const controller = new AbortController()

  Promise.resolve().then(() => {
    void loadOperators(controller.signal)
  })

  return () => controller.abort()
}, [loadOperators])

  return {
    operators,
    loading,
    error,
    refreshOperators: loadOperators,
  }
}