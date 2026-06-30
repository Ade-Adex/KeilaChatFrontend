// /components/operator/ConversationSidebar.tsx

'use client'

import { useEffect, useState } from 'react'
import {
  getQueuedSessions,
  getActiveSessions,
  getMySessions,
  getMyProperties,
} from '@/app/lib/api/chat.api'
import { FiUser, FiActivity, FiLayers } from 'react-icons/fi'
import type { OperatorConversation } from '@/app/types/dashboard'

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

  const getVisitorName = (visitor: OperatorConversation['visitorId']) => {
    if (visitor && typeof visitor === 'object' && 'name' in visitor) {
      return visitor.name ?? 'Anonymous Visitor'
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
            return (
              <button
                key={chat._id}
                onClick={() => onSelect(chat)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all text-xs font-medium relative group flex items-center justify-between
                  ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm shadow-primary/10'
                      : 'hover:bg-muted bg-background/30 text-foreground border border-transparent hover:border-border/50'
                  }`}
              >
                <span className="truncate pr-2">
                  {getVisitorName(chat.visitorId)}
                </span>
                <span
                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${chat.status === 'queued' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                />
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