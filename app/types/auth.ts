// /app/types/auth.ts

import type { AccountData } from '@/app/types/account'
import { OperatorData } from '@/app/types/operator'

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


export interface AssignedProperty {
  _id: string
  name: string
  domain: string
  widgetId: string
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