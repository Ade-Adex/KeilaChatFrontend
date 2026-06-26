//  /app/components/chat/ChatInput.tsx

'use client'

import { FiSend } from 'react-icons/fi'

interface Props {
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
}: Props) {
  return (
    <div
      className="
        border-t
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
          value={value}
          disabled={disabled}
          placeholder="Type a message..."
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          className="
            flex-1
            rounded-xl
            border
            bg-background
            px-4
            py-3
            text-sm
            outline-none
          "
        />

        {!!value.trim() && (
          <button
            onClick={onSend}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-blue-600
              text-white
              transition
              hover:scale-105
              cursor-pointer
            "
          >
            <FiSend />
          </button>
        )}
      </div>

      <div
        className="
          mt-2
          text-center
          text-[10px]
          text-muted-foreground
        "
      >
        Powered by <strong>Keila Technologies</strong>
      </div>
    </div>
  )
}