
// /app/(auth)/signin/page.tsx

'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

import { FiMail, FiLock } from 'react-icons/fi'
import { notifications } from '@mantine/notifications'

import { InputField } from '@/app/components/auth/InputField'
import { loginOperator } from '@/app/lib/api/auth.api'
import { checkAuth } from '@/app/lib/auth/checkAuth'
import { useAuthStore } from '@/app/store/useAuthStore'
import { loginSchema, type LoginSchema } from '@/app/lib/validation/auth.schema'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setAuth = useAuthStore((state) => state.login)

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  useEffect(() => {
    async function verify() {
      const authenticated = await checkAuth()

      if (authenticated) {
        router.replace('/dashboard')
      }
    }

    verify()
  }, [router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',

    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginSchema) => {
    try {
       await loginOperator(data)

      notifications.show({
        title: 'Success',
        message: 'Login successful',
        color: 'green',
      })

      router.replace(callbackUrl)
    } catch (error) {
      notifications.show({
        title: 'Login Failed',
        message: error instanceof Error ? error.message : 'Invalid credentials',
        color: 'red',
      })
    }
  }

  const isInviteContext =
    searchParams.toString().includes('token=') ||
    searchParams.toString().includes('accept-invite')

  return (
    <div className="flex min-h-screen items-center justify-center text-foreground bg-background px-4">
      <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Operator Sign In</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Authenticate your workspace session
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <InputField
            label="Email"
            type="email"
            icon={<FiMail />}
            placeholder="operator@company.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <InputField
            label="Password"
            type="password"
            icon={<FiLock />}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="h-4 w-4"
              />

              <span className="text-sm">Remember me</span>
            </label>

            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`
              w-full rounded-lg py-3
              font-medium transition
              ${
                !isValid || isSubmitting
                  ? 'cursor-not-allowed bg-gray-400'
                  : 'bg-primary text-white hover:opacity-90 cursor-pointer'
              }
            `}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            href={
              isInviteContext ? `/signup?${searchParams.toString()}` : '/signup'
            }
            className="font-medium text-primary"
          >
            {isInviteContext ? 'Accept Invitation' : 'Create workspace'}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
