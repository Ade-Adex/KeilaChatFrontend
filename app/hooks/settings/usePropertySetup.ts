// /app/hooks/settings/usePropertySetup.ts



'use client'

import { useEffect, useState } from 'react'

import { useAuthStore } from '@/app/store/useAuthStore'
import { getWebsite, type WebsiteData } from '@/app/lib/api/settings.api'

export function usePropertySetup() {
  const operator = useAuthStore((state) => state.operator)

  const isAdmin = operator?.role === 'admin'

  const [property, setProperty] = useState<WebsiteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [hasProperty, setHasProperty] = useState(false)
  const [hasAssignedProperty, setHasAssignedProperty] = useState(false)

  useEffect(() => {
    let mounted = true

    const controller = new AbortController()

    Promise.resolve().then(async () => {
      if (controller.signal.aborted || !mounted) return

      try {
        setLoading(true)

        /**
         * ----------------------------------------------------------
         * AGENT / SUPERVISOR
         * ----------------------------------------------------------
         * They cannot access /properties/settings.
         * Simply rely on assigned properties already stored
         * on the authenticated operator.
         */
       if (!isAdmin) {
         const assigned = operator?.assignedProperties ?? []

         if (!mounted) return

         const firstProperty =
           assigned.length > 0 ? (assigned[0] as WebsiteData) : null

         setProperty(firstProperty)

         setHasAssignedProperty(Boolean(firstProperty))
         setHasProperty(Boolean(firstProperty))

         setError(null)

         return
       }

        /**
         * ----------------------------------------------------------
         * ADMIN
         * ----------------------------------------------------------
         * Load account property.
         */
        const res = await getWebsite()


        console.log("response  in usePropertySetup", res)

        if (!mounted || controller.signal.aborted) return

        const currentProperty = res.data?.property ?? null


        console.log('currentProperty in usePropertySetup', currentProperty)

        setProperty(currentProperty)

        const exists = Boolean(currentProperty?._id)

        setHasProperty(exists)
        setHasAssignedProperty(exists)

        setError(null)
      } catch (err) {
        if (!mounted || controller.signal.aborted) return

        setProperty(null)
        setHasProperty(false)
        setHasAssignedProperty(false)

        setError(
          err instanceof Error ? err.message : 'Unable to load property.',
        )
      } finally {
        if (mounted && !controller.signal.aborted) {
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      controller.abort()
    }
  }, [isAdmin, operator])

  return {
    property,
    loading,
    error,
    hasProperty,
    hasAssignedProperty,
    isAdmin,
  }
}