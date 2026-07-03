// /app/components/dashboard/setup/InstallationNotes.tsx

'use client'

import { Paper, Stack, Text, Title } from '@mantine/core'

import { installationNotes } from '@/app/hooks/settings/installationNotes'

export default function InstallationNotes() {
  return (
    <Paper withBorder radius="md" p="lg" className="bg-card! border-border!">
      <Stack gap="sm">
        <Title order={5}>Installation Notes</Title>

        {installationNotes.map((note) => (
          <Text key={note} size="sm">
            • {note}
          </Text>
        ))}
      </Stack>
    </Paper>
  )
}