// /app/(routes)/embed/chat/ClientChatWrapper.tsx
'use client'

import { useEffect, useState } from 'react'
import ChatWindow from '@/app/components/chat/ChatWindow'
import { ChatLauncher } from '@/app/components/chat/ChatLauncher'
import type {
  WidgetConfig,
  ChatMessage,
  SafeSessionConfig,
  SessionInitResponse,
} from '@/app/types/chat'
import { getChatSocket } from '@/app/hooks/useChatSocket'

interface Props {
  widgetId: string
  visitorTrackingId: string
  widget: WidgetConfig
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
  const [session, setSession] = useState<SafeSessionConfig | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
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
  }, [widgetId, visitorTrackingId])

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
  }, [session?.sessionId])

  // 4. Persistent Core Socket Engine Link + Message Receipts
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

    const handleIncomingMessage = (payload: ChatMessage) => {
      setMessages((prev) => {
        if (!payload._id) return [...prev, payload]
        if (prev.some((m) => m._id === payload._id)) return prev
        return [...prev, payload]
      })

      if (payload.senderType === 'operator' || payload.senderType === 'ai') {
        if (payload._id) {
          socket.emit('message_delivered', {
            messageId: payload._id,
            sessionId: session.sessionId,
          })
        }

        if (!open) {
          setUnreadCount((prev) => prev + 1)

          if (widget?.widgetSettings?.soundEnabled) {
            try {
              const audio = new Audio('/sound/notification.wav')
              audio.volume = 0.7
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
    }

    // 🎯 Properly typed status confirmation listener
    const handleStatusUpdated = (data: MessageStatusPayload) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId ? { ...m, status: data.status } : m,
        ),
      )
    }

    // 🎯 Properly typed session read tracker listener
    const handleMessagesSeen = (data: MessagesSeenPayload) => {
      if (data.reader === 'operator') {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderType === 'visitor' ? { ...m, status: 'seen' as const } : m,
          ),
        )
      }
    }

    socket.on('new_message', handleIncomingMessage)
    socket.on('message_status_updated', handleStatusUpdated)
    socket.on('messages_seen', handleMessagesSeen)

    return () => {
      socket.off('new_message', handleIncomingMessage)
      socket.off('message_status_updated', handleStatusUpdated)
      socket.off('messages_seen', handleMessagesSeen)
    }
  }, [session, open, widget])

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
          initialSession={session}
          initialMessages={messages}
          setInitialMessages={setMessages}
          loading={loading}
          onClose={() => setOpen(false)}
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