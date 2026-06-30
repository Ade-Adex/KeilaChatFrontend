// // // /app/components/chat/ChatWindow.tsx

// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import { Modal, Button, Group, Text, LoadingOverlay } from '@mantine/core'
// import type {
//   ChatMessage,
//   ChatWindowProps,
//   SessionInitResponse,
//   PopulatedOperator,
//   SafeSessionConfig,
// } from '@/app/types/chat'

// import { getChatSocket } from '@/app/hooks/useChatSocket'
// import ChatHeader from './ChatHeader'
// import ChatMessages from './ChatMessages'
// import ChatInput from './ChatInput'

// export default function ChatWindow({
//   widget,
//   widgetId,
//   visitorTrackingId,
//   onClose,
// }: ChatWindowProps) {
//   const socket = getChatSocket()
//   const typingTimer = useRef<NodeJS.Timeout | null>(null)

//   const [session, setSession] = useState<SafeSessionConfig | null>(null)
//   const [messages, setMessages] = useState<ChatMessage[]>([])
//   const [message, setMessage] = useState('')
//   const [operatorTyping, setOperatorTyping] = useState(false)
//   const [socketOperatorName, setSocketOperatorName] = useState<string>()
//   const [socketOperatorAvatar, setSocketOperatorAvatar] = useState<string>()
//   const [loading, setLoading] = useState(true)

//   const [confirmModalOpen, setConfirmModalOpen] = useState(false)
//   const [isClosing, setIsClosing] = useState(false)

//   let operatorName = socketOperatorName
//   let operatorAvatar = socketOperatorAvatar

//   if (
//     operatorName &&
//     (operatorName.toLowerCase() === 'operator' ||
//       operatorName.toLowerCase() === 'support agent' ||
//       operatorName === 'Above Great Support' ||
//       operatorName.includes('Above Great'))
//   ) {
//     operatorName = undefined
//   }

//   if (session?.assignedOperatorId) {
//     const op = session.assignedOperatorId as unknown as PopulatedOperator
//     if (op && typeof op === 'object') {
//       if (
//         !operatorName &&
//         'firstName' in op &&
//         typeof op.firstName === 'string'
//       ) {
//         operatorName = op.firstName.trim()
//       }
//       if (!operatorAvatar && 'avatar' in op && typeof op.avatar === 'string') {
//         operatorAvatar = op.avatar
//       }
//     }
//   }

//   if (!operatorName) {
//     operatorName = 'Support Agent'
//   }

//   async function initializeConversation(forceNew = false) {
//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sessions/initiate`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             widgetId,
//             visitorTrackingId,
//             createNew: forceNew,
//           }),
//         },
//       )

//       const result: SessionInitResponse = await response.json()
//       if (result.status === 'success' && result.data) {
//         setSession(result.data)
//         if (forceNew) {
//           setMessages([])
//           setSocketOperatorName(undefined)
//           setSocketOperatorAvatar(undefined)
//         }
//       }
//     } catch (error) {
//       console.error('Session initialization failed', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     let isMounted = true
//     const timer = setTimeout(() => {
//       if (isMounted) initializeConversation(false)
//     }, 0)

//     return () => {
//       isMounted = false
//       clearTimeout(timer)
//     }
//   }, [widgetId, visitorTrackingId])

//   useEffect(() => {
//     if (!session?.sessionId || session.status === 'closed') return

//     async function fetchHistory() {
//       try {
//         const response = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/api/v1/messages/session/${session?.sessionId}`,
//           { method: 'GET', headers: { 'Content-Type': 'application/json' } },
//         )
//         const result = await response.json()
//         if (result.status === 'success' && Array.isArray(result.data)) {
//           setMessages(result.data)
//         }
//       } catch (error) {
//         console.error('Failed to load previous chat history:', error)
//       }
//     }
//     fetchHistory()
//   }, [session?.sessionId, session?.status])

//   useEffect(() => {
//     if (!session?.sessionId) return

//     if (!socket.connected) {
//       socket.connect()
//     }

//     socket.emit('join_chat_session', {
//       sessionId: session.sessionId,
//       propertyId: session.propertyId,
//       visitorId: session.visitorId,
//       clientType: 'visitor',
//     })

//     const handleNewMessage = (
//       payload: ChatMessage & { senderAvatar?: string },
//     ) => {
//       setMessages((prev) => {
//         if (!payload._id) return [...prev, payload]
//         if (prev.some((m) => m._id === payload._id)) return prev
//         return [...prev, payload]
//       })

//       if (payload.senderType === 'operator') {
//         setOperatorTyping(false)
//         if (
//           payload.senderName &&
//           payload.senderName.toLowerCase() !== 'operator'
//         ) {
//           setSocketOperatorName(payload.senderName)
//           if (payload.senderAvatar)
//             setSocketOperatorAvatar(payload.senderAvatar)
//         }
//       }
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

//     socket.on('new_message', handleNewMessage)
//     socket.on('user_typing', handleTyping)

//     return () => {
//       socket.off('new_message', handleNewMessage)
//       socket.off('user_typing', handleTyping)
//     }
//   }, [session, socket])

//   async function handleEndChat() {
//     if (!session?.sessionId) return
//     setIsClosing(true)
//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/${session.sessionId}/close`,
//         {
//           method: 'PATCH',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ closedBy: 'visitor' }),
//         },
//       )
//       const result = await response.json()
//       if (result.status === 'success') {
//         setSession((prev) => (prev ? { ...prev, status: 'closed' } : null))
//         setConfirmModalOpen(false)
//         onClose()
//       }
//     } catch (error) {
//       console.error('Error closing conversation thread:', error)
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
//         isSessionActive={session?.status !== 'closed'}
//         onOpenEndModal={() => setConfirmModalOpen(true)}
//         onStartNewChat={() => initializeConversation(true)}
//         onClose={onClose}
//         onVisitorProfileUpdated={(name, email) => {
//           // 🎯 Emit updated profile immediately over the socket tunnel to active operator rooms
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
//             messages={messages}
//             operatorTyping={operatorTyping}
//           />
//         )}
//       </div>

//       {!loading && session?.status !== 'closed' && (
//         <ChatInput
//           value={message}
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
//           onSend={() => {
//             if (!message.trim() || !session) return
//             socket.emit('send_message', {
//               sessionId: session.sessionId,
//               propertyId: session.propertyId,
//               senderType: 'visitor',
//               senderId: session.visitorId,
//               messageText: message.trim(),
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

'use client'

import { useEffect, useRef, useState } from 'react'
import { Modal, Button, Group, Text, LoadingOverlay } from '@mantine/core'
import type {
  ChatMessage,
  ChatWindowProps,
  SessionInitResponse,
  PopulatedOperator,
  SafeSessionConfig,
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

  const currentUnreadRef = useRef<number>(0)
  // 🎯 Use a state mirror to ensure runtime code references current layout bounds perfectly
  const [isCurrentlyMinimized, setIsCurrentlyMinimized] = useState(true)

  const [session, setSession] = useState<SafeSessionConfig | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [message, setMessage] = useState('')
  const [operatorTyping, setOperatorTyping] = useState(false)
  const [socketOperatorName, setSocketOperatorName] = useState<string>()
  const [socketOperatorAvatar, setSocketOperatorAvatar] = useState<string>()
  const [loading, setLoading] = useState(true)

  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  let operatorName = socketOperatorName
  let operatorAvatar = socketOperatorAvatar

  if (
    operatorName &&
    (operatorName.toLowerCase() === 'operator' ||
      operatorName.toLowerCase() === 'support agent' ||
      operatorName === 'Above Great Support' ||
      operatorName.includes('Above Great'))
  ) {
    operatorName = undefined
  }

  if (session?.assignedOperatorId) {
    const op = session.assignedOperatorId as unknown as PopulatedOperator
    if (op && typeof op === 'object') {
      if (
        !operatorName &&
        'firstName' in op &&
        typeof op.firstName === 'string'
      ) {
        operatorName = op.firstName.trim()
      }
      if (!operatorAvatar && 'avatar' in op && typeof op.avatar === 'string') {
        operatorAvatar = op.avatar
      }
    }
  }

  if (!operatorName) {
    operatorName = 'Support Agent'
  }

  async function initializeConversation(forceNew = false) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sessions/initiate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            widgetId,
            visitorTrackingId,
            createNew: forceNew,
          }),
        },
      )

      const result: SessionInitResponse = await response.json()
      if (result.status === 'success' && result.data) {
        setSession(result.data)
        if (forceNew) {
          setMessages([])
          setSocketOperatorName(undefined)
          setSocketOperatorAvatar(undefined)
        }
      }
    } catch (error) {
      console.error('Session initialization failed', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    const timer = setTimeout(() => {
      if (isMounted) initializeConversation(false)
    }, 0)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [widgetId, visitorTrackingId])

  useEffect(() => {
    if (!session?.sessionId || session.status === 'closed') return

    async function fetchHistory() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/messages/session/${session?.sessionId}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } },
        )
        const result = await response.json()
        if (result.status === 'success' && Array.isArray(result.data)) {
          setMessages(result.data)
        }
      } catch (error) {
        console.error('Failed to load previous chat history:', error)
      }
    }
    fetchHistory()
  }, [session?.sessionId, session?.status])

  // 🎯 Combined viewport listener to determine layout state accurately
  useEffect(() => {
    const handleResizeCheck = () => {
      // Browsers match small dimensions up to 66px inside standalone widget layouts
      const minimized = window.innerWidth <= 66 || window.innerHeight <= 66
      setIsCurrentlyMinimized(minimized)

      if (!minimized) {
        currentUnreadRef.current = 0
        window.parent.postMessage({ type: 'UNREAD_RESET' }, '*')
      }
    }

    window.addEventListener('resize', handleResizeCheck)
    handleResizeCheck()

    return () => window.removeEventListener('resize', handleResizeCheck)
  }, [])

  useEffect(() => {
    if (!session?.sessionId) return

    if (!socket.connected) {
      socket.connect()
    }

    socket.emit('join_chat_session', {
      sessionId: session.sessionId,
      propertyId: session.propertyId,
      visitorId: session.visitorId,
      clientType: 'visitor',
    })

    const handleNewMessage = (
      payload: ChatMessage & { senderAvatar?: string },
    ) => {
      setMessages((prev) => {
        if (!payload._id) return [...prev, payload]
        if (prev.some((m) => m._id === payload._id)) return prev
        return [...prev, payload]
      })

      if (payload.senderType === 'operator' || payload.senderType === 'ai') {
        setOperatorTyping(false)

        // 🎯 Evaluates state from the synchronized state variable instead of direct window size operations
        if (isCurrentlyMinimized) {
          currentUnreadRef.current += 1

          // 1. Send count value to parent script context
          window.parent.postMessage(
            { type: 'UNREAD_UPDATE', count: currentUnreadRef.current },
            '*',
          )

          // 2. 🔊 Execute sound track playback sequence
          if (widget?.widgetSettings?.soundEnabled) {
            try {
              const audio = new Audio('/sound/notification.wav')
              audio.volume = 0.7

              const playPromise = audio.play()
              if (playPromise !== undefined) {
                playPromise.catch((err) => {
                  console.warn(
                    '[KeilaChat] Audio playback deferred until user engagement:',
                    err,
                  )
                })
              }
            } catch (audioError) {
              console.error(
                '[KeilaChat] HTML5 Audio runtime issue:',
                audioError,
              )
            }
          }
        }

        if (
          payload.senderName &&
          payload.senderName.toLowerCase() !== 'operator'
        ) {
          setSocketOperatorName(payload.senderName)
          if (payload.senderAvatar)
            setSocketOperatorAvatar(payload.senderAvatar)
        }
      }
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

    socket.on('new_message', handleNewMessage)
    socket.on('user_typing', handleTyping)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('user_typing', handleTyping)
    }
  }, [session, socket, isCurrentlyMinimized, widget]) // 🎯 Added dependencies to ensure effect re-binds on layout adjustments

  async function handleEndChat() {
    if (!session?.sessionId) return
    setIsClosing(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/${session.sessionId}/close`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ closedBy: 'visitor' }),
        },
      )
      const result = await response.json()
      if (result.status === 'success') {
        setSession((prev) => (prev ? { ...prev, status: 'closed' } : null))
        setConfirmModalOpen(false)
        onClose()
      }
    } catch (error) {
      console.error('Error closing conversation thread:', error)
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

      {!loading && session?.status !== 'closed' && (
        <ChatInput
          value={message}
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
          onSend={() => {
            if (!message.trim() || !session) return
            socket.emit('send_message', {
              sessionId: session.sessionId,
              propertyId: session.propertyId,
              senderType: 'visitor',
              senderId: session.visitorId,
              messageText: message.trim(),
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