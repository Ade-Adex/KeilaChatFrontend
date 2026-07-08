'use client'

import { getChatSocket } from '@/app/hooks/useChatSocket'
import { useVisitorChatStore } from '@/app/store/useVisitorChatStore'
import type {
  ChatMessage,
  PopulatedOperator,
  SafeSessionConfig,
  WidgetConfig,
} from '@/app/types/chat'
import { useEffect, useState } from 'react'

interface UseChatSocketEventsOptions {
  session: SafeSessionConfig | null
  open: boolean
  widget: WidgetConfig | null
}

export function useChatSocketEvents({
  session,
  open,
  widget,
}: UseChatSocketEventsOptions) {
  const messages = useVisitorChatStore((state) => state.messages)
  const setMessages = useVisitorChatStore((state) => state.setMessages)
  const setSession = useVisitorChatStore((state) => state.setSession)
  const addMessage = useVisitorChatStore((state) => state.addMessage)

  const [unreadCount, setUnreadCount] = useState(0)

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

    messages.forEach((message) => {
      if (
        (message.senderType === 'operator' || message.senderType === 'ai') &&
        (!message.status || message.status === 'sent') &&
        message._id
      ) {
        socket.emit('message_delivered', {
          messageId: message._id,
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

      if (
        (payload.senderType === 'operator' || payload.senderType === 'ai') &&
        payload.senderId &&
        session &&
        !session.assignedOperatorId
      ) {
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
            } catch (error) {
              console.error(error)
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

    const handleStatusUpdated = (data: {
      messageId: string
      sessionId: string
      status: 'sent' | 'delivered' | 'seen' | 'failed'
    }) => {
      if (data.sessionId !== session.sessionId) return
      setMessages(
        messages.map((message) =>
          message._id === data.messageId
            ? { ...message, status: data.status }
            : message,
        ),
      )
    }

    const handleMessagesSeen = (data: {
      sessionId: string
      reader: 'visitor' | 'operator'
    }) => {
      if (data.sessionId !== session.sessionId) return
      if (data.reader === 'operator') {
        setMessages(
          messages.map((message) =>
            message.senderType === 'visitor'
              ? { ...message, status: 'seen' }
              : message,
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
        messages.map((message) =>
          message.senderType === 'operator' || message.senderType === 'ai'
            ? {
                ...message,
                status: message.status === 'seen' ? 'seen' : 'delivered',
              }
            : message,
        ),
      )
    }

    const handleStatusChanged = (payload: {
      sessionId: string
      status: SafeSessionConfig['status']
    }) => {
      if (payload.sessionId !== session.sessionId) return
      setSession({ ...session, status: payload.status })
    }

    const handleOperatorJoined = (payload: {
      operatorId: string
      name: string
      avatar?: string
    }) => {
      if (!session) return
      const runtimeOperator: PopulatedOperator = {
        _id: payload.operatorId,
        firstName: payload.name?.trim() || 'Support Agent',
        email: '',
        avatar: payload.avatar || '',
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
    socket.on('operator_joined', handleOperatorJoined)

    return () => {
      socket.off('new_message', handleIncomingMessage)
      socket.off('message_status_updated', handleStatusUpdated)
      socket.off('messages_seen', handleMessagesSeen)
      socket.off('messages_delivered_bulk', handleBulkDelivered)
      socket.off('session_status_changed', handleStatusChanged)
      socket.off('operator_joined', handleOperatorJoined)
    }
  }, [session, open, widget, messages, setMessages, setSession, addMessage])

  useEffect(() => {
    if (open) {
      setUnreadCount(0)
    }
  }, [open])

  const markSessionSeen = () => {
    if (session?.sessionId) {
      const socket = getChatSocket()
      if (socket.connected) {
        socket.emit('mark_session_seen', {
          sessionId: session.sessionId,
          clientType: 'visitor',
        })
      }
    }
  }

  return {
    unreadCount,
    markSessionSeen,
  }
}
