// // /app/store/useAuthStore.ts
// import { create } from 'zustand'
// import { persist, createJSONStorage } from 'zustand/middleware'
// import type { AccountData, PropertyData, UserSession } from '@/app/types/auth'

// interface AuthState {
//   user: UserSession | null
//   loading: boolean
//   _hasHydrated: boolean
//   login: (
//     token: string,
//     accountData: AccountData,
//     propertyData: PropertyData | null,
//   ) => Promise<void>
//   logout: () => void
//   setLoading: (loading: boolean) => void
//   setHasHydrated: (hydrated: boolean) => void
// }

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set) => ({
//       user: null,
//       loading: false,
//       _hasHydrated: false,

//       login: async (token, accountData, propertyData) => {
//         set({ loading: true })
//         try {
//           const sessionPayload: UserSession = {
//             id: accountData.id,
//             name: accountData.name,
//             email: accountData.ownerEmail,
//             plan: accountData.plan,
//             property: propertyData,
//             accessToken: token,
//           }
//           set({ user: sessionPayload })
//         } catch (err) {
//           console.error('Zustand login pipeline hydration failed:', err)
//         } finally {
//           set({ loading: false })
//         }
//       },

//       logout: async () => {
//         // 1. Wipe out client local state immediately
//         set({ user: null })

//         try {

//           const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

//           // 2. Trigger cross-origin cookie destruction using credentials include
//           await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
//             method: 'POST',
//             credentials: 'include',
//           })
//         } catch (err) {
//           console.error('Failed to clear backend server session cookie:', err)
//         }
//       },

//       setLoading: (loading: boolean) => set({ loading }),
//       setHasHydrated: (hydrated: boolean) => set({ _hasHydrated: hydrated }),
//     }),
//     {
//       name: 'keila_admin_auth',
//       storage: createJSONStorage(() => localStorage),
//       partialize: (state) => ({ user: state.user }),
//       onRehydrateStorage: () => (state) => {
//         state?.setHasHydrated(true)
//       },
//     },
//   ),
// )




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

          // 🚀 THE FIX: Mirror your working localStorage payload directly to a client cookie.
          // This makes the token instantly visible to Next.js server routing.
          const storagePayload = JSON.stringify({ state: { user: sessionPayload } })
          document.cookie = `keila_admin_auth=${encodeURIComponent(storagePayload)}; path=/; max-age=2592000; SameSite=Lax; secure`

        } catch (err) {
          console.error('Zustand login pipeline hydration failed:', err)
        } finally {
          set({ loading: false })
        }
      },

      logout: async () => {
        set({ user: null })

        // 🚀 CLEANUP: Remove the tracking cookie when logging out
        document.cookie = 'keila_admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

        try {
          const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL
          await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
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