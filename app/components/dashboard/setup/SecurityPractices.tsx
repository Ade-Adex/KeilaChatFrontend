// /app/components/dashboard/setup/SecurityPractices.tsx

'use client'

import { Alert, Paper, Stack, Text, Title } from '@mantine/core'

import { securityPractices } from '@/app/data/setup/securityPractices'

export default function SecurityPractices() {
  return (
    <Paper withBorder radius="md" p="lg" className="bg-card! border-border!">
      <Stack gap="sm">
        <Title order={5}>Security Best Practices</Title>

        <Alert color="yellow" variant="light">
          Never expose your Property API Key in frontend code.
        </Alert>

        {securityPractices.map((practice) => (
          <Text key={practice} size="sm">
            ✓ {practice}
          </Text>
        ))}
      </Stack>
    </Paper>
  )
}