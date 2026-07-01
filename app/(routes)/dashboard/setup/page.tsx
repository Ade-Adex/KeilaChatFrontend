// /app/(routes)/admin/dashboard/setup/page.tsx

'use client'

import { useState } from 'react'
import {
  Paper,
  Title,
  Text,
  Code,
  Group,
  Stack,
  Alert,
  Tabs,
  Badge,
  ActionIcon,
  Tooltip,
  Card,
  Loader,
  Button,
} from '@mantine/core'
import {
  FiGlobe,
  FiSettings,
  FiEye,
  FiEyeOff,
  FiInfo,
  FiCode,
  FiAlertTriangle,
  FiArrowRight,
  FiLock,
} from 'react-icons/fi'
import Link from 'next/link'

import { usePropertySetup } from '@/app/hooks/settings/usePropertySetup'
import CodeSnippet from '@/app/components/dashboard/setup/CodeSnippet'

export default function SetupPage() {
  const { property, loading, error } = usePropertySetup()

  const [revealWidgetId, setRevealWidgetId] = useState(false)

  const isNotFoundError = error?.toLowerCase().includes('not found')
  const isNotRegistered =
    !property || !property.domain || !property.widgetId || isNotFoundError

  /**
   * Safe public Widget ID
   * This is NOT an API key.
   */
  const widgetId = property?.widgetId ?? 'YOUR_WIDGET_ID'

  /**
   * Mask Widget ID only for display.
   * Never use this masked value in copied snippets.
   */
  const getDisplayId = (id?: string) => {
    if (!id) return 'Not configured'

    if (revealWidgetId) {
      return id
    }

    return `${id.slice(0, 8)}••••••••••••••••`
  }

  /**
   * HTML Embed Snippet
   */
  const htmlScript = `<script
  src="https://keila-chat.vercel.app/embed.js"
  data-id="${widgetId}"
  async>
</script>`

  /**
   * Next.js Embed Snippet
   */
  const nextJsScript = `import Script from 'next/script'

<Script
  src="https://keila-chat.vercel.app/embed.js"
  strategy="afterInteractive"
  data-id="${widgetId}"
/>`

  /* ---------------------------------------------------------- */
  /* Loading State                                               */
  /* ---------------------------------------------------------- */

  if (loading) {
    return (
      <Card className="bg-card! flex justify-center items-center h-screen">
        <Loader size="lg" />
      </Card>
    )
  }

  /* ---------------------------------------------------------- */
  /* Error State                                                 */
  /* ---------------------------------------------------------- */

  if (error && !isNotFoundError) {
    return (
      <Alert
        color="red"
        title="Unable to Load Widget Configuration"
        icon={<FiInfo />}
      >
        {error}
      </Alert>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      {/* ===================================================== */}
      {/* 🎯 Unregistered Property Banner Warning Notification  */}
      {/* ===================================================== */}
      {isNotRegistered && (
        <Alert
          color="amber"
          variant="filled"
          title="Property Registration Required"
          icon={<FiAlertTriangle size={20} />}
          radius="md"
          className="shadow-md text-foreground!"
        >
          <Stack gap="xs">
            <Text size="sm" className="text-foreground!">
              You haven&apos;t fully registered or configured a domain profile
              for this property workspace yet. The integration layout cannot
              authorize or issue live production snippets until your website
              domain is authorized.
            </Text>
            <Group>
              <Button
                component={Link}
                href="/dashboard/settings"
                variant="white"
                color="amber"
                size="xs"
                rightSection={<FiArrowRight size={14} />}
                className="font-semibold cursor-pointer text-white bg-primary!"
              >
                Go to Property Settings
              </Button>
            </Group>
          </Stack>
        </Alert>
      )}

      {/* ===================================================== */}
      {/* Header */}
      {/* ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-5">
        <div>
          <Title order={2}>Widget Integration</Title>

          <Text size="sm" c="dimmed" mt={4}>
            Embed the Keila Chat widget into your website with a single script.
            Every widget request is securely verified against your registered
            domain before loading.
          </Text>
        </div>

        <Badge
          size="md"
          color={isNotRegistered ? 'amber' : 'green'}
          variant="light"
        >
          {isNotRegistered ? 'Awaiting Configuration' : 'Production Ready'}
        </Badge>
      </div>

      {/* ===================================================== */}
      {/* Overview Cards */}
      {/* ===================================================== */}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Domain */}

        <Paper
          withBorder
          radius="md"
          p="xl"
          className="bg-card! border-border!"
        >
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <FiGlobe size={18} className="text-blue-600" />

              <Text fw={600}>Registered Domain</Text>
            </Group>

            <Badge variant="dot" color={property?.domain ? 'blue' : 'amber'}>
              {property?.domain ? 'Verified' : 'Missing'}
            </Badge>
          </Group>

          <Code
            block
            className="bg-card! border border-border! text-foreground!"
          >
            {property?.domain || 'No registered domain configured'}
          </Code>

          <Text size="xs" c="dimmed" mt="sm">
            Only this domain is allowed to initialize your chat widget.
          </Text>
        </Paper>

        {/* Widget ID */}

        <Paper
          withBorder
          radius="md"
          p="xl"
          className="bg-card! border-border!"
        >
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <FiSettings size={18} className="text-violet-600" />

              <Text fw={600}>Public Widget ID</Text>
            </Group>

            {!isNotRegistered && (
              <Tooltip
                withArrow
                label={revealWidgetId ? 'Hide Widget ID' : 'Show Widget ID'}
              >
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => setRevealWidgetId((prev) => !prev)}
                >
                  {revealWidgetId ? (
                    <FiEyeOff size={16} />
                  ) : (
                    <FiEye size={16} />
                  )}
                </ActionIcon>
              </Tooltip>
            )}
          </Group>

          <Code
            block
            className="bg-card! border border-border! text-foreground!"
          >
            {property?.widgetId
              ? getDisplayId(property.widgetId)
              : 'Not configured'}
          </Code>

          <Text size="xs" c="dimmed" mt="sm">
            This identifier is safe to embed on your website. It is not an API
            key and cannot access your account.
          </Text>
        </Paper>
      </div>

      {/* ===================================================== */}
      {/* Security Notice */}
      {/* ===================================================== */}

      <Alert color="blue" variant="light" icon={<FiInfo />}>
        <Text fw={600} mb={4}>
          Secure Widget Authentication
        </Text>

        <Text size="sm">
          The Widget ID is intentionally public and is safe to include in your
          website. Every initialization request is validated against your
          registered domain on the server before the widget is allowed to load.
          Your API keys, account credentials, and internal tokens are never
          exposed to visitors.
        </Text>
      </Alert>

      {/* ===================================================== */}
      {/* Installation Tabs */}
      {/* ===================================================== */}

      <Paper
        withBorder
        radius="md"
        p="xl"
        className="bg-card! border-border! relative"
      >
        {/* 🎯 Blur overlay container blocker if the property has not been registered yet */}
        {isNotRegistered && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 rounded-md text-center">
            <FiLock size={32} className="text-muted-foreground mb-3" />
            <Title order={4} mb={4}>
              Snippets Locked
            </Title>
            <Text size="sm" c="dimmed" maw={400} mx="auto" mb="md">
              Please register your website domain details inside your management
              dashboard configurations to unlock integration script elements.
            </Text>
            <Button
              component={Link}
              href="/dashboard/settings"
              variant="outline"
              size="sm"
              className="cursor-pointer"
            >
              Configure Settings Property
            </Button>
          </div>
        )}

        <Stack
          gap="lg"
          className={
            isNotRegistered ? 'opacity-30 pointer-events-none select-none' : ''
          }
        >
          <Text fw={600} className="flex items-center gap-2">
            <FiCode className="text-emerald-500" />
            Installation Snippets
          </Text>

          <Tabs defaultValue="html" variant="outline">
            <Tabs.List>
              <Tabs.Tab value="html">HTML / CMS</Tabs.Tab>

              <Tabs.Tab value="nextjs">Next.js</Tabs.Tab>
            </Tabs.List>
            {/* ================================================= */}
            {/* HTML */}
            {/* ================================================= */}

            <Tabs.Panel value="html" pt="xl">
              <Stack gap="md">
                <Text size="sm" c="dimmed">
                  Copy and paste the following snippet immediately before your
                  closing <Code>&lt;/body&gt;</Code> tag.
                </Text>

                <CodeSnippet code={htmlScript} copyValue={htmlScript} />

                <Alert color="green" variant="light" icon={<FiInfo />}>
                  This script automatically downloads the latest widget,
                  verifies your domain with Keila Chat servers, creates a secure
                  Shadow DOM, and loads the chat interface.
                </Alert>
              </Stack>
            </Tabs.Panel>

            {/* ================================================= */}
            {/* NEXT JS */}
            {/* ================================================= */}

            <Tabs.Panel value="nextjs" pt="xl">
              <Stack gap="md">
                <Text size="sm" c="dimmed">
                  Import Next.js Script and place the widget inside your root
                  <Code>layout.tsx</Code> or any layout that wraps your public
                  website.
                </Text>

                <CodeSnippet code={nextJsScript} copyValue={nextJsScript} />

                <Alert color="green" variant="light" icon={<FiInfo />}>
                  Using
                  <Code mx={4}>strategy=&quot;afterInteractive&quot;</Code>
                  ensures your website loads first before the chat widget
                  initializes.
                </Alert>
              </Stack>
            </Tabs.Panel>
          </Tabs>

          {/* ================================================= */}
          {/* Installation Notes */}
          {/* ================================================= */}

          <Paper
            withBorder
            radius="md"
            p="lg"
            className="bg-card! border-border!"
          >
            <Stack gap="sm">
              <Title order={5}>Installation Notes</Title>

              <Text size="sm">
                • The widget automatically generates a persistent visitor ID.
              </Text>

              <Text size="sm">
                • Your visitors never have access to your dashboard or account.
              </Text>

              <Text size="sm">
                • Only domains registered in your Property Settings can load
                this widget.
              </Text>

              <Text size="sm">
                • The widget securely communicates with Keila Chat using HTTPS.
              </Text>

              <Text size="sm">
                • Future widget improvements are delivered automatically without
                requiring you to update your website.
              </Text>
            </Stack>
          </Paper>

          {/* ================================================= */}
          {/* Security Best Practices */}
          {/* ================================================= */}

          <Paper
            withBorder
            radius="md"
            p="lg"
            className="bg-card! border-border!"
          >
            <Stack gap="sm">
              <Title order={5}>Security Best Practices</Title>

              <Alert color="yellow" variant="light">
                Never expose your Property API Key in frontend code.
              </Alert>

              <Text size="sm">✓ The Widget ID is designed to be public.</Text>

              <Text size="sm">
                ✓ Domain verification happens entirely on the server.
              </Text>

              <Text size="sm">
                ✓ Your API Key remains stored only on Keila Chat servers.
              </Text>

              <Text size="sm">
                ✓ Every widget request is verified before an iframe is ever
                created.
              </Text>

              <Text size="sm">
                ✓ Requests from unauthorized domains are rejected with HTTP 403.
              </Text>
            </Stack>
          </Paper>

          {/* ================================================= */}
          {/* Footer */}
          {/* ================================================= */}

          <Alert color="blue" variant="light" icon={<FiInfo />}>
            Your widget is now ready for production deployment. Simply copy one
            of the installation snippets above, paste it into your website, and
            publish. Keila Chat will handle visitor identification, secure
            initialization, and real-time communication automatically.
          </Alert>
        </Stack>
      </Paper>
    </div>
  )
}

