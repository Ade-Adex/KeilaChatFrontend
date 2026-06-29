// /components/operator/ConversationSidebar.tsx

'use client'

import { useEffect, useState } from 'react'
import {
  getQueuedSessions,
  getActiveSessions,
  getMySessions,
} from '@/app/lib/api/chat.api'
import { getWorkspace } from '@/app/lib/api/settings.api'

import type { OperatorConversation } from '@/app/types/dashboard'
import type { AccountData } from '@/app/types/auth'

// Explicitly extend AccountData to check for valid target identifier keys safely
interface ExtendedAccountData extends AccountData {
  defaultProperty?: string
  _id?: string
}

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

  useEffect(() => {
    let mounted = true

    const fetchConversations = async () => {
      try {
        // Prevent jarring UI flashes by only setting global loading state on initial load mount
        if (refreshKey === 0) setLoading(true)

        console.log('🔄 Sidebar gathering active workspace info...')
        const workspace = await getWorkspace()
        console.log('💼 Sidebar Workspace API Response:', workspace)

        const account = workspace?.data?.account as
          | ExtendedAccountData
          | undefined

        // Strictly determine the true property target string
        let propertyId: string | undefined = undefined

        if (account) {
          if (
            typeof account.defaultProperty === 'string' &&
            account.defaultProperty
          ) {
            propertyId = account.defaultProperty
          } else if (typeof account._id === 'string' && account._id) {
            propertyId = account._id
          }
        }

        if (!propertyId) {
          console.error(
            '❌ CRITICAL: No propertyId could be extracted from workspace data.',
            {
              receivedAccount: account,
            },
          )
          return
        }

        console.log(
          `📡 Fetching session streams for Property ID: ${propertyId}`,
        )

        const [queued, active, mine] = await Promise.all([
          getQueuedSessions(propertyId),
          getActiveSessions(propertyId),
          getMySessions(),
        ])

        if (!mounted) return

        console.log('📊 Raw Sessions Payload Returned:', {
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
                {chat.visitorId?.name ?? 'Anonymous Visitor'}
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
                {chat.visitorId?.name ?? 'Incoming Visitor'}
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
                {chat.visitorId?.name ?? 'Active Visitor'}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}