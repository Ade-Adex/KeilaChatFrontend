'use client'

import { Paper, Group, Stack, Text, Title } from '@mantine/core'

import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { FiTrendingUp } from 'react-icons/fi'

import type { DashboardConversationChartProps } from '@/app/types/dashboard'

export default function ConversationChart({
  data,
}: DashboardConversationChartProps) {
  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      className="bg-card! border border-border! text-foreground! h-full"
    >
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={4}>Conversation Activity</Title>

            <Text size="sm" c="dimmed">
              Conversations during the last 7 days
            </Text>
          </div>

          <FiTrendingUp size={20} />
        </Group>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id="conversationGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />

                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="day" tickLine={false} axisLine={false} />

              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="conversations"
                stroke="#3b82f6"
                fill="url(#conversationGradient)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Stack>
    </Paper>
  )
}
