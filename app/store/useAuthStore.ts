// /app/store/useAuthStore.ts

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { AccountData, OperatorData } from '@/app/types/auth'

import { logoutOperator } from '@/app/lib/api/auth.api'

interface AuthState {
  account: AccountData | null
  operator: OperatorData | null

  /**
   * Set authenticated user identity.
   */
  login: (account: AccountData, operator: OperatorData) => void

  /**
   * Clear local identity and backend session.
   */
  logout: () => Promise<void>

  /**
   * Update operator cache.
   */
  updateOperator: (operator: Partial<OperatorData>) => void

  /**
   * Update account cache.
   */
  updateAccount: (account: Partial<AccountData>) => void

  /**
   * Clear local state only.
   */
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      account: null,
      operator: null,

      login: (account, operator) => {
        set({
          account,
          operator,
        })
      },

      logout: async () => {
        try {
          /**
           * Clears backend session +
           * removes httpOnly cookies.
           */
          await logoutOperator()
        } catch {
          // ignore network failures
        }

        set({
          account: null,
          operator: null,
        })

        sessionStorage.clear()
      },

      clear: () => {
        set({
          account: null,
          operator: null,
        })
      },

      updateOperator: (operator) => {
        set((state) => ({
          operator: state.operator
            ? {
                ...state.operator,
                ...operator,
              }
            : null,
        }))
      },

      updateAccount: (account) => {
        set((state) => ({
          account: state.account
            ? {
                ...state.account,
                ...account,
              }
            : null,
        }))
      },
    }),
    {
      /**
       * Persist only UI identity.
       */
      name: 'keila_auth',

      storage: createJSONStorage(() => localStorage),

      /**
       * Explicit whitelist.
       * Never persist methods.
       */
      partialize: (state) => ({
        account: state.account,
        operator: state.operator,
      }),
    },
  ),
)
