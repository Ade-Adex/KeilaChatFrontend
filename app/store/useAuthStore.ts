// /app/store/useAuthStore.ts

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { AccountData, OperatorData, Tokens } from '@/app/types/auth'
import { logoutOperator } from '@/app/lib/api/auth.api'

interface AuthState {
  account: AccountData | null
  operator: OperatorData | null
  tokens: Tokens | null
  loading: boolean

  login: (account: AccountData, operator: OperatorData, tokens?: Tokens) => void

  logout: () => Promise<void>

  setLoading: (loading: boolean) => void

  updateOperator: (operator: Partial<OperatorData>) => void

  updateAccount: (account: Partial<AccountData>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      account: null,
      operator: null,
      tokens: null,
      loading: false,

      login: (account, operator, tokens) => {
        set({
          account,
          operator,
          tokens: tokens ?? null,
          loading: false,
        })
      },

      logout: async () => {
        try {
          await logoutOperator()
        } catch {
          // ignore network/server errors
        }

        set({
          account: null,
          operator: null,
          tokens: null,
          loading: false,
        })

        localStorage.removeItem('keila_auth')

        sessionStorage.clear()
      },

      setLoading: (loading) => {
        set({ loading })
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
    },
  ),
)
