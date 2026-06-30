// /components/operator/ConversationSidebar.tsx

'use client'

import { useEffect, useState } from 'react'
import {
  getQueuedSessions,
  getActiveSessions,
  getMySessions,
  getMyProperties,
} from '@/app/lib/api/chat.api'
import { getChatSocket } from '@/app/hooks/useChatSocket'
import { FiUser, FiActivity, FiLayers } from 'react-icons/fi'
import type { OperatorConversation, ChatMessage } from '@/app/types/dashboard'

interface ConversationSidebarProps {
  selectedConversation: OperatorConversation | null
  onSelect: (conversation: OperatorConversation) => void
  refreshKey?: number
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

  const getVisitorName = (visitor: OperatorConversation['visitorId']) => {
    if (visitor && typeof visitor === 'object' && 'name' in visitor) {
      return visitor.name ?? 'Anonymous Visitor'
    }
    return 'Anonymous Visitor'
  }

  // Effect 1: Core API Synchronizer
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

  // Effect 2: Fine-Grained Real-Time Message & Notification Push Mapper
  useEffect(() => {
    if (!socket) return

    const handleMessageUpdate = (payload: {
      sessionId: string
      message: ChatMessage
    }) => {
      const updateList = (list: OperatorConversation[]) => {
        const targetIndex = list.findIndex((c) => c._id === payload.sessionId)
        if (targetIndex === -1) return list

        const updatedList = [...list]
        const targetChat = { ...updatedList[targetIndex] }

        // Update preview metrics dynamically
        targetChat.lastMessage = payload.message.messageText
        targetChat.lastMessageAt = payload.message.createdAt

        // Increment unread count if it's an operator viewing an incoming message from a visitor
        if (
          payload.message.senderType === 'visitor' &&
          selectedConversation?._id !== payload.sessionId
        ) {
          targetChat.unreadOperator = (targetChat.unreadOperator ?? 0) + 1
        }

        // Pull item forward to top position of array list stack
        updatedList.splice(targetIndex, 1)
        return [targetChat, ...updatedList]
      }

      setMyChats((prev) => updateList(prev))
      setQueuedChats((prev) => updateList(prev))
      setActiveChats((prev) => updateList(prev))
    }

    socket.on('dashboard_message_update', handleMessageUpdate)
    return () => {
      socket.off('dashboard_message_update', handleMessageUpdate)
    }
  }, [socket, selectedConversation])

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
  ) => (
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
          {chats.length}
        </span>
      </div>
      {chats.length === 0 ? (
        <p className="text-[11px] text-muted-foreground/60 italic p-3 border border-dashed border-border/60 rounded-xl bg-background/20">
          {emptyText}
        </p>
      ) : (
        <div className="space-y-1">
          {chats.map((chat) => {
            const isSelected = selectedConversation?._id === chat._id
            const hasUnread = (chat.unreadOperator ?? 0) > 0

            return (
              <button
                key={chat._id}
                onClick={() => {
                  // Reset local unread flag optimistically when opening thread
                  chat.unreadOperator = 0
                  onSelect(chat)
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all text-xs font-medium relative group flex items-center justify-between
                  ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm shadow-primary/10'
                      : 'hover:bg-muted bg-background/30 text-foreground border border-transparent hover:border-border/50'
                  }`}
              >
                <div className="flex flex-col min-w-0 flex-1 pr-2">
                  <span className="truncate font-semibold">
                    {getVisitorName(chat.visitorId)}
                  </span>
                  {chat.lastMessage && (
                    <span
                      className={`truncate text-[10px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}
                    >
                      {chat.lastMessage}
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
                    className={`h-1.5 w-1.5 rounded-full ${chat.status === 'queued' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

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
      )}
    </div>
  )
}