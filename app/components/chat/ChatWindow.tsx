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

interface ExtendedChatWindowProps extends Omit<ChatWindowProps, 'onClose'> {
  initialSession: SafeSessionConfig | null
  initialMessages: ChatMessage[]
  setInitialMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  loading: boolean
  onClose: () => void
  queueSubtext?: string
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
  queueSubtext,
}: ExtendedChatWindowProps) {
  const socket = getChatSocket()

  const [session, setSession] = useState<SafeSessionConfig | null>(
    initialSession,
  )
  const [message, setMessage] = useState('')
  const [operatorTyping, setOperatorTyping] = useState(false)

  // Real-time operator state synchronized from backend event listeners
  const [socketOperatorName, setSocketOperatorName] = useState<string>()
  const [socketOperatorAvatar, setSocketOperatorAvatar] = useState<string>()

  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // 🎯 Resolve the base channel fallback name dynamically from the widget setup
  const platformFallbackName = widget.name?.trim() || 'Support Agent'

  // 1. Prioritize live operator state changes emitted over WebSockets
  let operatorName = socketOperatorName
  let operatorAvatar = socketOperatorAvatar

  console.log('operatorName', operatorName)
  console.log('operatorName  from session', session?.assignedOperatorId)
  console.log('operatorName  from initialSession', initialSession)

  // 2. Fallback to parsing structural snapshot fields populated during SSR or hydration
  if (!operatorName && session?.assignedOperatorId) {
    const op = session.assignedOperatorId as unknown as PopulatedOperator
    if (op && typeof op === 'object') {
      if (
        'firstName' in op &&
        typeof op.firstName === 'string' &&
        op.firstName.trim()
      ) {
        operatorName = op.firstName.trim()
      }
      if ('avatar' in op && typeof op.avatar === 'string') {
        operatorAvatar = op.avatar
      }
    }
  }

  // 3. Dynamic Filtering: Handle fallbacks cleanly when no operator is actively bound
  if (!operatorName || operatorName.toLowerCase() === 'operator') {
    if (
      session?.assignedOperatorId ||
      session?.status === 'queued' ||
      session?.status === 'waiting'
    ) {
      operatorName = 'Support Agent'
    } else {
      operatorName = platformFallbackName
    }
  }

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
        setSession(result.data as SafeSessionConfig)
        setInitialMessages([])
        setSocketOperatorName(undefined)
        setSocketOperatorAvatar(undefined)
      }
    } catch (error) {
      console.error('[KeilaChat] Session hard-reset failed:', error)
    }
  }

  // 🎯 Manage Socket Lifecycle events for Live Presence Tracking
  useEffect(() => {
    if (!session?.sessionId) return

    // Event A: Operator updates typing indicators
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

    // 🎯 FIXED: Strongly typed live joining synchronization loop
    const handleOperatorJoined = (payload: {
      operatorId: string
      name: string
      avatar?: string
    }) => {
      const cleanName = payload.name?.trim() || 'Support Agent'

      setSocketOperatorName(cleanName)
      if (payload.avatar) {
        setSocketOperatorAvatar(payload.avatar)
      }

      setSession((prev): SafeSessionConfig | null => {
        if (!prev) return null

        const operatorMock: PopulatedOperator = {
          _id: payload.operatorId,
          firstName: cleanName,
          email: '', // Fits our PopulatedOperator structure perfectly
          avatar: payload.avatar || '',
        }

        return {
          ...prev,
          status: 'active', // 🎯 Dynamic Shift: Pull chat state out of queue cleanly
          assignedOperatorId:
            operatorMock as unknown as SafeSessionConfig['assignedOperatorId'],
        }
      })
    }

    // Event C: Operator unassigns or leaves workspace chat room channel
    const handleOperatorLeft = () => {
      setSocketOperatorName(undefined)
      setSocketOperatorAvatar(undefined)
      setSession((prev) => {
        if (!prev) return null
        return {
          ...prev,
          status: 'queued', // Put back to queue if dropped
          assignedOperatorId: null,
        }
      })
    }

    // Listen to status updates from backend modifications
    const handleStatusChanged = (payload: {
      sessionId: string
      status: SafeSessionConfig['status']
    }) => {
      if (payload.sessionId !== session.sessionId) return
      setSession((prev) => (prev ? { ...prev, status: payload.status } : null))
    }

    socket.on('user_typing', handleTyping)
    socket.on('operator_joined', handleOperatorJoined)
    socket.on('operator_left', handleOperatorLeft)
    socket.on('session_status_changed', handleStatusChanged)

    return () => {
      socket.off('user_typing', handleTyping)
      socket.off('operator_joined', handleOperatorJoined)
      socket.off('operator_left', handleOperatorLeft)
      socket.off('session_status_changed', handleStatusChanged)
    }
  }, [session?.sessionId, socket, platformFallbackName])

  // 4. 🎯 Handle Chat Session Closure from Visitor Side

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
        queueSubtext={session?.status === 'closed' ? undefined : queueSubtext}
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
        styles={{
          content: {
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border, #262626)',
          },
          header: {
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
          },
        }}
        className="bg-card! border-border!"
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