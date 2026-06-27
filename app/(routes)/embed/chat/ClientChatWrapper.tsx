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
    const screenWidth = window.screen.width
    const screenHeight = window.screen.height

    const mobile = screenWidth <= 768

    const width = open ? (mobile ? screenWidth : 420) : 64

    const height = open ? (mobile ? screenHeight : 760) : 64

    console.log(
      '[CHAT]',
      'screen:',
      screenWidth,
      screenHeight,
      'mobile:',
      mobile,
      'resize:',
      width,
      height,
    )

    window.parent.postMessage(
      {
        type: 'RESIZE',
        width,
        height,
      },
      '*',
    )
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
