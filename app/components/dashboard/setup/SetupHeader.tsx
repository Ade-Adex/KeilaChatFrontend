// /app/components/dashboard/setup/SetupHeader.tsx


'use client'

import { Badge, Text, Title } from '@mantine/core'

interface SetupHeaderProps {
  isNotRegistered: boolean | undefined
}

export default function SetupHeader({ isNotRegistered }: SetupHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-5 px-4">
      <div>
        <Title order={2}>Widget Integration</Title>

        <Text size="sm" c="dimmed" mt={4} className="max-w-[80%]">
          Embed the Keila Chat widget into your website with a single script.
          Every widget request is securely validated against your registered
          property domain before initialization.
        </Text>
      </div>

      <Badge
        size="md"
        color={isNotRegistered ? 'yellow' : 'green'}
        variant="light"
        className="my-auto"
      >
        {isNotRegistered ? 'Awaiting Configuration' : 'Production Ready'}
      </Badge>
    </div>
  )
}