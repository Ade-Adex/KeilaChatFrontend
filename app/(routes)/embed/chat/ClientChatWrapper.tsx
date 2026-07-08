// /app/(routes)/embed/chat/ClientChatWrapper.tsx

'use client'

import { ChatLauncher } from '@/app/components/chat/ChatLauncher'
import ChatWindow from '@/app/components/chat/ChatWindow'
import { getChatSocket } from '@/app/hooks/useChatSocket'
import { useVisitorChatStore } from '@/app/store/useVisitorChatStore'
import type {
  ChatMessage,
  PopulatedOperator,
  SafeSessionConfig,
  SessionInitResponse,
  WidgetConfig,
} from '@/app/types/chat'
import { useEffect, useState } from 'react'

interface Props {
  widgetId: string
  visitorTrackingId: string
  widget: WidgetConfig | null
}

interface MessageStatusPayload {
  messageId: string
  status: 'sent' | 'delivered' | 'seen' | 'failed'
  sessionId: string
}

interface MessagesSeenPayload {
  sessionId: string
  reader: 'visitor' | 'operator'
}

export default function ClientChatWrapper({
  widgetId,
  visitorTrackingId,
  widget,
}: Props) {
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const session = useVisitorChatStore((state) => state.session)
  const messages = useVisitorChatStore((state) => state.messages)
  const setSession = useVisitorChatStore((state) => state.setSession)
  const setMessages = useVisitorChatStore((state) => state.setMessages)
  const addMessage = useVisitorChatStore((state) => state.addMessage)
  const [loading, setLoading] = useState(true)

  // 1. Manage layout dimensions with the parent website embed frame
  useEffect(() => {
    const screenWidth = window.screen.width
    const screenHeight = window.screen.height
    const mobile = screenWidth <= 768

    const width = open ? (mobile ? screenWidth : 420) : 64
    const height = open ? (mobile ? screenHeight : 760) : 64

    window.parent.postMessage({ type: 'RESIZE', width, height }, '*')
  }, [open])

  // 2. Fetch or initiate the conversation thread session immediately on frame startup
  useEffect(() => {
    async function initializeConversation() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sessions/initiate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ widgetId, visitorTrackingId }),
          },
        )
        const result: SessionInitResponse = await response.json()
        if (result.status === 'success' && result.data) {
          setSession(result.data)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('[KeilaChat] Root initialization failed:', error)
        setLoading(false)
      }
    }
    initializeConversation()
  }, [widgetId, visitorTrackingId, setSession])

  // 3. Fetch database message logs as soon as session context maps out
  useEffect(() => {
    if (!session?.sessionId) return

    async function fetchHistory() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/messages/session/${session?.sessionId}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } },
        )
        const result = await response.json()
        if (result.status === 'success' && Array.isArray(result.data)) {
          setMessages(result.data as ChatMessage[])
        }
      } catch (error) {
        console.error(
          '[KeilaChat] Failed to load previous chat history:',
          error,
        )
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [session?.sessionId, setMessages])

  // 4. Persistent Core Socket Engine Link + Real-Time Decoupled Status Delivery Check
  useEffect(() => {
    if (!session?.sessionId) return

    const socket = getChatSocket()

    if (!socket.connected) {
      socket.connect()
    }

    socket.emit('join_chat_session', {
      sessionId: session.sessionId,
      propertyId: session.propertyId,
      visitorId: session.visitorId,
      clientType: 'visitor',
    })

    messages.forEach((m) => {
      if (
        (m.senderType === 'operator' || m.senderType === 'ai') &&
        (!m.status || m.status === 'sent') &&
        m._id
      ) {
        socket.emit('message_delivered', {
          messageId: m._id,
          sessionId: session.sessionId,
        })
      }
    })

    const handleIncomingMessage = (payload: ChatMessage) => {
      const incomingSessionId =
        payload.sessionId &&
        typeof payload.sessionId === 'object' &&
        '_id' in payload.sessionId
          ? (payload.sessionId as { _id: string })._id
          : (payload.sessionId as string)

      if (incomingSessionId !== session.sessionId) return

      // 🎯 FIX: Check if the incoming sender is an operator or explicitly an AI bot
      if (
        (payload.senderType === 'operator' || payload.senderType === 'ai') &&
        payload.senderId
      ) {
        if (session && !session.assignedOperatorId) {
          if (payload.senderType === 'ai' || payload.senderId === 'ai') {
            setSession({
              ...session,
              status: 'active',
              assignedOperatorId: 'ai',
            })
          } else {
            const runtimeOperator: PopulatedOperator = {
              _id: payload.senderId,
              firstName: payload.senderName || 'Support Agent',
              avatar: payload.senderAvatar || '',
              email: '',
            }

            setSession({
              ...session,
              status: 'active',
              assignedOperatorId:
                runtimeOperator as unknown as SafeSessionConfig['assignedOperatorId'],
            })
          }
        }
      }

      if (!payload._id) {
        addMessage(payload)
      } else {
        const matchIndex = messages.findIndex((m) => m._id === payload._id)
        if (matchIndex !== -1) {
          setMessages(
            messages.map((m) =>
              m._id === payload._id
                ? { ...m, status: payload.status ?? m.status }
                : m,
            ),
          )
        } else {
          addMessage(payload)
        }
      }

      if (payload.senderType === 'operator' || payload.senderType === 'ai') {
        if (!open) {
          if (payload._id && payload.status !== 'seen') {
            socket.emit('message_delivered', {
              messageId: payload._id,
              sessionId: session.sessionId,
            })
          }

          setUnreadCount((prev) => prev + 1)

          if (widget?.widgetSettings?.soundEnabled) {
            try {
              const audio = new Audio('/sound/notification.wav')
              audio.volume = 0.9
              audio
                .play()
                .catch((err) => console.warn('[KeilaChat] Audio block:', err))
            } catch (e) {
              console.error(e)
            }
          }
        } else {
          socket.emit('mark_session_seen', {
            sessionId: session.sessionId,
            clientType: 'visitor',
          })
        }
      }
    } // 🎯 FIXED: Re-added missing closing block curly braces for handleIncomingMessage closure context!

    const handleStatusUpdated = (data: MessageStatusPayload) => {
      if (data.sessionId !== session.sessionId) return
      setMessages(
        messages.map((m) =>
          m._id === data.messageId ? { ...m, status: data.status } : m,
        ),
      )
    }

    const handleMessagesSeen = (data: MessagesSeenPayload) => {
      if (data.sessionId !== session.sessionId) return
      if (data.reader === 'operator') {
        setMessages(
          messages.map((m) =>
            m.senderType === 'visitor' ? { ...m, status: 'seen' as const } : m,
          ),
        )
      }
    }

    const handleBulkDelivered = (data: {
      sessionId: string
      senderType: string
    }) => {
      if (data.sessionId !== session.sessionId) return
      setMessages(
        messages.map((m) =>
          m.senderType === 'operator' || m.senderType === 'ai'
            ? { ...m, status: m.status === 'seen' ? 'seen' : 'delivered' }
            : m,
        ),
      )
    }

    const handleStatusChanged = (payload: {
      sessionId: string
      status: SafeSessionConfig['status']
    }) => {
      if (payload.sessionId !== session.sessionId) return
      if (session) {
        setSession({ ...session, status: payload.status })
      }
    }

    const handleOperatorJoinedLive = (payload: {
      operatorId: string
      name: string
      avatar?: string
    }) => {
      if (!session) return
      const runtimeOperator: PopulatedOperator = {
        _id: payload.operatorId,
        firstName: payload.name?.trim() || 'Support Agent',
        avatar: payload.avatar || '',
        email: '',
      }
      setSession({
        ...session,
        status: 'active',
        assignedOperatorId:
          runtimeOperator as unknown as SafeSessionConfig['assignedOperatorId'],
      })
    }

    socket.on('new_message', handleIncomingMessage)
    socket.on('message_status_updated', handleStatusUpdated)
    socket.on('messages_seen', handleMessagesSeen)
    socket.on('messages_delivered_bulk', handleBulkDelivered)
    socket.on('session_status_changed', handleStatusChanged)
    socket.on('operator_joined', handleOperatorJoinedLive)

    return () => {
      socket.off('new_message', handleIncomingMessage)
      socket.off('message_status_updated', handleStatusUpdated)
      socket.off('messages_seen', handleMessagesSeen)
      socket.off('messages_delivered_bulk', handleBulkDelivered)
      socket.off('session_status_changed', handleStatusChanged)
      socket.off('operator_joined', handleOperatorJoinedLive)
    }
  }, [session, open, widget, messages, setMessages, setSession, addMessage])

  const handleOpenChat = () => {
    setUnreadCount(0)
    setOpen(true)

    const socket = getChatSocket()
    if (socket.connected && session?.sessionId) {
      socket.emit('mark_session_seen', {
        sessionId: session.sessionId,
        clientType: 'visitor',
      })
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      {open ? (
        <ChatWindow
          widget={widget}
          widgetId={widgetId}
          visitorTrackingId={visitorTrackingId}
          loading={loading}
          onClose={() => setOpen(false)}
          queueSubtext={
            session?.status === 'queued' || session?.status === 'waiting'
              ? 'Someone will join your chat soon...'
              : undefined
          }
        />
      ) : (
        <ChatLauncher
          onClick={handleOpenChat}
          widget={widget}
          unreadCount={unreadCount}
        />
      )}
    </div>
  )
}
