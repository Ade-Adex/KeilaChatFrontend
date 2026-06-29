// /components/operator/OperatorWorkspace.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import MessageFeed from './MessageFeed'
import TypingIndicator from './TypingIndicator'
import OperatorInput from './OperatorInput'
import { getSessionMessages } from '@/app/lib/api/chat.api'
import { getChatSocket } from '@/app/hooks/useChatSocket'
import type { OperatorConversation, ChatMessage } from '@/app/types/dashboard'

interface OperatorWorkspaceProps {
  session: OperatorConversation
}

export default function OperatorWorkspace({ session }: OperatorWorkspaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [visitorTyping, setVisitorTyping] = useState(false)
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)

  const socket = getChatSocket()
  const currentSessionId = session._id

  useEffect(() => {
    if (!socket.connected) socket.connect()
  }, [socket])

  // Load Room Message Thread Logs
  useEffect(() => {
    let mounted = true
    const fetchMessages = async () => {
      try {
        setLoading(true)
        const result = await getSessionMessages(currentSessionId)
        if (!mounted) return
        setMessages(Array.isArray(result.data) ? result.data : [])
      } catch (error) {
        console.error('❌ Failed fetching thread historical context:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void fetchMessages()
    return () => {
      mounted = false
    }
  }, [currentSessionId])

  // Isolate Socket Namespace Room Tunnels
  useEffect(() => {
    if (!socket.connected) socket.connect()

    const propertyId =
      typeof session.propertyId === 'string'
        ? session.propertyId
        : session.propertyId?._id

    const visitorId =
      typeof session.visitorId === 'string'
        ? session.visitorId
        : session.visitorId?._id

    socket.emit('join_chat_session', {
      sessionId: currentSessionId,
      propertyId,
      visitorId,
      operatorId: session.assignedOperatorId,
      clientType: 'operator',
    })
  }, [session, currentSessionId, socket])


  useEffect(() => {
    const handleMessage = (message: ChatMessage) => {
      const incomingSessionId =
        message.sessionId &&
        typeof message.sessionId === 'object' &&
        '_id' in message.sessionId
          ? (message.sessionId as { _id: string })._id
          : (message.sessionId as string)

      if (incomingSessionId !== currentSessionId) return

      setMessages((prev) =>
        prev.some((m) => m._id === message._id) ? prev : [...prev, message],
      )
    }

    const handleTyping = (payload: {
      sessionId: string | { _id: string }
      isTyping: boolean
      actor?: string
    }) => {
      const incomingSessionId =
        payload.sessionId &&
        typeof payload.sessionId === 'object' &&
        '_id' in payload.sessionId
          ? (payload.sessionId as { _id: string })._id
          : (payload.sessionId as string)

      if (incomingSessionId !== currentSessionId) return

      // IGNORE if the typing update is from an operator
      if (payload.actor === 'operator') return

      setVisitorTyping(payload.isTyping)

      if (typingTimeout.current) clearTimeout(typingTimeout.current)
      if (payload.isTyping) {
        typingTimeout.current = setTimeout(() => setVisitorTyping(false), 3500)
      }
    }

    socket.on('new_message', handleMessage)
    socket.on('user_typing', handleTyping)

    return () => {
      socket.off('new_message', handleMessage)
      socket.off('user_typing', handleTyping)
      if (typingTimeout.current) clearTimeout(typingTimeout.current)
    }
  }, [currentSessionId, socket])

  const visitorName =
    typeof session.visitorId === 'object' && session.visitorId?.name
      ? session.visitorId.name
      : 'Anonymous Visitor'

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background/30 space-y-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-xs font-medium text-muted-foreground tracking-wide">
          Opening secure chat workspace...
        </span>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background/40 relative">
      {/* Workspace Subheader Workspace Meta Section */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/50 px-4 backdrop-blur-sm">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground truncate tracking-tight">
            {visitorName}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium capitalize text-muted-foreground tracking-wide">
              {session.status} Thread
            </span>
          </div>
        </div>
      </div>

      {/* Message Feed Canvas Layer */}
      <div className="flex-1 overflow-hidden relative">
        <MessageFeed messages={messages} loading={false} />
      </div>

      {/* Interactive Telemetry Feed Footers */}
      <div className="relative z-10 bg-gradient-to-t from-background via-background/90 to-transparent pt-4">
        <TypingIndicator
          visible={visitorTyping}
          actor="visitor"
          name={visitorName}
        />
        <OperatorInput
          sessionId={currentSessionId}
          onMessageSent={(msg) => setMessages((prev) => [...prev, msg])}
        />
      </div>
    </div>
  )
}