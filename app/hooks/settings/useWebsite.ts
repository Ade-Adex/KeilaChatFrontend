// /app/hooks/settings/useWebsite.ts


'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAuthStore } from '@/app/store/useAuthStore' // 🎯 Import Auth Store
import { useDashboardStore } from '@/app/store/useDashboardStore'
import { updateWebsite } from '@/app/lib/api/settings.api'
import type { WebsiteFormValues } from '@/app/lib/validation/settings/settings.schema'

export function useWebsite() {
  const [saving, setSaving] = useState(false)

  // 1. Get the authorized operator metadata context
  const user = useAuthStore((state) => state.operator)

  // 2. Read your dashboard store cache utilities
  const cachedProperty = useDashboardStore((state) => state.property)
  const isStoreLoading = useDashboardStore((state) => state.loading)
  const fetchDashboardData = useDashboardStore(
    (state) => state.fetchDashboardData,
  )
  const updateCachedProperty = useDashboardStore(
    (state) => state.updateCachedProperty,
  )

  // 3. 🎯 Derive the contextual property ID from the operator profile exactly like the dashboard page
  const assignedProperties = user?.assignedProperties ?? []
  const propertyIdContext =
    assignedProperties.length > 0
      ? assignedProperties[0]?._id || assignedProperties[0]
      : null

  // 4. 🎯 FIX: Automatically bootstrap the background fetch if data is missing on deep links or refreshes
  useEffect(() => {
    if (!propertyIdContext || cachedProperty || isStoreLoading) return

    // Safely defer store dispatch execution to prevent immediate react cycle warnings
    Promise.resolve().then(() => {
      void fetchDashboardData(propertyIdContext.toString())
    })
  }, [propertyIdContext, cachedProperty, isStoreLoading, fetchDashboardData])

  // 5. Memoize form structural mapping schema setup
  const website = useMemo<WebsiteFormValues>(() => {
    return {
      name: cachedProperty?.name ?? '',
      domain: cachedProperty?.domain ?? '',
      aiName: cachedProperty?.widgetSettings?.aiName ?? 'AI Assistant',
      allowedDomains: cachedProperty?.allowedDomains
        ? cachedProperty.allowedDomains.join('\n')
        : '',
      category: cachedProperty?.details?.category ?? '',
      subCategory: cachedProperty?.details?.subCategory ?? '',
      region: cachedProperty?.details?.region ?? '',
      description: cachedProperty?.details?.description ?? '',
      logoUrl: cachedProperty?.details?.logoUrl ?? '',
    }
  }, [cachedProperty])

  const saveWebsite = async (values: WebsiteFormValues) => {
    setSaving(true)

    try {
      const payloadAllowedDomains = values.allowedDomains
        .split('\n')
        .map((d) => d.trim())
        .filter(Boolean)

      const res = await updateWebsite({
        name: values.name,
        domain: values.domain,
        aiName: values.aiName,
        allowedDomains: payloadAllowedDomains,
        category: values.category,
        subCategory: values.subCategory,
        region: values.region,
        description: values.description,
        logoUrl: values.logoUrl,
      })

      // Update Zustand context so user is synced live
      if (res?.success && res.data?.property) {
        updateCachedProperty(res.data.property)
      }

      return res
    } catch (err) {
      console.error(
        '[KeilaChat Settings] Failed to update website configuration:',
        err,
      )
      throw err
    } finally {
      setSaving(false)
    }
  }

  return {
    saving,
    isLoading: isStoreLoading && !cachedProperty, 
    website,
    saveWebsite,
  }
}
