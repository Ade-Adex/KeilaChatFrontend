// /app/store/useOperatorsStore.ts


import { create } from 'zustand'
import { getOperators, inviteOperator } from '@/app/lib/api/operators.api'
import { getMyProperties } from '@/app/lib/api/chat.api'
import { OperatorData } from '@/app/types/operator'

interface PropertyItem {
  _id: string
  name: string
  domain: string
}

interface OperatorsState {
  operators: OperatorData[]
  properties: PropertyItem[]
  loadingOperators: boolean
  loadingProperties: boolean
  submitLoading: boolean
  error: string | null
  operatorsLoaded: boolean
  propertiesLoaded: boolean

  fetchOperators: (forceRefresh?: boolean) => Promise<void>
  fetchProperties: (forceRefresh?: boolean) => Promise<void>
  sendInvite: (
    email: string,
    role: 'admin' | 'supervisor' | 'agent',
    assignedProperties: string[],
  ) => Promise<boolean>
  clearOperatorsCache: () => void
}

export const useOperatorsStore = create<OperatorsState>((set, get) => ({
  operators: [],
  properties: [],
  loadingOperators: false,
  loadingProperties: false,
  submitLoading: false,
  error: null,
  operatorsLoaded: false,
  propertiesLoaded: false,

  fetchOperators: async (forceRefresh = false) => {
    if (get().operatorsLoaded && !forceRefresh) return
    set({ loadingOperators: true, error: null })
    try {
      const res = await getOperators()
      set({ operators: res.data || [], operatorsLoaded: true, error: null })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load operators',
      })
    } finally {
      set({ loadingOperators: false })
    }
  },

  fetchProperties: async (forceRefresh = false) => {
    if (get().propertiesLoaded && !forceRefresh) return
    set({ loadingProperties: true })
    try {
      const res = await getMyProperties()
      set({ properties: res.data || [], propertiesLoaded: true })
    } catch (err) {
      console.error(
        'Failed fetching workspace properties within operators context:',
        err,
      )
    } finally {
      set({ loadingProperties: false })
    }
  },

  sendInvite: async (email, role, assignedProperties) => {
    set({ submitLoading: true, error: null })
    try {
      await inviteOperator({ email, role, assignedProperties })
      set({ error: null })
      return true
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Unable to send invitation',
      })
      return false
    } finally {
      set({ submitLoading: false })
    }
  },

  clearOperatorsCache: () => {
    set({
      operators: [],
      properties: [],
      operatorsLoaded: false,
      propertiesLoaded: false,
      error: null,
    })
  },
}))
