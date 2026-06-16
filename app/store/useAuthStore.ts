//  /app/store/useAuthStore.ts

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AccountData {
  id: string
  name: string
  ownerEmail: string
  plan: string
}

interface UserSession {
  id: string
  name: string
  email: string
  plan: string
  currentPropertyId: string
  accessToken: string
}

interface AuthState {
  user: UserSession | null
  loading: boolean
  _hasHydrated: boolean
  login: (token: string, accountData: AccountData) => Promise<void>
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

      login: async (token: string, accountData: AccountData) => {
        set({ loading: true })
        try {
          const targetPropertyId = '6a3143b6d4767cbc5b60ac7c'

          const sessionPayload: UserSession = {
            id: accountData.id,
            name: accountData.name,
            email: accountData.ownerEmail,
            plan: accountData.plan,
            currentPropertyId: targetPropertyId,
            accessToken: token,
          }

          set({ user: sessionPayload })
        } catch (err) {
          console.error('Zustand login pipeline hydration failed:', err)
        } finally {
          set({ loading: false })
        }
      },

      logout: () => {
        set({ user: null })
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