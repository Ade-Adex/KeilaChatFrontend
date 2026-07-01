'use client'

import { useEffect, useState } from 'react'
import ChatWindow from '@/app/components/chat/ChatWindow'
import { ChatLauncher } from '@/app/components/chat/ChatLauncher'
import type { WidgetConfig, ChatMessage } from '@/app/types/chat'
import { getChatSocket } from '@/app/hooks/useChatSocket'

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
  const [unreadCount, setUnreadCount] = useState(0)

  // 🎯 Manage viewport sizing and message passing inside this effect
  useEffect(() => {
    const screenWidth = window.screen.width
    const screenHeight = window.screen.height
    const mobile = screenWidth <= 768

    const width = open ? (mobile ? screenWidth : 420) : 64
    const height = open ? (mobile ? screenHeight : 760) : 64

    window.parent.postMessage({ type: 'RESIZE', width, height }, '*')
  }, [open])

  // 🎯 Background socket listener with strict ChatMessage typing
  useEffect(() => {
    const socket = getChatSocket()

    const handleBackgroundMessage = (payload: ChatMessage) => {
      // Increment only if the chat window is currently closed and sent by operator/ai
      if (
        !open &&
        (payload.senderType === 'operator' || payload.senderType === 'ai')
      ) {
        setUnreadCount((prev) => prev + 1)

        if (widget?.widgetSettings?.soundEnabled) {
          try {
            const audio = new Audio('/sound/notification.wav')
            audio.volume = 0.7
            audio.play().catch((err) => {
              console.log(
                '[KeilaChat] Audio playback deferred until user interaction:',
                err,
              )
            })
          } catch (audioError) {
            console.error(
              '[KeilaChat] Audio engine initialization failed:',
              audioError,
            )
          }
        }
      }
    }

    socket.on('new_message', handleBackgroundMessage)
    return () => {
      socket.off('new_message', handleBackgroundMessage)
    }
  }, [open, widget])

  // 🎯 Fix cascading render: Clear unread count directly during user interaction
  const handleOpenChat = () => {
    setUnreadCount(0)
    setOpen(true)
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      {open ? (
        <ChatWindow
          widget={widget}
          widgetId={widgetId}
          visitorTrackingId={visitorTrackingId}
          onClose={() => setOpen(false)}
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
