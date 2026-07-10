// /app/components/dashboard/DashboardShell.tsx

'use client'

import { useEffect, useState } from 'react'
import { AppShell, Burger, Group, ScrollArea, Avatar, Text, Menu, UnstyledButton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { FaCircle } from 'react-icons/fa'
import Sidebar from '@/app/components/dashboard/Sidebar'
import ThemeToggle from '@/app/components/ThemeToggle'
import Link from 'next/link'

import { getOperatorProfile } from '@/app/lib/api/chat.api'
import { getChatSocket } from '@/app/hooks/useChatSocket'
import type { OperatorProfile } from '@/app/types/dashboard'

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [opened, { toggle, close }] = useDisclosure(false)
  const [profile, setProfile] = useState<OperatorProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchProfile = async () => {
      try {
        const result = await getOperatorProfile()
        if (mounted) {
          setProfile(result.data)
        }
      } catch (error) {
        console.error('❌ Failed syncing profile content schema:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void fetchProfile()

    const socket = getChatSocket()
    const handlePresenceWireShift = (payload: { operatorId: string; availabilityStatus: string; isOnline: boolean }) => {
      if (profile?.operator?._id === payload.operatorId && mounted) {
        setProfile((prev) => {
          if (!prev || !prev.operator) return prev
          return {
            ...prev,
            operator: {
              ...prev.operator,
              availabilityStatus: payload.availabilityStatus as 'offline' | 'online' | 'away' | 'busy',
            },
          }
        })
      }
    }

    socket.on('operator_status_changed', handlePresenceWireShift)

    return () => {
      mounted = false
      socket.off('operator_status_changed', handlePresenceWireShift)
    }
  }, [profile?.operator?._id])

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: { base: opened ? 250 : 80 },
        breakpoint: 'md',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      className="bg-background text-foreground transition-all duration-300"
    >
      {/* Header Container */}
      <AppShell.Header className="bg-card border-b border-border! px-4 transition-all duration-300 z-40">
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
            {/* 🎯 DESKTOP ONLY: Full Presence Pill Display */}
            {profile?.operator && (
              <Group 
                gap="xs" 
                visibleFrom="sm"
                className="select-none border border-border rounded-xl px-2.5 py-1 bg-muted/40"
              >
                <FaCircle
                  className={`text-[10px] transition-colors duration-200 ${
                    profile.operator.availabilityStatus === 'online' ? 'text-green-500' :
                    profile.operator.availabilityStatus === 'busy' ? 'text-red-500' :
                    profile.operator.availabilityStatus === 'away' ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                />
                <Text size="xs" fw={600} className="capitalize text-muted-foreground">
                  {profile.operator.availabilityStatus ?? 'offline'}
                </Text>
              </Group>
            )}

            {/* 🎯 RESPONSIVE USER FOOTPRINT: Minimal Indicator on Mobile, Full Metadata Profile on Desktop */}
            {profile?.operator && (
              <Menu shadow="md" width={200} position="bottom-end" withinPortal>
                <Menu.Target>
                  <UnstyledButton className="hover:bg-muted/50 p-1 rounded-xl transition-colors">
                    <Group gap="xs" wrap="nowrap">
                      {/* Avatar with built-in presence dot fallback badge */}
                      <div className="relative">
                        <Avatar
                          src={profile.operator.avatar}
                          radius="xl"
                          size="sm"
                          alt="avatar"
                          color="initials"
                          name={profile.operator.firstName}
                        />
                        {/* Mobile Status Dot Element */}
                        <div 
                          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-card sm:hidden ${
                            profile.operator.availabilityStatus === 'online' ? 'bg-green-500' :
                            profile.operator.availabilityStatus === 'busy' ? 'bg-red-500' :
                            profile.operator.availabilityStatus === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      
                      <div className="text-left hidden md:block max-w-25">
                        <Text size="xs" fw={700} className="truncate leading-tight">
                          {profile.operator.firstName}
                        </Text>
                        <Text size="10px" className="text-muted-foreground truncate capitalize">
                          {profile.operator.availabilityStatus ?? 'offline'}
                        </Text>
                      </div>
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown className="border-border bg-card">
                  <Menu.Label className="font-bold text-[11px]">
                    Logged in as {profile.operator.email}
                  </Menu.Label>
                  <div className="px-3 py-1 sm:hidden border-b border-border mb-1">
                    <Text size="xs" fw={600} className="capitalize">
                      Status: {profile.operator.availabilityStatus ?? 'offline'}
                    </Text>
                  </div>
                  <Menu.Item component={Link} href="/dashboard/settings" className="text-xs font-medium">
                    Profile Settings
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