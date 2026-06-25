// /app/(auth)/forgot-password/page.tsx

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { FiMail } from 'react-icons/fi'
import { notifications } from '@mantine/notifications'

import { InputField } from '@/app/components/auth/InputField'
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from '@/app/lib/validation/auth.schema'
import { forgotPassword } from '@/app/lib/api/auth.api'

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      const res = await forgotPassword(data)

      notifications.show({
        title: 'Email Sent',
        message:
          res.message ||
          'If an account exists for this email, a password reset link has been sent.',
        color: 'green',
      })

      reset()
    } catch (err) {
      notifications.show({
        title: 'Request Failed',
        message:
          err instanceof Error ? err.message : 'Unable to process request.',
        color: 'red',
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl bg-card shadow-2xl p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Forgot Password</h1>

          <p className="text-sm text-muted-foreground">
            Enter your account email and we&apos;ll send you a password reset
            link.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <InputField
            label="Email Address"
            type="email"
            icon={<FiMail />}
            placeholder="operator@company.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`w-full rounded-lg py-2.5 font-medium transition
              ${
                !isValid || isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:opacity-90 cursor-pointer'
              }
            `}
          >
            {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center text-sm">
          <Link href="/signin" className="text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}