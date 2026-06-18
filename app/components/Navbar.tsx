'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Burger, Divider, Drawer, Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const [opened, { toggle, close }] = useDisclosure(false)

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="font-bold text-lg tracking-tight text-foreground"
        >
          Keila Engine
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <ThemeToggle />
          <Link
            href="/admin/login"
            className="text-sm font-medium text-foreground transition-colors hover:text-foreground border border-[#0070f3] px-4 py-1.5 rounded-xl"
          >
            Login
          </Link>

          {/* A subtle vertical separator */}
          <div className="h-4 w-px bg-zinc-800" />

          <Link
            href="/signup"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all shadow-lg shadow-primary/20 hover:bg-button-hover hover:shadow-primary/30 active:scale-95"
          >
            Add chat to your website
          </Link>
        </div>

        {/* Mobile Burger Button */}
        <div className="md:hidden flex gap-4">
          <ThemeToggle />
          <Burger
            opened={opened}
            onClick={toggle}
            aria-label="Toggle navigation"
            color="var(--foreground)"
          />
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        title="Menu"
        position="right"
        size="xs"
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      >
        <Stack gap="md" px="md">
          {/* <div className="flex items-center justify-between">
            <span>Theme</span>
            <ThemeToggle />
          </div> */}
          <Divider my="sm" />
          <Link
            href="/login"
            onClick={close}
            className="p-2 border border-zinc-700 rounded-lg text-center mt-8"
          >
            Login
          </Link>
          <Link
            href="/signup"
            onClick={close}
            className="p-2 bg-blue-600 text-white rounded-lg text-center"
          >
            Add chat to your website
          </Link>
        </Stack>
      </Drawer>
    </nav>
  )
}
