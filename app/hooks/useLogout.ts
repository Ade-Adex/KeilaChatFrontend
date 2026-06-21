'use client'

import { useAuthStore } from '@/app/store/useAuthStore'
import { useRouter } from 'next/navigation'

export function useLogout() {
  const router = useRouter()
  const logoutAction = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    // 1. Explicitly clear client storage/state via Zustand
    logoutAction()

    // 2. Clear any other ephemeral browser tokens if you use them
    // document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

    // 3. Perform a clean programmatic redirect to the authentication gateway
    router.replace('/sign')
  }

  return handleLogout
}
