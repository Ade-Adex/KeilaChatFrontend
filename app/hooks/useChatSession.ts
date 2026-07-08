// /app/hooks/useChatSession.ts

'use client'

import { getSessionMessages, initiateSession } from '@/app/lib/api/chat.api'
import { useVisitorChatStore } from '@/app/store/useVisitorChatStore'
import type { ChatMessage } from '@/app/types/chat'
import { useEffect, useState } from 'react'

interface UseChatSessionOptions {
  widgetId: string
  visitorTrackingId: string
}

export function useChatSession({
  widgetId,
  visitorTrackingId,
}: UseChatSessionOptions) {
  const session = useVisitorChatStore((state) => state.session)
  const setSession = useVisitorChatStore((state) => state.setSession)
  const setMessages = useVisitorChatStore((state) => state.setMessages)

  const [loading, setLoading] = useState(true)
  const [historyLoadedFor, setHistoryLoadedFor] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function initializeConversation() {
      try {
        const result = await initiateSession({ widgetId, visitorTrackingId })
        if (!isCancelled && result.status === 'success' && result.data) {
          setSession(result.data)
        }
      } catch (error) {
        console.error('[KeilaChat] Root initialization failed:', error)
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    initializeConversation()

    return () => {
      isCancelled = true
    }
  }, [widgetId, visitorTrackingId, setSession])

  useEffect(() => {
    const sessionId = session?.sessionId
    if (!sessionId || historyLoadedFor === sessionId) {
      return
    }

    let isCancelled = false

    async function fetchHistory(currentSessionId: string) {
      try {
        setLoading(true)
        const result = await getSessionMessages(currentSessionId)
        if (!isCancelled && Array.isArray(result.data)) {
          setMessages(result.data as ChatMessage[])
          setHistoryLoadedFor(currentSessionId)
        }
      } catch (error) {
        console.error(
          '[KeilaChat] Failed to load previous chat history:',
          error,
        )
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchHistory(sessionId)

    return () => {
      isCancelled = true
    }
  }, [session?.sessionId, historyLoadedFor, setMessages])

  return { loading }
}
