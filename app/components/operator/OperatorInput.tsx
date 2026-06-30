// /components/operator/OperatorInput.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { FaPaperclip } from 'react-icons/fa'
import { FaFaceSmile, FaPaperPlane } from 'react-icons/fa6'

import { sendOperatorMessage, sendTypingStatus } from '@/app/lib/api/chat.api'
import { useAuthStore } from '@/app/store/useAuthStore'
import { getChatSocket } from '@/app/hooks/useChatSocket'

export interface OperatorInputProps {
  sessionId: string
}

export default function OperatorInput({ sessionId }: OperatorInputProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)
  const isCurrentlyTyping = useRef(false)

  const operator = useAuthStore((state) => state.operator)
  const socket = getChatSocket()

  useEffect(() => {
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current)
    }
  }, [])

  const sendMessage = async () => {
    const trimmed = message.trim()
    if (!trimmed || sending) return

    const operatorId = operator?._id
    if (!operatorId) {
      console.error('❌ Missing valid authentication credentials context ID.')
      return
    }

    try {
      setSending(true)

      if (typingTimeout.current) clearTimeout(typingTimeout.current)
      await sendTyping(false)

      // 🎯 API resolves backend database operations, Socket handler streams message automatically
      await sendOperatorMessage({
        sessionId,
        senderType: 'operator',
        senderId: operatorId,
        messageText: trimmed,
        messageType: 'text',
        isFromAI: false,
      })

      setMessage('')
    } catch (error) {
      console.error(
        '❌ Message push failure execution handler exception:',
        error,
      )
    } finally {
      setSending(false)
    }
  }

  const sendTyping = async (typing: boolean) => {
    isCurrentlyTyping.current = typing
    try {
      await sendTypingStatus(sessionId, { actor: 'operator', typing })

      if (socket && socket.connected) {
        socket.emit('typing', {
          sessionId,
          senderName: 'Operator',
          isTyping: typing,
        })
      }
    } catch (error) {
      console.error('❌ Failed to emit typing tracking payload data:', error)
    }
  }

  const handleChange = (value: string) => {
    setMessage(value)

    if (!isCurrentlyTyping.current) {
      void sendTyping(true)
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      void sendTyping(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  return (
    <div className="border-t border-border bg-card/80 p-3 md:p-4 backdrop-blur-md">
      <div className="flex items-end gap-2 md:gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-1 pb-1.5 md:pb-2">
          <button
            type="button"
            className="p-2 text-muted-foreground transition hover:text-foreground rounded-lg hover:bg-muted/80"
          >
            <FaPaperclip size={16} />
          </button>
          <button
            type="button"
            className="p-2 text-muted-foreground transition hover:text-foreground rounded-lg hover:bg-muted/80"
          >
            <FaFaceSmile size={16} />
          </button>
        </div>

        <div className="flex-1 relative bg-background rounded-xl border border-border focus-within:border-primary/50 transition-all flex items-center px-3 py-1">
          <textarea
            rows={1}
            value={message}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              operator
                ? 'Type your dispatch reply message...'
                : 'Authenticating authorization credentials...'
            }
            disabled={!operator}
            className="w-full max-h-32 min-h-9.5 py-2 bg-transparent text-xs outline-none resize-none disabled:opacity-50 text-foreground custom-scrollbar leading-relaxed"
          />
        </div>

        <button
          type="button"
          onClick={() => void sendMessage()}
          disabled={sending || !message.trim() || !operator}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/15 transition hover:opacity-90 disabled:opacity-40"
        >
          <FaPaperPlane size={14} />
        </button>
      </div>
    </div>
  )
}