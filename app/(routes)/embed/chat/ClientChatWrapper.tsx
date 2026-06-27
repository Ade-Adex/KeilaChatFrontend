'use client'

import { useEffect, useState } from 'react'

import ChatWindow from '@/app/components/chat/ChatWindow'
import { ChatLauncher } from '@/app/components/chat/ChatLauncher'
import { WidgetConfig } from '@/app/types/chat'

interface Props {
  widgetId: string
  visitorTrackingId: string
  widget: WidgetConfig
}

export default function ClientChatWrapper({
  widgetId,
  visitorTrackingId,
  widget,
}: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {

    console.log('OPEN STATE', open)

    const mobile = window.innerWidth < 640

    const payload = {
      type: 'RESIZE',
      width: open ? (mobile ? window.innerWidth : 380) : 60,
      height: open ? (mobile ? window.innerHeight : 650) : 60,
    }

    console.log('[EMBED SEND]', payload)

    window.parent.postMessage(payload, '*')
  }, [open])

  return (
    <div className="w-full h-full">
      {open ? (
        <ChatWindow
          widget={widget}
          widgetId={widgetId}
          visitorTrackingId={visitorTrackingId}
          onClose={() => setOpen(false)}
        />
      ) : (
        <ChatLauncher onClick={() => setOpen(true)} widget={widget} />
      )}
    </div>
  )
}
