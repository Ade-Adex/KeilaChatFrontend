// 'use client'

// import { useEffect, useState } from 'react'

// import ChatWindow from '@/app/components/chat/ChatWindow'
// import { ChatLauncher } from '@/app/components/chat/ChatLauncher'
// import { WidgetConfig } from '@/app/types/chat'

// interface Props {
//   widgetId: string
//   visitorTrackingId: string
//   widget: WidgetConfig
// }

// export default function ClientChatWrapper({
//   widgetId,
//   visitorTrackingId,
//   widget,
// }: Props) {
//   const [open, setOpen] = useState(false)

//   useEffect(() => {
//     const screenWidth = window.screen.width
//     const screenHeight = window.screen.height

//     const mobile = screenWidth <= 768

//     const width = open ? (mobile ? screenWidth : 420) : 64

//     const height = open ? (mobile ? screenHeight : 760) : 64

//     console.log(
//       '[CHAT]',
//       'screen:',
//       screenWidth,
//       screenHeight,
//       'mobile:',
//       mobile,
//       'resize:',
//       width,
//       height,
//     )

//     window.parent.postMessage(
//       {
//         type: 'RESIZE',
//         width,
//         height,
//       },
//       '*',
//     )
//   }, [open])

//   return (
//     <div className="w-full h-full">
//       {open ? (
//         <ChatWindow
//           widget={widget}
//           widgetId={widgetId}
//           visitorTrackingId={visitorTrackingId}
//           onClose={() => setOpen(false)}
//         />
//       ) : (
//         <ChatLauncher onClick={() => setOpen(true)} widget={widget} />
//       )}
//     </div>
//   )
// }

'use client'

import { useEffect, useState, useRef } from 'react'
import ChatWindow from '@/app/components/chat/ChatWindow'
import { ChatLauncher } from '@/app/components/chat/ChatLauncher'
import type {
  WidgetConfig,
  ChatMessage,
  SafeSessionConfig,
  SessionInitResponse,
} from '@/app/types/chat'
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
  const [session, setSession] = useState<SafeSessionConfig | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  // 1. Manage layout dimensions with the parent website embed frame
  useEffect(() => {
    const screenWidth = window.screen.width
    const screenHeight = window.screen.height
    const mobile = screenWidth <= 768

    const width = open ? (mobile ? screenWidth : 420) : 64
    const height = open ? (mobile ? screenHeight : 760) : 64

    window.parent.postMessage({ type: 'RESIZE', width, height }, '*')
  }, [open])

  // 2. Fetch or initiate the conversation thread session immediately on frame startup
  useEffect(() => {
    async function initializeConversation() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sessions/initiate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ widgetId, visitorTrackingId }),
          },
        )
        const result: SessionInitResponse = await response.json()
        if (result.status === 'success' && result.data) {
          setSession(result.data)
        }
      } catch (error) {
        console.error('[KeilaChat] Root initialization failed:', error)
      } finally {
        setLoading(false)
      }
    }
    initializeConversation()
  }, [widgetId, visitorTrackingId])

  // 3. Persistent Core Socket Engine Link (Runs even when closed!)
  useEffect(() => {
    if (!session?.sessionId) return

    const socket = getChatSocket()

    if (!socket.connected) {
      socket.connect()
    }

    // Join the room room right away so backend can route events to this minimized client
    socket.emit('join_chat_session', {
      sessionId: session.sessionId,
      propertyId: session.propertyId,
      visitorId: session.visitorId,
      clientType: 'visitor',
    })

    const handleIncomingMessage = (payload: ChatMessage) => {
      setMessages((prev) => {
        if (!payload._id) return [...prev, payload]
        if (prev.some((m) => m._id === payload._id)) return prev
        return [...prev, payload]
      })

      // 🎯 Process unread metrics + playback alerts if minimized
      if (payload.senderType === 'operator' || payload.senderType === 'ai') {
        if (!open) {
          setUnreadCount((prev) => prev + 1)

          if (widget?.widgetSettings?.soundEnabled) {
            try {
              const audio = new Audio('/sound/notification.wav')
              audio.volume = 0.7
              audio
                .play()
                .catch((err) => console.warn('[KeilaChat] Audio block:', err))
            } catch (e) {
              console.error(e)
            }
          }
        }
      }
    }

    socket.on('new_message', handleIncomingMessage)
    return () => {
      socket.off('new_message', handleIncomingMessage)
    }
  }, [session, open, widget])

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
          initialSession={session}
          initialMessages={messages}
          setInitialMessages={setMessages}
          loading={loading}
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