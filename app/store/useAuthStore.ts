// /app/store/useAuthStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AccountData, PropertyData, UserSession } from '@/app/types/auth'

interface AuthState {
  user: UserSession | null
  loading: boolean
  _hasHydrated: boolean
  login: (
    token: string,
    accountData: AccountData,
    propertyData: PropertyData | null,
  ) => Promise<void>
  logout: () => void
  setLoading: (loading: boolean) => void
  setHasHydrated: (hydrated: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      _hasHydrated: false,

      login: async (token, accountData, propertyData) => {
        set({ loading: true })
        try {
          const sessionPayload: UserSession = {
            id: accountData.id,
            name: accountData.name,
            email: accountData.ownerEmail,
            plan: accountData.plan,
            property: propertyData,
            accessToken: token,
          }
          set({ user: sessionPayload })
        } catch (err) {
          console.error('Zustand login pipeline hydration failed:', err)
        } finally {
          set({ loading: false })
        }
      },

      logout: async () => {
        // 1. Wipe out client local state immediately
        set({ user: null })

        try {

          const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

          // 2. Trigger cross-origin cookie destruction using credentials include
          await fetch(`${BACKEND_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include', 
          })
        } catch (err) {
          console.error('Failed to clear backend server session cookie:', err)
        }
      },

      setLoading: (loading: boolean) => set({ loading }),
      setHasHydrated: (hydrated: boolean) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: 'keila_admin_auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
