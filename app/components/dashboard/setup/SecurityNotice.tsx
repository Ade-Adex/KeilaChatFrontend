//  /app/components/dashboard/setup/SecurityNotice.tsx

'use client'

import { Alert, Text } from '@mantine/core'

import { FiInfo } from 'react-icons/fi'

export default function SecurityNotice() {
  return (
    <Alert color="blue" variant="light" icon={<FiInfo />}>
      <Text fw={600} mb={4}>
        Secure Widget Authentication
      </Text>

      <Text size="sm">
        The Widget ID is intentionally public and is safe to embed directly into
        your website. Every initialization request is validated against your
        registered property domain before the widget is allowed to load.
      </Text>

      <Text size="sm" mt="sm">
        API credentials, internal account identifiers, and secure access tokens
        are never exposed to website visitors.
      </Text>
    </Alert>
  )
}