// /app/components/dashboard/knowledge-base/FaqList.tsx

'use client'

import {
  Card,
  Table,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Group,
} from '@mantine/core'
import { FiTrash2, FiEdit2 } from 'react-icons/fi'
import type { IFaqItem } from '@/app/types/knowledgeBase'

interface FaqListProps {
  faqs: IFaqItem[]
  onEdit: (idx: number) => void
  onRemove: (idx: number) => void
}

export default function FaqList({ faqs, onEdit, onRemove }: FaqListProps) {
  return (
    <Card
      withBorder
      radius="md"
      p={0}
      className="bg-card! border-border! overflow-hidden"
    >
      <div className="p-4 border-b border-border bg-sidebar/5">
        <Text fw={600} size="sm" className="text-foreground">
          Structured Context Records ({faqs.length})
        </Text>
      </div>
      <div className="overflow-x-auto">
        <Table
          verticalSpacing="sm"
          horizontalSpacing="md"
          highlightOnHover
          variant="simple"
        >
          <Table.Thead className="bg-sidebar/5">
            <Table.Tr>
              <Table.Th style={{ width: 130 }}>Category</Table.Th>
              <Table.Th style={{ width: 260 }}>Context Question</Table.Th>
              <Table.Th>Configured Matrix Response</Table.Th>
              <Table.Th>Intent</Table.Th>

              <Table.Th>Keywords</Table.Th>

              <Table.Th>Usage</Table.Th>
              <Table.Th
                style={{ width: 90 }}
                aria-label="Control Matrix Actions"
              />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {faqs.map((item, idx) => (
              <Table.Tr
                key={item._id || idx}
                className="border-b border-border last:border-0"
              >
                <Table.Td>
                  <Badge
                    variant="light"
                    color={item.enabled ? 'blue' : 'gray'}
                    size="xs"
                  >
                    {item.category}
                  </Badge>
                </Table.Td>
                <Table.Td className="font-semibold text-xs max-w-60 truncate text-foreground">
                  {item.question}
                </Table.Td>
                <Table.Td className="text-xs text-dimmed max-w-100 truncate">
                  {item.answer}
                </Table.Td>
                <Table.Td>{item.intent}</Table.Td>

                <Table.Td>{item.keywords?.join(', ')}</Table.Td>

                <Table.Td>{item.usageCount ?? 0}</Table.Td>
                <Table.Td>
                  <Group gap={4} justify="flex-end">
                    <Tooltip label="Edit Element">
                      <ActionIcon
                        color="blue"
                        variant="subtle"
                        onClick={() => onEdit(idx)}
                      >
                        <FiEdit2 size={14} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete Element">
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => onRemove(idx)}
                      >
                        <FiTrash2 size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </Card>
  )
}