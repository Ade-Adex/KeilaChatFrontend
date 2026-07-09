//  /src/app/hooks/usePropertySettings.ts

'use client'

import { useState, useEffect } from 'react'
import { getPropertySettings } from '@/app/lib/api/settings.api'

interface WidgetFeatures {
  allowFileUpload: boolean
  allowVoiceRecordings: boolean
}

export function usePropertySettings(propertyId: string | undefined) {
  const [features, setFeatures] = useState<WidgetFeatures>({
    allowFileUpload: true,
    allowVoiceRecordings: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // 🎯 TypeScript Type Guard Guardrail
    if (!propertyId) return

    let isMounted = true

    async function loadWorkspacePermissions() {
      try {
        // 🎯 FIXED: setLoading safely runs inside the async pipeline, avoiding cascading side effects
        setLoading(true)
        
        // 🎯 FIXED: Explicitly casting out undefined because the guardrail above blocks it
        const response = await getPropertySettings(propertyId as string)

        if (isMounted && response?.data?.property?.widgetSettings) {
          const settings = response.data.property.widgetSettings
          setFeatures({
            allowFileUpload: settings.allowFileUpload ?? true,
            allowVoiceRecordings: settings.allowVoiceRecordings ?? true,
          })
          setError(null)
        }
      } catch (err) {
        console.error('❌ Failed fetching property profile restrictions:', err)
        if (isMounted) {
          setError(
            err instanceof Error
              ? err
              : new Error('Failed fetching configurations'),
          )
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void loadWorkspacePermissions()

    return () => {
      isMounted = false
    }
  }, [propertyId])

  return { features, loading, error }
}