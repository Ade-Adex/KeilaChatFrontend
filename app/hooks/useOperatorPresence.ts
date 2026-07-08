'use client'

import { getChatSocket } from '@/app/hooks/useChatSocket'
import { useVisitorChatStore } from '@/app/store/useVisitorChatStore'
import type {
  ChatMessage,
  PopulatedOperator,
  SafeSessionConfig,
  WidgetConfig,
} from '@/app/types/chat'
import { useEffect, useRef, useState } from 'react'

interface UseOperatorPresenceOptions {
  session: SafeSessionConfig | null
  widget: WidgetConfig | null
  isClosing: boolean
}

function isAiSession(session: SafeSessionConfig | null) {
  if (!session) return false
  if (session.assignedOperatorId === 'ai') return true
  if (
    typeof session.assignedOperatorId === 'object' &&
    session.assignedOperatorId !== null &&
    '_id' in session.assignedOperatorId &&
    String(session.assignedOperatorId._id).toLowerCase() === 'ai'
  ) {
    return true
  }
  return false
}

function getSessionName(
  session: SafeSessionConfig | null,
  widget: WidgetConfig | null,
  socketName?: string,
) {
  const fallbackName = widget?.name?.trim() || 'Support Agent'

  if (isAiSession(session)) {
    return 'ai'
  }

  if (socketName && socketName.toLowerCase() !== 'operator') {
    return socketName
  }

  if (
    typeof session?.assignedOperatorId === 'object' &&
    session.assignedOperatorId !== null
  ) {
    const op = session.assignedOperatorId as PopulatedOperator
    if (op.firstName?.trim()) {
      return op.firstName.trim()
    }
  }

  if (session?.status === 'queued' || session?.status === 'waiting') {
    return 'Support Agent'
  }

  return fallbackName
}

export function useOperatorPresence({
  session,
  widget,
  isClosing,
}: UseOperatorPresenceOptions) {
  const setSession = useVisitorChatStore((state) => state.setSession)
  const setOperatorTyping = useVisitorChatStore(
    (state) => state.setOperatorTyping,
  )
  const addMessage = useVisitorChatStore((state) => state.addMessage)

  const [socketOperatorName, setSocketOperatorName] = useState<
    string | undefined
  >()
  const [socketOperatorAvatar, setSocketOperatorAvatar] = useState<
    string | undefined
  >()
  const handledClosedSessionRef = useRef<string | null>(null)

  useEffect(() => {
    if (!session?.sessionId) return

    const socket = getChatSocket()

    if (socket.connected) {
      socket.emit('join_chat_session', {
        sessionId: session.sessionId,
        propertyId: session.propertyId,
        visitorId: session.visitorId,
        clientType: 'visitor',
      })
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

    const handleOperatorJoined = (payload: {
      operatorId: string
      name: string
      avatar?: string
    }) => {
      const isPayloadAi =
        payload.operatorId === 'ai' || payload.name?.toLowerCase() === 'ai'
      const cleanName = isPayloadAi
        ? 'ai'
        : payload.name?.trim() || 'Support Agent'

      setSocketOperatorName(cleanName)
      if (payload.avatar) {
        setSocketOperatorAvatar(payload.avatar)
      }

      if (session) {
        const operatorMock: PopulatedOperator = {
          _id: payload.operatorId,
          firstName: cleanName,
          email: '',
          avatar: payload.avatar || '',
        }

        setSession({
          ...session,
          status: 'active',
          assignedOperatorId:
            operatorMock as unknown as SafeSessionConfig['assignedOperatorId'],
        })
      }
    }

    const handleOperatorLeft = () => {
      setSocketOperatorName(undefined)
      setSocketOperatorAvatar(undefined)
      if (session) {
        setSession({
          ...session,
          status: 'queued',
          assignedOperatorId: null,
        })
      }
    }

    const handleStatusChanged = (payload: {
      sessionId: string
      status: SafeSessionConfig['status']
    }) => {
      if (payload.sessionId !== session.sessionId) return
      if (session) {
        setSession({ ...session, status: payload.status })
      }

      if (
        payload.status === 'closed' &&
        handledClosedSessionRef.current !== payload.sessionId
      ) {
        handledClosedSessionRef.current = payload.sessionId
        setOperatorTyping(false)

        const runtimeAiDisplayName =
          widget?.widgetSettings?.aiName?.trim() ||
          widget?.settings?.aiName?.trim() ||
          'AI Assistant'

        const displayTerminalName =
          getSessionName(session, widget, socketOperatorName).toLowerCase() ===
          'ai'
            ? runtimeAiDisplayName
            : getSessionName(session, widget, socketOperatorName)

        const terminalNotice: ChatMessage = {
          _id: `sys-${Date.now()}`,
          sessionId: payload.sessionId,
          senderType: 'ai',
          senderId: 'system',
          messageText: isClosing
            ? '🚫 You have ended this support session.'
            : `🚫 Conversation ended by ${displayTerminalName}.`,
          status: 'seen',
          createdAt: new Date().toISOString(),
        }

        addMessage(terminalNotice)
      }
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
  }, [
    session,
    socketOperatorName,
    widget,
    setOperatorTyping,
    setSession,
    addMessage,
    isClosing,
  ])

  const operatorName = getSessionName(session, widget, socketOperatorName)

  return {
    operatorName,
    operatorAvatar: socketOperatorAvatar,
    isCurrentlyAi: isAiSession(session) || operatorName.toLowerCase() === 'ai',
  }
}
