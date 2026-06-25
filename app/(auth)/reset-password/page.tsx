// /app/(auth)/reset-password/page.tsx

'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiLock } from 'react-icons/fi'
import { notifications } from '@mantine/notifications'

import { InputField } from '@/app/components/auth/InputField'
import { resetPassword } from '@/app/lib/api/auth.api'

import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from '@/app/lib/validation/auth.schema'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: ResetPasswordSchema) => {
    if (!token) {
      notifications.show({
        title: 'Invalid Link',
        message: 'Password reset token is missing.',
        color: 'red',
      })

      return
    }

    try {
      const res = await resetPassword(token, data)

      notifications.show({
        title: 'Password Updated',
        message: res.message || 'Your password has been reset successfully.',
        color: 'green',
      })

      router.replace('/signin')
    } catch (err) {
      notifications.show({
        title: 'Reset Failed',
        message:
          err instanceof Error ? err.message : 'Unable to reset password.',
        color: 'red',
      })
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-xl bg-card shadow-2xl p-8 text-center space-y-5">
          <h1 className="text-2xl font-bold">Invalid Reset Link</h1>

          <p className="text-sm text-muted-foreground">
            This password reset link is invalid or has expired.
          </p>

          <Link
            href="/forgot-password"
            className="inline-block rounded-lg bg-primary px-5 py-3 text-white hover:opacity-90"
          >
            Request another link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl bg-card shadow-2xl p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Reset Password</h1>

          <p className="text-sm text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <InputField
            label="New Password"
            type="password"
            placeholder="••••••••"
            icon={<FiLock />}
            error={errors.password?.message}
            {...register('password')}
          />

          <InputField
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            icon={<FiLock />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`w-full rounded-lg py-3 font-medium transition
              ${
                !isValid || isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:opacity-90 cursor-pointer'
              }`}
          >
            {isSubmitting ? 'Updating Password...' : 'Reset Password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}