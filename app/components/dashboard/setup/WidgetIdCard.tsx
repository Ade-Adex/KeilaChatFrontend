//  /app/components/dashboard/setup/WidgetIdCard.tsx


'use client'

import {
  ActionIcon,
  Badge,
  Code,
  Group,
  Paper,
  Text,
  Tooltip,
} from '@mantine/core'

import {
  FiEye,
  FiEyeOff,
  FiSettings,
  FiCopy,
  FiCheck,
} from 'react-icons/fi'

import { useState } from 'react'

interface WidgetIdCardProps {
  widgetId?: string | null
  disabled?: boolean
  revealed: boolean
  onToggle: () => void
  displayId: (id?: string) => string
}

export default function WidgetIdCard({
  widgetId,
  disabled = false,
  revealed,
  onToggle,
  displayId,
}: WidgetIdCardProps) {
  const hasWidgetId = Boolean(widgetId)


  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!widgetId) return

    try {
      await navigator.clipboard.writeText(widgetId)

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy Widget ID:', error)
    }
  }

  return (
    <Paper
      withBorder
      radius="md"
      p={{ base: 'md', sm: 'xl' }}
      className="bg-card! border-border!"
    >
      <Group
        justify="space-between"
        align="flex-start"
        wrap="wrap"
        gap="sm"
        mb="md"
      >
        <Group gap="xs" wrap="nowrap">
          <FiSettings size={18} className="text-violet-600 shrink-0" />

          <Text fw={600}>Public Widget ID</Text>
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Badge variant="dot" color={hasWidgetId ? 'green' : 'yellow'}>
            {hasWidgetId ? 'Configured' : 'Missing'}
          </Badge>

          {!disabled && hasWidgetId && (
            <>
              <Tooltip
                withArrow
                position="left"
                label={revealed ? 'Hide Widget ID' : 'Show Widget ID'}
              >
                <ActionIcon
                  variant="subtle"
                  onClick={onToggle}
                  className="text-foreground!"
                  aria-label={revealed ? 'Hide Widget ID' : 'Show Widget ID'}
                >
                  {revealed ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </ActionIcon>
              </Tooltip>

              <Tooltip
                withArrow
                position="left"
                label={copied ? 'Copied!' : 'Copy Widget ID'}
              >
                <ActionIcon
                  variant="subtle"
                  color={copied ? 'green' : undefined}
                  onClick={handleCopy}
                  className="text-foreground!"
                  aria-label="Copy Widget ID"
                >
                  {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                </ActionIcon>
              </Tooltip>
            </>
          )}
        </Group>
      </Group>

      <Code
        block
        className="
          bg-card!
          border
          border-border!
          text-foreground!
          whitespace-pre-wrap
          break-all
          overflow-x-auto
        "
      >
        {widgetId ? displayId(widgetId) : 'Not configured'}
      </Code>

      <Text size="xs" c="dimmed" mt="sm">
        This identifier is intended to be public and can safely be embedded into
        your website. It cannot access your account, API credentials, or
        internal resources.
      </Text>
    </Paper>
  )
}