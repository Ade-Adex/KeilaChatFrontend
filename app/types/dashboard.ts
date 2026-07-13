// /app/types/dashboard.ts

import { WebsiteData } from '@/app/lib/api/settings.api'
import type { MantineColor } from '@mantine/core'
import type { ReactNode } from 'react'

// --- Existing Types Preserved ---
export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  color: MantineColor
  progress?: number
}

// 🎯 FIX: Updated naming constraints to align time-series chart data schema properties seamlessly
export interface DashboardConversationChartItem {
  date: string
  chats: number
  visitors: number
}

export interface DashboardConversationChartProps {
  title: string
  subtitle: string
  data: DashboardConversationChartItem[]
}

export interface WebsiteSummaryProps {
  property: WebsiteData
}

// 🎯 ADDED: Strongly-typed response block mapping back to DashboardService runtime overview pipelines
export interface DashboardOverviewMetrics {
  activeChats: number
  queuedChats: number
  waitingChats: number
  totalVisitors: number
  onlineVisitors: number
  onlineOperators: number
  unreadNotifications: number
  metrics?: {
    avgResponseTimeSec: number
  }
  aiInsights?: {
    totalAIChats: number
    aiResolvedChats: number
    escalatedChats: number
  }
  chartData: DashboardConversationChartItem[]
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

export interface ChatAttachment {
  fileUrl: string
  fileType: string
  fileName: string
}

export interface ChatMessage {
  _id: string
  sessionId: string
  senderType: 'visitor' | 'operator' | 'ai' | 'system'
  senderId: string
  messageText: string
  messageType:
    | 'text'
    | 'image'
    | 'video'
    | 'audio'
    | 'file'
    | 'system'
    | 'event'
    | 'note'
    | 'ai_suggestion'
    | 'media'
  status: 'sent' | 'delivered' | 'seen' | 'failed'
  isFromAI: boolean
  media?: string[]
  attachments?: ChatAttachment[]
  createdAt: string
  updatedAt?: string
}

export type OperatorMessage = ChatMessage

export interface OperatorVisitorMetadata {
  country?: string
  city?: string
  browser?: string
  operatingSystem?: string
  deviceType?: 'mobile' | 'desktop' | 'tablet'
  timezone?: string
}

export interface OperatorVisitor {
  _id: string
  name?: string
  email?: string
  currentPage?: string
  referrer?: string
  pageViews?: number
  chatOpened?: boolean
  lastSeen?: string
  notes?: string
  tags?: string[]
  metadata?: OperatorVisitorMetadata
}

export interface OperatorConversation {
  _id: string
  status: 'queued' | 'active' | 'waiting' | 'closed' | 'transferred'
  priority: 'low' | 'normal' | 'high'
  channel: 'widget' | 'api'
  aiHandled: boolean
  unreadOperator: number
  lastMessage?: string
  lastMessageAt?: string
  assignedOperatorId?: string
  visitorId?: string | OperatorVisitor
  propertyId?:
    | string
    | {
        _id: string
        name?: string
        domain?: string
      }
  startedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface OperatorProfile {
  operator: {
    _id: string
    firstName?: string
    lastName?: string
    email: string
    avatar?: string
    role: 'admin' | 'supervisor' | 'agent'
    availabilityStatus: 'online' | 'away' | 'busy' | 'offline'
    activeChatsCount: number
  }
  account?: {
    name: string
  }
}