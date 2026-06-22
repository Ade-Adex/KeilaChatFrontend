// 'use client'

// import { notifications } from '@mantine/notifications'
// import { useState, Suspense } from 'react'
// import {
//   FiAlertCircle,
//   FiBriefcase,
//   FiCheckCircle,
//   FiEye,
//   FiEyeOff,
//   FiGlobe,
//   FiLock,
//   FiMail,
// } from 'react-icons/fi'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { useAuthStore } from '@/app/store/useAuthStore'

// interface InputFieldProps {
//   label: string
//   icon: React.ReactNode
//   type?: string
//   placeholder: string
//   onChange: (value: string) => void
// }

// const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

// function InputField({
//   label,
//   icon,
//   type = 'text',
//   placeholder,
//   onChange,
// }: InputFieldProps) {
//   const [show, setShow] = useState(false)
//   const isPassword = type === 'password'

//   return (
//     <div className="space-y-1.5">
//       <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
//         {label}
//       </label>
//       <div className="relative flex items-center">
//         <div className="absolute left-3 text-foreground">{icon}</div>
//         <input
//           type={isPassword ? (show ? 'text' : 'password') : type}
//           placeholder={placeholder}
//           onChange={(e) => onChange(e.target.value)}
//           className="w-full bg-background border border-border text-foreground outline-none focus:border-primary rounded-lg pl-10 pr-10 py-2.5 text-sm transition-colors"
//           required
//         />
//         {isPassword && (
//           <button
//             type="button"
//             onClick={() => setShow(!show)}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
//           >
//             {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
//           </button>
//         )}
//       </div>
//     </div>
//   )
// }

// function SignupFormContent() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const loginSession = useAuthStore((state) => state.login)

//   // Detect if registering via an email invite link
//   const inviteToken = searchParams.get('token')
//   const isInvitedOperator = !!inviteToken

//   const [formData, setFormData] = useState({
//     companyName: '',
//     ownerEmail: '',
//     password: '',
//     propertyName: '',
//     propertyDomain: '',
//   })
//   const [loading, setLoading] = useState<boolean>(false)

//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)

//     // Determine target API endpoint dynamically based on role context
//     const endpoint = isInvitedOperator
//       ? `${BACKEND_URL}/api/v1/auth/register-operator`
//       : `${BACKEND_URL}/api/v1/auth/register`

//     const payload = isInvitedOperator
//       ? {
//           email: formData.ownerEmail,
//           password: formData.password,
//           token: inviteToken,
//         }
//       : formData

//     try {
//       const res = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//         credentials: 'include',
//       })

//       const json = await res.json()
//       if (!res.ok) throw new Error(json.message || 'Registration failed')

//       await loginSession(json.token, json.data.account, json.data.property)

//       notifications.show({
//         title: 'Success!',
//         message: 'Profile workspace initialized successfully.',
//         color: 'green',
//         icon: <FiCheckCircle />,
//       })

//       router.push('/admin/dashboard')
//     } catch (err: unknown) {
//       notifications.show({
//         title: 'Registration Failed',
//         message:
//           err instanceof Error ? err.message : 'An unknown error occurred',
//         color: 'red',
//         icon: <FiAlertCircle />,
//         autoClose: 5000,
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
//       <div className="hidden md:flex flex-col justify-between p-12 mt-10 bg-sidebar-background w-1/3 border-r border-border">
//         <div className="my-auto">
//           <div className="text-2xl font-black mb-4">Keila.</div>
//           <p className="text-foreground text-sm leading-relaxed">
//             Provision your multi-tenant messaging architecture in seconds.
//             Security, scalability, and production ready.
//           </p>
//         </div>
//         <div className="text-[10px] text-zinc-700 uppercase tracking-widest">
//           v1.0.4-stable
//         </div>
//       </div>

//       <div className="flex-1 p-8 md:p-20 overflow-y-auto mt-12 md:mt-0">
//         <div className="max-w-lg">
//           <h1 className="text-2xl text-center md:text-start md:text-3xl font-bold mb-8">
//             {isInvitedOperator
//               ? 'Claim Team Operator Invitation'
//               : 'Create your workspace'}
//           </h1>
//           <form onSubmit={handleSignup} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Conditionally hide company naming parameters if user is simply an operator agent */}
//               {!isInvitedOperator && (
//                 <InputField
//                   label="Company"
//                   icon={<FiBriefcase />}
//                   placeholder="Acme Inc"
//                   onChange={(v) => setFormData({ ...formData, companyName: v })}
//                 />
//               )}
//               <InputField
//                 label="Email Address"
//                 icon={<FiMail />}
//                 type="email"
//                 placeholder="admin@acme.com"
//                 onChange={(v) => setFormData({ ...formData, ownerEmail: v })}
//               />
//             </div>

//             <InputField
//               label="Secure Password"
//               icon={<FiLock />}
//               type="password"
//               placeholder="••••••••"
//               onChange={(v) => setFormData({ ...formData, password: v })}
//             />

//             {/* Conditionally hide property allocation metrics entirely for accepted incoming operators */}
//             {!isInvitedOperator && (
//               <div className="pt-6 border-t border-border space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <InputField
//                     label="Property Name"
//                     icon={<FiBriefcase />}
//                     placeholder="Main Site"
//                     onChange={(v) =>
//                       setFormData({ ...formData, propertyName: v })
//                     }
//                   />
//                   <InputField
//                     label="Domain"
//                     icon={<FiGlobe />}
//                     placeholder="https://acme.com"
//                     onChange={(v) =>
//                       setFormData({ ...formData, propertyDomain: v })
//                     }
//                   />
//                 </div>
//               </div>
//             )}

//             <button
//               disabled={loading}
//               className="w-full bg-primary hover:bg-button-hover text-white py-3 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
//             >
//               {loading
//                 ? 'Processing...'
//                 : isInvitedOperator
//                   ? 'Join Workspace Team'
//                   : 'Sign Up for free'}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default function SignupPage() {
//   return (
//     <Suspense
//       fallback={
//         <div className="p-12 text-center text-xs text-foreground animate-pulse">
//           Loading signup gateway...
//         </div>
//       }
//     >
//       <SignupFormContent />
//     </Suspense>
//   )
// }

















// /app/(auth)/signup/page.tsx
'use client'

import { notifications } from '@mantine/notifications'
import { useState, Suspense, useEffect } from 'react'
import {
  FiAlertCircle,
  FiBriefcase,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiGlobe,
  FiLock,
  FiMail,
  FiUser,
} from 'react-icons/fi'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/app/store/useAuthStore'
import Link from 'next/link'

interface InputFieldProps {
  label: string
  icon: React.ReactNode
  type?: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL

function InputField({
  label,
  icon,
  type = 'text',
  placeholder,
  value,
  onChange,
}: InputFieldProps) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
        {label}
      </label>
      <div className="relative flex items-center">
        <div className="absolute left-3 text-foreground">{icon}</div>
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-background border border-border text-foreground outline-none focus:border-primary rounded-lg pl-10 pr-10 py-2.5 text-sm transition-colors"
          required
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
          >
            {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}

function SignupFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const loginSession = useAuthStore((state) => state.login)

  const [loading, setLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    ownerEmail: '',
    password: '',
    propertyName: '',
    propertyDomain: '',
  })

  const inviteToken = (() => {
    const directToken = searchParams.get('token')
    if (directToken) return directToken

    const callbackUrl = searchParams.get('callbackUrl')
    if (callbackUrl) {
      try {
        const decodedUrl = decodeURIComponent(callbackUrl)
        const urlObj = new URL(decodedUrl, FRONTEND_URL)
        return urlObj.searchParams.get('token')
      } catch (e) {
        console.error('Failed to trace deep token links:', e)
      }
    }
    return null
  })()

  const isInvitedOperator = !!inviteToken

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const endpoint = isInvitedOperator
      ? `${BACKEND_URL}/api/v1/auth/register-operator`
      : `${BACKEND_URL}/api/v1/auth/register`

    const payload = isInvitedOperator
      ? {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.ownerEmail,
          password: formData.password,
          token: inviteToken,
        }
      : formData

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Registration failed')

      await loginSession(json.token, json.data.account, json.data.property)

      notifications.show({
        title: 'Welcome onboard!',
        message: 'Your system security profile has been activated.',
        color: 'green',
        icon: <FiCheckCircle />,
      })

      router.push('/admin/dashboard')
    } catch (err: unknown) {
      notifications.show({
        title: 'Registration Failed',
        message: err instanceof Error ? err.message : 'An unknown error occurred',
        color: 'red',
        icon: <FiAlertCircle />,
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      <div className="hidden md:flex flex-col justify-between p-12 mt-10 bg-sidebar-background w-1/3 border-r border-border">
        <div className="my-auto">
          <div className="text-2xl font-black mb-4">Keila.</div>
          <p className="text-foreground text-sm leading-relaxed">
            Provision your multi-tenant messaging architecture in seconds.
            Security, scalability, and production ready.
          </p>
        </div>
        <div className="text-[10px] text-zinc-700 uppercase tracking-widest">
          v1.0.4-stable
        </div>
      </div>

      <div className="flex-1 p-8 md:p-20 overflow-y-auto mt-12 md:mt-0">
        <div className="max-w-lg">
          <h1 className="text-2xl text-center md:text-start md:text-3xl font-bold mb-8">
            {isInvitedOperator
              ? 'Claim Team Operator Invitation'
              : 'Create your workspace'}
          </h1>
          
          <form onSubmit={handleSignup} className="space-y-6">
            
            {/* Operator Layout Form View Structure */}
            {isInvitedOperator && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                <InputField
                  label="First Name"
                  icon={<FiUser />}
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(v) => setFormData({ ...formData, firstName: v })}
                />
                <InputField
                  label="Last Name"
                  icon={<FiUser />}
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(v) => setFormData({ ...formData, lastName: v })}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Workspace Layout Form View Structure */}
              {!isInvitedOperator && (
                <InputField
                  label="Company"
                  icon={<FiBriefcase />}
                  placeholder="Acme Inc"
                  value={formData.companyName}
                  onChange={(v) => setFormData({ ...formData, companyName: v })}
                />
              )}
              <InputField
                label="Email Address"
                icon={<FiMail />}
                type="email"
                placeholder="operator@company.com"
                value={formData.ownerEmail}
                onChange={(v) => setFormData({ ...formData, ownerEmail: v })}
              />
            </div>

            <InputField
              label="Secure Access Password"
              icon={<FiLock />}
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(v) => setFormData({ ...formData, password: v })}
            />

            {!isInvitedOperator && (
              <div className="pt-6 border-t border-border space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Property Name"
                    icon={<FiBriefcase />}
                    placeholder="Main Site"
                    value={formData.propertyName}
                    onChange={(v) => setFormData({ ...formData, propertyName: v })}
                  />
                  <InputField
                    label="Domain"
                    icon={<FiGlobe />}
                    placeholder="https://acme.com"
                    value={formData.propertyDomain}
                    onChange={(v) => setFormData({ ...formData, propertyDomain: v })}
                  />
                </div>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-primary hover:bg-button-hover text-white py-3 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? 'Processing...'
                : isInvitedOperator
                  ? 'Activate Team Profile'
                  : 'Sign Up Workspace'}
            </button>
          </form>

          <div className="text-center pt-6">
            <p className="text-xs text-foreground/60">
              Already have an account?{' '}
              <Link
                href={`/signin?${searchParams.toString()}`}
                className="text-primary hover:underline font-semibold"
              >
                Sign In Instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-foreground animate-pulse">
          Loading signup gateway...
        </div>
      }
    >
      <SignupFormContent />
    </Suspense>
  )
}