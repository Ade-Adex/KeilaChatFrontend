//  /app/components/chat/ChatLauncher.tsx

'use client'

import type { WidgetConfig } from '@/app/types/chat'

interface Props {
  widget: WidgetConfig
  onClick: () => void
}

export function ChatLauncher({ widget, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="
        h-15
        w-15
        rounded-full
        shadow-lg
        flex
        items-center
        justify-center
      "
      style={{
        background: widget.theme?.primaryColor ?? '#2563eb',
      }}
    >
      💬
    </button>
  )
}