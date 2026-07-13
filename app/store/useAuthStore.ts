// /app/store/useAuthStore.ts

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { AccountData } from '@/app/types/account'
import { logoutOperator } from '@/app/lib/api/auth.api'
import { OperatorData } from '@/app/types/operator'

interface AuthState {
  account: AccountData | null
  operator: OperatorData | null

  /**
   * Set authenticated user identity.
   * ✅ Updated to match single argument object shape from response.data
   */
  login: (data: { account: AccountData; operator: OperatorData }) => void

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

      // ✅ Unpacks account and operator cleanly from the single data argument object
      login: ({ account, operator }) => {
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
      name: 'keila_auth',
      storage: createJSONStorage(() => localStorage),
      
      // ✅ Explicit list includes all sub-properties safely across refreshes
      partialize: (state) => ({
        account: state.account,
        operator: state.operator,
      }),
    },
  ),
)