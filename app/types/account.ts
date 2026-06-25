// /app/types/account.ts

export interface AccountData {
  id: string

  name: string

  ownerEmail: string

  plan: 'free' | 'starter' | 'pro' | 'enterprise'

  isActive: boolean

  settings: {
    aiEnabled: boolean
    maxOperators: number
    maxVisitors: number
  }

  createdAt: string

  updatedAt: string
}