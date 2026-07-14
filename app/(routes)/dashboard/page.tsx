// /app/(routes)/dashboard/page.tsx



'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Grid,
  Stack,
  Loader,
  Center,
  Title,
  Text,
  Button,
  Paper,
} from '@mantine/core'
import Link from 'next/link'

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

import { useAuthStore } from '@/app/store/useAuthStore'
import { useDashboardStore } from '@/app/store/useDashboardStore' // 🎯 Import custom store
import { useOperators } from '@/app/hooks/operators/useOperators'
import { getChatSocket } from '@/app/hooks/useChatSocket'

import type {
  DashboardRecentConversation,
  DashboardRecentVisitor,
  DashboardOperatorPerformance,
  DashboardPropertyHealth,
  DashboardAIInsights,
} from '@/app/types/dashboard'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.operator)
  const account = useAuthStore((state) => state.account)
  const { operators } = useOperators()

  // 🎯 Map global Zustand caching states
  const { property, analytics, chartData, loading, hasLoaded, fetchDashboardData } = useDashboardStore()

  // console.log('DashboardPage', { property, analytics, chartData, loading, hasLoaded })

  const [conversations, setConversations] = useState<DashboardRecentConversation[]>([])
  const [visitors, setVisitors] = useState<DashboardRecentVisitor[]>([])

  const assignedProperties = user?.assignedProperties ?? []
  const propertyIdContext =
    assignedProperties.length > 0
      ? assignedProperties[0]?._id || assignedProperties[0]
      : null

  // Wrapper tracking function for websocket re-fetches
  const triggerSocketRefresh = useCallback(async () => {
    if (!propertyIdContext) return
    await fetchDashboardData(propertyIdContext.toString(), true) // 🎯 Force refresh on backend request signals
  }, [propertyIdContext, fetchDashboardData])

  useEffect(() => {
    if (!propertyIdContext) return

    // Defer processing execution frame preventing synchronous cascading re-renders
    Promise.resolve().then(() => {
      void fetchDashboardData(propertyIdContext.toString())
    })
  }, [propertyIdContext, fetchDashboardData])

  useEffect(() => {
    if (!propertyIdContext) return

    const socket = getChatSocket()

    const handleVisitors = (updatedVisitors: DashboardRecentVisitor[]) => {
      setVisitors(updatedVisitors)
    }

    const handleConversations = (updatedChats: DashboardRecentConversation[]) => {
      setConversations(updatedChats)
    }

    socket.on('visitor_activity_sync', handleVisitors)
    socket.on('conversation_stream_sync', handleConversations)
    socket.on('dashboard_refresh_request', triggerSocketRefresh)

    return () => {
      socket.off('visitor_activity_sync', handleVisitors)
      socket.off('conversation_stream_sync', handleConversations)
      socket.off('dashboard_refresh_request', triggerSocketRefresh)
    }
  }, [propertyIdContext, triggerSocketRefresh])

  // Display initial loader only when there's no cached property payload context available yet
  if (loading && !hasLoaded) {
    return (
      <Center h={400}>
        <Loader size="md" color="blue" />
      </Center>
    )
  }

  if (!propertyIdContext || !property) {
    return (
      <Stack gap="lg">
        {(user || account) && <DashboardHero user={user} account={account} />}

        <Paper p="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
          <Stack align="center" gap="sm">
            <Title order={3}>Welcome to KeilaChat!</Title>
            <Text c="dimmed" maw={500}>
              To begin monitoring visitors and managing live chat operations,
              you need to create your first property website workspace.
            </Text>
            <Button
              component={Link}
              href="/dashboard/settings"
              color="blue"
              mt="md"
            >
              Set Up Your Property Website
            </Button>
          </Stack>
        </Paper>
      </Stack>
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
    aiEnabled: !!property?.settings?.aiEnabled || !!account?.settings?.aiEnabled,
    autoAssign: !!property?.settings?.autoAssign,
    onlineStatus: !!property?.settings?.onlineStatus,
    allowedDomains: property?.allowedDomains?.length ?? 0,
  }

  const computedAiDetails: DashboardAIInsights = {
    enabled: !!property?.settings?.aiEnabled || !!account?.settings?.aiEnabled,
    fallbackToHuman: !!property?.settings?.aiFallbackToHuman,
    autoAssign: !!property?.settings?.autoAssign,
    totalAIChats: analytics?.aiInsights?.totalAIChats ?? 0,
    aiResolvedChats: analytics?.aiInsights?.aiResolvedChats ?? 0,
    escalatedChats: analytics?.aiInsights?.escalatedChats ?? 0,
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
      lastSeen: op.lastSeen ? new Date(op.lastSeen).toLocaleDateString() : 'Never',
    }),
  )

  const aiResolutionProgress =
    computedAiDetails.totalAIChats > 0
      ? Math.round((computedAiDetails.aiResolvedChats / computedAiDetails.totalAIChats) * 100)
      : 0

  return (
    <Stack gap="lg">
      {(user || account) && <DashboardHero user={user} account={account} />}

      <StatsGrid
        operators={operators ?? []}
        account={account}
        activeVisitorsCount={visitors.filter((visitor) => visitor.isOnline).length}
        activeChatsCount={conversations.filter((c) => c.status === 'active' || c.status === 'queued').length}
        aiResolutionProgress={aiResolutionProgress}
        avgResponseTime={analytics?.metrics?.avgResponseTimeSec ?? user?.stats?.averageResponseTime ?? 0}
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
          <WebsiteSummary property={property} />
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