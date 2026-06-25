// /app/components/dashboard/RecentVisitors.tsx

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

import {
  FiExternalLink,
  FiGlobe,
  FiMonitor,
  FiSmartphone,
  FiTablet,
} from 'react-icons/fi'

import type { DashboardRecentVisitor } from '@/app/types/dashboard'

interface RecentVisitorsProps {
  visitors: DashboardRecentVisitor[]
}

function DeviceIcon({
  device,
}: {
  device: DashboardRecentVisitor['deviceType']
}) {
  switch (device) {
    case 'mobile':
      return <FiSmartphone size={14} />

    case 'tablet':
      return <FiTablet size={14} />

    default:
      return <FiMonitor size={14} />
  }
}

export default function RecentVisitors({ visitors }: RecentVisitorsProps) {
  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      className="bg-card! border border-border! text-foreground! h-full"
    >
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={4}>Recent Visitors</Title>

          <Badge variant="light">{visitors.length}</Badge>
        </Group>

        {visitors.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No visitors yet.
          </Text>
        ) : (
          <ScrollArea.Autosize mah={430}>
            <Stack gap="md">
              {visitors.map((visitor) => (
                <Paper key={visitor.id} withBorder radius="md" p="md" className='bg-background! border-border!'>
                  <Group align="flex-start" justify="space-between">
                    <Group align="flex-start">
                      <Avatar radius="xl">
                        {visitor.name.charAt(0).toUpperCase()}
                      </Avatar>

                      <Stack gap={2}>
                        <Group gap={6}>
                          <Text fw={600}>{visitor.name}</Text>

                          <Badge
                            color={visitor.isOnline ? 'green' : 'gray'}
                            variant="light"
                            size="xs"
                          >
                            {visitor.isOnline ? 'Online' : 'Offline'}
                          </Badge>
                        </Group>

                        <Group gap={5}>
                          <FiExternalLink size={13} />

                          <Text size="sm" c="dimmed" lineClamp={1}>
                            {visitor.currentPage || 'Unknown page'}
                          </Text>
                        </Group>

                        <Group gap="xs">
                          <DeviceIcon device={visitor.deviceType} />

                          <Text size="xs" c="dimmed" tt="capitalize">
                            {visitor.deviceType}
                          </Text>

                          {visitor.country && (
                            <>
                              <FiGlobe size={12} />

                              <Text size="xs" c="dimmed">
                                {visitor.city ? `${visitor.city}, ` : ''}
                                {visitor.country}
                              </Text>
                            </>
                          )}
                        </Group>
                      </Stack>
                    </Group>

                    <Stack gap={4} align="flex-end">
                      <Badge variant="outline" color="blue">
                        {visitor.pageViews} Pages
                      </Badge>

                      {visitor.chatOpened && (
                        <Badge color="green" variant="light">
                          Chat Opened
                        </Badge>
                      )}

                      <Text size="xs" c="dimmed">
                        {visitor.lastSeen}
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
