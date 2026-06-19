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

interface AppProvidersProps {
  children: React.ReactNode
}

export default function AppProviders({ children }: AppProvidersProps) {
  const pathname = usePathname()

  const showNavbar = ['/', '/signup', '/signin', '/pricing', '/about'].includes(
    pathname,
  )
  const showFooter = ['/', '/pricing', '/about'].includes(pathname)

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <MantineProvider>
        <Notifications position="bottom-center" zIndex={1000} />
        {showNavbar && <Navbar />}

        <main className="min-h-screen">{children}</main>

        {showFooter && <Footer />}
      </MantineProvider>
    </ThemeProvider>
  )
}
