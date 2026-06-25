// /app/hooks/operators/useOperators.ts

'use client'

import { useEffect, useState, useCallback } from 'react'

import { getOperators, type OperatorData } from '@/app/lib/api/operators.api'

export function useOperators() {
  const [operators, setOperators] = useState<OperatorData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOperators = useCallback(async () => {

    try {
      setLoading(true)

      const res = await getOperators()

      setOperators(res.data)

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load operators')
    } finally {
      setLoading(false)
    }
  }, [])

 useEffect(() => {
   let mounted = true

   const fetchOperators = async () => {
     try {
       const res = await getOperators()

       if (mounted) {
         setOperators(res.data)
         setError(null)
       }
     } catch (err) {
       if (mounted) {
         setError(
           err instanceof Error ? err.message : 'Failed to load operators',
         )
       }
     } finally {
       if (mounted) {
         setLoading(false)
       }
     }
   }

   void fetchOperators()

   return () => {
     mounted = false
   }
 }, [])

  return {
    operators,
    loading,
    error,
    refreshOperators: loadOperators,
  }
}


