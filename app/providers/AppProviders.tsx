'use client'

import React from 'react'
import { MantineProvider } from '@mantine/core'
import { ThemeProvider } from 'next-themes'
import { usePathname } from 'next/navigation'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'
import { Notifications } from '@mantine/notifications'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

export default function AppProviders({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isEmbed = pathname.startsWith('/embed/chat')

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <MantineProvider>
        <Notifications position="bottom-center" />

        {!isEmbed && <Navbar />}

        <main className={!isEmbed ? 'min-h-screen' : ''}>{children}</main>

        {!isEmbed && <Footer />}
      </MantineProvider>
    </ThemeProvider>
  )
}
