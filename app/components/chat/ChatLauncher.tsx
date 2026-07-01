//  /app/components/chat/ChatLauncher.tsx

'use client'

import type { WidgetConfig } from '@/app/types/chat'

interface Props {
  widget: WidgetConfig
  onClick: () => void
  unreadCount: number // 🎯 Pass down the live count
}

export function ChatLauncher({ widget, onClick, unreadCount }: Props) {
  return (
    <div className="relative inline-block">
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
        "
        style={{
          background: widget.theme?.primaryColor ?? '#2563eb',
        }}
      >
        💬
      </button>

      {/* 🎯 NATIVE REACT BADGE: Renders inside the launcher's layout safely */}
      {unreadCount > 0 && (
        <span
          className="
            absolute 
            -top-1 
            -right-1 
            bg-red-500 
            color-white 
            text-xs 
            font-bold 
            rounded-full 
            h-5 
            min-w-[20px] 
            px-1.5
            flex 
            items-center 
            justify-center 
            animate-bounce
            shadow-md
          "
          style={{ color: '#ffffff' }}
        >
          {unreadCount}
        </span>
      )}
    </div>
  )
}