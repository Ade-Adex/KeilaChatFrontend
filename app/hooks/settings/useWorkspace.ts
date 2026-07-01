// /app/hooks/settings/useWorkspace.ts

'use client'

import { useEffect, useState } from 'react'

import { getWorkspace, updateWorkspace } from '@/app/lib/api/settings.api'
import type { WorkspaceFormValues } from '@/app/lib/validation/settings/settings.schema'

type WorkspaceState = WorkspaceFormValues & {
  plan: string
}

export function useWorkspace() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadWorkspace = async () => {
      try {
        setLoading(true)

        const res = await getWorkspace()

        if (!isMounted) return

        setWorkspace({
          companyName: res.data.account.name,
          plan: res.data.account.plan,
        })
      } catch (err) {
        console.error('Failed to load workspace data:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadWorkspace()

    return () => {
      isMounted = false
    }
  }, [])

  const saveWorkspace = async (values: WorkspaceFormValues) => {
    setSaving(true)

    try {
      const res = await updateWorkspace(values)

      setWorkspace((prev) =>
        prev
          ? {
              ...prev,
              companyName: res.data.account.name,
            }
          : null,
      )
    } catch (err) {
      console.error('Failed to update workspace configuration:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  return {
    loading,
    saving,
    workspace,
    saveWorkspace,
    refresh: async () => {
      const res = await getWorkspace()

      setWorkspace({
        companyName: res.data.account.name,
        plan: res.data.account.plan,
      })
    },
  }
}