// /app/types/account.ts

export interface AccountData {
  _id: string 
  name: string
  ownerEmail: string
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
  isActive: boolean
  settings: {
    aiEnabled: boolean
    maxOperators: number
    maxVisitors: number
  }
  usage?: {
    totalChats: number
    totalVisitors: number
    totalMessages: number
    totalOperators: number
    totalProperties: number
    currentMonthMessages: number
  }
  createdAt: string
  updatedAt: string
}