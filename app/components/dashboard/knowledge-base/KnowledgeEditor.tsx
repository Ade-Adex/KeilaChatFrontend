// /app/components/dashboard/knowledge-base/KnowledgeEditor.tsx

'use client'

import { useState } from 'react'
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Switch,
} from '@mantine/core'
import type { IFaqItem } from '@/app/types/knowledgeBase'

interface KnowledgeEditorProps {
  opened: boolean
  onClose: () => void
  faq: IFaqItem | null
  onSave: (updatedFaq: IFaqItem) => void
}

export default function KnowledgeEditor({
  opened,
  onClose,
  faq,
  onSave,
}: KnowledgeEditorProps) {
  const [category, setCategory] = useState(faq?.category || '')
  const [question, setQuestion] = useState(faq?.question || '')
  const [answer, setAnswer] = useState(faq?.answer || '')
  const [enabled, setEnabled] = useState(faq?.enabled ?? true)
  const [keywordsInput, setKeywordsInput] = useState(
    faq?.keywords?.join(', ') || '',
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !answer.trim()) return

    const keywords = keywordsInput
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0)

    onSave({
      ...faq,

      category,

      question,

      answer,

      enabled,

      priority: faq?.priority ?? 1,

      keywords,

      intent: faq?.intent ?? 'unknown',

      entities: faq?.entities ?? [],

      embedding: faq?.embedding ?? [],

      embeddingModel: faq?.embeddingModel ?? 'Xenova/all-MiniLM-L6-v2',

      usageCount: faq?.usageCount ?? 0,

      lastMatchedAt: faq?.lastMatchedAt,
    })
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Modify Knowledge Pair"
      centered
      radius="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Switch
            label="Enable item for automatic AI reference matching matches"
            checked={enabled}
            onChange={(e) => setEnabled(e.currentTarget.checked)}
          />
          <TextInput
            label="Category Namespace"
            value={category}
            onChange={(e) => setCategory(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Expected Visitor Prompt Question"
            value={question}
            onChange={(e) => setQuestion(e.currentTarget.value)}
            required
          />
          <Textarea
            label="Automated System Response Value"
            value={answer}
            onChange={(e) => setAnswer(e.currentTarget.value)}
            rows={5}
            required
          />
          <TextInput
            label="Keywords (Separated by commas)"
            value={keywordsInput}
            onChange={(e) => setKeywordsInput(e.currentTarget.value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Dismiss
            </Button>
            <Button type="submit" className="bg-primary text-white">
              Save Structural Updates
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}