// /components/operator/OperatorWorkspace.tsx

'use client'

import { useEffect, useRef, useState } from 'react'

import MessageFeed from './MessageFeed'
import TypingIndicator from './TypingIndicator'
import OperatorInput from './OperatorInput'

import { getSessionMessages } from '@/app/lib/api/chat.api'

import type { OperatorConversation, ChatMessage } from '@/app/types/dashboard'

interface OperatorWorkspaceProps {
  session: OperatorConversation
}

export default function OperatorWorkspace({ session }: OperatorWorkspaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const [loading, setLoading] = useState(true)

  const [visitorTyping, setVisitorTyping] = useState(false)

  const typingTimeout = useRef<NodeJS.Timeout | null>(null)

  /* ---------------------------------------------------- */
  /* cleanup typing timeout                               */
  /* ---------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current)
      }
    }
  }, [])

  /* ---------------------------------------------------- */
  /* load messages                                        */
  /* ---------------------------------------------------- */

  useEffect(() => {
    let mounted = true

    const fetchMessages = async () => {
      try {
        setLoading(true)

        const result = await getSessionMessages(session._id)

        if (!mounted) {
          return
        }

        setMessages(Array.isArray(result.data) ? result.data : [])
      } catch (error) {
        if (mounted) {
          console.error(error)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void fetchMessages()

    return () => {
      mounted = false
    }
  }, [session._id])

  /* ---------------------------------------------------- */
  /* websocket typing listener                            */
  /* ---------------------------------------------------- */

  useEffect(() => {
    const socket = (
      window as typeof window & {
        operatorSocket?: {
          on: (
            event: string,
            callback: (payload: {
              sessionId: string
              actor: string
              typing: boolean
            }) => void,
          ) => void

          off: (event: string) => void
        }
      }
    ).operatorSocket

    if (!socket) {
      return
    }

    const handleTyping = (payload: {
      sessionId: string
      actor: string
      typing: boolean
    }) => {
      if (payload.sessionId !== session._id) {
        return
      }

      if (payload.actor !== 'visitor') {
        return
      }

      setVisitorTyping(payload.typing)

      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current)
      }

      if (payload.typing) {
        typingTimeout.current = setTimeout(() => {
          setVisitorTyping(false)
        }, 2000)
      }
    }

    socket.on('typing', handleTyping)

    return () => {
      socket.off('typing')
    }
  }, [session._id])

  /* ---------------------------------------------------- */
  /* loading                                              */
  /* ---------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        Loading conversation...
      </div>
    )
  }

  /* ---------------------------------------------------- */
  /* ui                                                   */
  /* ---------------------------------------------------- */

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="border-b p-4">
        <h2 className="font-semibold">
          {session.visitorId?.name ?? 'Anonymous Visitor'}
        </h2>

        <p className="text-sm capitalize text-muted-foreground">
          {session.status}
        </p>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageFeed messages={messages} loading={loading} />
      </div>

      {/* typing */}
      <TypingIndicator
        visible={visitorTyping}
        actor="visitor"
        name={session.visitorId?.name}
      />

      {/* input */}
      <OperatorInput
        sessionId={session._id}
        onMessageSent={(message) => setMessages((prev) => [...prev, message])}
      />
    </div>
  )
}
