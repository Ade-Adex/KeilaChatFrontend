// /app/(routes)/admin/dashboard/setup/page.tsx

'use client'

import { useEffect, useState } from 'react'
import {
  Paper,
  Title,
  Text,
  Code,
  Button,
  CopyButton,
  Group,
  Stack,
  Alert,
  LoadingOverlay,
  Tabs,
  Badge,
  ActionIcon,
  Tooltip,
} from '@mantine/core'
import {
  FiCheck,
  FiCopy,
  FiCode,
  FiGlobe,
  FiSettings,
  FiEye,
  FiEyeOff,
  FiInfo,
} from 'react-icons/fi'
import { useAuthStore } from '@/app/store/useAuthStore'
import type { PropertyData } from '@/app/types/auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

export default function SetupPage() {
  const user = useAuthStore((state) => state.user)
  const [property, setProperty] = useState<PropertyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Enterprise Toggle Flag for Token Hiding
  const [revealWidgetId, setRevealWidgetId] = useState(false)

  useEffect(() => {
    const fetchProperty = async () => {
      if (!user?.property?.id) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/v1/properties/${user.property.id}`,
        )
        const result = await response.json()

        if (!response.ok)
          throw new Error(result.error || 'Failed to fetch settings')
        setProperty(result.data)
      } catch (err) {
        setError('Could not load property configuration. Please refresh.')
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [user?.property?.id])

  // Helper logic to return either the true ID or a masked string
  const getDisplayId = (id: string | undefined) => {
    if (!id) return 'Not set'
    if (revealWidgetId) return id
    return `${id.substring(0, 8)}••••••••••••••••`
  }

  // Dynamic code injection based on token visibility state
  const activeWidgetId = property?.widgetId || 'YOUR_WIDGET_ID'
  const visualWidgetId = revealWidgetId
    ? activeWidgetId
    : `${activeWidgetId.substring(0, 8)}••••••••••••••••`

  const nextJsScript = `<Script 
  src="https://keila-chat.vercel.app/embed.js" 
  strategy="afterInteractive" 
  data-id="${visualWidgetId}" 
/>`

  const htmlScript = `<script 
  src="https://keila-chat.vercel.app/embed.js" 
  data-id="${visualWidgetId}" 
  async>
</script>`

  if (loading) return <LoadingOverlay visible overlayProps={{ blur: 1 }} />
  if (error)
    return (
      <Alert color="red" title="System Error" icon={<FiInfo />}>
        {error}
      </Alert>
    )

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-5 ">
        <div>
          <Title order={2} className="tracking-tight">
            Widget Integration
          </Title>
          <Text size="sm" className="mt-1">
            Embed your custom conversational snippet onto client domains to
            stream live message events.
          </Text>
        </div>
        <Badge
          variant="light"
          color="green"
          size="lg"
          className="self-start md:self-auto"
        >
          Active Environment
        </Badge>
      </div>

      {/* Domain Context & ID Overview Panel */}
      <div className="grid md:grid-cols-2 gap-6">
        <Paper
          withBorder
          p="xl"
          radius="md"
          className="shadow-sm bg-card! border border-border!"
        >
          <Group justify="space-between" mb="sm">
            <Group gap="xs">
              <FiGlobe className="text-blue-600 size-5" />
              <Text fw={600} size="sm">
                Whitelisted Domain
              </Text>
            </Group>
            <Badge
              variant="dot"
              color="blue"
              className="bg-card! border border-border! text-foreground!"
            >
              Secure Mode
            </Badge>
          </Group>
          <Code className="text-base py-1 px-2 font-mono block truncate bg-card! border border-border! text-foreground!">
            {property?.domain || 'No domain whitelisted'}
          </Code>
        </Paper>

        <Paper
          withBorder
          p="xl"
          radius="md"
          className="shadow-sm  bg-card! border border-border!"
        >
          <Group justify="space-between" mb="sm">
            <Group gap="xs">
              <FiSettings className="text-violet-600 size-5" />
              <Text fw={600} size="sm">
                Widget Identifier
              </Text>
            </Group>

            {/* Toggle Button Container */}
            <Tooltip
              label={
                revealWidgetId ? 'Hide Sensitive Key' : 'Show Sensitive Key'
              }
              position="top"
              withArrow
            >
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => setRevealWidgetId(!revealWidgetId)}
              >
                {revealWidgetId ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </ActionIcon>
            </Tooltip>
          </Group>
          <Code className="text-base py-1 px-2 font-mono block truncate tracking-wide bg-card! border border-border! text-foreground!">
            {getDisplayId(property?.widgetId)}
          </Code>
        </Paper>
      </div>

      {/* Setup Implementation Workspaces */}
      <Paper
        withBorder
        p="xl"
        radius="md"
        className="shadow-sm bg-card! border border-border! text-foreground!"
      >
        <Stack gap="lg">
          <Text
            fw={600}
            size="md"
            className="flex items-center gap-2 border-b pb-3  border border-border! text-foreground!"
          >
            <FiCode className="text-emerald-500" /> Embedded Snippet Selector
          </Text>

          <Tabs defaultValue="html" variant="outline" className="">
            <Tabs.List>
              <Tabs.Tab
                value="html"
                leftSection={
                  <span className="text-xs font-mono font-bold">&lt;/&gt;</span>
                }
              >
                Standard HTML / CMS
              </Tabs.Tab>
              <Tabs.Tab
                value="nextjs"
                leftSection={
                  <span className="text-xs font-mono font-bold">N</span>
                }
              >
                Next.js Framework
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="html" pt="xl">
              <Stack gap="sm">
                <Text size="sm" c="dimmed">
                  Paste this cross-origin asynchronous loader immediately prior
                  to your terminating <Code>&lt;/body&gt;</Code> segment tag.
                </Text>
                {/* Notice we pass down the raw version for accurate copy actions, but visual tracking updates instantly */}
                <CodeSnippet code={htmlScript} copyValue={htmlScript} />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="nextjs" pt="xl">
              <Stack gap="sm">
                <Text size="sm" c="dimmed">
                  Place this Next.js dynamic script injection inside your entry
                  global or path route layout layer component (
                  <Code className="bg-card! border border-border! text-foreground!">
                    layout.tsx
                  </Code>
                  ).
                </Text>
                <CodeSnippet code={nextJsScript} copyValue={nextJsScript} />
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Paper>
    </div>
  )
}

interface CodeSnippetProps {
  code: string
  copyValue: string
}

function CodeSnippet({ code, copyValue }: CodeSnippetProps) {
  return (
    <CopyButton value={copyValue} timeout={2500}>
      {({ copied, copy }) => (
        <Stack gap="xs">
          <div className="relative group">
            <Code
              block
              className="p-5 bg-card! border border-border! text-foreground! rounded-lg overflow-x-auto text-sm font-mono leading-relaxed"
            >
              {code}
            </Code>
          </div>
          <Group justify="flex-end">
            <Button
              variant="light"
              size="xs"
              onClick={copy}
              color={copied ? 'teal' : 'neutral'}
              leftSection={
                copied ? <FiCheck size={14} /> : <FiCopy size={14} />
              }
              className="transition-all duration-200 hover:bg-button-hover!"
            >
              {copied ? 'Copied Snippet' : 'Copy Snippet'}
            </Button>
          </Group>
        </Stack>
      )}
    </CopyButton>
  )
}