//  /app/components/dashboard/setup/DomainCard.tsx

'use client'

import { Badge, Code, Group, Paper, Stack, Text } from '@mantine/core'
import { FiGlobe } from 'react-icons/fi'

interface DomainCardProps {
  domain?: string | null
}

export default function DomainCard({ domain }: DomainCardProps) {
  const hasDomain = Boolean(domain)

  return (
    <Paper
      withBorder
      radius="md"
      p={{ base: 'md', sm: 'xl' }}
      className="bg-card! border-border!"
    >
      <Group
        justify="space-between"
        align="flex-start"
        wrap="wrap"
        gap="sm"
        mb="md"
      >
        <Group gap="xs" wrap="nowrap">
          <FiGlobe size={18} className="text-blue-600 shrink-0" />

          <Text fw={600}>Registered Domain</Text>
        </Group>

        <Badge variant="dot" color={hasDomain ? 'blue' : 'yellow'}>
          {hasDomain ? 'Verified' : 'Missing'}
        </Badge>
      </Group>

      <Code
        block
        className="
          bg-card!
          border
          border-border!
          text-foreground!
          whitespace-pre-wrap
          break-all
          overflow-x-auto
        "
      >
        {domain ?? 'No registered domain configured'}
      </Code>

      <Text size="xs" c="dimmed" mt="sm">
        Only this registered domain is authorized to initialize your Keila Chat
        widget.
      </Text>
    </Paper>
  )
}