// // /app/components/chat/ChatWindow.tsx


'use client'

import { useEffect, useState, useRef } from 'react'
import { Modal, Button, Group, Text, LoadingOverlay } from '@mantine/core'
import type {
  ChatMessage,
  ChatWindowProps,
  PopulatedOperator,
  SafeSessionConfig,
} from '@/app/types/chat'

import { getChatSocket } from '@/app/hooks/useChatSocket'
import { initiateSession, closeSession, uploadMedia } from '@/app/lib/api/chat.api'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'

interface ExtendedChatWindowProps extends Omit<ChatWindowProps, 'onClose'> {
  initialSession: SafeSessionConfig | null
  initialMessages: ChatMessage[]
  setInitialMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  setSession: React.Dispatch<React.SetStateAction<SafeSessionConfig | null>>
  loading: boolean
  onClose: () => void
  queueSubtext?: string
}

export default function ChatWindow({
  widget,
  widgetId,
  visitorTrackingId,
  initialSession,
  setSession,
  initialMessages,
  setInitialMessages,
  loading,
  onClose,
  queueSubtext,
}: ExtendedChatWindowProps) {
  const socket = getChatSocket()
  const session = initialSession

  const [prevSessionId, setPrevSessionId] = useState<string | undefined>(
    initialSession?.sessionId,
  )

  if (initialSession?.sessionId !== prevSessionId) {
    setSession(initialSession)
    setPrevSessionId(initialSession?.sessionId)
  }

  const [message, setMessage] = useState('')
  const [operatorTyping, setOperatorTyping] = useState(false)

  const [socketOperatorName, setSocketOperatorName] = useState<string>()
  const [socketOperatorAvatar, setSocketOperatorAvatar] = useState<string>()

  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const handledClosedSessionRef = useRef<string | null>(null)
  const platformFallbackName = widget?.name?.trim() || 'Support Agent'

  let operatorName = socketOperatorName
  let operatorAvatar = socketOperatorAvatar

  const isCurrentlyAi =
    session?.assignedOperatorId === 'ai' ||
    (!session?.assignedOperatorId &&
      session?.status !== 'queued' &&
      session?.status !== 'waiting') ||
    (typeof session?.assignedOperatorId === 'object' &&
      session?.assignedOperatorId !== null &&
      '_id' in session.assignedOperatorId &&
      String(session.assignedOperatorId._id).toLowerCase() === 'ai')

  if (isCurrentlyAi) {
    operatorName = 'ai'
  } else if (!operatorName && session?.assignedOperatorId) {
    const op = session.assignedOperatorId as unknown as PopulatedOperator
    if (op && typeof op === 'object') {
      if (
        'firstName' in op &&
        typeof op.firstName === 'string' &&
        op.firstName.trim()
      ) {
        operatorName = op.firstName.trim()
      }
      if ('avatar' in op && typeof op.avatar === 'string') {
        operatorAvatar = op.avatar
      }
    }
  }

  if (isCurrentlyAi || operatorName?.toLowerCase() === 'ai') {
    operatorName = 'ai'
  } else if (!operatorName || operatorName.toLowerCase() === 'operator') {
    if (
      session?.assignedOperatorId ||
      session?.status === 'queued' ||
      session?.status === 'waiting'
    ) {
      operatorName = 'Support Agent'
    } else {
      operatorName = platformFallbackName
    }
  }

  async function initializeConversation(forceNew = false) {
    if (!forceNew) return
    try {
      const result = await initiateSession({
        widgetId,
        visitorTrackingId,
        createNew: true,
      })

      if (result.status === 'success' && result.data) {
        handledClosedSessionRef.current = null
        setSession(result.data as SafeSessionConfig)
        setInitialMessages([])
        setSocketOperatorName(undefined)
        setSocketOperatorAvatar(undefined)
      }
    } catch (error) {
      console.error('[KeilaChat] Session hard-reset failed:', error)
    }
  }

  useEffect(() => {
    if (!session?.sessionId) return

    if (socket.connected) {
      socket.emit('join_chat_session', {
        sessionId: session.sessionId,
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
      if (payload.avatar) setSocketOperatorAvatar(payload.avatar)

      setSession((prev): SafeSessionConfig | null => {
        if (!prev) return null
        const operatorMock: PopulatedOperator = {
          _id: payload.operatorId,
          firstName: cleanName,
          email: '',
          avatar: payload.avatar || '',
        }
        return {
          ...prev,
          status: 'active',
          assignedOperatorId:
            operatorMock as unknown as SafeSessionConfig['assignedOperatorId'],
        }
      })
    }

    const handleOperatorLeft = () => {
      setSocketOperatorName(undefined)
      setSocketOperatorAvatar(undefined)
      setSession((prev) => {
        if (!prev) return null
        return { ...prev, status: 'queued', assignedOperatorId: null }
      })
    }

    const handleStatusChanged = (payload: {
      sessionId: string
      status: SafeSessionConfig['status']
    }) => {
      if (payload.sessionId !== session.sessionId) return

      setSession((prev) => (prev ? { ...prev, status: payload.status } : null))

      if (
        payload.status === 'closed' &&
        handledClosedSessionRef.current !== payload.sessionId
      ) {
        handledClosedSessionRef.current = payload.sessionId
        setOperatorTyping(false)

        if (confirmModalOpen || isClosing) {
          const visitorNotice: ChatMessage = {
            _id: `sys-${Date.now()}`,
            sessionId: payload.sessionId,
            senderType: 'ai',
            senderId: 'system',
            messageText: '🚫 You have ended this support session.',
            status: 'seen',
            createdAt: new Date().toISOString(),
          }
          setInitialMessages((prev) => [...prev, visitorNotice])
        } else {
          const runtimeAiDisplayName =
            widget?.widgetSettings?.aiName?.trim() ||
            widget?.settings?.aiName?.trim() ||
            'AI Assistant'

          const displayTerminalName =
            operatorName?.toLowerCase() === 'ai'
              ? runtimeAiDisplayName
              : operatorName || 'the support agent'

          const terminalNotice: ChatMessage = {
            _id: `sys-${Date.now()}`,
            sessionId: payload.sessionId,
            senderType: 'ai',
            senderId: 'system',
            messageText: `🚫 Conversation ended by ${displayTerminalName}.`,
            status: 'seen',
            createdAt: new Date().toISOString(),
          }
          setInitialMessages((prev) => [...prev, terminalNotice])
        }
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
    session?.sessionId,
    socket,
    setSession,
    operatorName,
    setInitialMessages,
    widget?.settings?.aiName,
    widget?.widgetSettings?.aiName,
    confirmModalOpen,
    isClosing,
  ])

  async function handleEndChat() {
    if (!session?.sessionId) return
    setIsClosing(true)
    try {
      const result = await closeSession(session.sessionId, 'visitor')

      if (result.status === 'success') {
        if (handledClosedSessionRef.current !== session.sessionId) {
          handledClosedSessionRef.current = session.sessionId
          const visitorNotice: ChatMessage = {
            _id: `sys-${Date.now()}`,
            sessionId: session.sessionId,
            senderType: 'ai',
            senderId: 'system',
            messageText: '🚫 You have ended this support session.',
            status: 'seen',
            createdAt: new Date().toISOString(),
          }
          setInitialMessages((prev) => [...prev, visitorNotice])
        }

        setSession((prev) => (prev ? { ...prev, status: 'closed' } : null))
        setConfirmModalOpen(false)
      }
    } catch (error) {
      console.error('[KeilaChat] Error closing conversation session:', error)
    } finally {
      setIsClosing(false)
    }
  } 

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background shadow-2xl md:h-full md:w-full md:rounded-2xl">
      <ChatHeader
        widget={widget}
        propertyId={session?.propertyId}
        visitorTrackingId={visitorTrackingId}
        operatorName={session?.status === 'closed' ? undefined : operatorName}
        operatorAvatar={
          session?.status === 'closed' ? undefined : operatorAvatar
        }
        queueSubtext={session?.status === 'closed' ? undefined : queueSubtext}
        isSessionActive={session?.status !== 'closed'}
        onOpenEndModal={() => setConfirmModalOpen(true)}
        onStartNewChat={() => initializeConversation(true)}
        onClose={onClose}
        onVisitorProfileUpdated={(name, email) => {
          if (socket.connected && session?.sessionId) {
            socket.emit('visitor_profile_updated', {
              sessionId: session.sessionId,
              propertyId: session.propertyId,
              name,
              email,
            })
          }
        }}
      />

      <div className="relative flex-1 overflow-y-auto">
        <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
        {!loading && (
          <ChatMessages
            widget={widget}
            messages={initialMessages}
            operatorTyping={operatorTyping}
          />
        )}
      </div>

      {!loading && session && (
        <ChatInput
          value={message}
          disabled={session.status === 'closed'}
          // 🎯 LINKING FILE UPLOADS DIRECTLY TO THE BACKEND PROPERTY FIELD
          allowAttachments={widget?.widgetSettings?.allowFileUpload ?? true}
          // 🎯 LINKING VOICE RECORDINGS DIRECTLY TO THE NEW BACKEND PROPERTY FIELD
          allowVoiceRecordings={
            widget?.widgetSettings?.allowVoiceRecordings ?? true
          }
          onChange={(val) => {
            setMessage(val)
            if (socket.connected && session) {
              socket.emit('typing', {
                sessionId: session.sessionId,
                senderName: 'Visitor',
                isTyping: val.length > 0,
              })
            }
          }}
          onSend={async (attachments) => {
            if (!message.trim() && (!attachments || attachments.length === 0))
              return

            const uploadedMediaUrls: string[] = []

            if (attachments && attachments.length > 0) {
              try {
                for (const item of attachments) {
                  const formData = new FormData()
                  formData.append('file', item.file)
                  formData.append('type', item.type)
                  formData.append('sessionId', session.sessionId)

                  const result = await uploadMedia(formData)
                  if (result.status === 'success' && result.url) {
                    uploadedMediaUrls.push(result.url)
                  }
                }
              } catch (error) {
                console.error('[KeilaChat] Attachment upload failed:', error)
              }
            }

            socket.emit('send_message', {
              sessionId: session.sessionId,
              propertyId: session.propertyId,
              senderType: 'visitor',
              senderId: session.visitorId,
              messageText: message.trim(),
              media: uploadedMediaUrls,
            })

            setMessage('')
          }}
        />
      )}

      <Modal
        opened={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="End Conversation"
        centered
        size="sm"
        styles={{
          content: {
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border, #262626)',
          },
          header: {
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
          },
        }}
        className="bg-card! border-border!"
      >
        <Text size="sm" mb="lg">
          Are you sure you want to close this support session?
        </Text>
        <Group justify="flex-end" gap="xs">
          <Button
            variant="subtle"
            size="xs"
            color="gray"
            onClick={() => setConfirmModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="xs"
            color="red"
            loading={isClosing}
            onClick={handleEndChat}
          >
            End Chat
          </Button>
        </Group>
      </Modal>
    </div>
  )
}