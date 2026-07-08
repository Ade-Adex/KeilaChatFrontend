//  /app/components/chat/ChatLauncher.tsx

'use client'

import type { WidgetConfig } from '@/app/types/chat'

interface Props {
  widget: WidgetConfig | null
  onClick: () => void
  unreadCount: number
}

export function ChatLauncher({ widget, onClick, unreadCount }: Props) {
  return (
    // 🎯 FIX: Explicitly enforce exact 64px containment boundaries matching your script dimension bounds
    <div className="relative h-16 w-16 flex items-center justify-center overflow-visible">
      <button
        onClick={onClick}
        className="
          h-14
          w-14
          rounded-full
          shadow-lg
          flex
          items-center
          justify-center
          text-2xl
          cursor-pointer
          transition-transform
          hover:scale-105
          active:scale-95
          border-none
        "
        style={{
          background: widget?.theme?.primaryColor ?? '#2563eb',
        }}
      >
        💬
      </button>

      {/* 🎯 FIX: Absolute position shifted completely INSIDE the 64px viewport frame boundaries */}
      {unreadCount > 0 && (
        <span
          className="
            absolute 
            top-1
            right-1
            bg-red-500 
            text-white 
            text-xs 
            font-bold 
            rounded-full 
            h-5 
            min-w-[20px] 
            px-1.5
            flex 
            items-center 
            justify-center 
            shadow-md
            animate-pulse
            z-50
          "
          style={{
            color: '#ffffff',
            backgroundColor: '#ef4444',
          }}
        >
          {unreadCount}
        </span>
      )}
    </div>
  )
}