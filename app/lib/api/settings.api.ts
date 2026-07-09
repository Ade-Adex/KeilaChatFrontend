// /app/lib/api/settings.api.ts

import { apiGet, apiPut } from '@/app/lib/api/apiClient'

import type {
  ProfileFormValues,
  WorkspaceFormValues,
} from '@/app/lib/validation/settings/settings.schema'

import type { AccountData, OperatorData } from '@/app/types/auth'

/* -------------------------------------------------------------------------- */
/* PROFILE                                   */
/* -------------------------------------------------------------------------- */

export interface ProfileResponse {
  success: boolean
  data: {
    operator: OperatorData
    account: AccountData
  }
}

export function getProfile() {
  return apiGet<ProfileResponse>(`/api/v1/operators/profile`)
}

export function updateProfile(data: ProfileFormValues) {
  return apiPut<ProfileResponse>(`/api/v1/operators/profile`, data)
}

/* -------------------------------------------------------------------------- */
/* WORKSPACE                                  */
/* -------------------------------------------------------------------------- */

export interface WorkspaceResponse {
  success: boolean
  data: {
    account: AccountData
  }
}

export function getWorkspace() {
  return apiGet<WorkspaceResponse>(`/api/v1/account/workspace`)
}

export function updateWorkspace(data: WorkspaceFormValues) {
  return apiPut<WorkspaceResponse>(`/api/v1/account/workspace`, data)
}

/* -------------------------------------------------------------------------- */
/* WEBSITE                                   */
/* -------------------------------------------------------------------------- */

export interface WebsiteData {
  id: string
  accountId: string
  widgetId: string
  apiKey: string
  name: string
  domain: string
  allowedDomains: string[]
  widgetSettings?: {
    aiName?: string
    launcherPosition?: string
    welcomeMessage?: string
    offlineMessage?: string
    showAgentPhoto?: boolean
    soundEnabled?: boolean
    allowFileUpload?: boolean
    allowEmoji?: boolean
    allowScreenshots?: boolean
    allowVoiceRecordings?: boolean
  }
  details: {
    category: string
    subCategory: string
    region: string
    description: string
    logoUrl: string
  }
  settings: {
    themeColor: string
    headingText: string
    onlineStatus: boolean
    trackIp: boolean
    autoAssign: boolean
    aiEnabled: boolean
    aiFallbackToHuman: boolean
    responseTimeGoalMs?: number
  }
  workingHours: {
    enabled: boolean
    timezone: string
    schedule: Record<
      string,
      {
        enabled: boolean
        start: string
        end: string
      }
    >
  }
  createdAt: string
  updatedAt: string
}

export interface WebsiteResponse {
  success: boolean
  data: {
    property: WebsiteData
  }
}

export interface UpdateWebsiteRequest {
  name: string
  domain: string
  aiName: string
  allowedDomains: string[]
  category: string
  subCategory: string
  region: string
  description: string
  logoUrl: string
  widgetSettings?: {
    allowFileUpload?: boolean
    allowVoiceRecordings?: boolean
  }
}

export function getWebsite() {
  return apiGet<WebsiteResponse>('/api/v1/properties/settings')
}

export function updateWebsite(data: UpdateWebsiteRequest) {
  return apiPut<WebsiteResponse>('/api/v1/properties/settings', data)
}

// 🎯 ADDED: Fetch dedicated property layout configuration rules with custom context headers
export function getPropertySettings(propertyId: string) {
  return apiGet<WebsiteResponse>('/api/v1/properties/settings', {
    headers: { 'x-property-id': propertyId },
  })
}