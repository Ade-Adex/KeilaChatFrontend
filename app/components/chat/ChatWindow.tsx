// /app/components/chat/ChatWindow.tsx

'use client'

import type {
  ChatMessage,
  ChatWindowProps,
  SafeSessionConfig,
} from '@/app/types/chat'
import { Button, Group, LoadingOverlay, Modal, Text } from '@mantine/core'
import { useRef, useState } from 'react'

import { getChatSocket } from '@/app/hooks/useChatSocket'
import { useOperatorPresence } from '@/app/hooks/useOperatorPresence'
import {
  closeSession,
  initiateSession,
  uploadMedia,
} from '@/app/lib/api/chat.api'
import { useVisitorChatStore } from '@/app/store/useVisitorChatStore'
import ChatHeader from './ChatHeader'
import ChatInput from './ChatInput'
import ChatMessages from './ChatMessages'

interface ExtendedChatWindowProps extends ChatWindowProps {
  loading: boolean
  queueSubtext?: string
}

export default function ChatWindow({
  widget,
  widgetId,
  visitorTrackingId,
  loading,
  onClose,
  queueSubtext,
}: ExtendedChatWindowProps) {
  const socket = getChatSocket()
  const session = useVisitorChatStore((state) => state.session)
  const messages = useVisitorChatStore((state) => state.messages)
  const setSession = useVisitorChatStore((state) => state.setSession)
  const setMessages = useVisitorChatStore((state) => state.setMessages)
  const addMessage = useVisitorChatStore((state) => state.addMessage)
  const operatorTyping = useVisitorChatStore((state) => state.operatorTyping)

  const [message, setMessage] = useState('')
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const handledClosedSessionRef = useRef<string | null>(null)

  const { operatorName, operatorAvatar } = useOperatorPresence({
    session,
    widget,
    isClosing,
  })

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
        setMessages([])
      }
    } catch (error) {
      console.error('[KeilaChat] Session hard-reset failed:', error)
    }
  }

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
          addMessage(visitorNotice)
        }
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
            messages={messages}
            operatorTyping={operatorTyping}
          />
        )}
      </div>

      {!loading && session && (
        <ChatInput
          value={message}
          disabled={session.status === 'closed'}
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
                  } else {
                    console.error(
                      '[KeilaChat] Attachment upload failed:',
                      result,
                    )
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
