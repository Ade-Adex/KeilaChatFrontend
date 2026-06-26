// /app/components/chat/MessageBubble.tsx

'use client'

import type { ChatMessage } from '@/app/types/chat'

interface Props {
  message: ChatMessage
}

export default function MessageBubble({ message }: Props) {
  const isVisitor = message.senderType === 'visitor'

  const isSystem = message.senderType === 'system'

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div
          className="
            rounded-full
            bg-muted
            px-4
            py-2
            text-xs
            text-muted-foreground
          "
        >
          {message.messageText}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${isVisitor ? 'items-end' : 'items-start'}`}>
      <div
        className={`
          max-w-[80%]
          rounded-2xl
          px-4
          py-3
          text-sm
          shadow-sm
          ${
            isVisitor
              ? 'rounded-br-sm bg-blue-600 text-white'
              : 'rounded-bl-sm bg-card'
          }
        `}
      >
        {message.messageText}
      </div>

      <span
        className="
          mt-1
          px-1
          text-[10px]
          text-muted-foreground
        "
      >
        {time}
      </span>
    </div>
  )
}
