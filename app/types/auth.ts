// // /src/types/auth.ts

// import { AccountData } from "@/app/types/account"

// export interface OperatorData {
//   _id: string
//   accountId: string
//   email: string
//   role: 'admin' | 'supervisor' | 'agent'
//   status: 'active' | 'invited' | 'suspended'
//   firstName?: string
//   lastName?: string
//   avatar?: string
//   assignedProperties?: string[]
//   createdAt: string
// }

// export interface Tokens {
//   accessToken: string
//   refreshToken: string
// }

// export interface AuthResponse {
//   success: boolean
//   data: {
//     operator: OperatorData
//     account: AccountData
//   }
// }

// export interface SignupFormData {
//   name: string
//   email: string
//   password: string
// }

// export interface LoginFormData {
//   email: string
//   password: string
//   rememberMe: boolean
// }

// export interface ForgotPasswordFormData {
//   email: string
// }

// export interface ResetPasswordFormData {
//   password: string
//   confirmPassword: string
// }








// /app/types/auth.ts

import type { AccountData } from '@/app/types/account'

export type OperatorRole =
  | 'admin'
  | 'supervisor'
  | 'agent'

export type OperatorStatus =
  | 'active'
  | 'invited'
  | 'suspended'

export type OperatorAvailability =
  | 'online'
  | 'away'
  | 'busy'
  | 'offline'

export interface OperatorStats {
  chatsHandled: number
  averageResponseTime: number
  satisfactionScore: number
}

export interface OperatorData {
  _id: string

  accountId: string

  email: string

  role: OperatorRole

  status: OperatorStatus

  firstName?: string

  lastName?: string

  avatar?: string

  /**
   * Property IDs assigned to this operator.
   * Admins may have access to every property.
   */
  assignedProperties: string[]

  socketId?: string

  isOnline: boolean

  lastSeen?: string

  isTyping: boolean

  currentSessionId?: string

  lastTypingAt?: string

  joinedAt?: string

  availabilityStatus: OperatorAvailability

  activeChatsCount: number

  maxConcurrentChats: number

  permissions: string[]

  stats: OperatorStats

  createdAt: string

  updatedAt: string
}

export interface Tokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  success: boolean
  data: {
    operator: OperatorData
    account: AccountData
  }
}

export interface SignupFormData {
  name: string
  email: string
  password: string
}

export interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export interface ForgotPasswordFormData {
  email: string
}

export interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}