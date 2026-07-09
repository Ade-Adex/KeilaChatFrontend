// // /app/components/operator/OperatorWorkspace.tsx

// 'use client'

// import TypingIndicator from '@/app/components/TypingIndicator'
// import { getChatSocket } from '@/app/hooks/useChatSocket'
// import {
//   closeSession,
//   getActiveOperators,
//   getSessionMessages,
// } from '@/app/lib/api/chat.api'
// import { useAuthStore } from '@/app/store/useAuthStore'
// import type { ChatMessage, OperatorConversation } from '@/app/types/dashboard'
// import { useEffect, useRef, useState } from 'react'
// import {
//   FiAlertTriangle,
//   FiShuffle,
//   FiUserPlus,
//   FiXCircle,
// } from 'react-icons/fi'
// import MessageFeed from './MessageFeed'
// import OperatorInput from './OperatorInput'

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

// interface OperatorTeammate {
//   _id: string
//   firstName: string
//   lastName?: string
// }

// interface StructuralVisitorWrapper {
//   visitorId?: {
//     name?: string
//   }
// }

// export default function OperatorWorkspace({ session }: OperatorWorkspaceProps) {
//   const [messages, setMessages] = useState<ChatMessage[]>([])
//   const [loading, setLoading] = useState(true)
//   const [visitorTyping, setVisitorTyping] = useState(false)
//   const [operators, setOperators] = useState<OperatorTeammate[]>([])
//   const [loadingOperators, setLoadingOperators] = useState(false)
//   const [showTransferDropdown, setShowTransferDropdown] = useState(false)
//   const [isTerminating, setIsTerminating] = useState(false)
//   const [showEndModal, setShowEndModal] = useState(false) // 🎯 Custom Modal visibility state

//   const typingTimeout = useRef<NodeJS.Timeout | null>(null)
//   const dropdownRef = useRef<HTMLDivElement>(null)

//   const user = useAuthStore((state) => state.operator)
//   const socket = getChatSocket()
//   const currentSessionId = session._id
//   const [sessionStatus, setSessionStatus] = useState(session.status)

//   useEffect(() => {
//     if (!socket.connected) socket.connect()
//   }, [socket])

//   useEffect(() => {
//     if (!showTransferDropdown) return

//     const fetchTeammates = async () => {
//       try {
//         setLoadingOperators(true) // 🎯 START LOADING
//         const response = await getActiveOperators()
//         const teammates = (response?.data || []).filter(
//           (op: OperatorTeammate) => op._id !== user?._id,
//         )
//         setOperators(teammates)
//       } catch (error) {
//         console.error('❌ Failed fetching operator teammates:', error)
//       } finally {
//         setLoadingOperators(false) // 🎯 STOP LOADING
//       }
//     }
//     void fetchTeammates()
//   }, [showTransferDropdown, user?._id])

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setShowTransferDropdown(false)
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside)
//     return () => document.removeEventListener('mousedown', handleClickOutside)
//   }, [])

//   useEffect(() => {
//     let mounted = true
//     const fetchMessages = async () => {
//       try {
//         setLoading(true)
//         const result = await getSessionMessages(currentSessionId)
//         if (!mounted) return

//         const fetchedMsgs: ChatMessage[] = Array.isArray(result?.data)
//           ? result.data
//           : []
//         setMessages(fetchedMsgs)

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

//     socket.emit('join_chat_session', {
//       sessionId: currentSessionId,
//       propertyId,
//       visitorId,
//       operatorId: user?._id || session.assignedOperatorId,
//       clientType: 'operator',
//     })

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

//     const handleSessionStatusChanged = (payload: {
//       sessionId: string
//       status: string
//     }) => {
//       if (payload.sessionId !== currentSessionId) return
//       setSessionStatus(payload.status as OperatorConversation['status'])
//     }

//     socket.on('new_message', handleMessage)
//     socket.on('user_typing', handleTyping)
//     socket.on('message_status_updated', handleStatusUpdated)
//     socket.on('messages_seen', handleMessagesSeen)
//     socket.on('session_status_changed', handleSessionStatusChanged)

//     return () => {
//       socket.off('new_message', handleMessage)
//       socket.off('user_typing', handleTyping)
//       socket.off('message_status_updated', handleStatusUpdated)
//       socket.off('messages_seen', handleMessagesSeen)
//       socket.off('session_status_changed', handleSessionStatusChanged)
//       if (typingTimeout.current) clearTimeout(typingTimeout.current)
//     }
//   }, [currentSessionId, socket, session])

//   const handleTransferChat = (targetOperatorId: string) => {
//     socket.emit('transfer_chat_session', {
//       sessionId: currentSessionId,
//       targetOperatorId,
//     })
//     setShowTransferDropdown(false)
//   }

//   const handleEndChatSession = async () => {
//     setIsTerminating(true)
//     try {
//       await closeSession(currentSessionId, 'operator')
//       setShowEndModal(false)
//     } catch (error) {
//       console.error('❌ Failed terminating channel sequence:', error)
//     } finally {
//       setIsTerminating(false)
//     }
//   }

//   const getVisitorDisplayName = () => {
//     const fallback = 'Anonymous Visitor'
//     if (!session.visitorId) return fallback

//     if (typeof session.visitorId === 'object') {
//       if ('name' in session.visitorId && session.visitorId.name) {
//         return session.visitorId.name
//       }
//       const structuredData = session.visitorId as StructuralVisitorWrapper
//       if (structuredData.visitorId?.name) {
//         return structuredData.visitorId.name
//       }
//     }
//     return fallback
//   }

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
//       <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/50 px-4 backdrop-blur-sm relative z-30">
//         <div className="min-w-0">
//           <h2 className="text-sm font-semibold text-foreground truncate tracking-tight">
//             {getVisitorDisplayName()}
//           </h2>
//           <div className="flex items-center gap-1.5 mt-0.5">
//             <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
//             <span className="text-[11px] font-medium capitalize text-muted-foreground tracking-wide">
//               {sessionStatus} Thread
//             </span>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           {/* 🎯 Trigger Custom Confirmation Modal instead of window.confirm */}
//           <button
//             onClick={() => setShowEndModal(true)}
//             className="inline-flex items-center gap-1.5 text-xs! font-semibold text-rose-500 hover:text-rose-600 transition-all px-2.5 py-1.5 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer border border-rose-500/20"
//           >
//             <FiXCircle size={13} />
//             <span>End Chat</span>
//           </button>

//           <div className="relative" ref={dropdownRef}>
//             <button
//               onClick={() => setShowTransferDropdown(!showTransferDropdown)}
//               className="inline-flex items-center gap-1.5 text-xs! font-semibold text-muted-foreground hover:text-foreground transition-all px-2.5 py-1.5 rounded-lg bg-muted/60 hover:bg-muted cursor-pointer border border-border"
//             >
//               <FiShuffle size={13} />
//               <span>Transfer</span>
//             </button>

//             {showTransferDropdown && (
//               <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-xl text-foreground animate-in fade-in zoom-in-95 duration-150">
//                 <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1">
//                   Transfer to Teammate
//                 </p>
//                 <div className="mt-1 max-h-40 overflow-y-auto space-y-0.5">
//                   {/* 🎯 CONDITION 1: Display spinner while backend sync runs */}
//                   {loadingOperators ? (
//                     <div className="flex items-center gap-2 px-2 py-2 text-[11px] text-muted-foreground font-medium">
//                       <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
//                       <span>Fetching operators...</span>
//                     </div>
//                   ) : operators.length === 0 ? (
//                     <p className="text-[11px] text-muted-foreground italic px-2 py-1.5">
//                       No other online agents
//                     </p>
//                   ) : (
//                     operators.map((op) => (
//                       <button
//                         key={op._id}
//                         onClick={() => handleTransferChat(op._id)}
//                         className="w-full text-left px-2 py-1.5 text-xs font-medium rounded-lg hover:bg-primary hover:text-white transition-all flex items-center gap-2 cursor-pointer"
//                       >
//                         <FiUserPlus size={12} />
//                         <span>
//                           {op.firstName} {op.lastName ?? ''}
//                         </span>
//                       </button>
//                     ))
//                   )}
//                 </div>
//               </div>
//             )}
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

//       {/* 🎯 CUSTOM MODAL POPUP DIALOG */}
//       {showEndModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
//           <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl text-foreground animate-in scale-in-95 duration-200">
//             <div className="flex items-start gap-3">
//               <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 shrink-0">
//                 <FiAlertTriangle size={20} />
//               </div>
//               <div className="space-y-1">
//                 <h3 className="text-sm font-semibold tracking-tight">
//                   Terminate Session?
//                 </h3>
//                 <p className="text-xs text-muted-foreground leading-normal">
//                   Are you sure you want to end this live chat thread with{' '}
//                   <span className="font-semibold text-foreground">
//                     {getVisitorDisplayName()}
//                   </span>
//                   ? This action is permanent.
//                 </p>
//               </div>
//             </div>

//             <div className="mt-5 flex items-center justify-end gap-2">
//               <button
//                 onClick={() => setShowEndModal(false)}
//                 disabled={isTerminating}
//                 className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-all cursor-pointer disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleEndChatSession}
//                 disabled={isTerminating}
//                 className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
//               >
//                 {isTerminating ? 'Ending...' : 'End Chat'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }












// /app/components/operator/OperatorWorkspace.tsx

'use client'

import TypingIndicator from '@/app/components/TypingIndicator'
import { getChatSocket } from '@/app/hooks/useChatSocket'
import {
  closeSession,
  getActiveOperators,
  getSessionMessages,
} from '@/app/lib/api/chat.api'
import { useAuthStore } from '@/app/store/useAuthStore'
import type { ChatMessage, OperatorConversation } from '@/app/types/dashboard'
import { useEffect, useRef, useState } from 'react'
import {
  FiAlertTriangle,
  FiShuffle,
  FiUserPlus,
  FiXCircle,
} from 'react-icons/fi'
import MessageFeed from './MessageFeed'
import OperatorInput from './OperatorInput'

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

interface StructuralVisitorWrapper {
  visitorId?: {
    name?: string
  }
}

export default function OperatorWorkspace({ session }: OperatorWorkspaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [visitorTyping, setVisitorTyping] = useState(false)
  const [operators, setOperators] = useState<OperatorTeammate[]>([])
  const [loadingOperators, setLoadingOperators] = useState(false)
  const [showTransferDropdown, setShowTransferDropdown] = useState(false)
  const [isTerminating, setIsTerminating] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false) // 🎯 Custom Modal visibility state

  const typingTimeout = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const user = useAuthStore((state) => state.operator)
  const socket = getChatSocket()
  const currentSessionId = session._id
  const [sessionStatus, setSessionStatus] = useState(session.status)

  useEffect(() => {
    if (!socket.connected) socket.connect()
  }, [socket])

  useEffect(() => {
    if (!showTransferDropdown) return

    const fetchTeammates = async () => {
      try {
        setLoadingOperators(true) // 🎯 START LOADING
        const response = await getActiveOperators()
        const teammates = (response?.data || []).filter(
          (op: OperatorTeammate) => op._id !== user?._id,
        )
        setOperators(teammates)
      } catch (error) {
        console.error('❌ Failed fetching operator teammates:', error)
      } finally {
        setLoadingOperators(false) // 🎯 STOP LOADING
      }
    }
    void fetchTeammates()
  }, [showTransferDropdown, user?._id])

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

    socket.emit('join_chat_session', {
      sessionId: currentSessionId,
      propertyId,
      visitorId,
      operatorId: user?._id || session.assignedOperatorId,
      clientType: 'operator',
    })

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

    const handleSessionStatusChanged = (payload: {
      sessionId: string
      status: string
    }) => {
      if (payload.sessionId !== currentSessionId) return
      setSessionStatus(payload.status as OperatorConversation['status'])
    }

    socket.on('new_message', handleMessage)
    socket.on('user_typing', handleTyping)
    socket.on('message_status_updated', handleStatusUpdated)
    socket.on('messages_seen', handleMessagesSeen)
    socket.on('session_status_changed', handleSessionStatusChanged)

    return () => {
      socket.off('new_message', handleMessage)
      socket.off('user_typing', handleTyping)
      socket.off('message_status_updated', handleStatusUpdated)
      socket.off('messages_seen', handleMessagesSeen)
      socket.off('session_status_changed', handleSessionStatusChanged)
      if (typingTimeout.current) clearTimeout(typingTimeout.current)
    }
  }, [currentSessionId, socket, session])

  const handleTransferChat = (targetOperatorId: string) => {
    socket.emit('transfer_chat_session', {
      sessionId: currentSessionId,
      targetOperatorId,
    })
    setShowTransferDropdown(false)
  }

  const handleEndChatSession = async () => {
    setIsTerminating(true)
    try {
      await closeSession(currentSessionId, 'operator')
      setShowEndModal(false)
    } catch (error) {
      console.error('❌ Failed terminating channel sequence:', error)
    } finally {
      setIsTerminating(false)
    }
  }

  const getVisitorDisplayName = () => {
    const fallback = 'Anonymous Visitor'
    if (!session.visitorId) return fallback

    if (typeof session.visitorId === 'object') {
      if ('name' in session.visitorId && session.visitorId.name) {
        return session.visitorId.name
      }
      const structuredData = session.visitorId as StructuralVisitorWrapper
      if (structuredData.visitorId?.name) {
        return structuredData.visitorId.name
      }
    }
    return fallback
  }

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
            {getVisitorDisplayName()}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium capitalize text-muted-foreground tracking-wide">
              {sessionStatus} Thread
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 🎯 Trigger Custom Confirmation Modal instead of window.confirm */}
          <button
            onClick={() => setShowEndModal(true)}
            className="inline-flex items-center gap-1.5 text-xs! font-semibold text-rose-500 hover:text-rose-600 transition-all px-2.5 py-1.5 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer border border-rose-500/20"
          >
            <FiXCircle size={13} />
            <span>End Chat</span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowTransferDropdown(!showTransferDropdown)}
              className="inline-flex items-center gap-1.5 text-xs! font-semibold text-muted-foreground hover:text-foreground transition-all px-2.5 py-1.5 rounded-lg bg-muted/60 hover:bg-muted cursor-pointer border border-border"
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
                  {/* 🎯 CONDITION 1: Display spinner while backend sync runs */}
                  {loadingOperators ? (
                    <div className="flex items-center gap-2 px-2 py-2 text-[11px] text-muted-foreground font-medium">
                      <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
                      <span>Fetching operators...</span>
                    </div>
                  ) : operators.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground italic px-2 py-1.5">
                      No other online agents
                    </p>
                  ) : (
                    operators.map((op) => (
                      <button
                        key={op._id}
                        onClick={() => handleTransferChat(op._id)}
                        className="w-full text-left px-2 py-1.5 text-xs font-medium rounded-lg hover:bg-primary hover:text-white transition-all flex items-center gap-2 cursor-pointer"
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
      </div>

      <div className="flex-1 overflow-hidden relative">
        <MessageFeed messages={messages} loading={false} />
      </div>

      <div className="relative z-10 bg-linear-to-t from-background via-background/90 to-transparent pt-4">
        {visitorTyping && <TypingIndicator />}
        <OperatorInput sessionId={currentSessionId} />
      </div>

      {/* 🎯 CUSTOM MODAL POPUP DIALOG */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl text-foreground animate-in scale-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 shrink-0">
                <FiAlertTriangle size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold tracking-tight">
                  Terminate Session?
                </h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  Are you sure you want to end this live chat thread with{' '}
                  <span className="font-semibold text-foreground">
                    {getVisitorDisplayName()}
                  </span>
                  ? This action is permanent.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowEndModal(false)}
                disabled={isTerminating}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEndChatSession}
                disabled={isTerminating}
                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isTerminating ? 'Ending...' : 'End Chat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}