// /app/components/dashboard/knowledge-base/CrawledSourcesList.tsx

'use client'

import { Card, Table, Text, Badge, Loader, Group, Tooltip } from '@mantine/core'
import { FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi'

interface ICrawledSource {
  url: string
  title?: string
  status: 'pending' | 'scraped' | 'failed'
  errorMessage?: string // 🎯 Capture and display descriptive backend failure strings
  lastScrapedAt?: string | Date
}

interface CrawledSourcesListProps {
  sources: ICrawledSource[]
}

export default function CrawledSourcesList({
  sources,
}: CrawledSourcesListProps) {
  if (!sources || sources.length === 0) return null

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
              <Table.Th style={{ width: 240 }}>
                Extracted Title Context
              </Table.Th>
              <Table.Th style={{ width: 140 }}>Sync State</Table.Th>
              <Table.Th style={{ width: 180 }}>Last Index Evaluation</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sources.map((source, idx) => (
              <Table.Tr
                key={idx}
                className="border-b border-border last:border-0 hover:bg-sidebar/5 transition-colors"
              >
                <Table.Td className="text-xs font-mono max-w-sm truncate text-foreground">
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-primary hover:underline transition-all"
                  >
                    {source.url}
                  </a>
                </Table.Td>
                <Table.Td className="text-xs font-semibold max-w-xs truncate text-foreground">
                  {source.status === 'failed' ? (
                    <Text size="xs" c="red" className="italic font-normal">
                      {source.errorMessage || 'Text extraction process failed.'}
                    </Text>
                  ) : (
                    source.title || (source.status === 'pending' ? 'Parsing text DOM elements...' : 'Untitled Reference Page')
                  )}
                </Table.Td>
                <Table.Td>
                  {source.status === 'scraped' && (
                    <Badge variant="light" color="green" leftSection={<FiCheckCircle size={10} />} size="xs">
                      Success
                    </Badge>
                  )}
                  {source.status === 'pending' && (
                    <Group gap={6}>
                      <Loader size={10} color="yellow" type="dots" />
                      <Badge variant="light" color="yellow" leftSection={<FiClock size={10} />} size="xs">
                        Crawling
                      </Badge>
                    </Group>
                  )}
                  {source.status === 'failed' && (
                    <Tooltip label={source.errorMessage || 'View trace configuration logs'}>
                      <Badge variant="light" color="red" leftSection={<FiAlertCircle size={10} />} size="xs" className="cursor-help">
                        Failed
                      </Badge>
                    </Tooltip>
                  )}
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