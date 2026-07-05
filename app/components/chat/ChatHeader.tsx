// /app/components/chat/ChatHeader.tsx

'use client'

import { useState } from 'react'
import {
  FiX,
  FiMoreVertical,
  FiLogOut,
  FiEdit2,
  FiPlusCircle,
  FiSun,
  FiMoon,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi'
import {
  Menu,
  ActionIcon,
  Modal,
  TextInput,
  Button,
  Stack,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import type { WidgetConfig } from '@/app/types/chat'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { getErrorMessage, getSuccessMessage } from '@/app/lib/utils/error'

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
  queueSubtext?: string
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
  queueSubtext,
}: ChatHeaderProps) {
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [visitorName, setVisitorName] = useState('')
  const [visitorEmail, setVisitorEmail] = useState('')
  const [updating, setUpdating] = useState(false)

  // 🎯 Theme Hook Integration
  const { resolvedTheme, setTheme } = useTheme()

 const structuralAiName =
   widget.widgetSettings?.aiName?.trim() ||
   widget.settings?.aiName?.trim() ||
   'AI Assistant'
  const isAiSession = operatorName?.toLowerCase() === 'ai'

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
            name: visitorName.trim(),
            email: visitorEmail.trim().toLowerCase(),
          }),
        },
      )

      const result = await response.json()

      if (response.ok && (result.success || result.status === 'success')) {
        notifications.show({
          title: 'Profile Updated',
          message: getSuccessMessage(result),
          color: 'green',
          icon: <FiCheck size={16} />,
          autoClose: 4000,
        })

        if (onVisitorProfileUpdated) {
          onVisitorProfileUpdated(
            visitorName.trim(),
            visitorEmail.trim().toLowerCase(),
          )
        }

        setProfileModalOpen(false)
      } else {
        throw result
      }
    } catch (err) {
      console.error('Failed to update visitor profile details:', err)

      notifications.show({
        title: 'Update Failed',
        message: getErrorMessage(err),
        color: 'red',
        icon: <FiAlertCircle size={16} />,
        autoClose: 5000,
      })
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
          <button
            suppressHydrationWarning
            onClick={() =>
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
            }
            className="rounded-full p-2 transition hover:bg-white/10 cursor-pointer text-white"
            aria-label="Toggle theme appearance"
          >
            {resolvedTheme === 'dark' ? (
              <FiSun size={18} />
            ) : (
              <FiMoon size={18} />
            )}
          </button>

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

            <Menu.Dropdown className="bg-card! border border-border! text-foreground!">
              <Menu.Label>Options</Menu.Label>

              {!isSessionActive && (
                <Menu.Item
                  leftSection={<FiPlusCircle size={14} />}
                  onClick={onStartNewChat}
                  className="cursor-pointer text-xs font-medium text-foreground!"
                >
                  Start New Chat
                </Menu.Item>
              )}

              <Menu.Item
                leftSection={<FiEdit2 size={14} />}
                onClick={() => setProfileModalOpen(true)}
                className="cursor-pointer text-xs text-foreground!"
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
            className="rounded-full p-2 transition hover:bg-white/10 cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Operator/AI Presence Header banner */}
      {isSessionActive && operatorName && (
        <div className="flex items-center gap-2.5 border-b border-border bg-card px-4 py-2 text-xs text-foreground">
          {/* Render avatar conditionally if it's a real operator and not a generic string/AI */}
          {operatorAvatar &&
          operatorName !== 'Support Agent' &&
          !isAiSession ? (
            <Image
              src={operatorAvatar}
              alt={operatorName}
              width={20}
              height={20}
              className="h-5 w-5 rounded-full object-cover border border-border shrink-0"
              onError={(e) => {
                ;(e.currentTarget as HTMLElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0" />
          )}

          <div className="flex flex-col min-w-0">
            <span>
              {isAiSession ? (
                <>
                  Chatting with <strong>{structuralAiName}</strong>
                </>
              ) : operatorName === 'Support Agent' ? (
                <>An agent is heading to your chat</>
              ) : (
                <>
                  Chatting with <strong>{operatorName}</strong>
                </>
              )}
            </span>
            {/* 🎯 Real-time queue notification message text banner */}
            {queueSubtext && (
              <span className="text-[10px] text-muted-foreground font-medium mt-0.5 animate-pulse">
                {queueSubtext}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Profile Setup Modal */}
      <Modal
        opened={profileModalOpen}
        onClose={() => !updating && setProfileModalOpen(false)}
        title="Introduce Yourself"
        centered
        size="sm"
        closeOnClickOutside={!updating}
        closeOnEscape={!updating}
        withCloseButton={!updating}
        styles={{
          content: {
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border, #262626)',
          },
          header: {
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
          },
        }}
        className="bg-card! border-border!"
      >
        <form onSubmit={handleUpdateProfile}>
          <Stack gap="md">
            <TextInput
              label="Your Name"
              placeholder="John Doe"
              value={visitorName}
              onChange={(e) => setVisitorName(e.currentTarget.value)}
              required
              disabled={updating}
              size="xs"
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
              }}
            />
            <TextInput
              label="Email Address"
              placeholder="john@example.com"
              type="email"
              value={visitorEmail}
              onChange={(e) => setVisitorEmail(e.currentTarget.value)}
              required
              disabled={updating}
              size="xs"
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
              }}
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