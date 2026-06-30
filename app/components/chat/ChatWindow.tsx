// /app/components/chat/ChatWindow.tsx

'use client'

import { useEffect, useRef, useState } from 'react'

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

  /*
   ****************************************
   * DERIVED STATE: OPERATOR NAME CALCULATION
   ****************************************
   */
  let operatorName = socketOperatorName

  // 1. Filter out generic system or account company string labels coming from sockets
  if (
    operatorName &&
    (operatorName.toLowerCase() === 'operator' ||
      operatorName.toLowerCase() === 'support agent' ||
      operatorName === 'Above Great Support' ||
      operatorName.includes('Above Great'))
  ) {
    operatorName = undefined
  }

  // 2. If no valid socket name override is active, look at the populated DB session config
  if (!operatorName) {
    if (
      session?.assignedOperatorId &&
      typeof session.assignedOperatorId === 'object' &&
      'firstName' in session.assignedOperatorId
    ) {
      const castedOp: PopulatedOperator = session.assignedOperatorId

      // 🎯 FORCE EXTRACT THE HUMAN FIRST NAME DIRECTLY ("adeolu")
      if (castedOp.firstName) {
        operatorName = castedOp.firstName.trim()
      }
    }

    // 3. Fallback: Check message array history data for a human name
    if (!operatorName) {
      const lastOperatorMsg = [...messages]
        .reverse()
        .find(
          (m) =>
            m.senderType === 'operator' &&
            m.senderName &&
            m.senderName.toLowerCase() !== 'operator' &&
            m.senderName.toLowerCase() !== 'support agent' &&
            m.senderName !== 'Above Great Support' &&
            !m.senderName.includes('Above Great'),
        )

      if (lastOperatorMsg?.senderName) {
        operatorName = lastOperatorMsg.senderName
      }
    }
  }

  // 4. ✅ FIXED: Clean fallback that never mentions the account/company name
  if (!operatorName) {
    operatorName = 'Support Agent'
  }

  /*
   ****************************************
   * CREATE/RESUME SESSION
   ****************************************
   */
  useEffect(() => {
    async function initialize() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sessions/initiate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              widgetId,
              visitorTrackingId,
            }),
          },
        )

        const result: SessionInitResponse = await response.json()

        if (result.status === 'success') {
          setSession(result.data)
        }
      } catch (error) {
        console.error('Session initialization failed', error)
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [widgetId, visitorTrackingId])

  /*
  /*
   ****************************************
   * LOAD OLD MESSAGES
   ****************************************
   */
  useEffect(() => {
    async function fetchHistory() {
      if (!session?.sessionId) return

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/messages/session/${session.sessionId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
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
  }, [session?.sessionId])
  /*
   ****************************************
   * SOCKET CONNECTION & MESSAGE LISTENER
   ****************************************
   */
  useEffect(() => {
    if (!session) return

    if (!socket.connected) {
      socket.connect()
    }

    socket.emit('join_chat_session', {
      sessionId: session.sessionId,
      propertyId: session.propertyId,
      visitorId: session.visitorId,
      clientType: 'visitor',
    })

    /*
     * New message inbound processor
     */
    const handleNewMessage = (payload: ChatMessage) => {
      setMessages((prev) => {
        if (!payload._id) return [...prev, payload]
        const exists = prev.some((m) => m._id === payload._id)
        if (exists) return prev
        return [...prev, payload]
      })

      if (payload.senderType === 'operator') {
        setOperatorTyping(false)
        if (payload.senderName) {
          setSocketOperatorName(payload.senderName)
        }
      }
    }

    /*
     * Dashboard Sync fallback alignment
     */
    const handleDashboardMessageUpdate = (payload: {
      sessionId: string
      message: ChatMessage
    }) => {
      if (payload.sessionId === session.sessionId) {
        handleNewMessage(payload.message)
      }
    }

    /*
     * Typing Listener Adjustment
     */
    const handleTyping = (payload: {
      sessionId: string
      isTyping: boolean
      actor?: string
      senderName?: string
    }) => {
      if (payload.actor === 'visitor') return

      setOperatorTyping(payload.isTyping)
      if (payload.senderName) {
        setSocketOperatorName(payload.senderName)
      }
    }

    /*
     * Presence Events
     */
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
      setSession((prev) =>
        prev ? { ...prev, status: 'closed' as const } : null,
      )
    }

    // Subscriptions
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
   * TYPING TRANSMITTER
   ****************************************
   */
  function sendTyping(typing: boolean) {
    if (!session || !socket.connected) return

    socket.emit('typing', {
      sessionId: session.sessionId,
      senderName: 'Visitor',
      isTyping: typing,
    })
  }

  /*
   ****************************************
   * SEND MESSAGE
   ****************************************
   */
  function sendMessage() {
    if (!session || !message.trim()) return

    socket.emit('send_message', {
      sessionId: session.sessionId,
      propertyId: session.propertyId,
      senderType: 'visitor',
      senderId: session.visitorId,
      messageText: message.trim(),
    })

    setMessage('')
    sendTyping(false)

    if (typingTimer.current) {
      clearTimeout(typingTimer.current)
    }
  }

  /*
   ****************************************
   * INPUT DEBOUNCER
   ****************************************
   */
  function handleInput(value: string) {
    setMessage(value)
    sendTyping(true)

    if (typingTimer.current) {
      clearTimeout(typingTimer.current)
    }

    typingTimer.current = setTimeout(() => {
      sendTyping(false)
    }, 1500)
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
        operatorName={operatorName}
        onClose={onClose}
      />

      <ChatMessages
        widget={widget}
        messages={messages}
        operatorTyping={operatorTyping}
      />

      <ChatInput
        disabled={session?.status === 'closed'}
        value={message}
        onChange={handleInput}
        onSend={sendMessage}
      />
    </div>
  )
}