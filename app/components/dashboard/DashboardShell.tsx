// /app/components/dashboard/DashboardShell.tsx


'use client'

import { useEffect } from 'react'
import {
  AppShell,
  Burger,
  Group,
  ScrollArea,
  Avatar,
  Text,
  Menu,
  UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { FaCircle } from 'react-icons/fa'
import Sidebar from '@/app/components/dashboard/Sidebar'
import ThemeToggle from '@/app/components/ThemeToggle'
import Link from 'next/link'

import { getChatSocket } from '@/app/hooks/useChatSocket'
import { useAuthStore } from '@/app/store/useAuthStore'
import { useRouter } from 'next/navigation'

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [opened, { toggle, close }] = useDisclosure(false)
  const router = useRouter()

  // 🎯 Select unified context values directly out of your persisted auth state store
  const operator = useAuthStore((state) => state.operator)
  const updateOperator = useAuthStore((state) => state.updateOperator)
  const logout = useAuthStore((state) => state.logout)

  const handleDropdownSignOutClick = async () => {
    try {
      close()
      await logout()
      router.replace('/signin')
      router.refresh()
    } catch (err) {
      console.error(
        '[KeilaChat DashboardShell] Error executing sign out sequence:',
        err,
      )
    }
  }

  useEffect(() => {
    if (!operator?._id) return

    const socket = getChatSocket()

    const handlePresenceWireShift = (payload: {
      operatorId: string
      availabilityStatus: string
      isOnline: boolean
    }) => {
      // 🎯 Sync websocket changes directly into the global auth store state
      if (operator._id === payload.operatorId) {
        updateOperator({
          availabilityStatus: payload.availabilityStatus as
            | 'offline'
            | 'online'
            | 'away'
            | 'busy',
          isOnline: payload.isOnline,
        })
      }
    }

    socket.on('operator_status_changed', handlePresenceWireShift)

    return () => {
      socket.off('operator_status_changed', handlePresenceWireShift)
    }
  }, [operator?._id, updateOperator])

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: { base: opened ? 250 : 80 },
        breakpoint: 'md',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      className="bg-background! text-foreground! transition-all duration-300"
    >
      {/* Header Container */}
      <AppShell.Header className="bg-card! border-b border-border! px-4 transition-all duration-300 z-40">
        <Group h="100%" justify="space-between" wrap="nowrap">
          {/* Left Block: Brand Brand & Menu Burger Control */}
          <Group gap="xs" wrap="nowrap">
            <Burger
              opened={opened}
              onClick={toggle}
              size="sm"
              color="var(--foreground)"
            />
            <Link
              href="/"
              className="font-bold text-base sm:text-lg tracking-tight text-foreground truncate max-w-30 sm:max-w-none"
            >
              KeilaChat
            </Link>
          </Group>

          {/* Right Block: Dynamic Status Badges, System Themes & User Profiles */}
          <Group className="gap-2 sm:gap-4" wrap="nowrap">
            {/* DESKTOP ONLY: Full Presence Pill Display */}
            {operator && (
              <Group
                gap="xs"
                visibleFrom="sm"
                className="select-none border border-border rounded-xl px-2.5 py-1 bg-muted/40"
              >
                <FaCircle
                  className={`text-[10px] transition-colors duration-200 ${
                    operator.availabilityStatus === 'online'
                      ? 'text-green-500'
                      : operator.availabilityStatus === 'busy'
                        ? 'text-red-500'
                        : operator.availabilityStatus === 'away'
                          ? 'text-yellow-500'
                          : 'text-gray-400'
                  }`}
                />
                <Text
                  size="xs"
                  fw={600}
                  className="capitalize text-muted-foreground"
                >
                  {operator.availabilityStatus ?? 'offline'}
                </Text>
              </Group>
            )}

            {operator && (
              <Menu shadow="md" width={200} position="bottom-end" withinPortal>
                <Menu.Target>
                  <UnstyledButton className="hover:bg-muted/50 p-1 rounded-xl transition-colors">
                    <Group gap="xs" wrap="nowrap">
                      {/* Avatar with built-in presence dot fallback badge */}
                      <div className="relative">
                        <Avatar
                          src={operator.avatar || undefined}
                          radius="xl"
                          size="sm"
                          alt="avatar"
                          color="initials"
                          name={operator.firstName}
                        />
                        {/* Mobile Status Dot Element */}
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-card sm:hidden ${
                            operator.availabilityStatus === 'online'
                              ? 'bg-green-500'
                              : operator.availabilityStatus === 'busy'
                                ? 'bg-red-500'
                                : operator.availabilityStatus === 'away'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-400'
                          }`}
                        />
                      </div>

                      <div className="text-left hidden md:block max-w-25">
                        <Text
                          size="xs"
                          fw={700}
                          className="truncate leading-tight"
                        >
                          {operator.firstName} {operator.lastName}
                        </Text>
                      </div>
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown className="border-border bg-card">
                  <Menu.Label className="font-bold text-[11px] pb-0">
                    Logged in as {operator.firstName} {operator.lastName ?? ''}
                  </Menu.Label>

                  {operator.email && (
                    <Menu.Label className="text-[10px] text-muted-foreground pt-0 truncate max-w-45">
                      {operator.email}
                    </Menu.Label>
                  )}

                  <div className="px-3 py-1 sm:hidden border-b border-border mb-1 mt-1">
                    <Text size="xs" fw={600} className="capitalize">
                      Status: {operator.availabilityStatus ?? 'offline'}
                    </Text>
                  </div>

                  <Menu.Item
                    component={Link}
                    href="/dashboard/settings"
                    className="text-xs font-medium"
                  >
                    Profile Settings
                  </Menu.Item>

                  <Menu.Item
                    onClick={handleDropdownSignOutClick}
                    className="text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Sign Out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}

            <ThemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navigation Drawer Panel */}
      <AppShell.Navbar className="border-r border-border! transition-all duration-300 z-40">
        <ScrollArea className="h-full bg-card">
          <Sidebar isOpened={opened} onNavigate={close} />
        </ScrollArea>
      </AppShell.Navbar>

      {/* Main Viewport Workspace Wrapper */}
      <AppShell.Main className="bg-background text-foreground min-h-screen transition-all duration-300 w-full overflow-x-hidden">
        {children}
      </AppShell.Main>
    </AppShell>
  )
}
