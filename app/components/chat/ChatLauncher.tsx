//  /app/components/chat/ChatLauncher.tsx

import { FiMessageSquare } from 'react-icons/fi'

export const ChatLauncher = ({ onClick }: { onClick: () => void }) => (
  // Remove 'fixed'. The iframe is already fixed.
  // Use flex/absolute to position within the iframe's viewport.
  <button
    onClick={onClick}
    className="absolute bottom-4 right-4 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:scale-105 transition-transform"
  >
    <FiMessageSquare size={24} />
  </button>
)
