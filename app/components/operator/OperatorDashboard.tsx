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
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)

  useEffect(() => {
    const socket = getChatSocket()
    if (!socket.connected) {
      socket.connect()
    }

    const currentPropertyId = selectedConversation
      ? typeof selectedConversation.propertyId === 'string'
        ? selectedConversation.propertyId
        : selectedConversation.propertyId?._id
      : null

    if (currentPropertyId) {
      console.log(
        `📊 Dashboard synchronization active for property: ${currentPropertyId}`,
      )
      // Notice: No operatorId passed here. The backend resolves it securely via cookies/sessions.
      socket.emit('join_property_dashboard', {
        propertyId: currentPropertyId,
      })
    }

    const handleDashboardUpdate = (payload: {
      sessionId: string
      message: ChatMessage
    }) => {
      setRefreshTrigger((prev) => prev + 1)
    }

    socket.on('dashboard_message_update', handleDashboardUpdate)
    socket.on('incoming_visitor_alert', () =>
      setRefreshTrigger((prev) => prev + 1),
    )
    socket.on('chat_assigned', () => setRefreshTrigger((prev) => prev + 1))

    return () => {
      socket.off('dashboard_message_update', handleDashboardUpdate)
      socket.off('incoming_visitor_alert')
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