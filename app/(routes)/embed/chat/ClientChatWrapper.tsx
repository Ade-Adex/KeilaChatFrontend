// app/(routes)/embed/chat/ClientChatWrapper.tsx
'use client'

import { useState } from 'react'
import { ChatLauncher } from '@/app/components/chat/ChatLauncher'
import ChatWindow from '@/app/components/chat/ChatWindow'

export default function ClientChatWrapper({ widgetId }: { widgetId: string }) {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false)

  const toggleWidget = (open: boolean) => {
    setIsWidgetOpen(open)
    const isMobile = window.innerWidth < 640
    const DESKTOP_WIDTH = '350px'
    const DESKTOP_HEIGHT = '500px'

    window.parent.postMessage(
      {
        type: 'RESIZE',
        width: open ? (isMobile ? '100vw' : DESKTOP_WIDTH) : '60px',
        height: open ? (isMobile ? '100dvh' : DESKTOP_HEIGHT) : '60px',
        top: open && isMobile ? '0' : 'auto',
        left: open && isMobile ? '0' : 'auto',
        bottom: '20px',
        right: '20px',
      },
      '*',
    )
  }

  return (
    <div className="w-full h-full">
      {isWidgetOpen ? (
        <ChatWindow onClose={() => toggleWidget(false)} />
      ) : (
        <ChatLauncher onClick={() => toggleWidget(true)} />
      )}
    </div>
  )
}
