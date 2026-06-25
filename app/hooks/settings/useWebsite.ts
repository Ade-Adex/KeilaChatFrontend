// /app/hooks/settings/useWebsite.ts

'use client'

import { useEffect, useState } from 'react'

import { getWebsite, updateWebsite } from '@/app/lib/api/settings.api'

import type { WebsiteFormValues } from '@/app/lib/validation/settings/settings.schema'

export function useWebsite() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [website, setWebsite] = useState<WebsiteFormValues | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getWebsite()

        const property = res.data.property

        setWebsite({
          name: property.name ?? '',
          domain: property.domain ?? '',

          allowedDomains: property.allowedDomains.join('\n'),

          category: property.details.category ?? '',
          subCategory: property.details.subCategory ?? '',
          region: property.details.region ?? '',
          description: property.details.description ?? '',
          logoUrl: property.details.logoUrl ?? '',
        })
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const saveWebsite = async (values: WebsiteFormValues) => {
    setSaving(true)

    try {
      await updateWebsite({
        name: values.name,
        domain: values.domain,

        allowedDomains: values.allowedDomains
          .split('\n')
          .map((d) => d.trim())
          .filter(Boolean),

        category: values.category,
        subCategory: values.subCategory,
        region: values.region,
        description: values.description,
        logoUrl: values.logoUrl,
      })

      setWebsite(values)
    } finally {
      setSaving(false)
    }
  }

  return {
    loading,
    saving,
    website,
    saveWebsite,
  }
}