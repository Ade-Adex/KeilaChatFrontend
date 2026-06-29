// /components/operator/OperatorDashboard.tsx

'use client'

import { useState, useEffect } from 'react'
import ConversationSidebar from './ConversationSidebar'
import OperatorWorkspace from './OperatorWorkspace'
import VisitorInfoPanel from './VisitorInfoPanel'
import EmptyState from './EmptyState'
import { FiChevronLeft, FiSliders, FiMessageSquare } from 'react-icons/fi'

import { getChatSocket } from '@/app/hooks/useChatSocket'
import type { OperatorConversation, ChatMessage } from '@/app/types/dashboard'

export default function OperatorDashboard() {
  const [selectedConversation, setSelectedConversation] =
    useState<OperatorConversation | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)

  // Responsive workflow controller: 'sidebar' | 'chat' | 'info'
  const [currentPane, setCurrentPane] = useState<'sidebar' | 'chat' | 'info'>(
    'sidebar',
  )

  useEffect(() => {
    const socket = getChatSocket()
    if (!socket.connected) socket.connect()

    const currentPropertyId = selectedConversation
      ? typeof selectedConversation.propertyId === 'string'
        ? selectedConversation.propertyId
        : selectedConversation.propertyId?._id
      : null

    if (currentPropertyId) {
      socket.emit('join_property_dashboard', { propertyId: currentPropertyId })
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

  const handleSelectConversation = (conversation: OperatorConversation) => {
    setSelectedConversation(conversation)
    setCurrentPane('chat')
  }

  return (
    <div className="flex h-full w-full bg-background overflow-hidden relative">
      {/* Pane 1: Chat Threads List */}
      <div
        className={`absolute inset-y-0 left-0 z-20 w-full md:static md:w-[290px] lg:w-[320px] xl:w-[350px] shrink-0 border-r border-border bg-card transition-transform duration-300 md:translate-x-0 flex flex-col
          ${currentPane === 'sidebar' ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <ConversationSidebar
          selectedConversation={selectedConversation}
          onSelect={handleSelectConversation}
          refreshKey={refreshTrigger}
        />
      </div>

      {/* Pane 2: Primary Thread Canvas Workspace */}
      <div
        className={`absolute inset-0 z-10 flex flex-col md:static md:flex-1 min-w-0 bg-background/40 transition-transform duration-300 md:translate-x-0
          ${currentPane === 'chat' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
      >
        {selectedConversation ? (
          <div className="flex flex-col h-full w-full overflow-hidden">
            {/* Mobile Adaptive Panel Command Ribbon Banner */}
            <div className="md:hidden flex h-14 items-center justify-between border-b border-border bg-card/90 px-4 shrink-0 backdrop-blur-sm">
              <button
                onClick={() => setCurrentPane('sidebar')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all px-2.5 py-1.5 rounded-lg bg-muted/50"
              >
                <FiChevronLeft size={16} />
                <span>Inbox</span>
              </button>
              <button
                onClick={() => setCurrentPane('info')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all px-2.5 py-1.5 rounded-lg bg-muted/50"
              >
                <span>Telemetry</span>
                <FiSliders size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <OperatorWorkspace
                key={selectedConversation._id}
                session={selectedConversation}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-background/50">
            <EmptyState />
          </div>
        )}
      </div>

      {/* Pane 3: Visitor Profile Info Inspector Drawer */}
      {selectedConversation && (
        <div
          className={`absolute inset-y-0 right-0 z-30 w-full sm:w-[340px] md:static md:w-[280px] lg:w-[320px] xl:w-[340px] shrink-0 border-l border-border bg-card transition-transform duration-300 md:translate-x-0 flex flex-col
            ${currentPane === 'info' ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
        >
          {/* Mobile Profile View Dimiss Header Bar Banner */}
          <div className="lg:hidden flex h-14 items-center border-b border-border bg-card px-4 shrink-0">
            <button
              onClick={() => setCurrentPane('chat')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all"
            >
              <FiMessageSquare size={14} />
              <span>Return to Chat Thread</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <VisitorInfoPanel session={selectedConversation} />
          </div>
        </div>
      )}
    </div>
  )
}