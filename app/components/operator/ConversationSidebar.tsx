// /components/operator/ConversationSidebar.tsx

import { useEffect, useState } from 'react'

import ConversationCard from './ConversationCard'

import {
  getWorkspace,
  getQueuedSessions,
  getActiveSessions,
  getMySessions,
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    const fetchConversations = async () => {
      try {
        // Only set loading screen on structural initial bootmount to avoid flash jarring flickering
        if (refreshKey === 0) setLoading(true)

        const workspace = await getWorkspace()
        const propertyId = workspace.data.account.defaultProperty

        if (!propertyId) return

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
        if (mounted) console.error(error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void fetchConversations()

    return () => {
      mounted = false
    }
  }, [refreshKey]) // <--- Re-fetch and sync interface automatically whenever socket sends trigger
  if (loading) {
    return <div className="p-6">Loading conversations...</div>
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Queue */}
      <section className="border-b p-4">
        <h2 className="mb-4 text-sm font-semibold">
          Queue ({queuedChats.length})
        </h2>

        <div className="space-y-2">
          {queuedChats.map((chat) => (
            <ConversationCard
              key={chat._id}
              session={chat}
              selected={selectedConversation?._id === chat._id}
              onClick={() => onSelect(chat)}
            />
          ))}
        </div>
      </section>

      {/* Active */}
      <section className="border-b p-4">
        <h2 className="mb-4 text-sm font-semibold">
          Active ({activeChats.length})
        </h2>

        <div className="space-y-2">
          {activeChats.map((chat) => (
            <ConversationCard
              key={chat._id}
              session={chat}
              selected={selectedConversation?._id === chat._id}
              onClick={() => onSelect(chat)}
            />
          ))}
        </div>
      </section>

      {/* Mine */}
      <section className="p-4">
        <h2 className="mb-4 text-sm font-semibold">
          My Chats ({myChats.length})
        </h2>

        <div className="space-y-2">
          {myChats.map((chat) => (
            <ConversationCard
              key={chat._id}
              session={chat}
              selected={selectedConversation?._id === chat._id}
              onClick={() => onSelect(chat)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}