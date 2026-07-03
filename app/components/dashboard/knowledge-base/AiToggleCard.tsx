// /app/components/dashboard/knowledge-base/AiToggleCard.tsx

'use client'

import { Card, Group, Switch, Text } from '@mantine/core'

interface AiToggleCardProps {
  isAiEnabled: boolean
  onToggle: (checked: boolean) => void
}

export default function AiToggleCard({
  isAiEnabled,
  onToggle,
}: AiToggleCardProps) {
  return (
    <Card withBorder radius="md" p="lg" className="bg-card! border-border!">
      <Group justify="space-between" align="center">
        <div>
          <Text fw={600} className="text-foreground">
            AI First-Respondent Engine
          </Text>
          <Text size="xs" c="dimmed">
            When toggled on, the AI assistant will automatically parse and
            intercept conversations before notifying human operators.
          </Text>
        </div>
        <Switch
          checked={isAiEnabled}
          onChange={(e) => onToggle(e.currentTarget.checked)}
          size="lg"
          classNames={{ track: 'cursor-pointer' }}
        />
      </Group>
    </Card>
  )
}