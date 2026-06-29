// /components/operator/MessageFeed.tsx

'use client'

import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import type { ChatMessage } from '@/app/types/dashboard'

export interface MessageFeedProps {
  messages: ChatMessage[]
  loading?: boolean
}

export default function MessageFeed({
  messages,
  loading = false,
}: MessageFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
        <p className="text-xs text-muted-foreground/60 max-w-[200px] leading-relaxed italic border border-dashed border-border/50 rounded-2xl p-4 bg-card/20">
          No dispatch transactions verified on this channel thread.
        </p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-background/20">
      <div className="flex flex-col gap-3.5 p-4 md:p-6 max-w-5xl mx-auto">
        {messages.map((message) => (
          <div
            key={message._id}
            className="animate-in fade-in duration-300 slide-in-from-bottom-1"
          >
            <MessageBubble message={message} />
          </div>
        ))}
        <div ref={bottomRef} className="h-2" />
      </div>
    </div>
  )
}