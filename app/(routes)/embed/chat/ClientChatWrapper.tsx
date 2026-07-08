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

    setOpen(true)
    setChatWindowKey((prev) => prev + 1)
    markSessionSeen()
  }

  const handleCloseChat = () => {
    setOpen(false)
    setChatWindowKey((prev) => prev + 1)
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      {open ? (
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
      ) : (
        <ChatLauncher
          onClick={handleOpenChat}
          widget={widget}
          unreadCount={unreadCount}
        />
      )}
    </div>
  )
}
