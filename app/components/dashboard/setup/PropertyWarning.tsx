// /app/components/dashboard/setup/PropertyWarning.tsx

'use client'

import Link from 'next/link'

import { Alert, Button, Group, Stack, Text } from '@mantine/core'

import { FiAlertTriangle, FiArrowRight } from 'react-icons/fi'

export default function PropertyWarning() {
  return (
    <Alert
      color="yellow"
      variant="filled"
      radius="md"
      title="Property Registration Required"
      icon={<FiAlertTriangle size={20} />}
      className="shadow-md text-foreground!"
    >
      <Stack gap="xs">
        <Text size="sm" className="text-foreground!">
          Your property workspace has not yet been fully configured. Integration
          snippets cannot be generated until a verified website domain has been
          registered for this workspace.
        </Text>

        <Group>
          <Button
            component={Link}
            href="/dashboard/settings"
            size="xs"
            variant="white"
            color="yellow"
            rightSection={<FiArrowRight size={14} />}
            className="bg-primary! text-white! font-semibold cursor-pointer"
          >
            Go to Property Settings
          </Button>
        </Group>
      </Stack>
    </Alert>
  )
}