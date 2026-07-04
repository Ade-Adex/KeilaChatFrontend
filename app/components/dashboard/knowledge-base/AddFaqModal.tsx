// /app/components/dashboard/knowledge-base/AddFaqModal.tsx

'use client'

import { useState } from 'react'
import { Modal, TextInput, Textarea, Button, Group, Stack } from '@mantine/core'
import type { IFaqItem } from '@/app/types/knowledgeBase'

interface AddFaqModalProps {
  opened: boolean
  onClose: () => void
  onAdd: (faq: IFaqItem) => void
}

export default function AddFaqModal({
  opened,
  onClose,
  onAdd,
}: AddFaqModalProps) {
  const [category, setCategory] = useState('General')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [keywordsInput, setKeywordsInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !answer.trim()) return

    const keywords = keywordsInput
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0)

    onAdd({
      category,
      question,
      answer,

      enabled: true,

      priority: 1,

      keywords,

      intent: category.toLowerCase().replace(/\s+/g, '_'),

      entities: [],

      embedding: [],

      embeddingModel: 'Xenova/all-MiniLM-L6-v2',

      usageCount: 0,
    })

    setQuestion('')
    setAnswer('')
    setCategory('General')
    setKeywordsInput('')
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add Knowledge Pair Instance"
      centered
      radius="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Category Namespace"
            placeholder="e.g., Accounts, Security"
            value={category}
            onChange={(e) => setCategory(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Expected Visitor Prompt Question"
            placeholder="e.g., How do I reset my password?"
            value={question}
            onChange={(e) => setQuestion(e.currentTarget.value)}
            required
          />
          <Textarea
            label="Automated System Response Value"
            placeholder="Provide exact informational fallback text guidelines..."
            value={answer}
            onChange={(e) => setAnswer(e.currentTarget.value)}
            rows={4}
            required
          />
          <TextInput
            label="Keywords (Optional)"
            placeholder="pass, reset, forgot (separated by commas)"
            value={keywordsInput}
            onChange={(e) => setKeywordsInput(e.currentTarget.value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-white">
              Save Matrix Entry
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}