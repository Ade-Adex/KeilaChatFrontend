//  /app/components/chat/ChatLauncher.tsx

// import { FiMessageSquare } from 'react-icons/fi'

// export const ChatLauncher = ({ onClick }: { onClick: () => void }) => (
//   <button
//     onClick={onClick}
//     className="
//       w-full h-full flex items-center justify-center
//       bg-blue-600 hover:bg-blue-500
//       border-b-4 border-blue-900/50
//       active:border-b-0 active:translate-y-1
//       transition-all duration-200 ease-out
//       rounded-full text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)]
//       animate-in zoom-in cursor-pointer
//     "
//   >
//     <FiMessageSquare size={24} />
//   </button>
// )




// /app/components/chat/ChatLauncher.tsx

import { FiMessageSquare } from 'react-icons/fi'
import type { WidgetConfig } from '@/app/types/chat'

interface Props {
  onClick: () => void
  widget?: WidgetConfig
}

export function ChatLauncher({
  onClick,
  widget,
}: Props) {
  return (
    <button
      onClick={onClick}
      aria-label="Open chat"
      className="
        flex
        h-full
        w-full
        items-center
        justify-center
        rounded-full
        shadow-xl
        transition-all
        duration-300
        hover:scale-105
        active:scale-95
        cursor-pointer
      "
      style={{
        background:
          widget?.theme?.primaryColor ??
          '#2563eb',
        color: '#ffffff',
      }}
    >
      <FiMessageSquare size={24} />
    </button>
  )
}