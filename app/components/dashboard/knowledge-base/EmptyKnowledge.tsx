// /app/components/dashboard/knowledge-base/EmptyKnowledge.tsx

'use client'

import { Paper, Title, Text, Button, Stack } from '@mantine/core'
import { FiBookOpen } from 'react-icons/fi'

interface EmptyKnowledgeProps {
  onOpenAddModal: () => void
}

export default function EmptyKnowledge({
  onOpenAddModal,
}: EmptyKnowledgeProps) {
  return (
    <Paper
      withBorder
      radius="md"
      p="xl"
      className="bg-card! border-border! text-center py-12"
    >
      <Stack align="center" gap="sm">
        <div className="p-4 rounded-full bg-sidebar/5 border border-dashed border-border text-dimmed">
          <FiBookOpen size={32} />
        </div>
        <Title order={4} className="text-foreground">
          Knowledge Base is Empty
        </Title>
        <Text size="sm" c="dimmed" maw={460} mx="auto">
          Your assistant doesn&apos;t have any reference training questions
          configured. Add data definitions now to automate client
          communications.
        </Text>
        <Button
          onClick={onOpenAddModal}
          size="sm"
          mt="xs"
          className="bg-primary! text-white cursor-pointer"
        >
          Create First Entry
        </Button>
      </Stack>
    </Paper>
  )
}