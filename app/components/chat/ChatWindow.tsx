// /app/components/chat/ChatWindow.tsx

'use client'

import { useEffect, useState } from 'react'
import { Modal, Button, Group, Text, LoadingOverlay } from '@mantine/core'
import type {
  ChatMessage,
  ChatWindowProps,
  PopulatedOperator,
  SafeSessionConfig,
} from '@/app/types/chat'

import { getChatSocket } from '@/app/hooks/useChatSocket'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'

// 🎯 Explicitly define the unified types passed from the wrapper without using any
interface ExtendedChatWindowProps extends Omit<ChatWindowProps, 'onClose'> {
  initialSession: SafeSessionConfig | null
  initialMessages: ChatMessage[]
  setInitialMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  loading: boolean
  onClose: () => void
}

export default function ChatWindow({
  widget,
  widgetId,
  visitorTrackingId,
  initialSession,
  initialMessages,
  setInitialMessages,
  loading,
  onClose,
}: ExtendedChatWindowProps) {
  const socket = getChatSocket()

  const [session, setSession] = useState<SafeSessionConfig | null>(
    initialSession,
  )
  const [message, setMessage] = useState('')
  const [operatorTyping, setOperatorTyping] = useState(false)
  const [socketOperatorName, setSocketOperatorName] = useState<string>()
  const [socketOperatorAvatar, setSocketOperatorAvatar] = useState<string>()

  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)


  console.log('Visitor messages', message)


  // Parse Operator names and brand filters safely
  let operatorName = socketOperatorName
  let operatorAvatar = socketOperatorAvatar

  if (
    operatorName &&
    (operatorName.toLowerCase() === 'operator' ||
      operatorName.toLowerCase() === 'support agent' ||
      operatorName === 'Above Great Support' ||
      operatorName.includes('Above Great'))
  ) {
    operatorName = undefined
  }

  if (session?.assignedOperatorId) {
    const op = session.assignedOperatorId as unknown as PopulatedOperator
    if (op && typeof op === 'object') {
      if (
        !operatorName &&
        'firstName' in op &&
        typeof op.firstName === 'string'
      ) {
        operatorName = op.firstName.trim()
      }
      if (!operatorAvatar && 'avatar' in op && typeof op.avatar === 'string') {
        operatorAvatar = op.avatar
      }
    }
  }

  if (!operatorName) {
    operatorName = 'Support Agent'
  }

  // Handle a forced new conversation session request from the header actions menu
  async function initializeConversation(forceNew = false) {
    if (!forceNew) return
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sessions/initiate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            widgetId,
            visitorTrackingId,
            createNew: true,
          }),
        },
      )

      const result = await response.json()
      if (result.status === 'success' && result.data) {
        setSession(result.data)
        setInitialMessages([])
        setSocketOperatorName(undefined)
        setSocketOperatorAvatar(undefined)
      }
    } catch (error) {
      console.error('[KeilaChat] Session hard-reset failed:', error)
    }
  }

  // 🎯 NEW: Emit a seen receipt loop if unread messages are loaded while open
  useEffect(() => {
    if (!session?.sessionId || initialMessages.length === 0) return

    const hasUnread = initialMessages.some(
      (m) =>
        (m.senderType === 'operator' || m.senderType === 'ai') &&
        m.status !== 'seen',
    )

    if (hasUnread && socket.connected) {
      socket.emit('mark_session_seen', {
        sessionId: session.sessionId,
        clientType: 'visitor',
      })
    }
  }, [initialMessages, session?.sessionId, socket])

  // Listen directly within the open layout frame view for profile events and typing flags
  useEffect(() => {
    if (!session?.sessionId) return

    const handleNewMessage = (
      payload: ChatMessage & { senderAvatar?: string },
    ) => {
      // Append message instantly if it lands while the screen is open
      setInitialMessages((prev) => {
        if (!payload._id) return [...prev, payload]
        if (prev.some((m) => m._id === payload._id)) return prev
        return [...prev, payload]
      })

      if (payload.senderType === 'operator' || payload.senderType === 'ai') {
        setOperatorTyping(false)
        if (
          payload.senderName &&
          payload.senderName.toLowerCase() !== 'operator'
        ) {
          setSocketOperatorName(payload.senderName)
          if (payload.senderAvatar) {
            setSocketOperatorAvatar(payload.senderAvatar)
          }
        }
      }
    }

    const handleTyping = (payload: {
      isTyping: boolean
      actor?: string
      senderName?: string
    }) => {
      if (payload.actor === 'visitor') return
      setOperatorTyping(payload.isTyping)
      if (
        payload.senderName &&
        payload.senderName.toLowerCase() !== 'operator'
      ) {
        setSocketOperatorName(payload.senderName)
      }
    }

    socket.on('new_message', handleNewMessage)
    socket.on('user_typing', handleTyping)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('user_typing', handleTyping)
    }
  }, [session, socket, setInitialMessages])

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
      console.error('[KeilaChat] Error closing conversation session:', error)
    } finally {
      setIsClosing(false)
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background shadow-2xl md:h-full md:w-full md:rounded-2xl">
      <ChatHeader
        widget={widget}
        propertyId={session?.propertyId}
        visitorTrackingId={visitorTrackingId}
        operatorName={session?.status === 'closed' ? undefined : operatorName}
        operatorAvatar={
          session?.status === 'closed' ? undefined : operatorAvatar
        }
        isSessionActive={session?.status !== 'closed'}
        onOpenEndModal={() => setConfirmModalOpen(true)}
        onStartNewChat={() => initializeConversation(true)}
        onClose={onClose}
        onVisitorProfileUpdated={(name, email) => {
          if (socket.connected && session?.sessionId) {
            socket.emit('visitor_profile_updated', {
              sessionId: session.sessionId,
              propertyId: session.propertyId,
              name,
              email,
            })
          }
        }}
      />

      <div className="relative flex-1 overflow-y-auto">
        <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
        {!loading && (
          <ChatMessages
            widget={widget}
            messages={initialMessages}
            operatorTyping={operatorTyping}
          />
        )}
      </div>

      {!loading && session?.status !== 'closed' && (
        <ChatInput
          value={message}
          onChange={(val) => {
            setMessage(val)
            if (socket.connected && session) {
              socket.emit('typing', {
                sessionId: session.sessionId,
                senderName: 'Visitor',
                isTyping: val.length > 0,
              })
            }
          }}
          onSend={() => {
            if (!message.trim() || !session) return
            socket.emit('send_message', {
              sessionId: session.sessionId,
              propertyId: session.propertyId,
              senderType: 'visitor',
              senderId: session.visitorId,
              messageText: message.trim(),
            })
            setMessage('')
          }}
        />
      )}

      <Modal
        opened={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="End Conversation"
        centered
        size="sm"
      >
        <Text size="sm" mb="lg">
          Are you sure you want to close this support session?
        </Text>
        <Group justify="flex-end" gap="xs">
          <Button
            variant="subtle"
            size="xs"
            color="gray"
            onClick={() => setConfirmModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="xs"
            color="red"
            loading={isClosing}
            onClick={handleEndChat}
          >
            End Chat
          </Button>
        </Group>
      </Modal>
    </div>
  )
}