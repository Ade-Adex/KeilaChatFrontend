//  /app/components/dashboard/setup/SetupFooter.tsx

'use client'

import { Alert, Text } from '@mantine/core'

import { FiInfo } from 'react-icons/fi'

export default function SetupFooter() {
  return (
    <Alert color="blue" variant="light" icon={<FiInfo />}>
      <Text size="sm">
        Your widget is now ready for production deployment. Simply copy one of
        the installation snippets above, paste it into your website, and
        publish.
      </Text>

      <Text size="sm" mt="sm">
        Keila Chat automatically handles visitor identification, secure
        initialization, real-time communication, and future widget updates
        without requiring additional changes to your website.
      </Text>
    </Alert>
  )
}