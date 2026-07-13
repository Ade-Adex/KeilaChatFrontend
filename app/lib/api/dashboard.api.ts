// app/lib/api/dashboard.api.ts

import { apiGet } from '@/app/lib/api/apiClient'
import type { WebsiteData } from '@/app/lib/api/settings.api'
import type { DashboardOverviewMetrics } from '@/app/types/dashboard'

// 🎯 FIX: Extends full transactional metrics profile with structural property definitions cleanly
export interface DashboardOverviewContextResponse {
  success: boolean
  data: DashboardOverviewMetrics & {
    property: WebsiteData
  }
}

export function getDashboardOverviewContext(propertyId: string) {
  return apiGet<DashboardOverviewContextResponse>(
    `/api/v1/dashboard/${propertyId}/overview`,
  )
}