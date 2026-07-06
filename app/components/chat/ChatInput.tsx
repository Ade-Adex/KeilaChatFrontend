//  /app/components/chat/ChatInput.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { FiSend, FiSmile } from 'react-icons/fi'
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react'

interface ChatInputProps {
  value: string
  disabled?: boolean
  onChange: (value: string) => void
  onSend: () => void
}

export default function ChatInput({
  value,
  disabled = false,
  onChange,
  onSend,
}: ChatInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const canSend = !disabled && value.trim().length > 0

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && canSend) {
      event.preventDefault()
      onSend()
      setShowEmojiPicker(false)
    }
  }

  // Close emoji picker when clicking anywhere outside the container wrapper
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Safely extract and append unicode string from library picker callback
  function handleEmojiClick(emojiData: EmojiClickData) {
    onChange(value + emojiData.emoji)
    inputRef.current?.focus()
  }

  if (disabled) {
    return (
      <div
        className="
          border-t
          bg-card
          p-4
          text-center
          text-sm
          text-foreground
        "
      >
        This chat session has ended.
      </div>
    )
  }

  return (
    <div
      className="
        relative
        border-t border-border
        bg-card
        p-3
      "
    >
      {/* Dynamic Emoji Picker Dropdown Panel */}
      {showEmojiPicker && (
        <div
          ref={pickerRef}
          className="
            absolute
            bottom-16
            left-4
            z-50
            shadow-2xl
          "
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            theme={Theme.AUTO} // Inherits system dark/light configuration cleanly
            width={320}
            height={400}
          />
        </div>
      )}

      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            text-muted-foreground
            transition
            hover:bg-accent
            hover:text-foreground
          "
        >
          <FiSmile size={20} />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder="Type a message..."
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="
            flex-1
            rounded-full
            border border-border
            bg-background
            text-foreground
            px-4
            py-2.5
            text-sm
            outline-none
            transition
            focus:border-primary
          "
        />

        <button
          type="button"
          disabled={!canSend}
          onClick={() => {
            onSend()
            setShowEmojiPicker(false)
          }}
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-blue-600
            text-white
            transition
            hover:bg-blue-500
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <FiSend size={18} />
        </button>
      </div>

      <div
        className="
          mt-2
          text-center
          text-[10px]
          text-foreground
        "
      >
        Powered by <strong>Keila Technologies</strong>
      </div>
    </div>
  )
}