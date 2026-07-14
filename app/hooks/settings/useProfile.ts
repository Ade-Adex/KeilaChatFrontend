// /app/hooks/settings/useProfile.ts


'use client'

import { useState } from 'react'
import { useAuthStore } from '@/app/store/useAuthStore'
import { updateProfile } from '@/app/lib/api/settings.api'
import type { ProfileFormValues } from '@/app/lib/validation/settings/settings.schema'

export function useProfile() {
  const [saving, setSaving] = useState(false)

  const operator = useAuthStore((state) => state.operator)

  const updateOperator = useAuthStore((state) => state.updateOperator)

  const profile: ProfileFormValues = {
    firstName: operator?.firstName ?? '',
    lastName: operator?.lastName ?? '',
    email: operator?.email ?? '',
    avatar: operator?.avatar ?? '',
  }

  const saveProfile = async (values: ProfileFormValues) => {
    setSaving(true)

    try {
      const res = await updateProfile(values)

      if (res?.success) {
        updateOperator(values)
      }

      return res
    } catch (err) {
      console.error(
        '[KeilaChat Settings] Failed to update operator runtime profile:',
        err,
      )
      throw err
    } finally {
      setSaving(false)
    }
  }

  return {
    saving,
    profile,
    saveProfile,
  }
}
