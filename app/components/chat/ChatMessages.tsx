// /app/components/chat/ChatMessages.tsx

'use client'

import TypingIndicator from '@/app/components/TypingIndicator'
import type { ChatMessage, WidgetConfig } from '@/app/types/chat'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FiCheck, FiCheckSquare, FiClock, FiInfo, FiX } from 'react-icons/fi'
import MessageBubble from './MessageBubble'

interface Props {
  widget: WidgetConfig | null
  messages: ChatMessage[]
  operatorTyping: boolean
}

interface InfoModalState {
  isOpen: boolean
  message: ChatMessage | null
  x: number
  y: number
}

export default function ChatMessages({
  widget,
  messages,
  operatorTyping,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [modal, setModal] = useState<InfoModalState>({
    isOpen: false,
    message: null,
    x: 0,
    y: 0,
  })

  // 🤖 AI animation tracking states
  const [completedAiMessageIds, setCompletedAiMessageIds] = useState<
    Set<string>
  >(new Set())

  const lastMessage = messages[messages.length - 1]

  useEffect(() => {
    if (messages.length !== 0) return

    const resetTimer = window.setTimeout(() => {
      setCompletedAiMessageIds(new Set())
    }, 0)

    return () => window.clearTimeout(resetTimer)
  }, [messages.length])

  const lastMessageId = lastMessage
    ? lastMessage._id || `${lastMessage.senderId}-${lastMessage.createdAt}`
    : null

  // 🧠 Compute AI typing status directly in the render line
  const aiTyping =
    lastMessage?.senderType === 'ai' &&
    !completedAiMessageIds.has(lastMessageId!)

  /**
   * ⏳ Natural Delay Trigger Management Ring
   */
  useEffect(() => {
    if (!lastMessageId || lastMessage?.senderType !== 'ai') return

    if (!completedAiMessageIds.has(lastMessageId)) {
      const timer = setTimeout(() => {
        setCompletedAiMessageIds((prev) => {
          const next = new Set(prev)
          next.add(lastMessageId)
          return next
        })
      }, 1800)

      return () => clearTimeout(timer)
    }
  }, [lastMessageId, lastMessage?.senderType, completedAiMessageIds])

  /**
   * 🧠 Pure Render Pass Slice Computation
   */
  const visibleMessages = useMemo(() => {
    if (messages.length === 0) return []

    if (aiTyping) {
      return messages.slice(0, -1)
    }
    return messages
  }, [messages, aiTyping])

  // Automatic bottom viewport alignment
  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: 'smooth',
      })
    }, 50)

    return () => clearTimeout(timer)
  }, [visibleMessages.length, operatorTyping, aiTyping])

  // Click outside listener to clean up the floating window
  useEffect(() => {
    const handleOutsideClick = () => {
      if (modal.isOpen) setModal((prev) => ({ ...prev, isOpen: false }))
    }
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [modal.isOpen])

  /**
   * Industrial Standard Day Separator Formatter Engine for Visitors
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

  const triggerMessageInfo = (
    e: React.MouseEvent | React.TouchEvent,
    msg: ChatMessage,
  ) => {
    if (msg.sessionId === 'system' || msg.senderType === 'system') return

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

    const modalWidth = 240
    const modalHeight = 140
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

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return '--:--'
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  // 🎯 STEP 1: Process and distribute active chat feed elements into timeline buckets
  const groupedTimeline = useMemo(() => {
    const buckets: { [key: string]: ChatMessage[] } = {}

    visibleMessages.forEach((message) => {
      const dayKey = formatDividerDate(message.createdAt)
      if (!buckets[dayKey]) buckets[dayKey] = []
      buckets[dayKey].push(message)
    })

    return buckets
  }, [visibleMessages])

  return (
    <div className="flex-1 overflow-y-auto bg-background p-4 relative select-none">
      <div className="flex flex-col">
        {/* Welcome message pinned safely at the absolute top of layout */}
        <MessageBubble
          message={{
            sessionId: 'system',
            senderId: 'system',
            senderType: 'system',
            messageText:
              widget?.settings?.welcomeMessage ??
              'Hi! How can we help you today?',
            createdAt: new Date().toISOString(),
          }}
        />

        {/* 🎯 STEP 2: Iterate over grouped timelines to append visual standard dividers */}
        {Object.keys(groupedTimeline).map((dayKey) => (
          <div key={dayKey} className="flex flex-col gap-4">
            {/* Visual Timeframe Separator Badge Line */}
            <div className="flex items-center my-4 w-full select-none">
              <div className="flex-1 h-px bg-linear-to-r from-transparent via-border/70 to-transparent" />
              <span className="mx-4 text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground bg-muted/90 backdrop-blur-xs border border-border px-3 py-0.5 rounded-full shadow-xs text-center">
                {dayKey}
              </span>
              <div className="flex-1 h-px bg-linear-to-r from-transparent via-border/70 to-transparent" />
            </div>

            {/* Print messages bound to this calendar group */}
            {groupedTimeline[dayKey].map((message, index) => {
              const messageKey =
                message._id ??
                `${message.senderId}-${message.createdAt}-${index}`

              const isSystemNotice =
                message.senderType === 'system' ||
                message.sessionId === 'system' ||
                (message.messageText &&
                  (message.messageText
                    .toLowerCase()
                    .includes('transferred to') ||
                    message.messageText.toLowerCase().includes('joined chat') ||
                    message.messageText
                      .toLowerCase()
                      .includes('presence_notification')))

              if (isSystemNotice) {
                return (
                  <div
                    key={messageKey}
                    className="flex items-center my-2 w-full select-none"
                  >
                    <div className="flex-1 h-px bg-linear-to-r from-transparent via-border to-transparent" />
                    <span className="mx-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/80 backdrop-blur-xs border border-border px-3 py-1 rounded-full shadow-xs text-center">
                      {message.messageText}
                    </span>
                    <div className="flex-1 h-px bg-linear-to-r from-transparent via-border to-transparent" />
                  </div>
                )
              }

              return (
                <div
                  key={messageKey}
                  className="cursor-help"
                  onContextMenu={(e) => triggerMessageInfo(e, message)}
                  onTouchStart={(e) => {
                    longPressTimerRef.current = setTimeout(
                      () => triggerMessageInfo(e, message),
                      500,
                    )
                  }}
                  onTouchEnd={() => {
                    if (longPressTimerRef.current)
                      clearTimeout(longPressTimerRef.current)
                  }}
                >
                  <MessageBubble message={message} />
                </div>
              )
            })}
          </div>
        ))}

        {/* Typing Indicators */}
        {(operatorTyping || aiTyping) && <TypingIndicator visible={true} />}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Floating Visitor-facing Telemetry Card */}
      {modal.isOpen && modal.message && (
        <div
          className="fixed z-50 w-60 rounded-xl border border-border bg-card p-3 shadow-xl backdrop-blur-md animate-in zoom-in-95 duration-100 text-foreground"
          style={{ top: `${modal.y}px`, left: `${modal.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-border pb-1 mb-2">
            <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
              <FiInfo size={10} /> Message Details
            </span>
            <button
              onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
              className="text-muted-foreground hover:text-foreground rounded p-0.5"
            >
              <FiX size={12} />
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                <FiClock size={11} className="text-blue-400" /> Sent:
              </span>
              <span className="font-medium text-[11px]">
                {formatTimestamp(modal.message.createdAt)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                <FiCheck
                  size={11}
                  className={
                    modal.message.status !== 'sent' &&
                    modal.message.status !== 'failed'
                      ? 'text-emerald-400'
                      : 'text-muted-foreground/40'
                  }
                />{' '}
                Delivered:
              </span>
              <span className="font-medium text-[11px]">
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
              <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                <FiCheckSquare
                  size={11}
                  className={
                    modal.message.status === 'seen'
                      ? 'text-indigo-400'
                      : 'text-muted-foreground/40'
                  }
                />{' '}
                Read:
              </span>
              <span className="font-medium text-[11px]">
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
