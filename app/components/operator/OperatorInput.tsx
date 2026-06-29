// /components/operator/OperatorInput.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { FaPaperclip } from 'react-icons/fa'
import { FaFaceSmile, FaPaperPlane } from 'react-icons/fa6'

import { sendOperatorMessage, sendTypingStatus } from '@/app/lib/api/chat.api'
import { useAuthStore } from '@/app/store/useAuthStore' // Verified filename match

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
  const [hydrated, setHydrated] = useState(false) // Tracking state hydration
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)

  const operator = useAuthStore((state) => state.operator)

  console.log('operator', operator)

  // Wait until Zustand reads localStorage and hydrates client layout
  // useEffect(() => {
  //   setHydrated(true)
  //   return () => {
  //     if (typingTimeout.current) {
  //       clearTimeout(typingTimeout.current)
  //     }
  //   }
  // }, [])

  const sendMessage = async () => {
    const trimmed = message.trim()

    if (!trimmed || sending) {
      return
    }

    // Fixed ID lookups to align directly with OperatorData.id properties
    const operatorId = operator?._id
    if (!operatorId) {
      console.error(
        '❌ Cannot dispatch message: Operator profile missing from Zustand auth store.',
      )
      return
    }

    try {
      setSending(true)

      const result = await sendOperatorMessage({
        sessionId,
        senderType: 'operator',
        senderId: operatorId, // <-- TypeScript Compilation Fixed
        messageText: trimmed,
        messageType: 'text',
        isFromAI: false,
      })

      if (result?.data) {
        onMessageSent?.(result.data)
      }

      setMessage('')
    } catch (error) {
      console.error('❌ Operator message submission failed:', error)
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

  // Prevent early rendering of the input element actions while store is empty/hydrating
  if (!hydrated) return null

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="flex items-end gap-3">
        <button
          type="button"
          className="pb-3 text-muted-foreground transition hover:text-foreground"
        >
          <FaPaperclip size={18} />
        </button>

        <button
          type="button"
          className="pb-3 text-muted-foreground transition hover:text-foreground"
        >
          <FaFaceSmile size={18} />
        </button>

        <textarea
          rows={1}
          value={message}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            operator ? 'Type your message...' : 'Authenticating operator...'
          }
          disabled={!operator}
          className="max-h-40 min-h-11 flex-1 resize-none rounded-lg border border-border bg-background px-4 py-3 outline-none disabled:opacity-50"
        />

        <button
          type="button"
          onClick={() => void sendMessage()}
          disabled={sending || !message.trim() || !operator}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  )
}