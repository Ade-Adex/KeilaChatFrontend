//  /app/components/chat/ChatInput.tsx
'use client'

import { FiSend } from 'react-icons/fi'

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
  const canSend = !disabled && value.trim().length > 0

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && canSend) {
      event.preventDefault()

      onSend()
    }
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
        border-t border-border
        bg-card
        p-3
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        <input
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
          onClick={onSend}
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
