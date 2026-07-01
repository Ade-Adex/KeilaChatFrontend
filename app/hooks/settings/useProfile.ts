// /app/hooks/settings/useProfile.ts

'use client'

import { useEffect, useState } from 'react'

import { getProfile, updateProfile } from '@/app/lib/api/settings.api'
import type { ProfileFormValues } from '@/app/lib/validation/settings/settings.schema'

export function useProfile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState<ProfileFormValues | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)

      try {
        const res = await getProfile()

        setProfile({
          firstName: res.data.operator.firstName ?? '',
          lastName: res.data.operator.lastName ?? '',
          email: res.data.operator.email,
          avatar: res.data.operator.avatar ?? '',
        })
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoading(false)
      }
    }

    void loadProfile()
  }, [])

  const saveProfile = async (values: ProfileFormValues) => {
    setSaving(true)

    try {
      await updateProfile(values)
      setProfile(values)
    } catch (err) {
      console.error('Failed to update profile:', err)
      // Rethrow the error so that the calling form component can catch it and display an error alert
      throw err
    } finally {
      setSaving(false)
    }
  }

  return {
    loading,
    saving,
    profile,
    saveProfile,
  }
}