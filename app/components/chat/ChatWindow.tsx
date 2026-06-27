// /app/components/chat/ChatWindow.tsx

'use client'

import { useEffect, useRef, useState } from 'react'

import type {
  ChatMessage,
  SessionConfig,
  ChatWindowProps,
  UserTypingPayload,
  SessionInitResponse,
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

  const [session, setSession] = useState<SessionConfig | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])

  const [message, setMessage] = useState('')

  const [operatorTyping, setOperatorTyping] = useState(false)

  const [operatorName, setOperatorName] = useState<string>()

  const [loading, setLoading] = useState(true)

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
   ****************************************
   * LOAD OLD MESSAGES
   ****************************************
   */
  useEffect(() => {
    if (!session?.sessionId) return

    async function loadMessages() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/messages/session/${session?.sessionId}`,
        )

        const result = await response.json()

        if (result.status === 'success') {
          setMessages(result.data)
        }
      } catch (error) {
        console.error(error)
      }
    }

    loadMessages()
  }, [session])

  /*
   ****************************************
   * SOCKET CONNECTION
   ****************************************
   */
  useEffect(() => {
    if (!session) return

    socket.connect()

    /*
     * Join chat session
     */
    socket.emit('join_chat_session', {
      sessionId: session.sessionId,
      propertyId: session.propertyId,
      visitorId: session.visitorId,
      clientType: 'visitor',
    })

    /*
     * New message
     */
    socket.on('new_message', (payload: ChatMessage) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === payload._id)

        if (exists) return prev

        return [...prev, payload]
      })

      if (payload.senderType === 'operator') {
        setOperatorName(payload.senderName ?? 'Support Agent')
      }
    })

    /*
     * Typing
     */
    socket.on('user_typing', (payload: UserTypingPayload) => {
      setOperatorTyping(payload.isTyping)
    })

    /*
     * Presence
     */
    socket.on('presence_notification', (payload) => {
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
    })

    /*
     * Session closed
     */
    socket.on('session_closed', () => {
      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: 'closed',
            }
          : null,
      )
    })

    /*
     * Message delivery
     */
    socket.on('message_delivered', (payload) => {
      console.log('Delivered:', payload)
    })

    /*
     * Errors
     */
    socket.on('message_error', (payload) => {
      console.error(payload)
    })

    return () => {
      socket.off('new_message')
      socket.off('user_typing')
      socket.off('presence_notification')
      socket.off('session_closed')
      socket.off('message_delivered')
      socket.off('message_error')

      socket.disconnect()
    }
  }, [session])

  /*
   ****************************************
   * TYPING
   ****************************************
   */
  function sendTyping(typing: boolean) {
    if (!session) return

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
   * INPUT
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
      <div className="flex h-full items-center justify-center">Loading...</div>
    )
  }

  return (
    <div
      className="
      flex
      w-full
      h-full
      flex-col
      overflow-hidden
      rounded-2xl
      bg-background
      shadow-2xl
    "
      style={{
        width: '100%',
        height: '100%',
      }}
    >
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
