// /app/components/guards/PermissionDenied.tsx

'use client'

import { Button, Center, Paper, Stack, Text, Title } from '@mantine/core'

import Link from 'next/link'

export default function PermissionDenied() {
  return (
    <Center h="70vh">
      <Paper withBorder p="xl" maw={500}>
        <Stack align="center">
          <Title order={2}>403</Title>

          <Title order={4}>Permission Denied</Title>

          <Text ta="center" c="dimmed">
            Your account does not have permission to access this page.
          </Text>

          <Button component={Link} href="/dashboard">
            Back to Dashboard
          </Button>
        </Stack>
      </Paper>
    </Center>
  )
}