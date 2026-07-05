// /app/store/useKnowledgeBaseStore.ts

import { create } from 'zustand'
import { notifications } from '@mantine/notifications'
import type {
  IFaqItem,
  IKnowledgeBase,
  ICrawledSource,
} from '@/app/types/knowledgeBase'
import { getMyProperties } from '@/app/lib/api/chat.api'
import {
  getKnowledgeBaseSettings,
  updateKnowledgeBaseSettings,
} from '@/app/lib/api/knowledgeBase.api'
import { getErrorMessage } from '@/app/lib/utils/error'

interface KnowledgeBaseState {
  activePropertyId: string | null
  isAiEnabled: boolean
  threshold: number // 0-100 representation
  faqs: IFaqItem[]
  crawledSources: ICrawledSource[]
  rawConfig: Partial<IKnowledgeBase>
  loading: boolean
  syncing: boolean
  initialized: boolean

  // Actions
  initializeWorkspace: () => Promise<void>
  refreshSources: () => Promise<void>
  setAiEnabled: (enabled: boolean) => Promise<void>
  setThreshold: (value: number) => Promise<void>
  addFaqItem: (item: IFaqItem) => Promise<void>
  saveEditItem: (idx: number, updatedItem: IFaqItem) => Promise<void>
  removeFaqItem: (idx: number) => Promise<void>
  forceCloudSync: () => Promise<void>
}

export const useKnowledgeBaseStore = create<KnowledgeBaseState>((set, get) => {
  // Shared internal syncing mechanism
  const persistState = async (
    updatedFaqs: IFaqItem[],
    nextAiEnabled: boolean,
    nextThreshold: number,
  ) => {
    const { activePropertyId, rawConfig } = get()
    if (!activePropertyId) return false

    set({ syncing: true })
    try {
      const payload = {
        ...rawConfig,
        isAiEnabled: nextAiEnabled,
        confidenceThreshold: nextThreshold / 100,
        faqs: updatedFaqs,
      }

      const response = await updateKnowledgeBaseSettings(
        activePropertyId,
        payload,
      )

      set({
        faqs: response.data.faqs ?? [],
        crawledSources: response.data.crawledSources ?? [],
        rawConfig: response.data,
      })
      return true
    } catch (err) {
      notifications.show({
        title: 'Sync Error',
        message: getErrorMessage(err),
        color: 'red',
      })
      return false
    } finally {
      set({ syncing: false })
    }
  }

  return {
    activePropertyId: null,
    isAiEnabled: true,
    threshold: 80,
    faqs: [],
    crawledSources: [],
    rawConfig: {},
    loading: false,
    syncing: false,
    initialized: false,

    initializeWorkspace: async () => {
      if (get().initialized) return

      set({ loading: true })
      try {
        const propertiesRes = await getMyProperties()
        const firstProperty = propertiesRes?.data?.[0]

        if (!firstProperty?._id) {
          notifications.show({
            title: 'Workspace Error',
            message: 'No active properties found for this account layout.',
            color: 'red',
          })
          return
        }

        const propertyId = firstProperty._id
        const kbRes = await getKnowledgeBaseSettings(propertyId)

        if (kbRes?.success && kbRes.data) {
          set({
            activePropertyId: propertyId,
            isAiEnabled: kbRes.data.isAiEnabled ?? true,
            threshold: Math.round(
              (kbRes.data.confidenceThreshold ?? 0.8) * 100,
            ),
            faqs: kbRes.data.faqs ?? [],
            crawledSources: kbRes.data.crawledSources ?? [],
            rawConfig: kbRes.data,
            initialized: true,
          })
        }
      } catch (err) {
        notifications.show({
          title: 'Initialization Error',
          message: getErrorMessage(err),
          color: 'red',
        })
      } finally {
        set({ loading: false })
      }
    },

    refreshSources: async () => {
      const { activePropertyId } = get()
      if (!activePropertyId) return

      try {
        const kbRes = await getKnowledgeBaseSettings(activePropertyId)
        if (kbRes?.success && kbRes.data) {
          set({
            crawledSources: kbRes.data.crawledSources ?? [],
            rawConfig: kbRes.data,
          })
        }
      } catch (err) {
        console.error('Failed to silently sync background crawl updates:', err)
      }
    },

    setAiEnabled: async (enabled: boolean) => {
      set({ isAiEnabled: enabled })
      await persistState(get().faqs, enabled, get().threshold)
    },

    setThreshold: async (value: number) => {
      set({ threshold: value })
      await persistState(get().faqs, get().isAiEnabled, value)
    },

    addFaqItem: async (newItem: IFaqItem) => {
      const freshFaqs = [...get().faqs, newItem]
      const success = await persistState(
        freshFaqs,
        get().isAiEnabled,
        get().threshold,
      )
      if (success) {
        notifications.show({
          title: 'Success',
          message: 'FAQ item saved directly to backend records.',
          color: 'green',
        })
      }
    },

    saveEditItem: async (idx: number, updatedItem: IFaqItem) => {
      const freshFaqs = get().faqs.map((item, i) =>
        i === idx ? updatedItem : item,
      )
      const success = await persistState(
        freshFaqs,
        get().isAiEnabled,
        get().threshold,
      )
      if (success) {
        notifications.show({
          title: 'Matrix Updated',
          message: 'Modified entry saved successfully.',
          color: 'green',
        })
      }
    },

    removeFaqItem: async (idx: number) => {
      const freshFaqs = get().faqs.filter((_, i) => i !== idx)
      const success = await persistState(
        freshFaqs,
        get().isAiEnabled,
        get().threshold,
      )
      if (success) {
        notifications.show({
          title: 'Item Deleted',
          message: 'Removed from data clusters permanently.',
          color: 'orange',
        })
      }
    },

    forceCloudSync: async () => {
      await persistState(get().faqs, get().isAiEnabled, get().threshold)
    },
  }
})