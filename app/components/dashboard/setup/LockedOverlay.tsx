// /app/components/dashboard/setup/LockedOverlay.tsx

'use client'

import Link from 'next/link'

import { Button, Text, Title } from '@mantine/core'

import { FiLock } from 'react-icons/fi'

export default function LockedOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-md bg-background/60 backdrop-blur-[2px] p-6 text-center">
      <FiLock size={32} className="mb-3 text-muted-foreground" />

      <Title order={4} mb={4}>
        Snippets Locked
      </Title>

      <Text size="sm" c="dimmed" maw={420} mx="auto" mb="md">
        Please configure and verify your property domain inside Property
        Settings before production installation snippets can be generated.
      </Text>

      <Button
        component={Link}
        href="/dashboard/settings"
        variant="outline"
        size="sm"
        className="cursor-pointer"
      >
        Configure Property Settings
      </Button>
    </div>
  )
}