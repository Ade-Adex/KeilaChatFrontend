// /app/hooks/settings/useWebsite.ts


'use client'

import { useState } from 'react'
import { useDashboardStore } from '@/app/store/useDashboardStore'
import { updateWebsite } from '@/app/lib/api/settings.api'
import type { WebsiteFormValues } from '@/app/lib/validation/settings/settings.schema'

export function useWebsite() {
  const [saving, setSaving] = useState(false)

  // 🎯 Read existing configuration and updates action directly out of your dashboard state cache!
  const cachedProperty = useDashboardStore((state) => state.property)
  const updateCachedProperty = useDashboardStore(
    (state) => state.updateCachedProperty,
  )

  // Format initial values cleanly from memory context if it exists
  const website: WebsiteFormValues = {
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

      // 🎯 Sync update straight back into useDashboardStore to keep workspace view aligned perfectly
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
    website,
    saveWebsite,
  }
}
