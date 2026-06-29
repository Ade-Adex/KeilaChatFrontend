// /components/operator/OperatorDashboard.tsx

'use client'

import { useState, useEffect } from 'react'
import ConversationSidebar from './ConversationSidebar'
import OperatorWorkspace from './OperatorWorkspace'
import VisitorInfoPanel from './VisitorInfoPanel'
import EmptyState from './EmptyState'
import OperatorHeader from './OperatorHeader'

import { getChatSocket } from '@/app/hooks/useChatSocket'
import type { OperatorConversation, ChatMessage } from '@/app/types/dashboard'

export default function OperatorDashboard() {
  const [selectedConversation, setSelectedConversation] =
    useState<OperatorConversation | null>(null)

  // Refresh tracking key to force state sync propagation down to sidebar collections
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)

  useEffect(() => {
    const socket = getChatSocket()

    if (!socket.connected) {
      socket.connect()
    }

    // Capture global messages across all properties to sync counters
    const handleGlobalIncomingMessage = (message: ChatMessage) => {
      console.log('Dashboard intercepted stream message:', message)

      // Fire state propagation trigger down to child panels to force rest api sync loops
      setRefreshTrigger((prev) => prev + 1)

      // Live-update current open panel reference if applicable
      if (
        selectedConversation &&
        message.sessionId === selectedConversation._id
      ) {
        // Handled inside local component synchronization frame hook arrays
      }
    }

    socket.on('new_message', handleGlobalIncomingMessage)
    socket.on('chat_assigned', () => setRefreshTrigger((prev) => prev + 1))

    return () => {
      socket.off('new_message', handleGlobalIncomingMessage)
      socket.off('chat_assigned')
    }
  }, [selectedConversation])

  return (
    <div className="flex h-screen flex-col bg-background">
      <OperatorHeader />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[340px] border-r border-border bg-card">
          <ConversationSidebar
            selectedConversation={selectedConversation}
            onSelect={setSelectedConversation}
            refreshKey={refreshTrigger}
          />
        </aside>

        <main className="flex flex-1 overflow-hidden">
          <div className="flex-1">
            {selectedConversation ? (
              <OperatorWorkspace
                key={selectedConversation._id}
                session={selectedConversation}
              />
            ) : (
              <EmptyState />
            )}
          </div>

          {selectedConversation && (
            <aside className="w-85 border-l border-border">
              <VisitorInfoPanel session={selectedConversation} />
            </aside>
          )}
        </main>
      </div>
    </div>
  )
}