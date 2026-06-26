// /app/components/chat/ChatMessages.tsx

'use client'

import { useEffect, useRef } from 'react'

import type { ChatMessage } from '@/app/types/chat'

import { getMessageDate } from '@/app/lib/chatDate'

import MessageBubble from './MessageBubble'
import SystemMessage from './SystemMessage'
import TypingIndicator from './TypingIndicator'

interface Props {
  messages: ChatMessage[]
  operatorTyping?: boolean
}

export default function ChatMessages({
  messages,
  operatorTyping = false,
}: Props) {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  /*
   ********************************
   * Professional auto-scroll
   ********************************
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: messages.length < 20 ? 'auto' : 'smooth',
      })
    }, 50)

    return () => clearTimeout(timer)
  }, [messages, operatorTyping])

  /*
   ********************************
   * Group messages by date
   ********************************
   */
  const groupedMessages: Record<string, ChatMessage[]> = {}

  for (const message of messages) {
    const group = getMessageDate(message.createdAt)

    if (!groupedMessages[group]) {
      groupedMessages[group] = []
    }

    groupedMessages[group].push(message)
  }

  return (
    <div
      className="
        flex-1
        overflow-y-auto
        bg-background
        p-4
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4
        "
      >
        {/* Welcome message */}
        <MessageBubble
          message={{
            sessionId: 'system',
            senderId: 'system',
            senderType: 'operator',
            messageText: 'Hi! How can we help you today?',
            createdAt: new Date().toISOString(),
          }}
        />

        {Object.entries(groupedMessages).map(([date, groupMessages]) => (
          <div
            key={date}
            className="
                flex
                flex-col
                gap-3
              "
          >
            {/* Date separator */}
            <div
              className="
                  text-center
                  text-[11px]
                  text-muted-foreground
                "
            >
              {date}
            </div>

            {groupMessages.map((message, index) => {
              if (message.senderType === 'system') {
                return (
                  <SystemMessage
                    key={message._id ?? index}
                    text={message.messageText}
                  />
                )
              }

              return (
                <MessageBubble key={message._id ?? index} message={message} />
              )
            })}
          </div>
        ))}

        {operatorTyping && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}