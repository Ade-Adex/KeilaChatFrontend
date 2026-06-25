'use client'

import {
  Badge,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'

import {
  FiCheckCircle,
  FiXCircle,
  FiGlobe,
  FiCpu,
  FiClock,
  FiImage,
  FiKey,
  FiLink,
  FiLayers,
} from 'react-icons/fi'

import type { PropertyHealthProps } from '@/app/types/dashboard'

export default function PropertyHealth({ health }: PropertyHealthProps) {
  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      className="bg-card! border border-border! text-foreground! h-full"
    >
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={4}>Property Health</Title>

          <Badge color={calculateHealthColor(health)} variant="light">
            {calculateHealthScore(health)}%
          </Badge>
        </Group>

        <HealthItem
          icon={<FiGlobe size={16} />}
          title="Website Configured"
          ok={health.websiteConfigured}
        />

        <HealthItem
          icon={<FiLink size={16} />}
          title="Primary Domain"
          ok={health.domainConfigured}
        />

        <HealthItem
          icon={<FiKey size={16} />}
          title="Widget ID"
          ok={health.widgetConfigured}
        />

        <HealthItem
          icon={<FiKey size={16} />}
          title="API Key"
          ok={health.apiKeyConfigured}
        />

        <HealthItem
          icon={<FiImage size={16} />}
          title="Logo Uploaded"
          ok={health.logoConfigured}
        />

        <HealthItem
          icon={<FiLayers size={16} />}
          title="Category Selected"
          ok={health.categoryConfigured}
        />

        <HealthItem
          icon={<FiClock size={16} />}
          title="Working Hours"
          ok={health.workingHoursEnabled}
        />

        <HealthItem
          icon={<FiCpu size={16} />}
          title="AI Enabled"
          ok={health.aiEnabled}
        />

        <HealthItem
          icon={<FiCheckCircle size={16} />}
          title="Auto Assignment"
          ok={health.autoAssign}
        />

        <HealthItem
          icon={<FiGlobe size={16} />}
          title="Website Online"
          ok={health.onlineStatus}
        />

        <Group justify="space-between">
          <Text fw={500}>Allowed Domains</Text>

          <Badge variant="outline">{health.allowedDomains}</Badge>
        </Group>
      </Stack>
    </Paper>
  )
}

interface HealthItemProps {
  icon: React.ReactNode
  title: string
  ok: boolean
}

function HealthItem({ icon, title, ok }: HealthItemProps) {
  return (
    <Group justify="space-between">
      <Group gap="sm">
        <ThemeIcon variant="light">{icon}</ThemeIcon>

        <Text size="sm">{title}</Text>
      </Group>

      {ok ? (
        <Badge color="green" leftSection={<FiCheckCircle size={12} />}>
          OK
        </Badge>
      ) : (
        <Badge color="red" leftSection={<FiXCircle size={12} />}>
          Missing
        </Badge>
      )}
    </Group>
  )
}

function calculateHealthScore(health: PropertyHealthProps['health']) {
  const values = [
    health.websiteConfigured,
    health.domainConfigured,
    health.widgetConfigured,
    health.apiKeyConfigured,
    health.logoConfigured,
    health.categoryConfigured,
    health.descriptionConfigured,
    health.workingHoursEnabled,
    health.aiEnabled,
    health.autoAssign,
    health.onlineStatus,
  ]

  const passed = values.filter(Boolean).length

  return Math.round((passed / values.length) * 100)
}

function calculateHealthColor(health: PropertyHealthProps['health']) {
  const score = calculateHealthScore(health)

  if (score >= 90) return 'green'

  if (score >= 70) return 'yellow'

  return 'red'
}
