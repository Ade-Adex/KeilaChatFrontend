// /app/components/guards/PropertyGuard.tsx

'use client'

import { ReactNode } from 'react'

import { Loader, Center } from '@mantine/core'

import { usePropertySetup } from '@/app/hooks/settings/usePropertySetup'

import PropertyRequired from '@/app/components/guards/PropertyRequired'

interface Props {
  children: ReactNode
}

export default function PropertyGuard({ children }: Props) {
  const { property, loading } = usePropertySetup()

  if (loading) {
    return (
      <Center h={500}>
        <Loader />
      </Center>
    )
  }
  if (!property?._id) {
    return <PropertyRequired mode="admin" />
  }

  return <>{children}</>
}
