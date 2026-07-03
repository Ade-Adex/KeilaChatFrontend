//  /app/components/dashboard/setup/DomainCard.tsx

'use client'

import { Badge, Code, Group, Paper, Text } from '@mantine/core'

import { FiGlobe } from 'react-icons/fi'

interface DomainCardProps {
  domain?: string | null
}

export default function DomainCard({ domain }: DomainCardProps) {
  const hasDomain = Boolean(domain)

  return (
    <Paper withBorder radius="md" p="xl" className="bg-card! border-border!">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <FiGlobe size={18} className="text-blue-600" />

          <Text fw={600}>Registered Domain</Text>
        </Group>

        <Badge variant="dot" color={hasDomain ? 'blue' : 'yellow'}>
          {hasDomain ? 'Verified' : 'Missing'}
        </Badge>
      </Group>

      <Code block className="bg-card! border border-border! text-foreground!">
        {domain ?? 'No registered domain configured'}
      </Code>

      <Text size="xs" c="dimmed" mt="sm">
        Only this registered domain is authorized to initialize your Keila Chat
        widget.
      </Text>
    </Paper>
  )
}