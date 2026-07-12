// /app/components/guards/PropertyRequired.tsx

'use client'

import Link from 'next/link'

import { Button, Center, Paper, Stack, Text, Title } from '@mantine/core'

export default function PropertyRequired() {
  return (
    <Center h="70vh">
      <Paper withBorder p="xl" maw={520}>
        <Stack align="center">
          <Title order={3}>Property Required</Title>

          <Text ta="center" c="dimmed">
            You must create your first Property before using this feature.
          </Text>

          <Button component={Link} href="/dashboard/setup">
            Go to Setup
          </Button>
        </Stack>
      </Paper>
    </Center>
  )
}