// /app/hooks/settings/usePropertySetup.ts

'use client'

import { useEffect, useState } from 'react'

import { getWebsite } from '@/app/lib/api/settings.api'

import type { WebsiteData } from '@/app/lib/api/settings.api'

export function usePropertySetup() {
  const [property, setProperty] = useState<WebsiteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getWebsite()
        console.log("Response", res.data)

        setProperty(res.data.property)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to load property.',
        )
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  return {
    property,
    loading,
    error,
  }
}