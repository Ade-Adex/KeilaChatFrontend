// /app/components/dashboard/knowledge-base/CrawledSourcesList.tsx

'use client'

import { Card, Table, Text, Badge } from '@mantine/core'

interface ICrawledSource {
  url: string
  title?: string
  status: 'pending' | 'scraped' | 'failed'
  lastScrapedAt?: string | Date
}

interface CrawledSourcesListProps {
  sources: ICrawledSource[]
}

export default function CrawledSourcesList({
  sources,
}: CrawledSourcesListProps) {
  if (!sources || sources.length === 0) return null

  const getStatusColor = (status: string) => {
    if (status === 'scraped') return 'green'
    if (status === 'pending') return 'yellow'
    return 'red'
  }

  return (
    <Card
      withBorder
      radius="md"
      p={0}
      className="bg-card! border-border! overflow-hidden mt-6"
    >
      <div className="p-4 border-b border-border bg-sidebar/5">
        <Text fw={600} size="sm" className="text-foreground">
          Crawled Website Index Records ({sources.length})
        </Text>
      </div>
      <div className="overflow-x-auto">
        <Table verticalSpacing="sm" horizontalSpacing="md" variant="simple">
          <Table.Thead className="bg-sidebar/5">
            <Table.Tr>
              <Table.Th>Target URL Path</Table.Th>
              <Table.Th style={{ width: 220 }}>
                Extracted Title Context
              </Table.Th>
              <Table.Th style={{ width: 120 }}>Sync State</Table.Th>
              <Table.Th style={{ width: 180 }}>Last Index Evaluation</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sources.map((source, idx) => (
              <Table.Tr
                key={idx}
                className="border-b border-border last:border-0"
              >
                <Table.Td className="text-xs font-mono max-w-sm truncate text-foreground">
                  {source.url}
                </Table.Td>
                <Table.Td className="text-xs font-semibold max-w-xs truncate text-foreground">
                  {source.title || 'Processing Meta Data...'}
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="light"
                    color={getStatusColor(source.status)}
                    size="xs"
                  >
                    {source.status}
                  </Badge>
                </Table.Td>
                <Table.Td className="text-xs text-dimmed">
                  {source.lastScrapedAt
                    ? new Date(source.lastScrapedAt).toLocaleString()
                    : 'Never'}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </Card>
  )
}