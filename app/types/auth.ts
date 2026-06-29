// /src/types/auth.ts

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

export interface OperatorData {
  _id: string 
  accountId: string
  email: string
  role: 'admin' | 'supervisor' | 'agent'
  status: 'active' | 'invited' | 'suspended'
  firstName?: string
  lastName?: string
  avatar?: string
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
