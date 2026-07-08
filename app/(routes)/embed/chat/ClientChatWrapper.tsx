// /app/(routes)/embed/chat/ClientChatWrapper.tsx

'use client'

import { ChatLauncher } from '@/app/components/chat/ChatLauncher'
import ChatWindow from '@/app/components/chat/ChatWindow'
import { useChatSession } from '@/app/hooks/useChatSession'
import { useChatSocketEvents } from '@/app/hooks/useChatSocketEvents'
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
  const session = useVisitorChatStore((state) => state.session)
  const { loading } = useChatSession({ widgetId, visitorTrackingId })
  const { unreadCount, markSessionSeen } = useChatSocketEvents({
    session,
    open,
    widget,
  })

  const handleOpenChat = () => {
    setOpen(true)
    markSessionSeen()
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      {open ? (
        <ChatWindow
          widget={widget}
          widgetId={widgetId}
          visitorTrackingId={visitorTrackingId}
          loading={loading}
          onClose={() => setOpen(false)}
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
