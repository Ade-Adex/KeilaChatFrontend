// /app/(routes)/admin/dashboard/page.tsx
'use client'

import { Paper, Title, Text, Grid, SimpleGrid, Group, Badge, ActionIcon } from '@mantine/core'
import { FiMessageSquare, FiUsers, FiClock, FiCheckCircle, FiArrowRight } from 'react-icons/fi'

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <Title order={2}>Dashboard</Title>
          <Text c="dimmed">
            Welcome back, here&apos;s what&apos;s happening with your chat
            widget.
          </Text>
        </div>
      </div>

      {/* 1. KPI Stats Section */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <StatCard
          title="Active Visitors"
          value="24"
          icon={<FiUsers size={20} />}
          color="blue"
        />
        <StatCard
          title="Open Conversations"
          value="3"
          icon={<FiMessageSquare size={20} />}
          color="indigo"
        />
        <StatCard
          title="Avg. Response Time"
          value="45s"
          icon={<FiClock size={20} />}
          color="teal"
        />
        <StatCard
          title="Status"
          value="Online"
          icon={<FiCheckCircle size={20} />}
          color="green"
        />
      </SimpleGrid>

      {/* 2. Charts & Recent Activity */}
      <Grid gap="md" className="">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Paper
            withBorder
            p="lg"
            radius="md"
            shadow="sm"
            className="bg-card! border border-border! text-foreground!"
          >
            <Title order={4} mb="md">
              Chat Activity (Last 7 Days)
            </Title>
            {/* Replace this with a <Recharts /> component */}
            <div className="h-64 bg-card! border border-border! text-foreground! rounded-lg flex items-center justify-center border-dashed">
              <Text c="dimmed" className="">
                Chart Visualization Area
              </Text>
            </div>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper
            withBorder
            p="lg"
            radius="md"
            shadow="sm"
            className="h-full bg-card! border border-border! text-foreground!"
          >
            <Title order={4} mb="md">
              Recent Conversations
            </Title>
            <div className="space-y-4">
              <RecentChatItem
                name="Sarah Johnson"
                text="Do you offer a refund policy?"
                time="2m ago"
              />
              <RecentChatItem
                name="Mike Chen"
                text="I need help with the API..."
                time="15m ago"
              />
              <RecentChatItem
                name="Admin System"
                text="New visitor from Ogbomoso"
                time="1h ago"
              />
            </div>
          </Paper>
        </Grid.Col>
      </Grid>
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      shadow="sm"
      className="bg-card! border border-border! text-foreground!"
    >
      <Group justify="space-between">
        <Text size="sm" c="dimmed" fw={500}>
          {title}
        </Text>
        <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
          {icon}
        </div>
      </Group>
      <Text size="xl" fw={700} mt="md">
        {value}
      </Text>
    </Paper>
  )
}

function RecentChatItem({ name, text, time }: { name: string, text: string, time: string }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
      <div>
        <Text size="sm" fw={600}>{name}</Text>
        <Text size="xs" c="dimmed" truncate maw={150}>{text}</Text>
      </div>
      <Text size="xs" c="dimmed">{time}</Text>
    </div>
  )
}