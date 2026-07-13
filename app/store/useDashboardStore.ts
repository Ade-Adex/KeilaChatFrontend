// /app/store/useDashboardStore.ts
import { create } from 'zustand'
import { getDashboardOverviewContext } from '@/app/lib/api/dashboard.api'
import type { WebsiteData } from '@/app/lib/api/settings.api'
import type {
  DashboardOverviewMetrics,
  DashboardConversationChartItem,
} from '@/app/types/dashboard'

interface DashboardState {
  property: WebsiteData | null
  analytics: DashboardOverviewMetrics | null
  chartData: DashboardConversationChartItem[]
  loading: boolean
  hasLoaded: boolean
  error: string | null
  fetchDashboardData: (
    propertyId: string,
    forceRefresh?: boolean,
  ) => Promise<void>
  clearDashboardCache: () => void
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  property: null,
  analytics: null,
  chartData: [],
  loading: false,
  hasLoaded: false,
  error: null,

  fetchDashboardData: async (propertyId: string, forceRefresh = false) => {
    // 🎯 If data is already cached and we aren't force-refreshing, skip the HTTP call
    if (get().hasLoaded && !forceRefresh && get().property) {
      return
    }

    set({ loading: true, error: null })

    try {
      const res = await getDashboardOverviewContext(propertyId)

      if (res?.success && res.data) {
        set({
          property: res.data.property,
          analytics: res.data,
          chartData: res.data.chartData ?? [],
          hasLoaded: true,
          error: null,
        })
      } else {
        set({ error: 'Failed retrieving structured dashboard payload.' })
      }
    } catch (err) {
      console.error('Error syncing contextual dashboard store properties:', err)
      set({
        error: err instanceof Error ? err.message : 'Unknown network failure',
      })
    } finally {
      set({ loading: false })
    }
  },

  clearDashboardCache: () => {
    set({
      property: null,
      analytics: null,
      chartData: [],
      hasLoaded: false,
      error: null,
    })
  },
}))
