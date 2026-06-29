// /app/(auth)/signin/page.tsx
'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FiMail, FiLock } from 'react-icons/fi'
import Link from 'next/link'

import { InputField } from '@/app/components/auth/InputField'
import { loginOperator } from '@/app/lib/api/auth.api'
import { useAuthStore } from '@/app/store/useAuthStore'
import { loginSchema, type LoginSchema } from '@/app/lib/validation/auth.schema'
import { notifications } from '@mantine/notifications'

import { checkAuth } from '@/app/lib/auth/checkAuth'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setAuth = useAuthStore((s) => s.login)

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
     const res = await loginOperator(data)

     const { account, operator } = res.data

     setAuth(account, operator)

     router.push(callbackUrl)
   } catch (err) {
     notifications.show({
       title: 'Login Failed',
       message: err instanceof Error ? err.message : 'Invalid credentials',
       color: 'red',
     })
   }
 }

  const isInviteContext =
    searchParams.toString().includes('token=') ||
    searchParams.toString().includes('accept-invite')

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Operator Sign In</h1>
          <p className="text-xs text-gray-500">Authenticate your session</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* EMAIL */}
          <InputField
            label="Email"
            type="email"
            icon={<FiMail />}
            placeholder="operator@company.com"
            {...register('email')}
            error={errors.email?.message}
          />

          {/* PASSWORD */}
          <InputField
            label="Password"
            type="password"
            icon={<FiLock />}
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />

              <span className="text-sm text-muted-foreground">Remember me</span>
            </label>

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`w-full py-2.5 rounded-lg font-medium transition
      ${
        !isValid || isSubmitting
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-primary text-white hover:opacity-90 cursor-pointer'
      }`}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-xs text-center text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            href={
              isInviteContext ? `/signup?${searchParams.toString()}` : '/signup'
            }
            className="text-primary font-medium"
          >
            {isInviteContext ? 'Accept Invitation' : 'Create workspace'}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
