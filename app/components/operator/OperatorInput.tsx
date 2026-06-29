// /components/operator/OperatorInput.tsx

'use client'

import { useState, useRef, useEffect } from 'react'

import { FaPaperclip } from 'react-icons/fa'

import { FaFaceSmile, FaPaperPlane } from 'react-icons/fa6'

import { sendOperatorMessage, sendTypingStatus } from '@/app/lib/api/chat.api'

import type { ChatMessage } from '@/app/types/dashboard'

export interface OperatorInputProps {
  sessionId: string
  onMessageSent?: (message: ChatMessage) => void
}

export default function OperatorInput({
  sessionId,
  onMessageSent,
}: OperatorInputProps) {
  const [message, setMessage] = useState('')

  const [sending, setSending] = useState(false)

  const typingTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current)
      }
    }
  }, [])

  const sendMessage = async () => {
    const trimmed = message.trim()

    if (!trimmed || sending) {
      return
    }

    try {
      setSending(true)

      const operator = localStorage.getItem('operator')

      const operatorData = operator ? JSON.parse(operator) : null

      const result = await sendOperatorMessage({
        sessionId,

        senderType: 'operator',

        senderId: operatorData?._id,

        messageText: trimmed,

        messageType: 'text',

        isFromAI: false,
      })

      if (result?.data) {
        onMessageSent?.(result.data)
      }

      setMessage('')
    } catch (error) {
      console.error(error)
    } finally {
      setSending(false)
    }
  }

  

  const sendTyping = async (typing: boolean) => {
    try {
      await sendTypingStatus(sessionId, {
        actor: 'operator',

        typing,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleChange = (value: string) => {
    setMessage(value)

    void sendTyping(true)

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current)
    }

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
    <div className="border-t border-border bg-card p-4">
      <div className="flex items-end gap-3">
        {/* attachment */}
        <button
          type="button"
          className="pb-3 text-muted-foreground transition hover:text-foreground"
        >
          <FaPaperclip size={18} />
        </button>

        {/* emoji */}
        <button
          type="button"
          className="pb-3 text-muted-foreground transition hover:text-foreground"
        >
          <FaFaceSmile size={18} />
        </button>

        {/* textarea */}
        <textarea
          rows={1}
          value={message}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="max-h-40 min-h-11 flex-1 resize-none rounded-lg border border-border bg-background px-4 py-3 outline-none"
        />

        {/* send */}
        <button
          type="button"
          onClick={() => void sendMessage()}
          disabled={sending || !message.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  )
}