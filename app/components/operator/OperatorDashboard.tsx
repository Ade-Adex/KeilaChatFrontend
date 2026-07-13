// /components/operator/OperatorDashboard.tsx

'use client'

import { useState, useEffect } from 'react'
import ConversationSidebar from './ConversationSidebar'
import OperatorWorkspace from './OperatorWorkspace'
import VisitorInfoPanel from './VisitorInfoPanel'
import EmptyState from './EmptyState'
import { FiChevronLeft, FiSliders, FiMessageSquare } from 'react-icons/fi'

import { getChatSocket } from '@/app/hooks/useChatSocket'
import { useAuthStore } from '@/app/store/useAuthStore' // 🎯 ADDED
import { sendOperatorHeartbeat } from '@/app/lib/api/chat.api'
import type { OperatorConversation, ChatMessage } from '@/app/types/dashboard'

/* -------------------------------------------------------------------------- */
/* 🎯 CENTRALIZED CLIENT BACKGROUND HEARTBEAT                                 */
/* -------------------------------------------------------------------------- */
function HeartbeatManager() {
  useEffect(() => {
    const INT_TIMEOUT = 35 * 1000

    const sendHeartbeatSignal = async () => {
      try {
        await sendOperatorHeartbeat()
      } catch (err) {
        console.error(
          '[Heartbeat] Failed pinging background presence agent:',
          err,
        )
      }
    }

    void sendHeartbeatSignal()

    const interval = setInterval(sendHeartbeatSignal, INT_TIMEOUT)
    return () => clearInterval(interval)
  }, [])

  return null
}

export default function OperatorDashboard() {
  // 🎯 READ ASSIGNED PROPERTY SCOPE DIRECTLY FROM AUTH STORE
  const user = useAuthStore((state) => state.operator)
  const assignedProperties = user?.assignedProperties ?? []

  // Resolve the active workspace property ID safely
  const propertyIdContext =
    assignedProperties.length > 0
      ? assignedProperties[0]?._id || assignedProperties[0]?.toString()
      : null


      console.log(propertyIdContext, 'propertyIdContext')

  const [selectedConversation, setSelectedConversation] =
    useState<OperatorConversation | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)
  const [currentPane, setCurrentPane] = useState<'sidebar' | 'chat' | 'info'>(
    'sidebar',
  )

  // 🎯 RE-SYNC WEBSOCKET CHANNEL JOIN EVENTS WHEN PROPERTY CONTEXT CHANGES
  useEffect(() => {
    if (!propertyIdContext) return

    const socket = getChatSocket()
    if (!socket.connected) socket.connect()

    // logger.info(
    //   { propertyIdContext },
    //   '🔗 Joining live property dashboard room channel',
    // )

    socket.emit('join_property_dashboard', {
      propertyId: propertyIdContext,
    })
  }, [propertyIdContext])

  useEffect(() => {
    const socket = getChatSocket()
    const triggerUpdate = () => setRefreshTrigger((prev) => prev + 1)

    const handleGlobalMessageReceipt = (payload: {
      sessionId: string
      message: ChatMessage
    }) => {
      triggerUpdate()

      if (
        payload.message.senderType === 'visitor' &&
        payload.message._id &&
        payload.message.status !== 'seen' &&
        payload.message.status !== 'delivered'
      ) {
        socket.emit('message_delivered', {
          messageId: payload.message._id,
          sessionId: payload.sessionId,
        })
      }
    }

    const handleStatusChangedEvent = (payload: {
      sessionId: string
      status: string
    }) => {
      triggerUpdate()
      if (
        payload.status === 'closed' &&
        selectedConversation?._id === payload.sessionId
      ) {
        setSelectedConversation(null)
        setCurrentPane('sidebar')
      }
    }

    socket.on('dashboard_message_update', handleGlobalMessageReceipt)
    socket.on('dashboard_chat_queued', triggerUpdate)
    socket.on('dashboard_chat_assigned', triggerUpdate)
    socket.on('chat_assigned', triggerUpdate)
    socket.on('session_status_changed', handleStatusChangedEvent)
    socket.on('dashboard_refresh_request', triggerUpdate)

    return () => {
      socket.off('dashboard_message_update', handleGlobalMessageReceipt)
      socket.off('dashboard_chat_queued', triggerUpdate)
      socket.off('dashboard_chat_assigned', triggerUpdate)
      socket.off('chat_assigned', triggerUpdate)
      socket.off('session_status_changed', handleStatusChangedEvent)
      socket.off('dashboard_refresh_request', triggerUpdate)
    }
  }, [selectedConversation])

  const handleSelectConversation = (
    conversation: OperatorConversation | null,
  ) => {
    setSelectedConversation(conversation)
    if (conversation) {
      setCurrentPane('chat')
    } else {
      setCurrentPane('sidebar')
    }
  }

  return (
    <div className="flex h-full w-full bg-background overflow-hidden relative">
      <HeartbeatManager />

      <div
        className={`absolute inset-y-0 left-0 z-20 w-full md:static md:w-72.5 lg:w-[320px] xl:w-87.5 shrink-0 border-r border-border bg-card transition-transform duration-300 md:translate-x-0 flex flex-col
          ${currentPane === 'sidebar' ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* 🎯 Forwarding active property contextual variables into sidebar query workflows */}
        <ConversationSidebar
          selectedConversation={selectedConversation}
          onSelect={handleSelectConversation}
          refreshKey={refreshTrigger}
          propertyId={propertyIdContext}
        />
      </div>

      <div
        className={`absolute inset-0 z-10 flex flex-col md:static md:flex-1 min-w-0 bg-background/40 transition-transform duration-300 md:translate-x-0
          ${currentPane === 'chat' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
      >
        {selectedConversation ? (
          <div className="flex flex-col h-full w-full overflow-hidden">
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

      {selectedConversation && (
        <div
          className={`absolute inset-y-0 right-0 z-30 w-full sm:w-85 md:static md:w-70 lg:w-[320px] xl:w-85 shrink-0 border-l border-border bg-card transition-transform duration-300 md:translate-x-0 flex flex-col
            ${currentPane === 'info' ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
        >
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