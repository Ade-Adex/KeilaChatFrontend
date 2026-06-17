//  /app/(routes)/admin/login/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/app/store/useAuthStore'
import { FiBriefcase, FiLock, FiMail } from 'react-icons/fi'

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-[#ededed] px-4 font-sans">
      <div className="max-w-md w-full space-y-6 border border-[#222] bg-[#111] p-8 rounded-xl shadow-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-500/10 rounded-full text-[#0070f3] mb-2">
            <FiBriefcase size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Operator Access Portal
          </h1>
          <p className="text-xs text-zinc-400">
            Authenticate session via Zustand state node
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400 block">
              Operator Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@company.com"
                className="w-full bg-[#161616] border border-[#222] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-[#0070f3] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400 block">
              Security Password Token
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#161616] border border-[#222] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-[#0070f3] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-[#0070f3] hover:bg-blue-600 disabled:bg-blue-800 text-white font-medium transition-colors text-center text-sm flex items-center justify-center"
          >
            {submitting
              ? 'Verifying Credentials...'
              : 'Sign In To Control Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}