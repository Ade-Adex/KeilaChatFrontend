// /app/(routes)/embed/chat/ClientChatWrapper.tsx

'use client'

import { ChatLauncher } from '@/app/components/chat/ChatLauncher'
import ChatWindow from '@/app/components/chat/ChatWindow'
import { useChatSession } from '@/app/hooks/useChatSession'
import { useChatSocketEvents } from '@/app/hooks/useChatSocketEvents'
import { initiateSession } from '@/app/lib/api/chat.api'
import { useVisitorChatStore } from '@/app/store/useVisitorChatStore'
import type { WidgetConfig } from '@/app/types/chat'
import { useState } from 'react'

interface Props {
  widgetId: string
  visitorTrackingId: string
  widget: WidgetConfig | null
}

export default function ClientChatWrapper({
  widgetId,
  visitorTrackingId,
  widget,
}: Props) {
  const [open, setOpen] = useState(false)
  const [chatWindowKey, setChatWindowKey] = useState(0)
  const session = useVisitorChatStore((state) => state.session)
  const setSession = useVisitorChatStore((state) => state.setSession)
  const setMessages = useVisitorChatStore((state) => state.setMessages)
  const { loading } = useChatSession({ widgetId, visitorTrackingId })
  const { unreadCount, markSessionSeen } = useChatSocketEvents({
    session,
    open,
    widget,
  })

  const handleOpenChat = async () => {
    setOpen(true)
    setChatWindowKey((prev) => prev + 1)
    markSessionSeen()

    if (!session?.sessionId || session.status === 'closed') {
      try {
        const result = await initiateSession({
          widgetId,
          visitorTrackingId,
          createNew: true,
        })

        if (result.status === 'success' && result.data) {
          setSession(result.data)
          setMessages([])
        }
      } catch (error) {
        console.error(
          '[KeilaChat] Failed to start a fresh visitor session:',
          error,
        )
      }
    }
  }

  const handleCloseChat = () => {
    setOpen(false)
    setChatWindowKey((prev) => prev + 1)
  }

  return (
    <div className="relative w-full h-full bg-transparent overflow-hidden">
      {/* Chat Window Panel */}
      <div
        className={`absolute bottom-0 right-0 transition-all duration-300 ease-in-out ${
          open
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <ChatWindow
          key={chatWindowKey}
          widget={widget}
          widgetId={widgetId}
          visitorTrackingId={visitorTrackingId}
          loading={loading}
          onClose={handleCloseChat}
          queueSubtext={
            session?.status === 'queued' || session?.status === 'waiting'
              ? 'Someone will join your chat soon...'
              : undefined
          }
        />
      </div>

      {/* Chat Launcher Button */}
      <div
        className={`absolute bottom-4 right-4 transition-all duration-200 z-50 ${
          open
            ? 'opacity-0 scale-75 pointer-events-none'
            : 'opacity-100 scale-100 pointer-events-auto'
        }`}
      >
        <ChatLauncher
          onClick={handleOpenChat}
          widget={widget}
          unreadCount={unreadCount}
        />
      </div>
    </div>
  )
}