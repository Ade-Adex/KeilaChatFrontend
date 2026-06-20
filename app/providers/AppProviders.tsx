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

  const isExcluded = ['/embed/chat', '/admin/dashboard'].some((path) => pathname.startsWith(path));

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <MantineProvider>
        <Notifications position="bottom-center" />

        {!isExcluded && <Navbar />}

        <main className={!isExcluded ? 'min-h-screen' : ''}>{children}</main>

        {!isExcluded && <Footer />}
      </MantineProvider>
    </ThemeProvider>
  )
}
