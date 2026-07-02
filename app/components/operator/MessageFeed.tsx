// /components/operator/MessageFeed.tsx

// 'use client'

// import { useEffect, useRef } from 'react'
// import MessageBubble from './MessageBubble'
// import type { ChatMessage } from '@/app/types/dashboard'

// export interface MessageFeedProps {
//   messages: ChatMessage[]
//   loading?: boolean
// }

// export default function MessageFeed({
//   messages,
//   loading = false,
// }: MessageFeedProps) {
//   const bottomRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages])

//   if (loading) {
//     return (
//       <div className="flex h-full flex-col items-center justify-center space-y-2 bg-background/10">
//         <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-transparent" />
//         <p className="text-[11px] font-medium text-muted-foreground tracking-wide">
//           Syncing conversation stream...
//         </p>
//       </div>
//     )
//   }

//   if (messages.length === 0) {
//     return (
//       <div className="flex h-full items-center justify-center p-8 text-center bg-background/10">
//         <p className="text-xs text-muted-foreground/60 max-w-50 leading-relaxed italic border border-dashed border-border/50 rounded-2xl p-4 bg-card/20">
//           No dispatch transactions verified on this channel thread.
//         </p>
//       </div>
//     )
//   }

//   return (
//     <div className="h-full overflow-y-auto custom-scrollbar bg-background/20">
//       <div className="flex flex-col gap-3.5 p-4 md:p-6 max-w-5xl mx-auto">
//         {messages.map((message) => (
//           <div
//             key={message._id}
//             className="animate-in fade-in duration-300 slide-in-from-bottom-1"
//           >
//             <MessageBubble message={message} />
//           </div>
//         ))}
//         <div ref={bottomRef} className="h-2" />
//       </div>
//     </div>
//   )
// }

'use client'

import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'
import type { ChatMessage } from '@/app/types/dashboard'
import { FiClock, FiCheck, FiCheckSquare, FiInfo, FiX } from 'react-icons/fi'

export interface MessageFeedProps {
  messages: ChatMessage[]
  loading?: boolean
}

interface InfoModalState {
  isOpen: boolean
  message: ChatMessage | null
  x: number
  y: number
}

export default function MessageFeed({
  messages,
  loading = false,
}: MessageFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const feedContainerRef = useRef<HTMLDivElement>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [modal, setModal] = useState<InfoModalState>({
    isOpen: false,
    message: null,
    x: 0,
    y: 0,
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Click outside to close telemetry info modal window
  useEffect(() => {
    const handleOutsideClick = () => {
      if (modal.isOpen) setModal((prev) => ({ ...prev, isOpen: false }))
    }
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [modal.isOpen])

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-2 bg-background/10">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-transparent" />
        <p className="text-[11px] font-medium text-muted-foreground tracking-wide">
          Syncing conversation stream...
        </p>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center bg-background/10">
        <p className="text-xs text-muted-foreground/60 max-w-50 leading-relaxed italic border border-dashed border-border/50 rounded-2xl p-4 bg-card/20">
          No dispatch transactions verified on this channel thread.
        </p>
      </div>
    )
  }

  // Trigger telemetry display wrapper details
  const triggerMessageInfo = (
    e: React.MouseEvent | React.TouchEvent,
    msg: ChatMessage,
  ) => {
    e.preventDefault()
    e.stopPropagation()

    let clientX = 0
    let clientY = 0

    if ('clientX' in e) {
      clientX = e.clientX
      clientY = e.clientY
    } else if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    }

    // Safety fallback bounds alignment logic
    const modalWidth = 260
    const modalHeight = 180
    let optimizedX = clientX + 10
    let optimizedY = clientY + 10

    if (window.innerWidth - optimizedX < modalWidth) {
      optimizedX = clientX - modalWidth - 10
    }
    if (window.innerHeight - optimizedY < modalHeight) {
      optimizedY = clientY - modalHeight - 10
    }

    setModal({
      isOpen: true,
      message: msg,
      x: optimizedX,
      y: optimizedY,
    })
  }

  // Touch handlers for mobile devices (long-press event)
  const handleTouchStart = (e: React.TouchEvent, msg: ChatMessage) => {
    longPressTimerRef.current = setTimeout(() => {
      triggerMessageInfo(e, msg)
    }, 500) // 500ms duration requirement flag
  }

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }
  }

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return '--:--'
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div
      ref={feedContainerRef}
      className="h-full overflow-y-auto custom-scrollbar bg-background/20 relative"
    >
      <div className="flex flex-col gap-3.5 p-4 md:p-6 max-w-5xl mx-auto">
        {messages.map((message) => (
          <div
            key={message._id}
            className="animate-in fade-in duration-300 slide-in-from-bottom-1 cursor-help select-none"
            onContextMenu={(e) => triggerMessageInfo(e, message)}
            onTouchStart={(e) => handleTouchStart(e, message)}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchEnd}
          >
            <MessageBubble message={message} />
          </div>
        ))}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Pop-up Telemetry Overlay Modal Context Menu */}
      {modal.isOpen && modal.message && (
        <div
          className="fixed z-50 w-64 rounded-xl border border-border bg-card p-3.5 shadow-xl backdrop-blur-md animate-in zoom-in-95 duration-100 text-foreground"
          style={{ top: `${modal.y}px`, left: `${modal.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-border pb-1.5 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
              <FiInfo size={11} /> Message Metadata
            </span>
            <button
              onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
              className="text-muted-foreground hover:text-foreground rounded p-0.5"
            >
              <FiX size={12} />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {/* Sent Status Group */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <FiClock size={12} className="text-blue-400" /> Sent:
              </span>
              <span className="font-medium tracking-tight">
                {formatTimestamp(modal.message.createdAt)}
              </span>
            </div>

            {/* Delivered Status Group */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <FiCheck
                  size={12}
                  className={
                    modal.message.status !== 'sent' &&
                    modal.message.status !== 'failed'
                      ? 'text-emerald-400'
                      : 'text-muted-foreground/40'
                  }
                />{' '}
                Delivered:
              </span>
              <span className="font-medium tracking-tight">
                {modal.message.status !== 'sent' &&
                modal.message.status !== 'failed' ? (
                  formatTimestamp(
                    modal.message.updatedAt ?? modal.message.createdAt,
                  )
                ) : (
                  <span className="text-muted-foreground/40 italic text-[10px]">
                    Pending
                  </span>
                )}
              </span>
            </div>

            {/* Read Status Group */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <FiCheckSquare
                  size={12}
                  className={
                    modal.message.status === 'seen'
                      ? 'text-indigo-400'
                      : 'text-muted-foreground/40'
                  }
                />{' '}
                Read Status:
              </span>
              <span className="font-medium tracking-tight">
                {modal.message.status === 'seen' ? (
                  formatTimestamp(modal.message.updatedAt)
                ) : (
                  <span className="text-muted-foreground/40 italic text-[10px]">
                    Unread
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}