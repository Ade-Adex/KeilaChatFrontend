// /components/operator/ConversationSidebar.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  getQueuedSessions,
  getActiveSessions,
  getMySessions,
  getMyProperties, 
} from '@/app/lib/api/chat.api'

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

  // Safe type guard utility to pull the visitor name from the union variant type
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

        console.log('🔄 Sidebar fetching true property context from backend...')

        // 1. Ask backend for the real properties array instead of checking the account object
        const propertiesData = await getMyProperties()
        const primaryProperty = propertiesData?.data?.[0]
        const propertyId = primaryProperty?._id

        if (!propertyId) {
          console.error(
            '❌ CRITICAL: Operator account has no valid properties created.',
          )
          if (mounted) setLoading(false)
          return
        }

        console.log(
          `📡 Fetching session streams for validated Property ID: ${propertyId}`,
        )

        // 2. Load the real real-time channels using the true Property ID string context
        const [queued, active, mine] = await Promise.all([
          getQueuedSessions(propertyId),
          getActiveSessions(propertyId),
          getMySessions(),
        ])

        if (!mounted) return

        console.log('📊 Real-time Streams Payload:', {
          queued: queued.data,
          active: active.data,
          mine: mine.data,
        })

        setQueuedChats((queued.data ?? []) as OperatorConversation[])
        setActiveChats((active.data ?? []) as OperatorConversation[])
        setMyChats((mine.data ?? []) as OperatorConversation[])
      } catch (error) {
        if (mounted) {
          console.error('❌ SIDEBAR FETCH EXCEPTION:', error)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void fetchConversations()

    return () => {
      mounted = false
    }
  }, [refreshKey])

  if (loading && refreshKey === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground animate-pulse">
        Loading channels...
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* MY ACTIVE CHATS                                                    */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          My Conversations ({myChats.length})
        </h3>
        {myChats.length === 0 ? (
          <p className="text-xs text-muted-foreground italic p-2 border border-dashed rounded-md">
            No chats assigned to you
          </p>
        ) : (
          <div className="space-y-1">
            {myChats.map((chat) => (
              <button
                key={chat._id}
                onClick={() => onSelect(chat)}
                className={`w-full text-left p-2 rounded-md transition-colors text-sm ${
                  selectedConversation?._id === chat._id
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                {getVisitorName(chat.visitorId)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* QUEUED INCOMING CHATS                                              */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Waiting Queue ({queuedChats.length})
        </h3>
        {queuedChats.length === 0 ? (
          <p className="text-xs text-muted-foreground italic p-2 border border-dashed rounded-md">
            Queue empty
          </p>
        ) : (
          <div className="space-y-1">
            {queuedChats.map((chat) => (
              <button
                key={chat._id}
                onClick={() => onSelect(chat)}
                className={`w-full text-left p-2 rounded-md transition-colors text-sm ${
                  selectedConversation?._id === chat._id
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                {getVisitorName(chat.visitorId)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* UNASSIGNED OR BROADLY ACTIVE CHATS                                 */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          All Active Channels ({activeChats.length})
        </h3>
        {activeChats.length === 0 ? (
          <p className="text-xs text-muted-foreground italic p-2 border border-dashed rounded-md">
            No other active streams
          </p>
        ) : (
          <div className="space-y-1">
            {activeChats.map((chat) => (
              <button
                key={chat._id}
                onClick={() => onSelect(chat)}
                className={`w-full text-left p-2 rounded-md transition-colors text-sm ${
                  selectedConversation?._id === chat._id
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                {getVisitorName(chat.visitorId)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}