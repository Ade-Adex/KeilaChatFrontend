//  /app/components/chat/ChatLauncher.tsx

import { FiMessageSquare } from 'react-icons/fi'

export const ChatLauncher = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="
      w-full h-full flex items-center justify-center 
      bg-blue-600 hover:bg-blue-500 
      /* 3D Effect: A thick bottom border creates depth */
      border-b-4 border-blue-900/50 
      active:border-b-0 active:translate-y-[4px] 
      transition-all duration-200 ease-out
      rounded-full text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)]
      animate-in zoom-in
    "
  >
    <FiMessageSquare size={24} />
  </button>
)