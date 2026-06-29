// /components/operator/MessageBubble.tsx

'use client'

import Image from 'next/image'
import { memo } from 'react'

import {
  FaRobot,
  FaUser,
  FaUserTie,
  FaFile,
  FaMusic,
} from 'react-icons/fa'

import type { ChatMessage } from '@/app/types/dashboard'

export interface MessageBubbleProps {
  message: ChatMessage
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

  // SYSTEM EVENTS
  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="rounded-full bg-muted px-4 py-2 text-xs text-muted-foreground">
          {message.messageText || 'System event'}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isOperator ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex max-w-[75%] gap-3 ${
          isOperator ? 'flex-row-reverse' : ''
        }`}
      >
        {/* avatar */}
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-card">
          {isVisitor && <FaUser size={14} />}

          {isOperator && <FaUserTie size={14} />}

          {isAI && <FaRobot size={14} className="text-blue-500" />}
        </div>

        {/* bubble */}
        <div className="space-y-1">
          <div
            className={`rounded-2xl px-4 py-3 ${
              isOperator
                ? 'bg-primary text-primary-foreground'
                : isAI
                  ? 'border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950'
                  : 'bg-muted'
            }`}
          >
            {/* text */}
            {message.messageText && (
              <p className="mb-2 whitespace-pre-wrap break-words text-sm">
                {message.messageText}
              </p>
            )}

            {/* attachments */}
            {message.attachments?.map((attachment, index) => {
              // image
              if (attachment.fileType.startsWith('image/')) {
                return (
                  <div key={index} className="mt-2">
                    <Image
                      src={attachment.fileUrl}
                      alt={attachment.fileName}
                      width={300}
                      height={200}
                      className="rounded-lg object-cover"
                      unoptimized
                    />
                  </div>
                )
              }

              // video
              if (attachment.fileType.startsWith('video/')) {
                return (
                  <div key={index} className="mt-2">
                    <video controls className="max-w-full rounded-lg">
                      <source src={attachment.fileUrl} />
                    </video>
                  </div>
                )
              }

              // audio
              if (attachment.fileType.startsWith('audio/')) {
                return (
                  <div key={index} className="mt-2 flex items-center gap-2">
                    <FaMusic />

                    <audio controls>
                      <source src={attachment.fileUrl} />
                    </audio>
                  </div>
                )
              }

              // generic file
              return (
                <a
                  key={index}
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex items-center gap-2 rounded-lg border p-3 text-sm hover:bg-background"
                >
                  <FaFile />

                  <span>{attachment.fileName}</span>
                </a>
              )
            })}
          </div>

          {/* footer */}
          <div
            className={`flex items-center gap-2 px-2 text-xs text-muted-foreground ${
              isOperator ? 'justify-end' : ''
            }`}
          >
            <span>{formattedTime}</span>

            {isOperator && message.status && (
              <span className="capitalize">{message.status}</span>
            )}

            {isAI && <span className="text-blue-500">AI</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(MessageBubble)