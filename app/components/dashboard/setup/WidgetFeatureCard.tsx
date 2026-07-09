// /app/components/dashboard/setup/WidgetFeatureCard.tsx


'use client'

import { Card, Group, Stack, Switch, Text } from '@mantine/core'
import { FiPaperclip, FiMic } from 'react-icons/fi'

interface WidgetFeatureCardProps {
  allowFileUpload: boolean
  allowVoiceRecordings: boolean
  onToggleUpload: (checked: boolean) => void
  onToggleVoice: (checked: boolean) => void
}

export default function WidgetFeatureCard({
  allowFileUpload,
  allowVoiceRecordings,
  onToggleUpload,
  onToggleVoice,
}: WidgetFeatureCardProps) {
  return (
    <Card withBorder radius="md" p="xl" className="bg-card! border-border!">
      <Stack gap="lg">
        <div>
          <Text fw={600} size="md" className="text-foreground">
            Widget Media Permissions
          </Text>
          <Text size="xs" c="dimmed">
            Manage interactive media capabilities accessible by visitors inside
            your chat container widget window.
          </Text>
        </div>

        <Group
          justify="space-between"
          align="center"
          className="border-t border-border pt-4"
        >
          <Group gap="sm">
            <FiPaperclip size={18} className="text-blue-500" />
            <div>
              <Text fw={500} size="sm" className="text-foreground">
                File & Image Attachments
              </Text>
              <Text size="xs" c="dimmed">
                Allow visitors to upload screenshots and document attachments
                inside chats.
              </Text>
            </div>
          </Group>
          <Switch
            checked={allowFileUpload}
            onChange={(e) => onToggleUpload(e.currentTarget.checked)}
            size="md"
            classNames={{ track: 'cursor-pointer' }}
          />
        </Group>

        <Group
          justify="space-between"
          align="center"
          className="border-t border-border pt-4"
        >
          <Group gap="sm">
            <FiMic size={18} className="text-purple-500" />
            <div>
              <Text fw={500} size="sm" className="text-foreground">
                Voice Message Recordings
              </Text>
              <Text size="xs" c="dimmed">
                Allow website visitors to record and submit structural
                asynchronous audio notes.
              </Text>
            </div>
          </Group>
          <Switch
            checked={allowVoiceRecordings}
            onChange={(e) => onToggleVoice(e.currentTarget.checked)}
            size="md"
            classNames={{ track: 'cursor-pointer' }}
          />
        </Group>
      </Stack>
    </Card>
  )
}
