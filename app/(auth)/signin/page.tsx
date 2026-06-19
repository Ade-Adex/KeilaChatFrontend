//  /app/(routes)/admin/login/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/app/store/useAuthStore'
import { FiBriefcase, FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi'

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export default function AdminLoginPage() {
  const router = useRouter()

  // Select micro-states cleanly from Zustand store
  const user = useAuthStore((state) => state.user)
  const login = useAuthStore((state) => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) {
      router.push('/admin/dashboard')
    }
  }, [user, router])

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault()
   if (!email || !password) return

   setSubmitting(true)
   setErrorMsg(null)

   try {
     const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email, password }),
     })

     const resData = await response.json()

     if (resData.status === 'success') {
       // FIX: Pass the property object along with account data
       // Ensure your backend controller sends res.data.property
       await login(resData.token, resData.data.account, resData.data.property)
       router.push('/admin/dashboard')
     } else {
       setErrorMsg(resData.message || 'Invalid credentials provided.')
     }
   } catch (err) {
     setErrorMsg('Network processing failure. Is your backend listening?')
   } finally {
     setSubmitting(false)
   }
 }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 font-sans">
      <div className="max-w-md w-full space-y-6  bg-card p-8 rounded-xl shadow-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-primary rounded-full text-white mb-2">
            <FiBriefcase size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Operator Access Portal
          </h1>
          <p className="text-xs text-foreground">Authenticate session</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground block">
              Operator Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground text-sm" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@company.com"
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm! text-foreground outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
  <label className="text-xs font-semibold text-foreground block">
    Security Password Token
  </label>
  <div className="relative">
    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground text-sm" />
    <input
      type={showPassword ? 'text' : 'password'}
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="••••••••••••"
      className="w-full bg-background border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm! text-foreground outline-none focus:border-primary transition-colors"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
    >
      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
    </button>
  </div>
</div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2.5 rounded-lg bg-primary hover:bg-button-hover disabled:bg-gray-400 text-white font-medium transition-colors text-center text-sm flex items-center justify-center ${submitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {submitting ? 'Verifying Credentials...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
