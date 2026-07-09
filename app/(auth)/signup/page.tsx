// /app/(auth)/signup/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FiBriefcase, FiMail, FiLock, FiCheckCircle } from 'react-icons/fi'
import { notifications } from '@mantine/notifications'

import { InputField } from '@/app/components/auth/InputField'
import { registerUser } from '@/app/lib/api/auth.api'
import { useAuthStore } from '@/app/store/useAuthStore'
import {
  signupSchema,
  type SignupSchema,
} from '@/app/lib/validation/auth.schema'

type Step = 1 | 2

export default function SignupPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)

  const [step, setStep] = useState<Step>(1)

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  })

  const values = watch()

  const nextStep = async () => {
    const valid = await trigger(['companyName', 'email', 'password'])
    if (valid) setStep(2)
  }

  const onSubmit = async (data: SignupSchema) => {
    try {
      const res = await registerUser({
        name: data.companyName,
        email: data.email,
        password: data.password,
      })

       const { account, operator } = res.data

       login(account, operator)

      notifications.show({
        title: 'Welcome',
        message: 'Workspace created successfully',
        color: 'green',
        icon: <FiCheckCircle />,
      })

      router.push('/dashboard')
    } catch (err) {
      notifications.show({
        title: 'Signup Failed',
        message: err instanceof Error ? err.message : 'Something went wrong',
        color: 'red',
      })
      console.error(err)
    }
  }

  return (
    <div className="flex items-center justify-center text-foreground bg-background px-6 pt-24">
      <div className="w-full max-w-md border border-border shadow-2xl rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-2">Create your workspace</h1>

        <p className="text-sm text-gray-500 mb-6">
          Start managing conversations in minutes
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {step === 1 && (
            <>
              <InputField
                label="Company Name"
                icon={<FiBriefcase />}
                {...register('companyName')}
                error={errors.companyName?.message}
              />

              <InputField
                label="Work Email"
                type="email"
                icon={<FiMail />}
                {...register('email')}
                error={errors.email?.message}
              />

              <InputField
                label="Password"
                type="password"
                icon={<FiLock />}
                {...register('password')}
                error={errors.password?.message}
              />

              <button
                type="button"
                onClick={nextStep}
                disabled={
                  !values.companyName ||
                  !values.email ||
                  !values.password ||
                  !isValid
                }
                className={`w-full py-3 rounded-lg transition text-sm!
                  ${
                    !values.companyName ||
                    !values.email ||
                    !values.password ||
                    !isValid
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary text-white cursor-pointer'
                  }
                `}
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-sm space-y-2 p-4 border rounded-lg">
                <p>
                  <strong>Company:</strong> {values.companyName}
                </p>
                <p>
                  <strong>Email:</strong> {values.email}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/2 border py-2 rounded-lg cursor-pointer text-sm!"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className={`w-1/2 py-2 rounded-lg font-medium text-sm!
                    ${
                      !isValid || isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary text-white cursor-pointer'
                    }
                  `}
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="text-xs text-center mt-6">
          Already have an account?{' '}
          <Link href="/signin" className="text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
