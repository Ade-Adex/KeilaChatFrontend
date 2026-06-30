// /app/components/chat/ChatHeader.tsx

'use client'

import { FiX, FiMoreVertical, FiLogOut, FiEdit2 } from 'react-icons/fi'
import { Menu, ActionIcon } from '@mantine/core'
import type { WidgetConfig } from '@/app/types/chat'

interface ChatHeaderProps {
  widget: WidgetConfig
  operatorName?: string
  isSessionActive: boolean
  onOpenEndModal: () => void
  onClose: () => void
}

export default function ChatHeader({
  widget,
  operatorName,
  isSessionActive,
  onOpenEndModal,
  onClose,
}: ChatHeaderProps) {
  console.log('operatorName in Header:', operatorName)

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

        <div className="flex items-center gap-1">
          {/* Action Menu Dropdown Container */}
          <Menu shadow="md" width={180} position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="white"
                className="hover:bg-white/10 cursor-pointer rounded-full"
                size="md"
                aria-label="Chat menu options"
              >
                <FiMoreVertical size={18} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Settings</Menu.Label>
              <Menu.Item
                leftSection={<FiEdit2 size={14} />}
                onClick={() => alert('Change profile name placeholder')}
                className="cursor-pointer text-xs"
              >
                Change Name
              </Menu.Item>

              {isSessionActive && (
                <>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<FiLogOut size={14} />}
                    onClick={onOpenEndModal}
                    className="cursor-pointer text-xs"
                  >
                    End Conversation
                  </Menu.Item>
                </>
              )}
            </Menu.Dropdown>
          </Menu>

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
          <span>
            {operatorName === 'Support Agent' ? (
              <>An agent is heading to your chat</>
            ) : (
              <>
                Chatting with <strong>{operatorName}</strong>
              </>
            )}
          </span>
        </div>
      )}
    </>
  )
}