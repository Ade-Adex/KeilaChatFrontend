// /app/components/chat/ChatWindow.tsx

'use client'

import { ChatWindowProps } from "@/app/types/chat"

export default function ChatWindow({
  widget,
  onClose,
}: ChatWindowProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-background shadow-2xl">

      {/* Header */}
      <div
        className="flex items-center justify-between p-4 text-white"
        style={{
          background: widget.theme?.primaryColor ?? '#2563eb',
        }}
      >
        <div>
          <h3 className="font-semibold">
            Live Support
          </h3>

          <p className="text-xs opacity-80">
            We are online
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-xl"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        Messages will go here
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <input
          placeholder="Type a message..."
          className="
            w-full
            rounded-xl
            border
            px-4
            py-3
            outline-none
          "
        />
      </div>
    </div>
  )
}