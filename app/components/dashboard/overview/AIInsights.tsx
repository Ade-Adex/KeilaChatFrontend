'use client'

import {
  Badge,
  Divider,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'

import {
  FiArrowUpRight,
  FiCheckCircle,
  FiCpu,
  FiGitMerge,
} from 'react-icons/fi'

import type { AIInsightsProps } from '@/app/types/dashboard'

export default function AIInsights({ ai }: AIInsightsProps) {
  const resolutionRate =
    ai.totalAIChats === 0
      ? 0
      : Math.round((ai.aiResolvedChats / ai.totalAIChats) * 100)

  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      className="bg-card! border border-border! text-foreground! h-full"
    >
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={4}>AI Insights</Title>

          <Badge color={ai.enabled ? 'green' : 'gray'} variant="light">
            {ai.enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </Group>

        <Divider className="border-border!" />

        <SimpleGrid cols={2}>
          <Metric
            icon={<FiCpu />}
            title="AI Chats"
            value={ai.totalAIChats.toLocaleString()}
          />

          <Metric
            icon={<FiCheckCircle />}
            title="Resolved"
            value={ai.aiResolvedChats.toLocaleString()}
          />

          <Metric
            icon={<FiGitMerge />}
            title="Escalated"
            value={ai.escalatedChats.toLocaleString()}
          />

          <Metric
            icon={<FiArrowUpRight />}
            title="Confidence"
            value={`${ai.averageConfidence.toFixed(1)}%`}
          />
        </SimpleGrid>

        <Divider className="border-border!" />

        <Stack gap={5}>
          <Group justify="space-between">
            <Text fw={500}>AI Resolution Rate</Text>

            <Text fw={700}>{resolutionRate}%</Text>
          </Group>

          <Progress value={resolutionRate} size="lg" />
        </Stack>

        <Divider className="border-border!" />

        <Group grow>
          <Badge color={ai.autoAssign ? 'green' : 'gray'} variant="light">
            Auto Assign
          </Badge>

          <Badge color={ai.fallbackToHuman ? 'blue' : 'gray'} variant="light">
            Human Fallback
          </Badge>

          <Badge color={ai.enabled ? 'teal' : 'gray'} variant="light">
            AI Assistant
          </Badge>
        </Group>
      </Stack>
    </Paper>
  )
}

interface MetricProps {
  title: string
  value: string | number
  icon: React.ReactNode
}

function Metric({ title, value, icon }: MetricProps) {
  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      className="bg-background! border border-border! text-foreground!"
    >
      <Stack gap={6}>
        <ThemeIcon variant="light" size="lg">
          {icon}
        </ThemeIcon>

        <Text size="xs" c="dimmed">
          {title}
        </Text>

        <Title order={3}>{value}</Title>
      </Stack>
    </Paper>
  )
}
