//  /app/store/useAuthStore.ts

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface PropertyData {
  id: string
  widgetId: string
  name: string
}

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
  currentWidgetId: string 
  accessToken: string
}

interface AuthState {
  user: UserSession | null
  loading: boolean
  _hasHydrated: boolean
  login: (
    token: string,
    accountData: AccountData,
    propertyData: PropertyData,
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

      login: async (
        token: string,
        accountData: AccountData,
        propertyData: PropertyData,
      ) => {
        set({ loading: true })
        try {
          const sessionPayload: UserSession = {
            id: accountData.id,
            name: accountData.name,
            email: accountData.ownerEmail,
            plan: accountData.plan,
            currentPropertyId: propertyData.id,
            currentWidgetId: propertyData.widgetId, // Dynamically set
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