//  /app/components/chat/ChatLauncher.tsx

import { FiMessageSquare } from 'react-icons/fi'

export const ChatLauncher = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white"
  >
    <FiMessageSquare size={24} />
  </button>
)

