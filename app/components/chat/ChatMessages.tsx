// /app/components/chat/ChatMessages.tsx

'use client'

import { useEffect, useRef } from 'react'

import type { ChatMessage, WidgetConfig } from '@/app/types/chat'

import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

interface Props {
  widget: WidgetConfig

  messages: ChatMessage[]

  operatorTyping: boolean
}

export default function ChatMessages({
  widget,
  messages,
  operatorTyping,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: 'smooth',
      })
    }, 50)

    return () => clearTimeout(timer)
  }, [messages, operatorTyping])

  return (
    <div
      className="
        flex-1
        overflow-y-auto
        bg-background
        p-4
      "
    >
      <div className="flex flex-col gap-4">
        {/* Welcome message */}

        <MessageBubble
          message={{
            sessionId: 'system',

            senderId: 'system',

            senderType: 'operator',

            messageText:
              widget.settings?.welcomeMessage ??
              'Hi! How can we help you today?',

            createdAt: new Date().toISOString(),
          }}
        />

        {/* Actual messages */}

        {messages.map((message) => (
          <MessageBubble
            key={message._id ?? `${message.senderId}-${message.createdAt}`}
            message={message}
          />
        ))}

        {/* Typing */}

        {operatorTyping && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
