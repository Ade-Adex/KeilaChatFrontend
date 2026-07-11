// /app/(routes)/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { Grid, Stack, Loader, Center } from '@mantine/core'

import DashboardHero from '@/app/components/dashboard/overview/DashboardHero'
import StatsGrid from '@/app/components/dashboard/overview/StatsGrid'
import ConversationChart from '@/app/components/dashboard/overview/ConversationChart'
import WebsiteSummary from '@/app/components/dashboard/overview/WebsiteSummary'
import RecentConversations from '@/app/components/dashboard/overview/RecentConversations'
import RecentVisitors from '@/app/components/dashboard/overview/RecentVisitors'
import OperatorPerformance from '@/app/components/dashboard/overview/OperatorPerformance'
import AIInsights from '@/app/components/dashboard/overview/AIInsights'
import PropertyHealth from '@/app/components/dashboard/overview/PropertyHealth'
import AccountSummary from '@/app/components/dashboard/overview/AccountSummary'

import { usePropertySetup } from '@/app/hooks/settings/usePropertySetup'
import { useAuthStore } from '@/app/store/useAuthStore'
import { useOperators } from '@/app/hooks/operators/useOperators'
import { getChatSocket } from '@/app/hooks/useChatSocket'

import type {
  DashboardConversationChartItem,
  DashboardRecentConversation,
  DashboardRecentVisitor,
  DashboardOperatorPerformance,
  DashboardPropertyHealth,
  DashboardAIInsights,
} from '@/app/types/dashboard'

export default function DashboardPage() {
  const { property, loading: propertyLoading } = usePropertySetup()
  const user = useAuthStore((state) => state.operator)
  const account = useAuthStore((state) => state.account)
  const { operators } = useOperators()

  // ✅ Fixed
  const [conversations, setConversations] = useState<
    DashboardRecentConversation[]
  >([])

  const [visitors, setVisitors] = useState<DashboardRecentVisitor[]>([])

  // Weekly chart data
  const totalChats = account?.usage?.totalChats ?? 0

  const chartData: DashboardConversationChartItem[] = [
    {
      label: 'Mon',
      conversations: totalChats ? Math.round(totalChats * 0.1) : 0,
    },
    {
      label: 'Tue',
      conversations: totalChats ? Math.round(totalChats * 0.15) : 0,
    },
    {
      label: 'Wed',
      conversations: totalChats ? Math.round(totalChats * 0.25) : 0,
    },
    {
      label: 'Thu',
      conversations: totalChats ? Math.round(totalChats * 0.2) : 0,
    },
    {
      label: 'Fri',
      conversations: totalChats ? Math.round(totalChats * 0.3) : 0,
    },
  ]

  useEffect(() => {
    if (!property?._id) return

    const socket = getChatSocket()

    const handleVisitors = (updatedVisitors: DashboardRecentVisitor[]) => {
      setVisitors(updatedVisitors)
    }

    const handleConversations = (
      updatedChats: DashboardRecentConversation[],
    ) => {
      setConversations(updatedChats)
    }

    socket.on('visitor_activity_sync', handleVisitors)
    socket.on('conversation_stream_sync', handleConversations)

    return () => {
      socket.off('visitor_activity_sync', handleVisitors)
      socket.off('conversation_stream_sync', handleConversations)
    }
  }, [property?._id])

  if (propertyLoading) {
    return (
      <Center h={400}>
        <Loader size="md" color="blue" />
      </Center>
    )
  }

  const computedHealth: DashboardPropertyHealth = {
    websiteConfigured: !!property?.name,
    domainConfigured: !!property?.domain,
    widgetConfigured: !!property?.widgetId,
    apiKeyConfigured: !!property?.apiKey,
    logoConfigured: !!property?.details?.logoUrl,
    categoryConfigured: !!property?.details?.category,
    descriptionConfigured: !!property?.details?.description,
    workingHoursEnabled: !!property?.workingHours?.enabled,
    aiEnabled: !!property?.settings?.aiEnabled,
    autoAssign: !!property?.settings?.autoAssign,
    onlineStatus: !!property?.settings?.onlineStatus,
    allowedDomains: property?.allowedDomains?.length ?? 0,
  }

  const computedAiDetails: DashboardAIInsights = {
    enabled: !!property?.settings?.aiEnabled,
    fallbackToHuman: !!property?.settings?.aiFallbackToHuman,
    autoAssign: !!property?.settings?.autoAssign,
    totalAIChats: totalChats ? Math.round(totalChats * 0.4) : 0,
    aiResolvedChats: totalChats ? Math.round(totalChats * 0.32) : 0,
    escalatedChats: totalChats ? Math.round(totalChats * 0.08) : 0,
    averageConfidence: 86.4,
  }

  const typedOperators: DashboardOperatorPerformance[] = (operators ?? []).map(
    (op) => ({
      id: op._id,
      firstName: op.firstName ?? '',
      lastName: op.lastName ?? '',
      email: op.email,
      avatar: op.avatar ?? '',
      role: op.role,
      isOnline: op.isOnline,
      availabilityStatus: op.availabilityStatus ?? 'offline',
      activeChatsCount: op.activeChatsCount ?? 0,
      maxConcurrentChats: op.maxConcurrentChats ?? 5,
      lastSeen: op.lastSeen
        ? new Date(op.lastSeen).toLocaleDateString()
        : 'Never',
    }),
  )

  const aiResolutionProgress =
    computedAiDetails.totalAIChats > 0
      ? Math.round(
          (computedAiDetails.aiResolvedChats / computedAiDetails.totalAIChats) *
            100,
        )
      : 0

  return (
    <Stack gap="lg">
      {(user || account) && <DashboardHero user={user} account={account} />}

      <StatsGrid
        operators={operators ?? []}
        account={account}
        activeVisitorsCount={
          visitors.filter((visitor) => visitor.isOnline).length
        }
        activeChatsCount={
          conversations.filter(
            (conversation) =>
              conversation.status === 'active' ||
              conversation.status === 'queued',
          ).length
        }
        aiResolutionProgress={aiResolutionProgress}
        avgResponseTime={0}
      />

      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <ConversationChart
            title="Conversation Trends"
            subtitle="Weekly overview"
            data={chartData}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          {property && <WebsiteSummary property={property} />}
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <RecentConversations conversations={conversations} />
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          <RecentVisitors visitors={visitors} />
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <OperatorPerformance operators={typedOperators} />
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          <AIInsights ai={computedAiDetails} />
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <PropertyHealth health={computedHealth} />
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          <AccountSummary account={account} />
        </Grid.Col>
      </Grid>
    </Stack>
  )
}
