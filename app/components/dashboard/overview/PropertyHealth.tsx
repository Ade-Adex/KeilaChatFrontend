'use client'

import { Badge, Group, Paper, Stack, Title, Text } from '@mantine/core'
import { FiCheckCircle, FiXCircle } from 'react-icons/fi'

interface PropertyHealthProps {
  health: {
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
}

export default function PropertyHealth({ health }: PropertyHealthProps) {
  // Compute performance index based on Boolean metrics completed
  const calculateHealthScore = (h: PropertyHealthProps['health']) => {
    const weights = [
      h.websiteConfigured, h.domainConfigured, h.widgetConfigured,
      h.aiEnabled, h.autoAssign, h.onlineStatus
    ]
    const passes = weights.filter(Boolean).length
    return Math.round((passes / weights.length) * 100)
  }

  const score = calculateHealthScore(health)

  return (
    <Paper withBorder radius="lg" p="lg" className="bg-card! border border-border! text-foreground! h-full">
      <Stack gap="sm">
        <Group justify="space-between">
          <Title order={4}>Property Health</Title>
          <Badge color={score > 70 ? 'green' : score > 40 ? 'yellow' : 'red'} variant="light">
            {score}% Score
          </Badge>
        </Group>

        <Stack gap="xs" className="mt-2">
          <HealthRow label="Widget Integration" status={health.widgetConfigured} />
          <HealthRow label="Custom Domain Routing" status={health.domainConfigured} />
          <HealthRow label="AI Core Operations" status={health.aiEnabled} />
          <HealthRow label="Auto Distribution Gateways" status={health.autoAssign} />
        </Stack>
      </Stack>
    </Paper>
  )
}

function HealthRow({ label, status }: { label: string; status: boolean }) {
  return (
    <Group justify="space-between" className="text-xs font-medium">
      <Text size="sm">{label}</Text>
      {status ? (
        <Group gap={4} className="text-green-500"><FiCheckCircle size={14} /> <span>Ready</span></Group>
      ) : (
        <Group gap={4} className="text-rose-500"><FiXCircle size={14} /> <span>Missing</span></Group>
      )}
    </Group>
  )
}