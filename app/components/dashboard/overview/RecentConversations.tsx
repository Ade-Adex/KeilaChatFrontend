'use client'

import {
  Avatar,
  Badge,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
} from '@mantine/core'

import { FiCpu, FiMessageSquare, FiUser } from 'react-icons/fi'

import type { RecentConversationsProps } from '@/app/types/dashboard'

export default function RecentConversations({
  conversations,
}: RecentConversationsProps) {
  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      className="bg-card! border border-border! text-foreground! h-full"
    >
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={4}>Recent Conversations</Title>

          <Badge variant="light">{conversations.length}</Badge>
        </Group>

        {conversations.length === 0 ? (
          <Text ta="center" c="dimmed" py="xl">
            No conversations yet.
          </Text>
        ) : (
          <ScrollArea.Autosize mah={430}>
            <Stack gap="md">
              {conversations.map((chat) => (
                <Paper
                  key={chat.id}
                  withBorder
                  radius="md"
                  p="md"
                  className="bg-background! border border-border! text-foreground!"
                >
                  <Group justify="space-between" align="flex-start">
                    <Group align="flex-start">
                      <Avatar radius="xl">{chat.visitorName.charAt(0)}</Avatar>

                      <Stack gap={2}>
                        <Group gap={6}>
                          <Text fw={600}>{chat.visitorName}</Text>

                          <Badge size="xs" variant="light">
                            {chat.channel}
                          </Badge>

                          {chat.aiHandled && (
                            <Badge color="blue" size="xs">
                              AI
                            </Badge>
                          )}
                        </Group>

                        <Text size="xs" c="dimmed">
                          {chat.currentPage || 'Unknown page'}
                        </Text>

                        <Group gap="xs">
                          <FiUser size={12} />

                          <Text size="xs" c="dimmed">
                            {chat.operatorName ?? 'Unassigned'}
                          </Text>
                        </Group>
                      </Stack>
                    </Group>

                    <Stack gap={5} align="flex-end">
                      <Badge color={statusColor(chat.status)}>
                        {chat.status}
                      </Badge>

                      <Badge
                        variant="outline"
                        color={priorityColor(chat.priority)}
                      >
                        {chat.priority}
                      </Badge>

                      <Text size="xs" c="dimmed">
                        {chat.startedAt}
                      </Text>
                    </Stack>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </ScrollArea.Autosize>
        )}
      </Stack>
    </Paper>
  )
}

function statusColor(status: string) {
  switch (status) {
    case 'active':
      return 'green'

    case 'waiting':
      return 'yellow'

    case 'queued':
      return 'blue'

    case 'closed':
      return 'gray'

    case 'transferred':
      return 'violet'

    default:
      return 'gray'
  }
}

function priorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'red'

    case 'normal':
      return 'blue'

    case 'low':
      return 'gray'

    default:
      return 'gray'
  }
}
