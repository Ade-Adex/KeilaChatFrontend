// /app/components/chat/MessageBubble.tsx

'use client'

import MessageStatusTicks from '@/app/components/MessageStatusTicks'
import type { ChatMessage } from '@/app/types/chat'
import Image from 'next/image'

interface Props {
  message: ChatMessage & { media?: string[]; messageType?: string }
}

export default function MessageBubble({ message }: Props) {
  const isVisitor = message.senderType === 'visitor'
  const isSystem =
    message.senderType === 'system' || message.sessionId === 'system'

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (isSystem) {
    return (
      <div className="flex justify-center w-full my-1">
        <div
          className="
            rounded-full
            bg-muted
            px-4
            py-1.5
            text-[11px]
            text-foreground
            text-center
          "
        >
          {message.messageText}
        </div>
      </div>
    )
  }

  const isAudioUrl = (url: string) => {
    const cleanUrl = url.toLowerCase().split('?')[0]
    return (
      cleanUrl.endsWith('.mp3') ||
      cleanUrl.endsWith('.wav') ||
      cleanUrl.endsWith('.ogg') ||
      cleanUrl.endsWith('.aac') ||
      cleanUrl.endsWith('.webm') ||
      url.includes('video/upload') ||
      url.includes('voice-note')
    )
  }

  const isImageUrl = (url: string) => {
    const cleanUrl = url.toLowerCase().split('?')[0]
    return (
      cleanUrl.endsWith('.jpg') ||
      cleanUrl.endsWith('.jpeg') ||
      cleanUrl.endsWith('.png') ||
      cleanUrl.endsWith('.gif') ||
      cleanUrl.endsWith('.webp')
    )
  }

  const hasText = Boolean(message.messageText && message.messageText.trim())
  const hasMedia = Boolean(message.media && message.media.length > 0)

  return (
    <div
      className={`flex flex-col ${isVisitor ? 'items-end' : 'items-start'} mb-2`}
    >
      <div
        className={`
          max-w-[80%]
          rounded-2xl
          px-4
          py-2
          text-sm
          shadow-sm
          flex flex-col gap-2
          ${
            isVisitor
              ? 'rounded-br-sm bg-blue-600 text-white'
              : 'rounded-bl-sm bg-chat-agent border border-chat-agent-border text-foreground'
          }
        `}
      >
        {/* Render media attachments cleanly if they exist inside the message bucket */}
        {message.media && message.media.length > 0 && (
          <div className="flex flex-col gap-2 my-1 max-w-full">
            {message.media.map((url, idx) => {
              if (isAudioUrl(url)) {
                return (
                  <div key={idx} className="w-64 max-w-full py-1">
                    <audio
                      src={url}
                      controls
                      preload="metadata"
                      className="w-full h-6 outline-hidden rounded-md accent-blue-600"
                    />
                  </div>
                )
              }

              if (isImageUrl(url)) {
                return (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="overflow-hidden rounded-lg border border-white/10 block hover:opacity-90 transition-opacity relative w-48 h-48"
                  >
                    {/* 🎯 Next.js Image component with fill strategy for dynamic chat sizing */}
                    <Image
                      src={url}
                      alt="Chat Attachment"
                      fill
                      sizes="(max-width: 768px) 100vw, 192px"
                      className="object-cover rounded-lg"
                      unoptimized={url.endsWith('.gif')} // Let GIFs animate naturally
                    />
                  </a>
                )
              }

              return (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-xs flex items-center gap-1 break-all tracking-wide opacity-90 hover:opacity-100"
                >
                  📁 Attachment Document #{idx + 1}
                </a>
              )
            })}
          </div>
        )}

        {/* Render text string message alongside attachments if present */}
        {hasText ? (
          <span className="leading-relaxed wrap-break-words">
            {message.messageText}
          </span>
        ) : hasMedia ? (
          <span className="leading-relaxed wrap-break-words text-muted-foreground">
            Media attachment
          </span>
        ) : null}
      </div>

      <div className="mt-1 flex items-center gap-1 px-1">
        <span className="text-[10px] text-muted-foreground">{time}</span>
        {isVisitor && <MessageStatusTicks status={message.status} />}
      </div>
    </div>
  )
}
