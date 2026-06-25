'use client'

import {
  Avatar,
  Badge,
  Group,
  Paper,
  Progress,
  ScrollArea,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'

import { FiActivity, FiClock, FiMessageSquare, FiUser } from 'react-icons/fi'

import type { OperatorPerformanceProps } from '@/app/types/dashboard'

export default function OperatorPerformance({
  operators,
}: OperatorPerformanceProps) {
  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      className="bg-card! border border-border! text-foreground!"
    >
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={4}>Operator Performance</Title>

          <Badge variant="light">{operators.length} Operators</Badge>
        </Group>

        <ScrollArea>
          <Table striped highlightOnHover verticalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Operator</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Chats</Table.Th>
                <Table.Th>Capacity</Table.Th>
                <Table.Th>Last Seen</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {operators.map((operator) => {
                const percentage =
                  operator.maxConcurrentChats === 0
                    ? 0
                    : Math.round(
                        (operator.activeChatsCount /
                          operator.maxConcurrentChats) *
                          100,
                      )

                return (
                  <Table.Tr
                    key={operator.id}
                    className="bg-background! border border-border! text-foreground!"
                  >
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar src={operator.avatar || undefined} radius="xl">
                          {operator.firstName?.charAt(0) || '?'}
                        </Avatar>

                        <Stack gap={0}>
                          <Text fw={600}>
                            {operator.firstName} {operator.lastName}
                          </Text>

                          <Text size="xs" c="dimmed">
                            {operator.email}
                          </Text>

                          <Badge size="xs" variant="light">
                            {operator.role}
                          </Badge>
                        </Stack>
                      </Group>
                    </Table.Td>

                    <Table.Td>
                      <Badge
                        color={
                          operator.availabilityStatus === 'online'
                            ? 'green'
                            : operator.availabilityStatus === 'busy'
                              ? 'red'
                              : operator.availabilityStatus === 'away'
                                ? 'yellow'
                                : 'gray'
                        }
                        leftSection={<FiActivity size={12} />}
                      >
                        {operator.availabilityStatus}
                      </Badge>
                    </Table.Td>

                    <Table.Td>
                      <Group gap={5}>
                        <ThemeIcon variant="light" size="sm">
                          <FiMessageSquare size={12} />
                        </ThemeIcon>

                        <Text>{operator.activeChatsCount}</Text>
                      </Group>
                    </Table.Td>

                    <Table.Td miw={170}>
                      <Stack gap={4}>
                        <Progress value={percentage} />

                        <Text size="xs" c="dimmed">
                          {operator.activeChatsCount}/
                          {operator.maxConcurrentChats}
                        </Text>
                      </Stack>
                    </Table.Td>

                    <Table.Td>
                      <Group gap={5}>
                        <FiClock size={12} />

                        <Text size="sm">{operator.lastSeen}</Text>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Stack>
    </Paper>
  )
}
