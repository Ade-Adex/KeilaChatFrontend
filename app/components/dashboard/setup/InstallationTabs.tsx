// /app/components/dashboard/setup/InstallationTabs.tsx

'use client'

import { Alert, Code, Paper, Stack, Tabs, Text } from '@mantine/core'

import { FiCode, FiInfo } from 'react-icons/fi'

import CodeSnippet from './CodeSnippet'
import LockedOverlay from './LockedOverlay'

interface InstallationTabsProps {
  locked: boolean | undefined

  htmlScript: string

  nextJsScript: string
}

export default function InstallationTabs({
  locked,
  htmlScript,
  nextJsScript,
}: InstallationTabsProps) {
  return (
    <Paper
      withBorder
      radius="md"
      p="xl"
      className="relative bg-card! border-border!"
    >
      {/* Lock overlay */}

      {locked && <LockedOverlay />}

      {/* Main content */}

      <Stack
        gap="lg"
        className={locked ? 'pointer-events-none select-none opacity-30' : ''}
      >
        {/* Section header */}

        <Text fw={600} className="flex items-center gap-2">
          <FiCode className="text-emerald-500" />
          Installation Snippets
        </Text>

        {/* Tabs */}

        <Tabs defaultValue="html" variant="outline">
          <Tabs.List>
            <Tabs.Tab value="html">HTML / CMS</Tabs.Tab>

            <Tabs.Tab value="nextjs">Next.js</Tabs.Tab>
          </Tabs.List>

          {/* HTML */}

          <Tabs.Panel value="html" pt="xl">
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Copy and paste this snippet immediately before your closing
                <Code>&lt;/body&gt;</Code> tag.
              </Text>

              <CodeSnippet code={htmlScript} copyValue={htmlScript} />

              <Alert color="green" variant="light" icon={<FiInfo />}>
                This script automatically downloads the latest widget version,
                validates your domain, initializes a secure Shadow DOM
                container, and loads the chat interface.
              </Alert>
            </Stack>
          </Tabs.Panel>

          {/* NextJS */}

          <Tabs.Panel value="nextjs" pt="xl">
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Import Next.js Script and place the widget inside your root
                <Code>layout.tsx</Code> or any public layout wrapper.
              </Text>

              <CodeSnippet code={nextJsScript} copyValue={nextJsScript} />

              <Alert color="green" variant="light" icon={<FiInfo />}>
                Using
                <Code mx={4}>strategy= &quot;afterInteractive&quot;</Code>
                ensures your website finishes loading before the chat widget
                initializes.
              </Alert>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Installation Process */}

        <Paper
          withBorder
          radius="md"
          p="lg"
          className="bg-card! border-border!"
        >
          <Stack gap="sm">
            <Text fw={600}>Installation Flow</Text>

            <Text size="sm">1. Visitor loads your website.</Text>

            <Text size="sm">2. Widget script downloads.</Text>

            <Text size="sm">
              3. Domain validation request is sent to Keila Chat.
            </Text>

            <Text size="sm">4. Secure Shadow DOM container is created.</Text>

            <Text size="sm">5. Visitor session is initialized.</Text>

            <Text size="sm">6. Real-time chat communication begins.</Text>
          </Stack>
        </Paper>
      </Stack>
    </Paper>
  )
}