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
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">No messages yet</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col gap-4 p-6">
        {messages.map((message) => (
          <div key={message._id} className="animate-in fade-in duration-200">
            <MessageBubble message={message} />
          </div>
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}