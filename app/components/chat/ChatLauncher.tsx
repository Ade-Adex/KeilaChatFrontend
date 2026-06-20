//  /app/components/chat/ChatLauncher.tsx

import { FiMessageSquare } from 'react-icons/fi'

export const ChatLauncher = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
  className="w-full h-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-lg text-white animate-in zoom-in" 
  >
    <FiMessageSquare size={24} />
  </button>
)
