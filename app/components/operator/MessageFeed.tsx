// /components/operator/MessageFeed.tsx

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

  useEffect(() => {
    const handleOutsideClick = () => {
      if (modal.isOpen) setModal((prev) => ({ ...prev, isOpen: false }))
    }
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [modal.isOpen])

  /**
   * Industrial Standard Day Separator Formatter Engine
   */
  const formatDividerDate = (dateString?: string | Date): string => {
    if (!dateString) return 'Today'
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    const compareDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).getTime()
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    ).getTime()
    const yesterdayDate = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
    ).getTime()

    if (compareDate === todayDate) {
      return 'Today'
    } else if (compareDate === yesterdayDate) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    }
  }

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

  const handleTouchStart = (e: React.TouchEvent, msg: ChatMessage) => {
    longPressTimerRef.current = setTimeout(() => {
      triggerMessageInfo(e, msg)
    }, 500)
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

  // 🎯 STEP 1: Linear structural mapping across dynamic timeline group arrays
  const groups: { [key: string]: ChatMessage[] } = {}
  messages.forEach((msg) => {
    const groupKey = formatDividerDate(msg.createdAt)
    if (!groups[groupKey]) groups[groupKey] = []
    groups[groupKey].push(msg)
  })

  return (
    <div
      ref={feedContainerRef}
      className="h-full overflow-y-auto custom-scrollbar bg-background/20 relative"
    >
      <div className="flex flex-col p-4 md:p-6 max-w-5xl mx-auto">
        {Object.keys(groups).map((dayKey) => (
          <div key={dayKey} className="flex flex-col gap-3.5">
            {/* 🎯 STEP 2: Render Industry Standard Day Separator Divider line */}
            <div className="flex items-center my-6 select-none">
              <div className="flex-1 h-[1px] bg-linear-to-r from-transparent via-border/70 to-transparent" />
              <span className="mx-4 text-[10px] font-extrabold tracking-wider text-muted-foreground/80 uppercase bg-muted px-3 py-1 rounded-full border border-border shadow-xs">
                {dayKey}
              </span>
              <div className="flex-1 h-[1px] bg-linear-to-r from-transparent via-border/70 to-transparent" />
            </div>

            {/* Render message bubbles packed inside this timeframe bucket */}
            {groups[dayKey].map((message) => {
              const isTransferNotice =
                message.senderType === 'system' ||
                (message.messageText &&
                  message.messageText.toLowerCase().includes('transferred to'))

              if (isTransferNotice) {
                return (
                  <div
                    key={message._id}
                    className="flex items-center my-2 w-full select-none"
                  >
                    <div className="flex-1 h-[1px] bg-linear-to-r from-transparent via-border to-transparent" />
                    <span className="mx-4 text-[11px] font-semibold tracking-wide text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border shadow-xs animate-in scale-in-95 duration-200">
                      🔄 {message.messageText}
                    </span>
                    <div className="flex-1 h-[1px] bg-linear-to-r from-transparent via-border to-transparent" />
                  </div>
                )
              }

              return (
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
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} className="h-2" />
      </div>

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
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <FiClock size={12} className="text-blue-400" /> Sent:
              </span>
              <span className="font-medium tracking-tight">
                {formatTimestamp(modal.message.createdAt)}
              </span>
            </div>

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