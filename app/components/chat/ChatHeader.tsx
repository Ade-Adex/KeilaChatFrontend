// /app/components/chat/ChatHeader.tsx

'use client'

import { useState } from 'react'
import {
  FiX,
  FiMoreVertical,
  FiLogOut,
  FiEdit2,
  FiPlusCircle,
} from 'react-icons/fi'
import {
  Menu,
  ActionIcon,
  Modal,
  TextInput,
  Button,
  Stack,
} from '@mantine/core'
import type { WidgetConfig } from '@/app/types/chat'
import Image from 'next/image'

interface ChatHeaderProps {
  widget: WidgetConfig
  propertyId?: string
  visitorTrackingId?: string
  operatorName?: string
  operatorAvatar?: string
  isSessionActive: boolean
  onOpenEndModal: () => void
  onStartNewChat: () => void
  onClose: () => void
  onVisitorProfileUpdated?: (name: string, email: string) => void
}

export default function ChatHeader({
  widget,
  propertyId,
  visitorTrackingId,
  operatorName,
  operatorAvatar,
  isSessionActive,
  onOpenEndModal,
  onStartNewChat,
  onClose,
  onVisitorProfileUpdated,
}: ChatHeaderProps) {
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [visitorName, setVisitorName] = useState('')
  const [visitorEmail, setVisitorEmail] = useState('')
  const [updating, setUpdating] = useState(false)

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    if (
      !visitorName.trim() ||
      !visitorEmail.trim() ||
      !propertyId ||
      !visitorTrackingId
    )
      return

    setUpdating(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/visitors/profile`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId,
            visitorTrackingId,
            name: visitorName,
            email: visitorEmail,
          }),
        },
      )

      const result = await response.json()
      if (result.status === 'success') {
        setProfileModalOpen(false)
        if (onVisitorProfileUpdated) {
          onVisitorProfileUpdated(visitorName, visitorEmail)
        }
      }
    } catch (err) {
      console.error('Failed to update visitor profile details:', err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      {/* Main Header */}
      <div
        className="flex items-center justify-between px-4 py-4 text-white shadow-sm"
        style={{
          background: widget.theme?.primaryColor ?? '#2563eb',
        }}
      >
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold">
            {widget.name ?? 'Live Support'}
          </h2>
          <p className="text-xs opacity-80">
            {isSessionActive ? "We're online" : 'Conversation Closed'}
          </p>
        </div>

        <div className="flex items-center gap-1">
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
              <Menu.Label>Options</Menu.Label>

              <Menu.Item
                leftSection={<FiPlusCircle size={14} />}
                onClick={onStartNewChat}
                className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Start New Chat
              </Menu.Item>

              <Menu.Item
                leftSection={<FiEdit2 size={14} />}
                onClick={() => setProfileModalOpen(true)}
                className="cursor-pointer text-xs"
              >
                Change Name / Email
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
            className="rounded-full p-2 transition hover:bg-white/10 cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Operator Presence Header banner */}
      {isSessionActive && operatorName && (
        <div className="flex items-center gap-2.5 border-b border-border bg-card px-4 py-2 text-xs text-foreground">
          {operatorAvatar && operatorName !== 'Support Agent' ? (
            <Image
              src={operatorAvatar}
              alt={operatorName}
              className="h-5 w-5 rounded-full object-cover border border-border shrink-0"
              onError={(e) => {
                ;(e.currentTarget as HTMLElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0" />
          )}

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

      {/* Profile Setup Modal */}
      <Modal
        opened={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Introduce Yourself"
        centered
        size="sm"
      >
        <form onSubmit={handleUpdateProfile}>
          <Stack gap="md">
            <TextInput
              label="Your Name"
              placeholder="John Doe"
              value={visitorName}
              onChange={(e) => setVisitorName(e.currentTarget.value)}
              required
              size="xs"
            />
            <TextInput
              label="Email Address"
              placeholder="john@example.com"
              type="email"
              value={visitorEmail}
              onChange={(e) => setVisitorEmail(e.currentTarget.value)}
              required
              size="xs"
            />
            <Button
              type="submit"
              size="xs"
              fullWidth
              loading={updating}
              style={{ background: widget.theme?.primaryColor ?? '#2563eb' }}
            >
              Save Profile
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  )
}