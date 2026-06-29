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

  /* ---------------------------------------------------- */
  /* socket connect                                       */
  /* ---------------------------------------------------- */

  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }
  }, [socket])

  /* ---------------------------------------------------- */
  /* cleanup                                              */
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

        if (!mounted) return

        setMessages(Array.isArray(result.data) ? result.data : [])
      } catch (error) {
        console.error(error)
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
  /* join chat room                                       */
  /* ---------------------------------------------------- */

  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }

    console.log('OPERATOR JOINING ROOM:', session._id)

    socket.emit('join_chat_session', {
      sessionId: session._id,

      propertyId: session.propertyId?._id,

      visitorId: session.visitorId?._id,

      operatorId: session.assignedOperatorId,

      clientType: 'operator',
    })
  }, [session, socket])

  /* ---------------------------------------------------- */
  /* receive messages                                     */
  /* ---------------------------------------------------- */

  useEffect(() => {
    const handleMessage = (message: ChatMessage) => {
      console.log('Workspace matched focus window frame processing:', message)
      if (message.sessionId !== session._id) return

      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev
        return [...prev, message]
      })
    }

    socket.on('new_message', handleMessage)

    return () => {
      socket.off('new_message', handleMessage)
    }
  }, [session._id, socket]) // Safe now due to explicit key tracking mounts!

  /* ---------------------------------------------------- */
  /* visitor typing                                       */
  /* ---------------------------------------------------- */

  useEffect(() => {
    const handleTyping = (payload: {
      senderName?: string
      isTyping: boolean
    }) => {
      setVisitorTyping(payload.isTyping)

      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current)
      }

      if (payload.isTyping) {
        typingTimeout.current = setTimeout(() => {
          setVisitorTyping(false)
        }, 2000)
      }
    }

    socket.on('user_typing', handleTyping)

    return () => {
      socket.off('user_typing', handleTyping)
    }
  }, [socket])

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
      <div className="border-b p-4">
        <h2 className="font-semibold">
          {session.visitorId?.name ?? 'Anonymous Visitor'}
        </h2>

        <p className="text-sm capitalize text-muted-foreground">
          {session.status}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <MessageFeed messages={messages} loading={loading} />
      </div>

      <TypingIndicator
        visible={visitorTyping}
        actor="visitor"
        name={session.visitorId?.name}
      />

      <OperatorInput
        sessionId={session._id}
        onMessageSent={(message) => setMessages((prev) => [...prev, message])}
      />
    </div>
  )
}
