// // /app/components/chat/ChatWindow.tsx

// 'use client'

// import { useEffect, useState, useRef } from 'react'
// import { Modal, Button, Group, Text, LoadingOverlay } from '@mantine/core'
// import type {
//   ChatMessage,
//   ChatWindowProps,
//   PopulatedOperator,
//   SafeSessionConfig,
// } from '@/app/types/chat'

// import { getChatSocket } from '@/app/hooks/useChatSocket'
// import ChatHeader from './ChatHeader'
// import ChatMessages from './ChatMessages'
// import ChatInput from './ChatInput'

// interface ExtendedChatWindowProps extends Omit<ChatWindowProps, 'onClose'> {
//   initialSession: SafeSessionConfig | null
//   initialMessages: ChatMessage[]
//   setInitialMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
//   setSession: React.Dispatch<React.SetStateAction<SafeSessionConfig | null>>
//   loading: boolean
//   onClose: () => void
//   queueSubtext?: string
// }

// export default function ChatWindow({
//   widget,
//   widgetId,
//   visitorTrackingId,
//   initialSession,
//   setSession,
//   initialMessages,
//   setInitialMessages,
//   loading,
//   onClose,
//   queueSubtext,
// }: ExtendedChatWindowProps) {
//   const socket = getChatSocket()
//   const session = initialSession

//   const [prevSessionId, setPrevSessionId] = useState<string | undefined>(
//     initialSession?.sessionId,
//   )

//   if (initialSession?.sessionId !== prevSessionId) {
//     setSession(initialSession)
//     setPrevSessionId(initialSession?.sessionId)
//   }

//   const [message, setMessage] = useState('')
//   const [operatorTyping, setOperatorTyping] = useState(false)

//   const [socketOperatorName, setSocketOperatorName] = useState<string>()
//   const [socketOperatorAvatar, setSocketOperatorAvatar] = useState<string>()

//   const [confirmModalOpen, setConfirmModalOpen] = useState(false)
//   const [isClosing, setIsClosing] = useState(false)

//   const handledClosedSessionRef = useRef<string | null>(null)
//   const platformFallbackName = widget.name?.trim() || 'Support Agent'

//   let operatorName = socketOperatorName
//   let operatorAvatar = socketOperatorAvatar

//   const isCurrentlyAi =
//     session?.assignedOperatorId === 'ai' ||
//     (!session?.assignedOperatorId &&
//       session?.status !== 'queued' &&
//       session?.status !== 'waiting') ||
//     (typeof session?.assignedOperatorId === 'object' &&
//       session?.assignedOperatorId !== null &&
//       '_id' in session.assignedOperatorId &&
//       String(session.assignedOperatorId._id).toLowerCase() === 'ai')

//   if (isCurrentlyAi) {
//     operatorName = 'ai'
//   } else if (!operatorName && session?.assignedOperatorId) {
//     const op = session.assignedOperatorId as unknown as PopulatedOperator
//     if (op && typeof op === 'object') {
//       if (
//         'firstName' in op &&
//         typeof op.firstName === 'string' &&
//         op.firstName.trim()
//       ) {
//         operatorName = op.firstName.trim()
//       }
//       if ('avatar' in op && typeof op.avatar === 'string') {
//         operatorAvatar = op.avatar
//       }
//     }
//   }

//   if (isCurrentlyAi || operatorName?.toLowerCase() === 'ai') {
//     operatorName = 'ai'
//   } else if (!operatorName || operatorName.toLowerCase() === 'operator') {
//     if (
//       session?.assignedOperatorId ||
//       session?.status === 'queued' ||
//       session?.status === 'waiting'
//     ) {
//       operatorName = 'Support Agent'
//     } else {
//       operatorName = platformFallbackName
//     }
//   }

//   async function initializeConversation(forceNew = false) {
//     if (!forceNew) return
//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sessions/initiate`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             widgetId,
//             visitorTrackingId,
//             createNew: true,
//           }),
//         },
//       )

//       const result = await response.json()
//       if (result.status === 'success' && result.data) {
//         handledClosedSessionRef.current = null
//         setSession(result.data as SafeSessionConfig)
//         setInitialMessages([])
//         setSocketOperatorName(undefined)
//         setSocketOperatorAvatar(undefined)
//       }
//     } catch (error) {
//       console.error('[KeilaChat] Session hard-reset failed:', error)
//     }
//   }

//   useEffect(() => {
//     if (!session?.sessionId) return

//     if (socket.connected) {
//       socket.emit('join_chat_session', {
//         sessionId: session.sessionId,
//         clientType: 'visitor',
//       })
//     }

//     const handleTyping = (payload: {
//       isTyping: boolean
//       actor?: string
//       senderName?: string
//     }) => {
//       if (payload.actor === 'visitor') return
//       setOperatorTyping(payload.isTyping)

//       if (
//         payload.senderName &&
//         payload.senderName.toLowerCase() !== 'operator'
//       ) {
//         setSocketOperatorName(payload.senderName)
//       }
//     }

//     const handleOperatorJoined = (payload: {
//       operatorId: string
//       name: string
//       avatar?: string
//     }) => {
//       const isPayloadAi =
//         payload.operatorId === 'ai' || payload.name?.toLowerCase() === 'ai'
//       const cleanName = isPayloadAi
//         ? 'ai'
//         : payload.name?.trim() || 'Support Agent'

//       setSocketOperatorName(cleanName)
//       if (payload.avatar) setSocketOperatorAvatar(payload.avatar)

//       setSession((prev): SafeSessionConfig | null => {
//         if (!prev) return null
//         const operatorMock: PopulatedOperator = {
//           _id: payload.operatorId,
//           firstName: cleanName,
//           email: '',
//           avatar: payload.avatar || '',
//         }
//         return {
//           ...prev,
//           status: 'active',
//           assignedOperatorId:
//             operatorMock as unknown as SafeSessionConfig['assignedOperatorId'],
//         }
//       })
//     }

//     const handleOperatorLeft = () => {
//       setSocketOperatorName(undefined)
//       setSocketOperatorAvatar(undefined)
//       setSession((prev) => {
//         if (!prev) return null
//         return { ...prev, status: 'queued', assignedOperatorId: null }
//       })
//     }

//     const handleStatusChanged = (payload: {
//       sessionId: string
//       status: SafeSessionConfig['status']
//     }) => {
//       if (payload.sessionId !== session.sessionId) return

//       setSession((prev) => (prev ? { ...prev, status: payload.status } : null))

//       if (
//         payload.status === 'closed' &&
//         handledClosedSessionRef.current !== payload.sessionId
//       ) {
//         handledClosedSessionRef.current = payload.sessionId
//         setOperatorTyping(false)

//         if (confirmModalOpen || isClosing) {
//           const visitorNotice: ChatMessage = {
//             _id: `sys-${Date.now()}`,
//             sessionId: payload.sessionId,
//             senderType: 'ai',
//             senderId: 'system',
//             messageText: '🚫 You have ended this support session.',
//             status: 'seen',
//             createdAt: new Date().toISOString(),
//           }
//           setInitialMessages((prev) => [...prev, visitorNotice])
//         } else {
//           const runtimeAiDisplayName =
//             widget.widgetSettings?.aiName?.trim() ||
//             widget.settings?.aiName?.trim() ||
//             'AI Assistant'

//           const displayTerminalName =
//             operatorName?.toLowerCase() === 'ai'
//               ? runtimeAiDisplayName
//               : operatorName || 'the support agent'

//           const terminalNotice: ChatMessage = {
//             _id: `sys-${Date.now()}`,
//             sessionId: payload.sessionId,
//             senderType: 'ai',
//             senderId: 'system',
//             messageText: `🚫 Conversation ended by ${displayTerminalName}.`,
//             status: 'seen',
//             createdAt: new Date().toISOString(),
//           }
//           setInitialMessages((prev) => [...prev, terminalNotice])
//         }
//       }
//     }

//     socket.on('user_typing', handleTyping)
//     socket.on('operator_joined', handleOperatorJoined)
//     socket.on('operator_left', handleOperatorLeft)
//     socket.on('session_status_changed', handleStatusChanged)

//     return () => {
//       socket.off('user_typing', handleTyping)
//       socket.off('operator_joined', handleOperatorJoined)
//       socket.off('operator_left', handleOperatorLeft)
//       socket.off('session_status_changed', handleStatusChanged)
//     }
//   }, [
//     session?.sessionId,
//     socket,
//     setSession,
//     operatorName,
//     setInitialMessages,
//     widget.settings?.aiName,
//     widget.widgetSettings?.aiName,
//     confirmModalOpen,
//     isClosing,
//   ])

//   async function handleEndChat() {
//     if (!session?.sessionId) return
//     setIsClosing(true)
//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sessions/${session.sessionId}/close`,
//         {
//           method: 'PATCH',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ closedBy: 'visitor' }),
//           credentials: 'include',
//         },
//       )

//       const result = await response.json()
//       if (result.status === 'success') {
//         if (handledClosedSessionRef.current !== session.sessionId) {
//           handledClosedSessionRef.current = session.sessionId
//           const visitorNotice: ChatMessage = {
//             _id: `sys-${Date.now()}`,
//             sessionId: session.sessionId,
//             senderType: 'ai',
//             senderId: 'system',
//             messageText: '🚫 You have ended this support session.',
//             status: 'seen',
//             createdAt: new Date().toISOString(),
//           }
//           setInitialMessages((prev) => [...prev, visitorNotice])
//         }

//         setSession((prev) => (prev ? { ...prev, status: 'closed' } : null))
//         setConfirmModalOpen(false)
//       }
//     } catch (error) {
//       console.error('[KeilaChat] Error closing conversation session:', error)
//     } finally {
//       setIsClosing(false)
//     }
//   }

//   return (
//     <div className="flex h-screen w-screen flex-col overflow-hidden bg-background shadow-2xl md:h-full md:w-full md:rounded-2xl">
//       <ChatHeader
//         widget={widget}
//         propertyId={session?.propertyId}
//         visitorTrackingId={visitorTrackingId}
//         operatorName={session?.status === 'closed' ? undefined : operatorName}
//         operatorAvatar={
//           session?.status === 'closed' ? undefined : operatorAvatar
//         }
//         queueSubtext={session?.status === 'closed' ? undefined : queueSubtext}
//         isSessionActive={session?.status !== 'closed'}
//         onOpenEndModal={() => setConfirmModalOpen(true)}
//         onStartNewChat={() => initializeConversation(true)}
//         onClose={onClose}
//         onVisitorProfileUpdated={(name, email) => {
//           if (socket.connected && session?.sessionId) {
//             socket.emit('visitor_profile_updated', {
//               sessionId: session.sessionId,
//               propertyId: session.propertyId,
//               name,
//               email,
//             })
//           }
//         }}
//       />

//       <div className="relative flex-1 overflow-y-auto">
//         <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
//         {!loading && (
//           <ChatMessages
//             widget={widget}
//             messages={initialMessages}
//             operatorTyping={operatorTyping}
//           />
//         )}
//       </div>

//       {!loading && session && (
//         <ChatInput
//           value={message}
//           disabled={session.status === 'closed'}
//           onChange={(val) => {
//             setMessage(val)
//             if (socket.connected && session) {
//               socket.emit('typing', {
//                 sessionId: session.sessionId,
//                 senderName: 'Visitor',
//                 isTyping: val.length > 0,
//               })
//             }
//           }}
//           onSend={async (attachments) => {
//             if (!message.trim() && (!attachments || attachments.length === 0))
//               return

//             const uploadedMediaUrls: string[] = []

//             if (attachments && attachments.length > 0) {
//               try {
//                 for (const item of attachments) {
//                   const formData = new FormData()
//                   formData.append('file', item.file)
//                   formData.append('type', item.type)
//                   formData.append('sessionId', session.sessionId)

//                   const response = await fetch(
//                     `${process.env.NEXT_PUBLIC_API_URL}/api/v1/media/upload`,
//                     {
//                       method: 'POST',
//                       body: formData,
//                     },
//                   )

//                   const result = await response.json()
//                   if (result.status === 'success' && result.url) {
//                     uploadedMediaUrls.push(result.url)
//                   }
//                 }
//               } catch (error) {
//                 console.error('[KeilaChat] Attachment upload failed:', error)
//               }
//             }

//             socket.emit('send_message', {
//               sessionId: session.sessionId,
//               propertyId: session.propertyId,
//               senderType: 'visitor',
//               senderId: session.visitorId,
//               messageText: message.trim(),
//               media: uploadedMediaUrls,
//             })

//             setMessage('')
//           }}
//         />
//       )}

//       <Modal
//         opened={confirmModalOpen}
//         onClose={() => setConfirmModalOpen(false)}
//         title="End Conversation"
//         centered
//         size="sm"
//         styles={{
//           content: {
//             backgroundColor: 'var(--background)',
//             color: 'var(--foreground)',
//             border: '1px solid var(--border, #262626)',
//           },
//           header: {
//             backgroundColor: 'var(--background)',
//             color: 'var(--foreground)',
//           },
//         }}
//         className="bg-card! border-border!"
//       >
//         <Text size="sm" mb="lg">
//           Are you sure you want to close this support session?
//         </Text>
//         <Group justify="flex-end" gap="xs">
//           <Button
//             variant="subtle"
//             size="xs"
//             color="gray"
//             onClick={() => setConfirmModalOpen(false)}
//           >
//             Cancel
//           </Button>
//           <Button
//             size="xs"
//             color="red"
//             loading={isClosing}
//             onClick={handleEndChat}
//           >
//             End Chat
//           </Button>
//         </Group>
//       </Modal>
//     </div>
//   )
// }









// /app/components/chat/ChatWindow.tsx
'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Modal, Button, Group, Text, LoadingOverlay } from '@mantine/core'
import type {
  ChatMessage,
  ChatWindowProps,
  PopulatedOperator,
  SafeSessionConfig,
} from '@/app/types/chat'

import { getChatSocket } from '@/app/hooks/useChatSocket'
import { useChatStore } from '@/app/store/useChatStore'
import { ChatEncryptionEngine } from '@/app/lib/utils/crypto'
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
  setSession: propSetSession,
  initialMessages: propInitialMessages,
  setInitialMessages: propSetInitialMessages,
  loading,
  onClose,
  queueSubtext,
}: ExtendedChatWindowProps) {
  const socket = getChatSocket()

  // Connect directly to Zustand centralized slice state
  const {
    session,
    messages: storeMessages,
    operatorTyping,
    socketOperatorName,
    socketOperatorAvatar,
    publicKeyExchanged,
    setSession,
    setInitialMessages,
    addIncomingMessage,
    setOperatorTyping,
    setSocketOperatorName,
    setSocketOperatorAvatar,
    initiateE2EEHandshake,
    handleIncomingPublicKey,
  } = useChatStore()

  // Sync incoming props directly with state engine
  const [prevSessionId, setPrevSessionId] = useState<string | undefined>(
    initialSession?.sessionId,
  )

  if (initialSession?.sessionId !== prevSessionId) {
    setSession(initialSession)
    propSetSession(initialSession)
    setPrevSessionId(initialSession?.sessionId)
  }

  // Populate component render layout with store data
  useEffect(() => {
    if (propInitialMessages && storeMessages.length === 0) {
      setInitialMessages(propInitialMessages)
    }
  }, [propInitialMessages, storeMessages.length, setInitialMessages])

  const [message, setMessage] = useState('')
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const handledClosedSessionRef = useRef<string | null>(null)
  const platformFallbackName = widget.name?.trim() || 'Support Agent'

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sessions/initiate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            widgetId,
            visitorTrackingId,
            createNew: true,
          }),
        },
      )

      const result = await response.json()
      if (result.status === 'success' && result.data) {
        handledClosedSessionRef.current = null
        setSession(result.data as SafeSessionConfig)
        propSetSession(result.data as SafeSessionConfig)
        setInitialMessages([])
        propSetInitialMessages([])
        setSocketOperatorName(undefined)
        setSocketOperatorAvatar(undefined)
      }
    } catch (error) {
      console.error('[KeilaChat] Session hard-reset failed:', error)
    }
  }

  // Memoize parent prop dispatch updates to prevent loop instability
  const memoPropSetInitialMessages = useCallback(
    (msgs: ChatMessage[]) => {
      propSetInitialMessages(msgs)
    },
    [propSetInitialMessages],
  )

  const memoPropSetSession = useCallback(
    (sess: SafeSessionConfig | null) => {
      propSetSession(sess)
    },
    [propSetSession],
  )

  useEffect(() => {
    if (!session?.sessionId) return

    if (socket.connected) {
      socket.emit('join_chat_session', {
        sessionId: session.sessionId,
        clientType: 'visitor',
      })
      initiateE2EEHandshake()
    }

    const handlePublicKeyReceived = async (payload: {
      publicKey: JsonWebKey
      clientType: string
    }) => {
      if (payload.clientType === 'operator') {
        await handleIncomingPublicKey(payload.publicKey)
      }
    }

    const handleNewMessage = async (msg: ChatMessage) => {
      // 🎯 Directly add message to the Zustand centralized store array
      await addIncomingMessage(msg)

      // Keep parent tracking props synced up cleanly without breaking reactivity
      const latestMessages = useChatStore.getState().messages
      memoPropSetInitialMessages(latestMessages)
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
        const updated: SafeSessionConfig = {
          ...prev,
          status: 'active' as const,
          assignedOperatorId:
            operatorMock as unknown as SafeSessionConfig['assignedOperatorId'],
        }
        memoPropSetSession(updated)
        return updated
      })

      initiateE2EEHandshake()
    }

    const handleOperatorLeft = () => {
      setSocketOperatorName(undefined)
      setSocketOperatorAvatar(undefined)
      setSession((prev) => {
        if (!prev) return null
        const updated: SafeSessionConfig = {
          ...prev,
          status: 'queued' as const,
          assignedOperatorId: null,
        }
        memoPropSetSession(updated)
        return updated
      })
    }

    const handleStatusChanged = (payload: {
      sessionId: string
      status: SafeSessionConfig['status']
    }) => {
      if (payload.sessionId !== session.sessionId) return

      setSession((prev) => {
        const updated = prev ? { ...prev, status: payload.status } : null
        memoPropSetSession(updated)
        return updated
      })

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
          // Mirroring system notice back to store array safely
          addIncomingMessage(visitorNotice).then(() => {
            memoPropSetInitialMessages(useChatStore.getState().messages)
          })
        } else {
          const runtimeAiDisplayName =
            widget.widgetSettings?.aiName?.trim() ||
            widget.settings?.aiName?.trim() ||
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
          addIncomingMessage(terminalNotice).then(() => {
            memoPropSetInitialMessages(useChatStore.getState().messages)
          })
        }
      }
    }

    socket.on('public_key_received', handlePublicKeyReceived)
    socket.on('new_message', handleNewMessage)
    socket.on('user_typing', handleTyping)
    socket.on('operator_joined', handleOperatorJoined)
    socket.on('operator_left', handleOperatorLeft)
    socket.on('session_status_changed', handleStatusChanged)

    return () => {
      socket.off('public_key_received', handlePublicKeyReceived)
      socket.off('new_message', handleNewMessage)
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
    widget.settings?.aiName,
    widget.widgetSettings?.aiName,
    confirmModalOpen,
    isClosing,
    initiateE2EEHandshake,
    handleIncomingPublicKey,
    addIncomingMessage,
    setOperatorTyping,
    setSocketOperatorName,
    setSocketOperatorAvatar,
    memoPropSetInitialMessages,
    memoPropSetSession,
  ])

  async function handleEndChat() {
    if (!session?.sessionId) return
    setIsClosing(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sessions/${session.sessionId}/close`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ closedBy: 'visitor' }),
          credentials: 'include',
        },
      )

      const result = await response.json()
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
          await addIncomingMessage(visitorNotice)
          memoPropSetInitialMessages(useChatStore.getState().messages)
        }

        setSession((prev) => {
          const updated = prev ? { ...prev, status: 'closed' as const } : null
          memoPropSetSession(updated)
          return updated
        })
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
            messages={storeMessages}
            operatorTyping={operatorTyping}
          />
        )}
      </div>

      {/* Falls back to initialSession if Zustand hasn't completed its frame update cycle */}
      {!loading && (session || initialSession) && (
        <ChatInput
          value={message}
          disabled={(session?.status || initialSession?.status) === 'closed'}
          onChange={(val) => {
            const activeSession = session || initialSession
            setMessage(val)
            if (socket.connected && activeSession) {
              socket.emit('typing', {
                sessionId: activeSession.sessionId,
                senderName: 'Visitor',
                isTyping: val.length > 0,
              })
            }
          }}
          onSend={async (attachments) => {
            const activeSession = session || initialSession
            if (!activeSession) return
            if (!message.trim() && (!attachments || attachments.length === 0))
              return

            const uploadedMediaUrls: string[] = []

            if (attachments && attachments.length > 0) {
              try {
                for (const item of attachments) {
                  const formData = new FormData()
                  formData.append('file', item.file)
                  formData.append('type', item.type)
                  formData.append('sessionId', activeSession.sessionId)

                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/media/upload`,
                    {
                      method: 'POST',
                      body: formData,
                    },
                  )

                  const result = await response.json()
                  if (result.status === 'success' && result.url) {
                    uploadedMediaUrls.push(result.url)
                  }
                }
              } catch (error) {
                console.error('[KeilaChat] Attachment upload failed:', error)
              }
            }

            let finalPayloadText = message.trim()
            let outboundIv = ''

            if (finalPayloadText && publicKeyExchanged) {
              const pack =
                await ChatEncryptionEngine.encryptMessage(finalPayloadText)
              finalPayloadText = pack.ciphertext
              outboundIv = pack.iv
            }

            socket.emit('send_message', {
              sessionId: activeSession.sessionId,
              propertyId: activeSession.propertyId,
              senderType: 'visitor',
              senderId: activeSession.visitorId,
              messageText: finalPayloadText,
              iv: outboundIv,
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