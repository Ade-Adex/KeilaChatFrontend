// /app/hooks/settings/useWorkspace.ts
'use client'

import { useState } from 'react'
import { useAuthStore } from '@/app/store/useAuthStore'
import { updateWorkspace } from '@/app/lib/api/settings.api'
import type { WorkspaceFormValues } from '@/app/lib/validation/settings/settings.schema'

export function useWorkspace() {
  const [saving, setSaving] = useState(false)
  
  const account = useAuthStore((state) => state.account)
  const updateAccount = useAuthStore((state) => state.updateAccount)

  const workspace = {
    companyName: account?.name ?? '',
    plan: account?.plan ?? 'free',
  }

  const saveWorkspace = async (values: WorkspaceFormValues) => {
    setSaving(true)

    try {
      const res = await updateWorkspace(values)

      if (res?.success && res.data?.account) {
        updateAccount({
          name: res.data.account.name,
        })
      }

      return res
    } catch (err) {
      console.error('[KeilaChat Settings] Failed to update workspace configuration:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  return {
    saving,
    workspace,
    saveWorkspace,
  }
}