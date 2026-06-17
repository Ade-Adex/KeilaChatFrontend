'use client'

import React from 'react'
import { MantineProvider } from '@mantine/core'


import '@mantine/core/styles.css'
// import '@mantine/carousel/styles.css'

interface AppProvidersProps {
  children: React.ReactNode
}

export default function AppProviders({ children }: AppProvidersProps) {
  return <MantineProvider defaultColorScheme="dark">{children}</MantineProvider>
}
