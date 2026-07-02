// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import MessageFeed from './MessageFeed'
// import OperatorInput from './OperatorInput'
// import { getSessionMessages } from '@/app/lib/api/chat.api'
// import { getChatSocket } from '@/app/hooks/useChatSocket'
// import type { OperatorConversation, ChatMessage } from '@/app/types/dashboard'
// import TypingIndicator from '@/app/components/TypingIndicator'
// import { useAuthStore } from '@/app/store/useAuthStore'

// interface OperatorWorkspaceProps {
//   session: OperatorConversation
// }

// interface MessageStatusPayload {
//   messageId: string
//   status: 'sent' | 'delivered' | 'seen' | 'failed'
//   sessionId: string
// }

// interface MessagesSeenPayload {
//   sessionId: string
//   reader: 'visitor' | 'operator'
// }

// export default function OperatorWorkspace({ session }: OperatorWorkspaceProps) {
//   const [messages, setMessages] = useState<ChatMessage[]>([])
//   const [loading, setLoading] = useState(true)
//   const [visitorTyping, setVisitorTyping] = useState(false)
//   const typingTimeout = useRef<NodeJS.Timeout | null>(null)

//   const user = useAuthStore((state) => state.operator)

//   const socket = getChatSocket()
//   const currentSessionId = session._id

//   useEffect(() => {
//     if (!socket.connected) socket.connect()
//   }, [socket])

//   // Load Room Message Thread Logs + Handle Seen Status Syncs Loop
//   useEffect(() => {
//     let mounted = true
//     const fetchMessages = async () => {
//       try {
//         setLoading(true)
//         const result = await getSessionMessages(currentSessionId)
//         if (!mounted) return

//         const fetchedMsgs: ChatMessage[] = Array.isArray(result.data)
//           ? result.data
//           : []
//         setMessages(fetchedMsgs)

//         // 🎯 Instantly clear pending unseen visitor logs because the operator workspace window is open
//         const possessesUnread = fetchedMsgs.some(
//           (m) => m.senderType === 'visitor' && m.status !== 'seen',
//         )
//         if (possessesUnread && socket.connected) {
//           socket.emit('mark_session_seen', {
//             sessionId: currentSessionId,
//             clientType: 'operator',
//           })
//         }
//       } catch (error) {
//         console.error('❌ Failed fetching thread historical context:', error)
//       } finally {
//         if (mounted) setLoading(false)
//       }
//     }
//     void fetchMessages()
//     return () => {
//       mounted = false
//     }
//   }, [currentSessionId, socket])

//   // Isolate Socket Namespace Room Tunnels
//   useEffect(() => {
//     if (!socket.connected) socket.connect()

//     const propertyId =
//       typeof session.propertyId === 'string'
//         ? session.propertyId
//         : session.propertyId?._id

//     const visitorId =
//       typeof session.visitorId === 'string'
//         ? session.visitorId
//         : session.visitorId?._id

//     // Join the chat room channel
//     socket.emit('join_chat_session', {
//       sessionId: currentSessionId,
//       propertyId,
//       visitorId,
//       operatorId: user?._id || session.assignedOperatorId,
//       clientType: 'operator',
//     })

//     // Read Receipt trigger: Emit when operator joins/opens workspace channel
//     socket.emit('mark_session_seen', {
//       sessionId: currentSessionId,
//       clientType: 'operator',
//     })
//   }, [session, currentSessionId, socket, user?._id])

//   useEffect(() => {
//     const handleMessage = (message: ChatMessage) => {
//       const incomingSessionId =
//         message.sessionId &&
//         typeof message.sessionId === 'object' &&
//         '_id' in message.sessionId
//           ? (message.sessionId as { _id: string })._id
//           : (message.sessionId as string)

//       if (incomingSessionId !== currentSessionId) return

//       setMessages((prev) => {
//         const isDuplicate = prev.some((m) => m._id === message._id)
//         if (isDuplicate) return prev
//         return [...prev, message]
//       })

//       // 🎯 Instantly raise seen broadcast receipt flags since workspace panel view is prioritized open
//       if (message.senderType === 'visitor') {
//         socket.emit('mark_session_seen', {
//           sessionId: currentSessionId,
//           clientType: 'operator',
//         })
//       }
//     }

//     const handleTyping = (payload: {
//       sessionId: string | { _id: string }
//       isTyping: boolean
//       actor?: string
//     }) => {
//       const incomingSessionId =
//         payload.sessionId &&
//         typeof payload.sessionId === 'object' &&
//         '_id' in payload.sessionId
//           ? (payload.sessionId as { _id: string })._id
//           : (payload.sessionId as string)

//       if (incomingSessionId !== currentSessionId) return
//       if (payload.actor === 'operator') return

//       setVisitorTyping(payload.isTyping)

//       if (typingTimeout.current) clearTimeout(typingTimeout.current)
//       if (payload.isTyping) {
//         typingTimeout.current = setTimeout(() => setVisitorTyping(false), 3500)
//       }
//     }

//     const handleStatusUpdated = (data: MessageStatusPayload) => {
//       if (data.sessionId !== currentSessionId) return
//       setMessages((prev) =>
//         prev.map((m) =>
//           m._id === data.messageId ? { ...m, status: data.status } : m,
//         ),
//       )
//     }

//     const handleMessagesSeen = (data: MessagesSeenPayload) => {
//       if (data.sessionId !== currentSessionId) return
//       if (data.reader === 'visitor') {
//         setMessages((prev) =>
//           prev.map((m) =>
//             m.senderType === 'operator' || m.senderType === 'ai'
//               ? { ...m, status: 'seen' }
//               : m,
//           ),
//         )
//       }
//     }

//     socket.on('new_message', handleMessage)
//     socket.on('user_typing', handleTyping)
//     socket.on('message_status_updated', handleStatusUpdated)
//     socket.on('messages_seen', handleMessagesSeen)

//     return () => {
//       socket.off('new_message', handleMessage)
//       socket.off('user_typing', handleTyping)
//       socket.off('message_status_updated', handleStatusUpdated)
//       socket.off('messages_seen', handleMessagesSeen)
//       if (typingTimeout.current) clearTimeout(typingTimeout.current)
//     }
//   }, [currentSessionId, socket])

//   const visitorName =
//     typeof session.visitorId === 'object' && session.visitorId?.name
//       ? session.visitorId.name
//       : 'Anonymous Visitor'

//   if (loading) {
//     return (
//       <div className="flex h-full flex-col items-center justify-center bg-background/30 space-y-3">
//         <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
//         <span className="text-xs font-medium text-muted-foreground tracking-wide">
//           Opening secure chat workspace...
//         </span>
//       </div>
//     )
//   }

//   return (
//     <div className="flex h-full flex-col bg-background/40 relative">
//       <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/50 px-4 backdrop-blur-sm">
//         <div className="min-w-0">
//           <h2 className="text-sm font-semibold text-foreground truncate tracking-tight">
//             {visitorName}
//           </h2>
//           <div className="flex items-center gap-1.5 mt-0.5">
//             <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
//             <span className="text-[11px] font-medium capitalize text-muted-foreground tracking-wide">
//               {session.status} Thread
//             </span>
//           </div>
//         </div>
//       </div>

//       <div className="flex-1 overflow-hidden relative">
//         <MessageFeed messages={messages} loading={false} />
//       </div>

//       <div className="relative z-10 bg-linear-to-t from-background via-background/90 to-transparent pt-4">
//         {visitorTyping && <TypingIndicator />}
//         <OperatorInput sessionId={currentSessionId} />
//       </div>
//     </div>
//   )
// }

'use client'

import { useEffect, useRef, useState } from 'react'
import MessageFeed from './MessageFeed'
import OperatorInput from './OperatorInput'
import { getSessionMessages, getActiveOperators } from '@/app/lib/api/chat.api'
import { getChatSocket } from '@/app/hooks/useChatSocket'
import type { OperatorConversation, ChatMessage } from '@/app/types/dashboard'
import TypingIndicator from '@/app/components/TypingIndicator'
import { useAuthStore } from '@/app/store/useAuthStore'
import { FiShuffle, FiUserPlus } from 'react-icons/fi'

interface OperatorWorkspaceProps {
  session: OperatorConversation
}

interface MessageStatusPayload {
  messageId: string
  status: 'sent' | 'delivered' | 'seen' | 'failed'
  sessionId: string
}

interface MessagesSeenPayload {
  sessionId: string
  reader: 'visitor' | 'operator'
}

interface OperatorTeammate {
  _id: string
  firstName: string
  lastName?: string
}

export default function OperatorWorkspace({ session }: OperatorWorkspaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [visitorTyping, setVisitorTyping] = useState(false)
  const [operators, setOperators] = useState<OperatorTeammate[]>([])
  const [showTransferDropdown, setShowTransferDropdown] = useState(false)

  const typingTimeout = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const user = useAuthStore((state) => state.operator)
  const socket = getChatSocket()
  const currentSessionId = session._id

  useEffect(() => {
    if (!socket.connected) socket.connect()
  }, [socket])

  // Fetch available operator teammates when the transfer list dropdown opens
  useEffect(() => {
    if (!showTransferDropdown) return

    const fetchTeammates = async () => {
      try {
        const response = await getActiveOperators()
        const teammates = (response?.data || []).filter(
          (op: OperatorTeammate) => op._id !== user?._id,
        )
        setOperators(teammates)
      } catch (error) {
        console.error('❌ Failed fetching operator teammates:', error)
      }
    }
    void fetchTeammates()
  }, [showTransferDropdown, user?._id])

  // Close the transfer dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowTransferDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load Room Message Thread Logs + Handle Seen Status Syncs Loop
  useEffect(() => {
    let mounted = true
    const fetchMessages = async () => {
      try {
        setLoading(true)
        const result = await getSessionMessages(currentSessionId)
        if (!mounted) return

        const fetchedMsgs: ChatMessage[] = Array.isArray(result?.data)
          ? result.data
          : []
        setMessages(fetchedMsgs)

        // Instantly clear pending unseen visitor logs because the operator workspace window is open
        const possessesUnread = fetchedMsgs.some(
          (m) => m.senderType === 'visitor' && m.status !== 'seen',
        )
        if (possessesUnread && socket.connected) {
          socket.emit('mark_session_seen', {
            sessionId: currentSessionId,
            clientType: 'operator',
          })
        }
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
  }, [currentSessionId, socket])

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

    // Join the chat room channel
    socket.emit('join_chat_session', {
      sessionId: currentSessionId,
      propertyId,
      visitorId,
      operatorId: user?._id || session.assignedOperatorId,
      clientType: 'operator',
    })

    // Read Receipt trigger: Emit when operator joins/opens workspace channel
    socket.emit('mark_session_seen', {
      sessionId: currentSessionId,
      clientType: 'operator',
    })
  }, [session, currentSessionId, socket, user?._id])

  useEffect(() => {
    const handleMessage = (message: ChatMessage) => {
      const incomingSessionId =
        message.sessionId &&
        typeof message.sessionId === 'object' &&
        '_id' in message.sessionId
          ? (message.sessionId as { _id: string })._id
          : (message.sessionId as string)

      if (incomingSessionId !== currentSessionId) return

      setMessages((prev) => {
        const isDuplicate = prev.some((m) => m._id === message._id)
        if (isDuplicate) return prev
        return [...prev, message]
      })

      // Instantly raise seen broadcast receipt flags since workspace panel view is prioritized open
      if (message.senderType === 'visitor') {
        socket.emit('mark_session_seen', {
          sessionId: currentSessionId,
          clientType: 'operator',
        })
      }
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
      if (payload.actor === 'operator') return

      setVisitorTyping(payload.isTyping)

      if (typingTimeout.current) clearTimeout(typingTimeout.current)
      if (payload.isTyping) {
        typingTimeout.current = setTimeout(() => setVisitorTyping(false), 3500)
      }
    }

    const handleStatusUpdated = (data: MessageStatusPayload) => {
      if (data.sessionId !== currentSessionId) return
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId ? { ...m, status: data.status } : m,
        ),
      )
    }

    const handleMessagesSeen = (data: MessagesSeenPayload) => {
      if (data.sessionId !== currentSessionId) return
      if (data.reader === 'visitor') {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderType === 'operator' || m.senderType === 'ai'
              ? { ...m, status: 'seen' }
              : m,
          ),
        )
      }
    }

    socket.on('new_message', handleMessage)
    socket.on('user_typing', handleTyping)
    socket.on('message_status_updated', handleStatusUpdated)
    socket.on('messages_seen', handleMessagesSeen)

    return () => {
      socket.off('new_message', handleMessage)
      socket.off('user_typing', handleTyping)
      socket.off('message_status_updated', handleStatusUpdated)
      socket.off('messages_seen', handleMessagesSeen)
      if (typingTimeout.current) clearTimeout(typingTimeout.current)
    }
  }, [currentSessionId, socket])

  const handleTransferChat = (targetOperatorId: string) => {
    socket.emit('transfer_chat_session', {
      sessionId: currentSessionId,
      targetOperatorId,
    })
    setShowTransferDropdown(false)
  }

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
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/50 px-4 backdrop-blur-sm relative z-30">
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

        {/* Dynamic Chat Transfer Component Action Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowTransferDropdown(!showTransferDropdown)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all px-2.5 py-1.5 rounded-lg bg-muted/60 hover:bg-muted"
          >
            <FiShuffle size={13} />
            <span>Transfer</span>
          </button>

          {showTransferDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-xl text-foreground animate-in fade-in zoom-in-95 duration-150">
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1">
                Transfer to Teammate
              </p>
              <div className="mt-1 max-h-40 overflow-y-auto space-y-0.5">
                {operators.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic px-2 py-1.5">
                    No other online agents
                  </p>
                ) : (
                  operators.map((op) => (
                    <button
                      key={op._id}
                      onClick={() => handleTransferChat(op._id)}
                      className="w-full text-left px-2 py-1.5 text-xs font-medium rounded-lg hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                    >
                      <FiUserPlus size={12} />
                      <span>
                        {op.firstName} {op.lastName ?? ''}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <MessageFeed messages={messages} loading={false} />
      </div>

      <div className="relative z-10 bg-linear-to-t from-background via-background/90 to-transparent pt-4">
        {visitorTyping && <TypingIndicator />}
        <OperatorInput sessionId={currentSessionId} />
      </div>
    </div>
  )
}