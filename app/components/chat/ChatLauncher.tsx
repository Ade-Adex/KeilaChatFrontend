//  /app/components/chat/ChatLauncher.tsx

'use client'

import type { WidgetConfig } from '@/app/types/chat'
import { BsChatSquareDotsFill } from 'react-icons/bs'

interface Props {
  widget: WidgetConfig | null
  onClick: () => void
  unreadCount: number
}

export function ChatLauncher({ widget, onClick, unreadCount }: Props) {
  const iconColor = '#ffffff' 

  return (
    <div className="relative h-16 w-16 flex items-center justify-center overflow-visible">
      <button
        onClick={onClick}
        aria-label="Open Chat"
        className="
          h-14
          w-14
          rounded-full
          shadow-lg
          flex
          items-center
          justify-center
          cursor-pointer
          transition-transform
          hover:scale-105
          active:scale-95
          border-none
          outline-none
        "
        style={{
          background: widget?.theme?.primaryColor ?? '#2563eb',
        }}
      >
        <BsChatSquareDotsFill 
          size={24} 
          style={{ color: iconColor }} 
        />
      </button>

      {unreadCount > 0 && (
        <span
          className="
            absolute 
            top-0
            right-0
            text-white 
            text-[11px] 
            font-bold 
            rounded-full 
            h-5 
            min-w-5 
            px-1
            flex 
            items-center 
            justify-center 
            shadow-md
            animate-bounce
            z-50
            pointer-events-none
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