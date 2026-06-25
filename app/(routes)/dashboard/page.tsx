// /app/(routes)/dashboard/page.tsx

'use client'

import { Grid, Stack } from '@mantine/core'

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

export default function DashboardPage() {
  const { property } = usePropertySetup()
  const user = useAuthStore((state) => state.operator)
  const account = useAuthStore((state) => state.account)
  const { operators, refreshOperators } = useOperators()

  console.log('account', account)

  return (
    <Stack gap="lg">
      {/* Hero */}
      {(user || account) && <DashboardHero user={user} account={account} />}

      {/* KPI Stats */}
      <StatsGrid operators={operators} account={account} />

      {/* Main Content */}
      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <ConversationChart
            title="Conversation Activity"
            subtitle="Last 7 days"
            data={[
              {
                label: 'Mon',
                conversations: 14,
              },
              {
                label: 'Tue',
                conversations: 18,
              },
              {
                label: 'Wed',
                conversations: 25,
              },
              {
                label: 'Thu',
                conversations: 20,
              },
              {
                label: 'Fri',
                conversations: 30,
              },
            ]}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          {property && <WebsiteSummary property={property} />}
        </Grid.Col>
      </Grid>

      {/* Visitors + Conversations */}
      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <RecentConversations
            conversations={[
              {
                id: '1',
                visitorName: 'John Doe',
                status: 'active',
                priority: 'normal',
                channel: 'widget',
                aiHandled: false,
                startedAt: '2m ago',
              },
              {
                id: '2',
                visitorName: 'Sarah Smith',
                status: 'waiting',
                priority: 'high',
                channel: 'widget',
                aiHandled: true,
                startedAt: '10m ago',
              },
            ]}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          <RecentVisitors
            visitors={[
              {
                id: '1',
                name: 'Anonymous Visitor',
                currentPage: '/pricing',
                pageViews: 5,
                isOnline: true,
                chatOpened: true,
                country: 'Nigeria',
                city: 'Lagos',
                deviceType: 'desktop',
                lastSeen: '1m ago',
              },
              {
                id: '2',
                name: 'Michael',
                currentPage: '/features',
                pageViews: 2,
                isOnline: false,
                chatOpened: false,
                country: 'United Kingdom',
                city: 'London',
                deviceType: 'mobile',
                lastSeen: '10m ago',
              },
            ]}
          />
        </Grid.Col>
      </Grid>

      {/* Operators + AI */}
      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <OperatorPerformance
            operators={[
              {
                id: '1',
                firstName: 'Adeolu',
                lastName: 'Amole',
                email: 'adeolu@example.com',
                avatar: '',
                role: 'admin',
                isOnline: true,
                availabilityStatus: 'online',
                activeChatsCount: 5,
                maxConcurrentChats: 10,
                lastSeen: 'Just now',
              },
              {
                id: '2',
                firstName: 'Support',
                lastName: 'Agent',
                email: 'support@example.com',
                avatar: '',
                role: 'agent',
                isOnline: false,
                availabilityStatus: 'away',
                activeChatsCount: 2,
                maxConcurrentChats: 5,
                lastSeen: '10m ago',
              },
            ]}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          <AIInsights
            ai={{
              enabled: true,
              fallbackToHuman: true,
              autoAssign: true,
              totalAIChats: 120,
              aiResolvedChats: 102,
              escalatedChats: 18,
              averageConfidence: 89,
            }}
          />
        </Grid.Col>
      </Grid>

      {/* Property + Account */}
      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <PropertyHealth
            health={{
              websiteConfigured: true,
              domainConfigured: true,
              widgetConfigured: true,
              apiKeyConfigured: true,

              logoConfigured: true,
              categoryConfigured: true,
              descriptionConfigured: true,

              workingHoursEnabled: false,

              aiEnabled: true,
              autoAssign: true,
              onlineStatus: true,

              allowedDomains: 3,
            }}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          <AccountSummary account={account} />
        </Grid.Col>
      </Grid>
    </Stack>
  )
}
