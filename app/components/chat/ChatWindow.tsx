// /app/components/chat/ChatWindow.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Modal, Button, Group, Text, LoadingOverlay } from '@mantine/core'
import type {
  ChatMessage,
  ChatWindowProps,
  SessionInitResponse,
  PopulatedOperator,
  SafeSessionConfig,
} from '@/app/types/chat'

import { getChatSocket } from '@/app/hooks/useChatSocket'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'

export default function ChatWindow({
  widget,
  widgetId,
  visitorTrackingId,
  onClose,
}: ChatWindowProps) {
  const socket = getChatSocket()
  const typingTimer = useRef<NodeJS.Timeout | null>(null)

  const [session, setSession] = useState<SafeSessionConfig | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [message, setMessage] = useState('')
  const [operatorTyping, setOperatorTyping] = useState(false)
  const [socketOperatorName, setSocketOperatorName] = useState<string>()
  const [loading, setLoading] = useState(true)

  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  /*
   ****************************************
   * DERIVED STATE: OPERATOR NAME CALCULATION
   ****************************************
   */
  let operatorName = socketOperatorName

  if (
    operatorName &&
    (operatorName.toLowerCase() === 'operator' ||
      operatorName.toLowerCase() === 'support agent' ||
      operatorName === 'Above Great Support' ||
      operatorName.includes('Above Great'))
  ) {
    operatorName = undefined
  }

  if (!operatorName && session?.assignedOperatorId) {
    const op = session.assignedOperatorId as unknown as PopulatedOperator

    if (
      op &&
      typeof op === 'object' &&
      'firstName' in op &&
      typeof op.firstName === 'string'
    ) {
      operatorName = op.firstName.trim()
    }
  }

  if (!operatorName) {
    operatorName = 'Support Agent'
  }

  /*
   ****************************************
   * CREATE / RESUME CONVERSATION SYSTEM
   ****************************************
   */
  async function initializeConversation(forceNew = false) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sessions/initiate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            widgetId,
            visitorTrackingId,
            createNew: forceNew,
          }),
        },
      )

      const result: SessionInitResponse = await response.json()
      if (result.status === 'success' && result.data) {
        setSession(result.data)
        if (forceNew) {
          setMessages([])
          setSocketOperatorName(undefined)
        }
      }
    } catch (error) {
      console.error('Session initialization failed', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle initialization on mount safely behind a non-blocking macro-task execution
  useEffect(() => {
    let isMounted = true

    // Wrapping in a zero-delay timeout moves execution to the next event loop cycle,
    // completely preventing cascading synchronous render loop warnings.
    const timer = setTimeout(() => {
      if (isMounted) {
        initializeConversation(false)
      }
    }, 0)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [widgetId, visitorTrackingId])

  /*
   ****************************************
   * FETCH HISTORICAL MESSAGES
   ****************************************
   */
  useEffect(() => {
    if (!session?.sessionId || session.status === 'closed') return

    async function fetchHistory() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/messages/session/${session?.sessionId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          },
        )
        const result = await response.json()

        if (result.status === 'success' && Array.isArray(result.data)) {
          setMessages(result.data)
        }
      } catch (error) {
        console.error('Failed to load previous chat history:', error)
      }
    }

    fetchHistory()
  }, [session?.sessionId, session?.status])

  /*
   ****************************************
   * SOCKET PIPELINE LISTENERS
   ****************************************
   */
  useEffect(() => {
    if (!session?.sessionId) return

    if (!socket.connected) {
      socket.connect()
    }

    socket.emit('join_chat_session', {
      sessionId: session.sessionId,
      propertyId: session.propertyId,
      visitorId: session.visitorId,
      clientType: 'visitor',
    })

    const handleNewMessage = (payload: ChatMessage) => {
      setMessages((prev) => {
        if (!payload._id) return [...prev, payload]
        if (prev.some((m) => m._id === payload._id)) return prev
        return [...prev, payload]
      })

      if (payload.senderType === 'operator') {
        setOperatorTyping(false)
        if (payload.senderName) setSocketOperatorName(payload.senderName)
      }
    }

    const handleDashboardMessageUpdate = (payload: {
      sessionId: string
      message: ChatMessage
    }) => {
      if (payload.sessionId === session.sessionId) {
        handleNewMessage(payload.message)
      }
    }

    const handleTyping = (payload: {
      sessionId: string
      isTyping: boolean
      actor?: string
      senderName?: string
    }) => {
      if (payload.actor === 'visitor') return
      setOperatorTyping(payload.isTyping)
      if (payload.senderName) setSocketOperatorName(payload.senderName)
    }

    const handlePresence = (payload: { message: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: crypto.randomUUID(),
          sessionId: session.sessionId,
          senderId: 'system',
          senderType: 'system',
          messageText: payload.message,
          createdAt: new Date().toISOString(),
        },
      ])
    }

    const handleSessionClosed = () => {
      setSession((prev) => (prev ? { ...prev, status: 'closed' } : null))
    }

    socket.on('new_message', handleNewMessage)
    socket.on('dashboard_message_update', handleDashboardMessageUpdate)
    socket.on('user_typing', handleTyping)
    socket.on('presence_notification', handlePresence)
    socket.on('session_closed', handleSessionClosed)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('dashboard_message_update', handleDashboardMessageUpdate)
      socket.off('user_typing', handleTyping)
      socket.off('presence_notification', handlePresence)
      socket.off('session_closed', handleSessionClosed)
    }
  }, [session, socket])

  /*
   ****************************************
   * END CHAT SYSTEM ACTION
   ****************************************
   */
  async function handleEndChat() {
    if (!session?.sessionId) return

    setIsClosing(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/${session.sessionId}/close`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ closedBy: 'visitor' }),
        },
      )

      const result = await response.json()
      if (result.status === 'success') {
        setSession((prev) => (prev ? { ...prev, status: 'closed' } : null))
        setConfirmModalOpen(false)
        onClose()
      }
    } catch (error) {
      console.error('Error closing conversation thread:', error)
    } finally {
      setIsClosing(false)
    }
  }

  function handleStartNewChat() {
    setLoading(true) // 🎯 Safe to call here because it handles a manual button click event sequence!
    initializeConversation(true)
  }

  function sendTyping(typing: boolean) {
    if (!session || !socket.connected || session.status === 'closed') return
    socket.emit('typing', {
      sessionId: session.sessionId,
      senderName: 'Visitor',
      isTyping: typing,
    })
  }

  function sendMessage() {
    if (!session || !message.trim() || session.status === 'closed') return

    socket.emit('send_message', {
      sessionId: session.sessionId,
      propertyId: session.propertyId,
      senderType: 'visitor',
      senderId: session.visitorId,
      messageText: message.trim(),
    })

    setMessage('')
    sendTyping(false)
    if (typingTimer.current) clearTimeout(typingTimer.current)
  }

  function handleInput(value: string) {
    setMessage(value)
    sendTyping(true)
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => sendTyping(false), 1500)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground animate-pulse">
        Connecting live support portal...
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background shadow-2xl md:h-full md:w-full md:rounded-2xl">
      <ChatHeader
        widget={widget}
        operatorName={session?.status === 'closed' ? undefined : operatorName}
        isSessionActive={session?.status !== 'closed'}
        onOpenEndModal={() => setConfirmModalOpen(true)}
        onStartNewChat={handleStartNewChat}
        onClose={onClose}
      />

      <ChatMessages
        widget={widget}
        messages={messages}
        operatorTyping={session?.status === 'closed' ? false : operatorTyping}
      />

      <ChatInput
        disabled={session?.status === 'closed'}
        value={message}
        onChange={handleInput}
        onSend={sendMessage}
      />

      <Modal
        opened={confirmModalOpen}
        onClose={() => !isClosing && setConfirmModalOpen(false)}
        title={<Text className="font-semibold text-sm">End Conversation</Text>}
        centered
        size="sm"
        padding="md"
        radius="md"
        withCloseButton={!isClosing}
        closeOnClickOutside={!isClosing}
        closeOnEscape={!isClosing}
        styles={{
          content: { position: 'relative', overflow: 'hidden' },
          header: { minHeight: 'auto', paddingBottom: '12px' },
        }}
      >
        <LoadingOverlay
          visible={isClosing}
          zIndex={1000}
          overlayProps={{ radius: 'md', blur: 1.5 }}
          loaderProps={{ size: 'sm', type: 'bars' }}
        />

        <Text
          size="xs"
          className="text-muted-foreground leading-normal"
          mb="lg"
        >
          Are you sure you want to end this chat session? Once closed, this
          window will shut down and a fresh conversation can be created.
        </Text>

        <Group justify="flex-end" gap="xs">
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            disabled={isClosing}
            onClick={() => setConfirmModalOpen(false)}
            className="text-[11px] font-medium"
          >
            Cancel
          </Button>
          <Button
            color="red"
            size="xs"
            onClick={handleEndChat}
            className="text-[11px] font-medium px-4"
          >
            End Chat
          </Button>
        </Group>
      </Modal>
    </div>
  )
}