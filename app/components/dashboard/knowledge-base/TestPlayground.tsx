// /app/components/dashboard/knowledge-base/TestPlayground.tsx

'use client'

import { useState } from 'react'
import {
  Drawer,
  TextInput,
  Button,
  Paper,
  Text,
  Stack,
  ScrollArea,
  Badge,
  Group,
  Loader,
} from '@mantine/core'
import { FiSend, FiCpu, FiUser } from 'react-icons/fi'
import { testPlaygroundQuery } from '@/app/lib/api/knowledgeBase.api'

interface TestPlaygroundProps {
  opened: boolean
  onClose: () => void
  propertyId: string
}

interface MessageInstance {
  sender: 'user' | 'ai'
  text: string
  confidence?: number
}

export default function TestPlayground({
  opened,
  onClose,
  propertyId,
}: TestPlaygroundProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatLog, setChatLog] = useState<MessageInstance[]>([
    {
      sender: 'ai',
      text: 'Simulate runtime queries to verify confidence parsing logs.',
    },
  ])

  const handleTestQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || loading) return

    const userMessage = query.trim()
    setChatLog((prev) => [...prev, { sender: 'user', text: userMessage }])
    setQuery('')
    setLoading(true)

    try {
      // Clean backend integration using fixed api client mapping
      const data = await testPlaygroundQuery(propertyId, userMessage)

      if (data.matched) {
        setChatLog((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.answer || '',
            confidence: data.confidenceScore
              ? Math.round(data.confidenceScore * 100)
              : undefined,
          },
        ])
      } else {
        setChatLog((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: '❌ Match failed. Confidence index fell beneath threshold bounds. Route drop triggered to human queue logs.',
          },
        ])
      }
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Error executing sandbox semantic evaluation request.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Intelligence Playground Sandbox"
      position="right"
      size="md"
    >
      <Stack justify="space-between" className="h-[calc(100vh-80px)]">
        <ScrollArea className="flex-1 pr-2 mt-4" offsetScrollbars>
          <Stack gap="sm">
            {chatLog.map((msg, index) => (
              <Paper
                key={index}
                p="sm"
                radius="md"
                withBorder
                className={
                  msg.sender === 'user'
                    ? 'bg-sidebar/5 ml-8'
                    : 'bg-card mr-8 border-primary/20'
                }
              >
                <Group justify="space-between" mb={6}>
                  <Group gap={6}>
                    {msg.sender === 'user' ? (
                      <FiUser size={12} />
                    ) : (
                      <FiCpu size={12} className="text-primary" />
                    )}
                    <Text size="xs" fw={700}>
                      {msg.sender === 'user'
                        ? 'Visitor Simulation'
                        : 'AI Node Link'}
                    </Text>
                  </Group>
                  {msg.confidence !== undefined && (
                    <Badge size="xs" color="green">
                      {msg.confidence}% Match
                    </Badge>
                  )}
                </Group>
                <Text size="sm" className="text-foreground leading-relaxed">
                  {msg.text}
                </Text>
              </Paper>
            ))}
            {loading && <Loader size="xs" className="mx-auto my-2" />}
          </Stack>
        </ScrollArea>

        <form
          onSubmit={handleTestQuery}
          className="pt-4 border-t border-border"
        >
          <Group gap="xs" align="flex-end">
            <TextInput
              placeholder="Ask Payboost rules..."
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              className="flex-1"
              required
            />
            <Button
              type="submit"
              variant="filled"
              className="bg-primary! text-white cursor-pointer"
            >
              <FiSend size={16} />
            </Button>
          </Group>
        </form>
      </Stack>
    </Drawer>
  )
}