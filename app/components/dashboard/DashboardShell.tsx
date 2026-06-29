// /app/components/dashboard/DashboardShell.tsx

'use client'

import { AppShell, Burger, Group, ScrollArea } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import Sidebar from '@/app/components/dashboard/Sidebar'
import ThemeToggle from '@/app/components/ThemeToggle'
import Link from 'next/link'

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [opened, { toggle }] = useDisclosure(true)

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
      <AppShell.Header className="bg-card border-b border-border px-4 transition-all duration-300">
        <Group h="100%" justify="space-between">
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
          <ThemeToggle />
        </Group>
      </AppShell.Header>

      {/* Navigation Drawer Panel */}
      <AppShell.Navbar className="bg-card border-r border-border transition-all duration-300">
        <ScrollArea className="h-full">
          <Sidebar isOpened={opened} />
        </ScrollArea>
      </AppShell.Navbar>

      {/* Main Viewport Workspace Wrapper */}
      <AppShell.Main className="bg-background text-foreground min-h-screen transition-all duration-300">
        {children}
      </AppShell.Main>
    </AppShell>
  )
}