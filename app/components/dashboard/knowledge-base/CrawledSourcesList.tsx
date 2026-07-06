// /app/components/dashboard/knowledge-base/CrawledSourcesList.tsx

'use client'

import { useState } from 'react'
import {
  Card,
  Table,
  Text,
  Badge,
  Loader,
  Group,
  Tooltip,
  ActionIcon,
  Modal,
  Button,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { FiCheckCircle, FiAlertCircle, FiClock, FiTrash2 } from 'react-icons/fi'

interface ICrawledSource {
  url: string
  title?: string
  status: 'pending' | 'scraped' | 'failed'
  errorMessage?: string
  lastScrapedAt?: string | Date
}

interface CrawledSourcesListProps {
  sources: ICrawledSource[]
  onRemoveItem: (url: string) => void
}

export default function CrawledSourcesList({
  sources,
  onRemoveItem,
}: CrawledSourcesListProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [selectedUrl, setSelectedUrl] = useState<string>('')

  if (!sources || sources.length === 0) return null

  const handleOpenConfirm = (url: string) => {
    setSelectedUrl(url)
    open()
  }

  const handleConfirmDelete = () => {
    onRemoveItem(selectedUrl)
    close()
  }

  return (
    <>
      <Card
        id="crawled-sources-section"
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
                <Table.Th style={{ width: 180 }}>
                  Last Index Evaluation
                </Table.Th>
                <Table.Th style={{ width: 60 }}></Table.Th>
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
                        {source.errorMessage ||
                          'Text extraction process failed.'}
                      </Text>
                    ) : (
                      source.title ||
                      (source.status === 'pending'
                        ? 'Parsing text DOM elements...'
                        : 'Untitled Reference Page')
                    )}
                  </Table.Td>
                  <Table.Td>
                    {source.status === 'scraped' && (
                      <Badge
                        variant="light"
                        color="green"
                        leftSection={<FiCheckCircle size={10} />}
                        size="xs"
                      >
                        Success
                      </Badge>
                    )}
                    {source.status === 'pending' && (
                      <Group gap={6}>
                        <Loader size={10} color="yellow" type="dots" />
                        <Badge
                          variant="light"
                          color="yellow"
                          leftSection={<FiClock size={10} />}
                          size="xs"
                        >
                          Crawling
                        </Badge>
                      </Group>
                    )}
                    {source.status === 'failed' && (
                      <Tooltip
                        label={
                          source.errorMessage || 'View trace configuration logs'
                        }
                      >
                        <Badge
                          variant="light"
                          color="red"
                          leftSection={<FiAlertCircle size={10} />}
                          size="xs"
                          className="cursor-help"
                        >
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
                  <Table.Td>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => handleOpenConfirm(source.url)}
                      title="Delete index document reference link"
                    >
                      <FiTrash2 size={14} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </Card>

      {/* ✅ Standard Mantine Core Modal Confirmation overlay */}
      <Modal
        opened={opened}
        onClose={close}
        title={<Text fw={600}>Remove Index Document</Text>}
        centered
      >
        <Text size="sm" className="text-foreground mb-4">
          Are you sure you want to completely drop and un-index this resource?
          This action cannot be undone.
          <span className="font-mono text-xs block mt-2 p-2 bg-sidebar/5 rounded border border-border break-all">
            {selectedUrl}
          </span>
        </Text>

        <Group justify="flex-end" gap="sm" mt="xl">
          <Button variant="default" onClick={close} className="cursor-pointer">
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleConfirmDelete}
            className="bg-red-600! text-white cursor-pointer"
          >
            Delete Record
          </Button>
        </Group>
      </Modal>
    </>
  )
}
