// /app/lib/api/auth.api.ts

import type {
  AuthResponse,
  LoginFormData,
  SignupFormData,
} from '@/app/types/auth'

import type {
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '@/app/lib/validation/auth.schema'

import { apiPost, apiGet } from '@/app/lib/api/apiClient'

/* -------------------------------------------------------------------------- */
/*                                AUTH ROUTES                                 */
/* -------------------------------------------------------------------------- */

/**
 * Register Tenant
 */
export function registerUser(data: SignupFormData) {
  return apiPost<AuthResponse>(`/api/v1/auth/register`, data)
}

/**
 * Login Operator
 */
export function loginOperator(data: LoginFormData) {
  return apiPost<AuthResponse>(`/api/v1/auth/login`, data)
}


/**
 * Fetch Current Authenticated Operator Data Context
 * Handles populating properties and account metrics professional standard way 🚀
 */
export function getCurrentProfile() {
  return apiGet<AuthResponse>(`/api/v1/auth/me`)
}

/**
 * Forgot Password
 */
export function forgotPassword(data: ForgotPasswordSchema) {
  return apiPost<{
    success: boolean
    message: string
  }>(`/api/v1/auth/forgot-password`, data)
}

/**
 * Reset Password
 */
export function resetPassword(token: string, data: ResetPasswordSchema) {
  return apiPost<{
    success: boolean
    message: string
  }>(`/api/v1/auth/reset-password`, {
    token,
    password: data.password,
  })
}



/**
 * Logout
 */
export function logoutOperator() {
  return apiPost<{
    success: boolean
    message: string
  }>(`/api/v1/auth/logout`, {})
}