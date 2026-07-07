// // /components/operator/ConversationSidebar.tsx

// 'use client'

// import { useEffect, useState } from 'react'
// import {
//   getQueuedSessions,
//   getActiveSessions,
//   getMySessions,
//   getMyProperties,
// } from '@/app/lib/api/chat.api'
// import { getChatSocket } from '@/app/hooks/useChatSocket'
// import { useAuthStore } from '@/app/store/useAuthStore'
// import { FiUser, FiActivity, FiLayers } from 'react-icons/fi'
// import type { OperatorConversation, ChatMessage } from '@/app/types/dashboard'

// interface ConversationSidebarProps {
//   selectedConversation: OperatorConversation | null
//   onSelect: (conversation: OperatorConversation | null) => void
//   refreshKey?: number
// }

// interface WithId {
//   _id: string
// }
// interface NestedVisitorStructure {
//   visitorId?: {
//     name?: string
//   }
// }

// function isPopulatedWithId(obj: unknown): obj is WithId {
//   return typeof obj === 'object' && obj !== null && '_id' in obj
// }

// export default function ConversationSidebar({
//   selectedConversation,
//   onSelect,
//   refreshKey = 0,
// }: ConversationSidebarProps) {
//   const [queuedChats, setQueuedChats] = useState<OperatorConversation[]>([])
//   const [activeChats, setActiveChats] = useState<OperatorConversation[]>([])
//   const [myChats, setMyChats] = useState<OperatorConversation[]>([])
//   const [loading, setLoading] = useState(true)

//   const socket = getChatSocket()
//   const currentOperator = useAuthStore((state) => state.operator)

//   const getVisitorName = (visitor: OperatorConversation['visitorId']) => {
//     if (!visitor) return 'Anonymous Visitor'

//     if (typeof visitor === 'object') {
//       // 1. Check if name exists directly on the object (flat structure)
//       if (
//         'name' in visitor &&
//         typeof (visitor as { name?: unknown }).name === 'string'
//       ) {
//         return (visitor as { name: string }).name
//       }

//       // 2. Check if name exists inside a nested visitorId wrapper object (nested structure)
//       if ('visitorId' in visitor) {
//         const nested = visitor as NestedVisitorStructure
//         if (nested.visitorId?.name) {
//           return nested.visitorId.name
//         }
//       }
//     }

//     return 'Anonymous Visitor'
//   }

//   useEffect(() => {
//     let mounted = true
//     const fetchConversations = async () => {
//       try {
//         if (refreshKey === 0) setLoading(true)

//         const propertiesData = await getMyProperties()
//         const propertyId = propertiesData?.data?.[0]?._id

//         if (!propertyId) {
//           if (mounted) setLoading(false)
//           return
//         }

//         const [queued, active, mine] = await Promise.all([
//           getQueuedSessions(propertyId),
//           getActiveSessions(propertyId),
//           getMySessions(),
//         ])

//         if (!mounted) return
//         setQueuedChats((queued.data ?? []) as OperatorConversation[])
//         setActiveChats((active.data ?? []) as OperatorConversation[])
//         setMyChats((mine.data ?? []) as OperatorConversation[])
//       } catch (error) {
//         console.error('❌ SIDEBAR FETCH EXCEPTION:', error)
//       } finally {
//         if (mounted) setLoading(false)
//       }
//     }

//     void fetchConversations()
//     return () => {
//       mounted = false
//     }
//   }, [refreshKey])

//   useEffect(() => {
//     if (!socket) return

//     const handleMessageUpdate = (payload: {
//       sessionId: string
//       message: ChatMessage
//       sessionContext?: OperatorConversation
//     }) => {
//       const updateList = (
//         list: OperatorConversation[],
//         type: 'mine' | 'queued' | 'active',
//       ) => {
//         const targetIndex = list.findIndex((c) => c._id === payload.sessionId)

//         if (targetIndex === -1) {
//           if (
//             payload.sessionContext &&
//             payload.sessionContext.status === type
//           ) {
//             return [payload.sessionContext, ...list]
//           }
//           return list
//         }

//         const updatedList = [...list]
//         const targetChat = { ...updatedList[targetIndex] }

//         targetChat.lastMessage = payload.message.messageText
//         targetChat.lastMessageAt = payload.message.createdAt

//         if (payload.sessionContext?.assignedOperatorId) {
//           targetChat.assignedOperatorId =
//             payload.sessionContext.assignedOperatorId
//         }

//         if (
//           payload.message.senderType === 'visitor' &&
//           selectedConversation?._id !== payload.sessionId
//         ) {
//           targetChat.unreadOperator = (targetChat.unreadOperator ?? 0) + 1
//         }

//         updatedList.splice(targetIndex, 1)
//         return [targetChat, ...updatedList]
//       }

//       setMyChats((prev) => updateList(prev, 'mine'))
//       setQueuedChats((prev) => updateList(prev, 'queued'))
//       setActiveChats((prev) => updateList(prev, 'active'))
//     }

//     // 🎯 FIXED: Catch status variations and force immediate array shifts across side panels
//     const handleStatusUpdateChange = (payload: {
//       sessionId: string
//       status: string
//     }) => {
//       if (payload.status === 'closed') {
//         const removeSession = (prev: OperatorConversation[]) =>
//           prev.filter((c) => c._id !== payload.sessionId)
//         setMyChats(removeSession)
//         setQueuedChats(removeSession)
//         setActiveChats(removeSession)

//         if (selectedConversation?._id === payload.sessionId) {
//           onSelect(null)
//         }
//       } else {
//         // If it shifts from waiting to active or queued, fire the refresh trigger hook to cleanly reload state definitions
//         onSelect(null) // Unselect current stale instance view models
//       }
//     }

//     socket.on('dashboard_message_update', handleMessageUpdate)
//     socket.on('session_status_changed', handleStatusUpdateChange)

//     return () => {
//       socket.off('dashboard_message_update', handleMessageUpdate)
//       socket.off('session_status_changed', handleStatusUpdateChange)
//     }
//   }, [socket, selectedConversation, onSelect])

//   if (loading && refreshKey === 0) {
//     return (
//       <div className="flex h-full flex-col items-center justify-center p-6 space-y-3 bg-card">
//         <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
//         <span className="text-xs font-medium text-muted-foreground tracking-wide">
//           Loading channels...
//         </span>
//       </div>
//     )
//   }

//   const renderChatGroup = (
//     title: string,
//     chats: OperatorConversation[],
//     emptyText: string,
//     icon: React.ReactNode,
//     badgeColor: string,
//     isGlobalActiveFeed = false,
//   ) => {
//     const displayableChats = isGlobalActiveFeed
//       ? chats.filter((chat) => {
//           const operatorId = isPopulatedWithId(chat.assignedOperatorId)
//             ? chat.assignedOperatorId._id
//             : (chat.assignedOperatorId as string | null | undefined)

//           return !operatorId || operatorId === currentOperator?._id
//         })
//       : chats

//     return (
//       <div className="space-y-2">
//         <div className="flex items-center justify-between px-1">
//           <div className="flex items-center gap-2 text-muted-foreground">
//             {icon}
//             <h3 className="text-[11px] font-bold uppercase tracking-wider">
//               {title}
//             </h3>
//           </div>
//           <span
//             className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border ${badgeColor}`}
//           >
//             {displayableChats.length}
//           </span>
//         </div>
//         {displayableChats.length === 0 ? (
//           <p className="text-[11px] text-muted-foreground/60 italic p-3 border border-dashed border-border/60 rounded-xl bg-background/20">
//             {emptyText}
//           </p>
//         ) : (
//           <div className="space-y-1">
//             {displayableChats.map((chat) => {
//               const isSelected = selectedConversation?._id === chat._id
//               const hasUnread = (chat.unreadOperator ?? 0) > 0

//               return (
//                 <button
//                   key={chat._id}
//                   onClick={() => {
//                     chat.unreadOperator = 0
//                     socket.emit('mark_session_seen', {
//                       sessionId: chat._id,
//                       clientType: 'operator',
//                     })
//                     onSelect(chat)
//                   }}
//                   className={`w-full text-left px-3 py-1.5 rounded-xl transition-all text-xs font-medium relative group flex items-center justify-between cursor-pointer border border-border!
//                     ${
//                       isSelected
//                         ? 'bg-primary text-white shadow-sm shadow-primary/10'
//                         : 'hover:bg-muted bg-background/30 text-foreground border border-transparent hover:border-border/50'
//                     }`}
//                 >
//                   <div className="flex flex-col min-w-0 flex-1 pr-2">
//                     <span className="truncate font-semibold">
//                       {getVisitorName(chat.visitorId)}
//                     </span>
//                     {chat.lastMessage && (
//                       <span
//                         className={`truncate text-[10px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}
//                       >
//                         {chat.lastMessage}
//                       </span>
//                     )}
//                   </div>
//                   <div className="flex items-center gap-1.5 shrink-0">
//                     {hasUnread && !isSelected && (
//                       <span className="bg-blue-600 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
//                         {chat.unreadOperator}
//                       </span>
//                     )}
//                     <span
//                       className={`h-1.5 w-1.5 rounded-full ${chat.status === 'queued' || chat.status === 'waiting' ? 'bg-amber-500' : 'bg-emerald-500'}`}
//                     />
//                   </div>
//                 </button>
//               )
//             })}
//           </div>
//         )}
//       </div>
//     )
//   }

//   return (
//     <div className="flex h-full flex-col overflow-y-auto p-4 space-y-5 custom-scrollbar bg-card/40">
//       {renderChatGroup(
//         'Assigned To Me',
//         myChats,
//         'No active workspace items',
//         <FiUser size={12} />,
//         'bg-primary/5 text-primary border-primary/10',
//       )}
//       {renderChatGroup(
//         'Waiting Queue',
//         queuedChats,
//         'Inbound queue clear',
//         <FiActivity size={12} />,
//         'bg-amber-500/5 text-amber-500 border-amber-500/10',
//       )}
//       {renderChatGroup(
//         'All Properties Active',
//         activeChats,
//         'No concurrent channel streams',
//         <FiLayers size={12} />,
//         'bg-muted text-muted-foreground border-border',
//         true,
//       )}
//     </div>
//   )
// }

'use client'

import { useEffect, useState } from 'react'
import {
  getQueuedSessions,
  getActiveSessions,
  getMySessions,
  getMyProperties,
} from '@/app/lib/api/chat.api'
import { getChatSocket } from '@/app/hooks/useChatSocket'
import { useAuthStore } from '@/app/store/useAuthStore'
import { FiUser, FiActivity, FiLayers } from 'react-icons/fi'
import type { OperatorConversation, ChatMessage } from '@/app/types/dashboard'

interface ConversationSidebarProps {
  selectedConversation: OperatorConversation | null
  onSelect: (conversation: OperatorConversation | null) => void
  refreshKey?: number
}

interface WithId {
  _id: string
}
interface NestedVisitorStructure {
  visitorId?: { name?: string }
}

function isPopulatedWithId(obj: unknown): obj is WithId {
  return typeof obj === 'object' && obj !== null && '_id' in obj
}

export default function ConversationSidebar({
  selectedConversation,
  onSelect,
  refreshKey = 0,
}: ConversationSidebarProps) {
  const [queuedChats, setQueuedChats] = useState<OperatorConversation[]>([])
  const [activeChats, setActiveChats] = useState<OperatorConversation[]>([])
  const [myChats, setMyChats] = useState<OperatorConversation[]>([])
  const [loading, setLoading] = useState(true)

  const socket = getChatSocket()
  const currentOperator = useAuthStore((state) => state.operator)

  const getVisitorName = (visitor: OperatorConversation['visitorId']) => {
    if (!visitor) return 'Anonymous Visitor'
    if (typeof visitor === 'object') {
      if (
        'name' in visitor &&
        typeof (visitor as { name?: unknown }).name === 'string'
      ) {
        return (visitor as { name: string }).name
      }
      if ('visitorId' in visitor) {
        const nested = visitor as NestedVisitorStructure
        if (nested.visitorId?.name) return nested.visitorId.name
      }
    }
    return 'Anonymous Visitor'
  }

  useEffect(() => {
    let mounted = true
    const fetchConversations = async () => {
      try {
        if (refreshKey === 0) setLoading(true)
        const propertiesData = await getMyProperties()
        const propertyId = propertiesData?.data?.[0]?._id

        if (!propertyId) {
          if (mounted) setLoading(false)
          return
        }

        const [queued, active, mine] = await Promise.all([
          getQueuedSessions(propertyId),
          getActiveSessions(propertyId),
          getMySessions(),
        ])

        if (!mounted) return
        setQueuedChats((queued.data ?? []) as OperatorConversation[])
        setActiveChats((active.data ?? []) as OperatorConversation[])
        setMyChats((mine.data ?? []) as OperatorConversation[])
      } catch (error) {
        console.error('❌ SIDEBAR FETCH EXCEPTION:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void fetchConversations()
    return () => {
      mounted = false
    }
  }, [refreshKey])

  useEffect(() => {
    if (!socket) return

    const handleMessageUpdate = (payload: {
      sessionId: string
      message: ChatMessage
      sessionContext?: OperatorConversation
    }) => {
      const updateList = (
        list: OperatorConversation[],
        type: 'mine' | 'queued' | 'active',
      ) => {
        const targetIndex = list.findIndex((c) => c._id === payload.sessionId)

        if (targetIndex === -1) {
          if (
            payload.sessionContext &&
            payload.sessionContext.status === type
          ) {
            return [payload.sessionContext, ...list]
          }
          return list
        }

        const updatedList = [...list]
        const targetChat = { ...updatedList[targetIndex] }

        // 🔒 Intercept to avoid leaking base64 cipher text on preview snippets
        targetChat.lastMessage = payload.message.isEncrypted
          ? '🔒 Encrypted message'
          : payload.message.messageText

        targetChat.lastMessageAt = payload.message.createdAt

        if (payload.sessionContext?.assignedOperatorId) {
          targetChat.assignedOperatorId =
            payload.sessionContext.assignedOperatorId
        }

        if (
          payload.message.senderType === 'visitor' &&
          selectedConversation?._id !== payload.sessionId
        ) {
          targetChat.unreadOperator = (targetChat.unreadOperator ?? 0) + 1
        }

        updatedList.splice(targetIndex, 1)
        return [targetChat, ...updatedList]
      }

      setMyChats((prev) => updateList(prev, 'mine'))
      setQueuedChats((prev) => updateList(prev, 'queued'))
      setActiveChats((prev) => updateList(prev, 'active'))
    }

    const handleStatusUpdateChange = (payload: {
      sessionId: string
      status: string
    }) => {
      if (payload.status === 'closed') {
        const removeSession = (prev: OperatorConversation[]) =>
          prev.filter((c) => c._id !== payload.sessionId)
        setMyChats(removeSession)
        setQueuedChats(removeSession)
        setActiveChats(removeSession)

        if (selectedConversation?._id === payload.sessionId) onSelect(null)
      } else {
        onSelect(null)
      }
    }

    socket.on('dashboard_message_update', handleMessageUpdate)
    socket.on('session_status_changed', handleStatusUpdateChange)

    return () => {
      socket.off('dashboard_message_update', handleMessageUpdate)
      socket.off('session_status_changed', handleStatusUpdateChange)
    }
  }, [socket, selectedConversation, onSelect])

  if (loading && refreshKey === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 space-y-3 bg-card">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-xs font-medium text-muted-foreground tracking-wide">
          Loading channels...
        </span>
      </div>
    )
  }

  const renderChatGroup = (
    title: string,
    chats: OperatorConversation[],
    emptyText: string,
    icon: React.ReactNode,
    badgeColor: string,
    isGlobalActiveFeed = false,
  ) => {
    const displayableChats = isGlobalActiveFeed
      ? chats.filter((chat) => {
          const operatorId = isPopulatedWithId(chat.assignedOperatorId)
            ? chat.assignedOperatorId._id
            : (chat.assignedOperatorId as string | null | undefined)
          return !operatorId || operatorId === currentOperator?._id
        })
      : chats

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            {icon}
            <h3 className="text-[11px] font-bold uppercase tracking-wider">
              {title}
            </h3>
          </div>
          <span
            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border ${badgeColor}`}
          >
            {displayableChats.length}
          </span>
        </div>
        {displayableChats.length === 0 ? (
          <p className="text-[11px] text-muted-foreground/60 italic p-3 border border-dashed border-border/60 rounded-xl bg-background/20">
            {emptyText}
          </p>
        ) : (
          <div className="space-y-1">
            {displayableChats.map((chat) => {
              const isSelected = selectedConversation?._id === chat._id
              const hasUnread = (chat.unreadOperator ?? 0) > 0

              return (
                <button
                  key={chat._id}
                  onClick={() => {
                    chat.unreadOperator = 0
                    socket.emit('mark_session_seen', {
                      sessionId: chat._id,
                      clientType: 'operator',
                    })
                    onSelect(chat)
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl transition-all text-xs font-medium relative group flex items-center justify-between cursor-pointer border border-border!
                    ${isSelected ? 'bg-primary text-white shadow-sm shadow-primary/10' : 'hover:bg-muted bg-background/30 text-foreground border border-transparent hover:border-border/50'}`}
                >
                  <div className="flex flex-col min-w-0 flex-1 pr-2">
                    <span className="truncate font-semibold">
                      {getVisitorName(chat.visitorId)}
                    </span>
                    {chat.lastMessage && (
                      <span
                        className={`truncate text-[10px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}
                      >
                        {chat.isEncrypted && !isSelected
                          ? '🔒 Encrypted message'
                          : chat.lastMessage}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {hasUnread && !isSelected && (
                      <span className="bg-blue-600 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                        {chat.unreadOperator}
                      </span>
                    )}
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${chat.status === 'queued' || chat.status === 'waiting' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 space-y-5 custom-scrollbar bg-card/40">
      {renderChatGroup(
        'Assigned To Me',
        myChats,
        'No active workspace items',
        <FiUser size={12} />,
        'bg-primary/5 text-primary border-primary/10',
      )}
      {renderChatGroup(
        'Waiting Queue',
        queuedChats,
        'Inbound queue clear',
        <FiActivity size={12} />,
        'bg-amber-500/5 text-amber-500 border-amber-500/10',
      )}
      {renderChatGroup(
        'All Properties Active',
        activeChats,
        'No concurrent channel streams',
        <FiLayers size={12} />,
        'bg-muted text-muted-foreground border-border',
        true,
      )}
    </div>
  )
}