'use client'

import {
  Group,
  Paper,
  RingProgress,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core'

import type { StatCardProps } from '@/app/types/dashboard'

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  progress,
}: StatCardProps) {
  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      className="bg-card! border-border! h-full"
    >
      <Group justify="space-between" align="flex-start">
        <ThemeIcon size={36} radius="md" color={color} variant="light">
          {icon}
        </ThemeIcon>

        {typeof progress === 'number' && (
          <RingProgress
            size={52}
            thickness={5}
            sections={[
              {
                value: progress,
                color,
              },
            ]}
            label={
              <Text ta="center" size="xs" fw={700}>
                {progress}%
              </Text>
            }
          />
        )}
      </Group>

      <Stack gap={2} mt="md">
        <Text size="xs" c="dimmed">
          {title}
        </Text>

        <Text fw={700} size="1.5rem">
          {value}
        </Text>

        {subtitle && (
          <Text size="xs" c="dimmed">
            {subtitle}
          </Text>
        )}
      </Stack>
    </Paper>
  )
}
