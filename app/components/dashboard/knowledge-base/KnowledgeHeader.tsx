// /app/components/dashboard/knowledge-base/KnowledgeHeader.tsx

'use client'

import { Title, Text, Button, Group } from '@mantine/core'
import { FiPlus, FiTerminal } from 'react-icons/fi'

interface KnowledgeHeaderProps {
  onOpenAddModal: () => void
  onOpenPlayground: () => void
  faqCount: number
}

export default function KnowledgeHeader({
  onOpenAddModal,
  onOpenPlayground,
  faqCount,
}: KnowledgeHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-5">
      <div>
        <Title order={2} className="text-foreground">
          AI Knowledge Base
        </Title>
        <Text size="sm" c="dimmed" mt={4}>
          Manage corporate guidelines and custom data instances. Your automated
          agent references these pairs to resolve customer tickets natively.
        </Text>
      </div>

      <Group gap="sm" className="my-auto">
        <Button
          leftSection={<FiTerminal size={16} />}
          variant="outline"
          onClick={onOpenPlayground}
          disabled={faqCount === 0}
        >
          Test Playground
        </Button>
        <Button
          leftSection={<FiPlus size={16} />}
          onClick={onOpenAddModal}
          className="bg-primary! text-white cursor-pointer"
        >
          Add FAQ Rule
        </Button>
      </Group>
    </div>
  )
}