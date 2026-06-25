// /app/lib/validation/auth.schema.ts

import { z } from 'zod'

/* -------------------------------------------------------------------------- */
/*                                   SIGN UP                                  */
/* -------------------------------------------------------------------------- */

export const signupSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, 'Company name is too short')
    .max(100, 'Company name is too long'),

  email: z.string().trim().email('Enter a valid email address'),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
})

export type SignupSchema = z.infer<typeof signupSchema>

/* -------------------------------------------------------------------------- */
/*                                   SIGN IN                                  */
/* -------------------------------------------------------------------------- */

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),

  password: z.string().min(6, 'Password must be at least 6 characters'),

  rememberMe: z.boolean(),
})

export type LoginSchema = z.infer<typeof loginSchema>

/* -------------------------------------------------------------------------- */
/*                              FORGOT PASSWORD                               */
/* -------------------------------------------------------------------------- */

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

/* -------------------------------------------------------------------------- */
/*                               RESET PASSWORD                               */
/* -------------------------------------------------------------------------- */

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password is too long'),

    confirmPassword: z.string().min(6, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
