// /app/components/dashboard/knowledge-base/AiSettings.tsx

'use client'

import { Card, Stack, Text, Slider } from '@mantine/core'

interface AiSettingsProps {
  threshold: number
  onChangeThreshold: (val: number) => void
}

export default function AiSettings({
  threshold,
  onChangeThreshold,
}: AiSettingsProps) {
  return (
    <Card withBorder radius="md" p="lg" className="bg-card! border-border!">
      <Stack gap="xs">
        <Text fw={600} size="sm" className="text-foreground">
          Semantic Similarity Threshold ({threshold}%)
        </Text>
        <Text size="xs" c="dimmed">
          The minimum structural relation match rate required to trigger an
          auto-reply. Queries below this percentage safely drop down to team
          inboxes.
        </Text>
        <Slider
          value={threshold}
          onChange={onChangeThreshold}
          min={50}
          max={100}
          step={1}
          marks={[
            { value: 50, label: '50%' },
            { value: 80, label: '80% (Recommended)' },
            { value: 100, label: '100%' },
          ]}
          className="mt-2 mb-4"
        />
      </Stack>
    </Card>
  )
}