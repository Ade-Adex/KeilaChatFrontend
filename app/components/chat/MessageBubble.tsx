// /app/components/chat/MessageBubble.tsx

'use client'

import type { ChatMessage } from '@/app/types/chat'

interface Props {
  message: ChatMessage
}

function MessageStatusTicks({
  status,
}: {
  status?: 'sent' | 'delivered' | 'seen' | 'failed'
}) {
  switch (status) {
    case 'sent':
      return (
        <span
          className="text-white/40 text-[10px] tracking-normal font-normal select-none"
          title="Sent to Server"
        >
          ✓
        </span>
      )
    case 'delivered':
      return (
        <span
          className="text-white/70 text-[10px] tracking-[-3px] pr-1 font-bold select-none"
          title="Delivered to Workspace Desk"
        >
          ✓✓
        </span>
      )
    case 'seen':
      return (
        <span
          className="text-sky-300 font-extrabold text-[10px] tracking-[-3px] pr-1 select-none"
          title="Seen by Operator"
        >
          ✓✓
        </span>
      )
    case 'failed':
      return (
        <span
          className="text-red-400 text-[10px] font-semibold select-none"
          title="Failed"
        >
          ✕
        </span>
      )
    default:
      return <span className="text-white/30 text-[10px] select-none">✓</span>
  }
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

      <div className="mt-1 flex items-center gap-1 px-1">
        <span className="text-[10px] text-muted-foreground">{time}</span>

        {/* 🎯 Only render status checkmarks for the visitor's outgoing messages */}
        {isVisitor && <MessageStatusTicks status={message.status} />}
      </div>
    </div>
  )
}