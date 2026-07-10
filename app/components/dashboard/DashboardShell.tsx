// /app/components/dashboard/DashboardShell.tsx

// 'use client'

// import { AppShell, Burger, Group, ScrollArea } from '@mantine/core'
// import { useDisclosure } from '@mantine/hooks'
// import Sidebar from '@/app/components/dashboard/Sidebar'
// import ThemeToggle from '@/app/components/ThemeToggle'
// import Link from 'next/link'

// export default function DashboardShell({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const [opened, { toggle, close }] = useDisclosure(false)

//   return (
//     <AppShell
//       header={{ height: 60 }}
//       navbar={{
//         width: { base: opened ? 250 : 80 },
//         breakpoint: 'md',
//         collapsed: { mobile: !opened },
//       }}
//       padding="md"
//       className="bg-background text-foreground transition-all duration-300"
//     >
//       {/* Header Container */}
//       <AppShell.Header className="bg-card! border-b border-border! px-4 transition-all duration-300">
//         <Group h="100%" justify="space-between">
//           <Group>
//             <Burger
//               opened={opened}
//               onClick={toggle}
//               size="sm"
//               color="var(--foreground)"
//             />
//             <Link
//               href="/"
//               className={`font-bold text-lg tracking-tight text-foreground transition-opacity duration-300 ${
//                 opened ? 'opacity-100' : 'opacity-0 md:opacity-100'
//               }`}
//             >
//               KeilaChat
//             </Link>
//           </Group>
//           <ThemeToggle />
//         </Group>
//       </AppShell.Header>

//       {/* Navigation Drawer Panel */}
//       <AppShell.Navbar className="border-r border-border! transition-all duration-300">
//         <ScrollArea className="h-full bg-card">
//           <Sidebar isOpened={opened} onNavigate={close} />
//         </ScrollArea>
//       </AppShell.Navbar>

//       {/* Main Viewport Workspace Wrapper */}
//       <AppShell.Main className="bg-background text-foreground min-h-screen transition-all duration-300">
//         {children}
//       </AppShell.Main>
//     </AppShell>
//   )
// }






















'use client'

import { useEffect, useState } from 'react'
import { AppShell, Burger, Group, ScrollArea, Avatar, Text } from '@mantine/core'
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

    // 🎯 LIVE REALTIME SYNC: Re-mapping state if changes are flagged across the cluster
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
      <AppShell.Header className="bg-card! border-b border-border! px-4 transition-all duration-300 z-40">
        <Group h="100%" justify="space-between" wrap="nowrap">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              size="sm"
              color="var(--foreground)"
            />
            <Link
              href="/"
              className={`font-bold text-lg tracking-tight text-foreground transition-opacity duration-300 ${
                opened ? 'opacity-100' : 'opacity-0 md:opacity-100'
              }`}
            >
              KeilaChat
            </Link>
          </Group>

          <Group gap="md">
            {/* 🎯 PRESENCE MONITOR ELEMENT INJECTED INTO APPLICATION BAR */}
            {profile?.operator && (
              <Group gap="xs" className="select-none border border-border rounded-xl px-2.5 py-1 bg-muted/40">
                <FaCircle
                  className={`text-[10px] transition-colors duration-200 ${
                    profile.operator.availabilityStatus === 'online'
                      ? 'text-green-500'
                      : profile.operator.availabilityStatus === 'busy'
                        ? 'text-red-500'
                        : profile.operator.availabilityStatus === 'away'
                          ? 'text-yellow-500'
                          : 'text-gray-400'
                  }`}
                />
                <Text size="xs" fw={600} className="capitalize text-muted-foreground">
                  {profile.operator.availabilityStatus ?? 'offline'}
                </Text>
              </Group>
            )}

            {/* AVATAR BRANDING WRAPPER */}
            {profile?.operator && (
              <Group gap="xs" className="hidden sm:flex">
                <Avatar
                  src={profile.operator.avatar}
                  radius="xl"
                  size="sm"
                  alt="avatar"
                  color="initials"
                  name={profile.operator.firstName}
                />
                <div className="text-left leading-none">
                  <p className="text-xs font-bold leading-tight">
                    {profile.operator.firstName} {profile.operator.lastName ?? ''}
                  </p>
                </div>
              </Group>
            )}

            <ThemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navigation Drawer Panel */}
      <AppShell.Navbar className="border-r border-border! transition-all duration-300">
        <ScrollArea className="h-full bg-card">
          <Sidebar isOpened={opened} onNavigate={close} />
        </ScrollArea>
      </AppShell.Navbar>

      {/* Main Viewport Workspace Wrapper */}
      <AppShell.Main className="bg-background text-foreground min-h-screen transition-all duration-300">
        {children}
      </AppShell.Main>
    </AppShell>
  )
}