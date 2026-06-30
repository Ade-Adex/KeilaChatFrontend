// /app/components/chat/ChatHeader.tsx

'use client'

import { FiX } from 'react-icons/fi'
import type { WidgetConfig } from '@/app/types/chat'

interface ChatHeaderProps {
  widget: WidgetConfig
  operatorName?: string
  onClose: () => void
}

export default function ChatHeader({
  widget,
  operatorName,
  onClose,
}: ChatHeaderProps) {


  console.log('operatorName', operatorName)
  // Custom parser to split "Company Name (FirstName)" into styled HTML elements
  const renderOperatorText = () => {
    if (!operatorName) return null

    const match = operatorName.match(/^(.*?)\s*\((.*?)\)$/)

    if (match) {
      const companyName = match[1]
      const firstName = match[2]
      return (
        <span>
          Chatting with <strong>{companyName}</strong> ({firstName})
        </span>
      )
    }

    return (
      <span>
        Chatting with <strong>{operatorName}</strong>
      </span>
    )
  }

  return (
    <>
      {/* Main Header */}
      <div
        className="
          flex
          items-center
          justify-between
          px-4
          py-4
          text-white
          shadow-sm
        "
        style={{
          background: widget.theme?.primaryColor ?? '#2563eb',
        }}
      >
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold">
            {widget.name ?? 'Live Support'}
          </h2>

          <p className="text-xs opacity-80">We&apos;re online</p>
        </div>

        <button
          onClick={onClose}
          aria-label="Close chat"
          className="
            rounded-full
            p-2
            transition
            hover:bg-white/10
            cursor-pointer
          "
        >
          <FiX size={18} />
        </button>
      </div>

      {/* Operator Presence Header banner */}
      {operatorName && (
        <div
          className="
            flex
            items-center
            gap-2
            border-b
            border-border
            bg-card
            px-4
            py-2
            text-xs
            text-foreground
          "
        >
          <div
            className="
              h-2
              w-2
              rounded-full
              bg-green-500
              animate-pulse
            "
          />
          {renderOperatorText()}
        </div>
      )}
    </>
  )
}