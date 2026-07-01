// /components/operator/MessageBubble.tsx
'use client'

import Image from 'next/image'
import { memo } from 'react'
import { FaRobot, FaUser, FaUserTie, FaFile, FaMusic } from 'react-icons/fa'
import type { ChatMessage } from '@/app/types/dashboard'

export interface MessageBubbleProps {
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
        <span className="text-white/10 text-[10px] select-none" title="Sent">
          ✓
        </span>
      )
    case 'delivered':
      return (
        <span
          className="text-white/10 text-[10px] tracking-[-3px] pr-1 select-none"
          title="Delivered"
        >
          ✓✓
        </span>
      )
    case 'seen':
      return (
        <span
          className="text-sky-300 font-bold text-[10px] tracking-[-3px] pr-1 select-none"
          title="Seen"
        >
          ✓✓
        </span>
      )
    case 'failed':
      return (
        <span className="text-red-400 text-[10px] font-semibold" title="Failed">
          ✕
        </span>
      )
    default:
      return <span className="text-white/10 text-[10px] select-none">✓</span>
  }
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isVisitor = message.senderType === 'visitor'
  const isOperator = message.senderType === 'operator'
  const isAI = message.senderType === 'ai'
  const isSystem = message.senderType === 'system'

  const formattedTime = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  if (isSystem) {
    return (
      <div className="flex justify-center my-1 animate-in fade-in duration-200">
        <div className="rounded-full bg-muted/60 border border-border/40 px-4 py-1.5 text-[11px] text-muted-foreground shadow-sm">
          {message.messageText || 'System event'}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex w-full mb-1 ${isOperator ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`flex max-w-[85%] sm:max-w-[75%] gap-2.5 ${isOperator ? 'flex-row-reverse' : ''}`}
      >
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card shadow-sm text-muted-foreground/80">
          {isVisitor && <FaUser size={11} />}
          {isOperator && <FaUserTie size={11} />}
          {isAI && (
            <FaRobot size={12} className="text-blue-500 animate-pulse" />
          )}
        </div>

        <div
          className={`space-y-1 flex flex-col ${isOperator ? 'items-end' : 'items-start'}`}
        >
          <div
            className={`rounded-2xl px-3.5 py-2.5 shadow-sm text-xs leading-relaxed transition-all
              ${
                isOperator
                  ? 'bg-primary text-white rounded-tr-none'
                  : isAI
                    ? 'border border-blue-100/80 bg-blue-50/50 dark:border-blue-950/50 dark:bg-blue-950/30 rounded-tl-none'
                    : 'bg-muted/70 text-foreground rounded-tl-none'
              }`}
          >
            {message.messageText && (
              <p className="whitespace-pre-wrap wrap-break-word">
                {message.messageText}
              </p>
            )}

            {/* Attachments rendering logic remains perfectly preserved */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="space-y-2 mt-2">
                {message.attachments.map((attachment, index) => {
                  if (attachment.fileType.startsWith('image/')) {
                    return (
                      <div
                        key={index}
                        className="overflow-hidden rounded-lg border border-border/40 shadow-sm bg-background/20 max-w-xs"
                      >
                        <Image
                          src={attachment.fileUrl}
                          alt={attachment.fileName}
                          width={300}
                          height={200}
                          className="object-cover max-w-full h-auto hover:scale-[1.02] transition-transform duration-200"
                          unoptimized
                        />
                      </div>
                    )
                  }
                  if (attachment.fileType.startsWith('video/')) {
                    return (
                      <div key={index} className="mt-1.5 max-w-xs">
                        <video
                          controls
                          className="max-w-full rounded-lg border border-border/40 shadow-sm"
                        >
                          <source src={attachment.fileUrl} />
                        </video>
                      </div>
                    )
                  }
                  if (attachment.fileType.startsWith('audio/')) {
                    return (
                      <div
                        key={index}
                        className="mt-1.5 flex items-center gap-2 bg-background/40 p-1.5 rounded-lg border border-border/30"
                      >
                        <FaMusic
                          className="text-muted-foreground/80"
                          size={12}
                        />
                        <audio controls className="h-7 max-w-full">
                          <source src={attachment.fileUrl} />
                        </audio>
                      </div>
                    )
                  }
                  return (
                    <a
                      key={index}
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 inline-flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-[11px] font-medium text-foreground hover:bg-muted transition-colors max-w-xs truncate"
                    >
                      <FaFile
                        className="text-muted-foreground shrink-0"
                        size={12}
                      />
                      <span className="truncate">{attachment.fileName}</span>
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Timestamp and Checkmark Status Blocks */}
          <div className="flex items-center gap-1.5 px-1 text-[10px] font-medium text-muted-foreground/70">
            <span>{formattedTime}</span>
            {isOperator && <MessageStatusTicks status={message.status} />}
            {isAI && (
              <span className="bg-blue-500/10 text-blue-500 px-1 rounded font-bold text-[9px] tracking-wide">
                AI
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(MessageBubble)