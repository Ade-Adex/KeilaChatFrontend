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
  const [opened, { toggle }] = useDisclosure(true) // Default true for desktop

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: { base: opened ? 250 : 80 }, // Dynamic width for animation
        breakpoint: 'md',
        collapsed: { mobile: !opened }, // Hide on mobile if closed
      }}
      padding="md"
      className="bg-background text-foreground transition-all duration-300"
    >
      {/* Header utilizing theme color matching variables */}
      <AppShell.Header className="bg-background border-b border-neutral-200 dark:border-neutral-800">
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              size="sm"
              className="text-foreground"
            />
            <Link
              href="/"
              className={`font-bold text-xl tracking-tight text-neutral-900 dark:text-neutral-50 transition-opacity duration-300 ${
                opened ? 'opacity-100' : 'opacity-0'
              }`}
            >
              KeilaChat
            </Link>
          </Group>
          <ThemeToggle />
        </Group>
      </AppShell.Header>

      {/* Navbar explicitly adhering to unified variables */}
      <AppShell.Navbar className="bg-background border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300">
        <ScrollArea className="h-full">
          <Sidebar isOpened={opened} />
        </ScrollArea>
      </AppShell.Navbar>

      {/* Main viewport pane wrapper */}
      <AppShell.Main className="bg-background text-foreground min-h-screen">
        {children}
      </AppShell.Main>
    </AppShell>
  )
}
