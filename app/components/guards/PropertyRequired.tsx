// /app/components/guards/PropertyRequired.tsx

'use client'

import Link from 'next/link'

import {
  Button,
  Center,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'

import { FiHome, FiLock } from 'react-icons/fi'

interface PropertyRequiredProps {
  mode: 'admin' | 'operator'
}

export default function PropertyRequired({
  mode,
}: PropertyRequiredProps) {
  const isAdmin = mode === 'admin'

  return (
    <Center h="70vh">
      <Paper
        withBorder
        radius="lg"
        p="xl"
        maw={560}
      >
        <Stack align="center">
          <ThemeIcon
            size={64}
            radius="xl"
            variant="light"
            color={isAdmin ? 'blue' : 'orange'}
          >
            {isAdmin ? (
              <FiHome size={28} />
            ) : (
              <FiLock size={28} />
            )}
          </ThemeIcon>

          <Title order={3}>
            {isAdmin
              ? 'Create Your First Property'
              : 'No Property Assigned'}
          </Title>

          <Text ta="center" c="dimmed">
            {isAdmin
              ? 'Your account does not have any property yet.'
              : 'Your administrator has not assigned you to any property yet.'}
          </Text>

          {isAdmin ? (
            <Button
              component={Link}
              href="/dashboard/setup"
            >
              Create Property
            </Button>
          ) : (
            <Button
              component={Link}
              href="/dashboard"
              variant="light"
            >
              Back to Dashboard
            </Button>
          )}
        </Stack>
      </Paper>
    </Center>
  )
}