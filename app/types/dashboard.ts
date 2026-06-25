// /app/types/dashboard.ts
import { WebsiteData } from '@/app/lib/api/settings.api'
import type { MantineColor } from '@mantine/core'
import type { ReactNode } from 'react'

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string

  icon: ReactNode

  color: MantineColor

  progress?: number
}


export interface DashboardConversationChartItem {
  label: string
  conversations: number
}

export interface DashboardConversationChartProps {
  title: string
  subtitle: string
  data: DashboardConversationChartItem[]
}

export interface WebsiteSummaryProps {
  property: WebsiteData
}

export interface DashboardRecentVisitor {
  id: string
  name: string
  currentPage: string
  pageViews: number

  isOnline: boolean
  chatOpened: boolean

  country?: string
  city?: string

  deviceType: 'desktop' | 'mobile' | 'tablet'

  lastSeen: string
}

export interface DashboardOperatorPerformance {
  id: string

  firstName: string
  lastName: string
  email: string
  avatar: string

  role: 'admin' | 'supervisor' | 'agent'

  isOnline: boolean

  availabilityStatus: 'online' | 'away' | 'busy' | 'offline'

  activeChatsCount: number
  maxConcurrentChats: number

  lastSeen: string
}

export interface OperatorPerformanceProps {
  operators: DashboardOperatorPerformance[]
}

export interface DashboardAIInsights {
  enabled: boolean
  fallbackToHuman: boolean
  autoAssign: boolean

  totalAIChats: number
  aiResolvedChats: number
  escalatedChats: number

  averageConfidence: number
}

export interface AIInsightsProps {
  ai: DashboardAIInsights
}

export interface DashboardPropertyHealth {
  websiteConfigured: boolean
  domainConfigured: boolean
  widgetConfigured: boolean
  apiKeyConfigured: boolean

  logoConfigured: boolean
  categoryConfigured: boolean
  descriptionConfigured: boolean

  workingHoursEnabled: boolean

  aiEnabled: boolean
  autoAssign: boolean
  onlineStatus: boolean

  allowedDomains: number
}

export interface PropertyHealthProps {
  health: DashboardPropertyHealth
}

export interface DashboardRecentConversation {
  id: string

  visitorName: string
  visitorEmail?: string

  operatorName?: string

  currentPage?: string

  status: 'queued' | 'active' | 'waiting' | 'closed' | 'transferred'

  priority: 'low' | 'normal' | 'high'

  channel: 'widget' | 'api'

  aiHandled: boolean

  startedAt: string
}

export interface RecentConversationsProps {
  conversations: DashboardRecentConversation[]
}