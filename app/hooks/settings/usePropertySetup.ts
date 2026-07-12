// // /app/hooks/settings/usePropertySetup.ts

// 'use client'

// import { useEffect, useState } from 'react'

// import { getWebsite } from '@/app/lib/api/settings.api'

// import type { WebsiteData } from '@/app/lib/api/settings.api'

// export function usePropertySetup() {
//   const [property, setProperty] = useState<WebsiteData | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const res = await getWebsite()
//         console.log("Response", res.data)

//         setProperty(res.data.property)
//       } catch (err) {
//         setError(
//           err instanceof Error ? err.message : 'Unable to load property.',
//         )
//       } finally {
//         setLoading(false)
//       }
//     }

//     void load()
//   }, [])

//   return {
//     property,
//     loading,
//     error,
//   }
// }

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

    async function loadProperty() {
      try {
        setLoading(true)

        const res = await getWebsite()

        if (!mounted) return

        const currentProperty = res.data?.property ?? null

        setProperty(currentProperty)

        setHasProperty(Boolean(currentProperty?._id))

        if (isAdmin) {
          setHasAssignedProperty(Boolean(currentProperty?._id))
        } else {
          setHasAssignedProperty(
            (operator?.assignedProperties?.length ?? 0) > 0,
          )
        }

        setError(null)
      } catch (err) {
        if (!mounted) return

        setProperty(null)

        setHasProperty(false)

        setHasAssignedProperty(false)

        setError(
          err instanceof Error ? err.message : 'Unable to load property.',
        )
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadProperty()

    return () => {
      mounted = false
    }
  }, [isAdmin, operator?.assignedProperties])

  return {
    property,

    loading,

    error,

    hasProperty,

    hasAssignedProperty,

    isAdmin,
  }
}