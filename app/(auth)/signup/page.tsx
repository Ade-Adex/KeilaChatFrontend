'use client'

import { useState } from 'react'

interface IntegrationResponse {
  account: { id: string; name: string; ownerEmail: string }
  property: { id: string; name: string; domain: string; widgetId: string }
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    ownerEmail: '',
    password: '',
    propertyName: '',
    propertyDomain: '',
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<IntegrationResponse | null>(null)

   const handleSignup = async (e: React.FormEvent) => {
     e.preventDefault()
     setLoading(true)
    //  setError(null)
     try {
       const res = await fetch('http://localhost:5000/api/v1/auth/register', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(formData),
       })
       const json = await res.json()
       if (!res.ok) throw new Error(json.message || 'Registration failed')
       setData(json.data as IntegrationResponse)
     } catch (err) {
     } finally {
       setLoading(false)
     }
   }

  if (data) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-10 border border-zinc-800 rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-2">Integration Successful</h2>
        <p className="text-zinc-400 mb-8">
          Copy your credentials to activate your Keila node.
        </p>

        <div className="bg-black p-6 rounded-2xl border border-zinc-800">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
            Embed Script
          </p>
          <pre className="text-blue-400 font-mono text-sm overflow-x-auto">
            {`<script id="keila-chat-script" src="https://cdn.keila-chat.org/embed.js" data-widget-id="${data.property.widgetId}"></script>`}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-20 px-6">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Initialize Workspace
        </h1>
        <p className="text-zinc-400 text-lg">
          Provision your multi-tenant environment in seconds.
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-5">
        {/* Section 1: Business Identity */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">
              Company Name
            </label>
            <input
              className="w-full bg-gray-300  px-4 py-2 rounded-xl focus:ring-2 focus:ring-white outline-none transition-all"
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">
              Owner Email
            </label>
            <input
              type="email"
              className="w-full bg-gray-300  px-4 py-2 rounded-xl focus:ring-2 focus:ring-white outline-none transition-all"
              onChange={(e) =>
                setFormData({ ...formData, ownerEmail: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Password (Full Width) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-black">
            Secure Password
          </label>
          <input
            type="password"
            className="w-full bg-gray-300  px-4 py-2 rounded-xl focus:ring-2 focus:ring-white outline-none transition-all"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
        </div>

        {/* Section 2: Property Config */}
        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800">
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">
              Property Name
            </label>
            <input
              className="w-full bg-gray-300  px-4 py-2 rounded-xl focus:ring-2 focus:ring-white outline-none transition-all"
              onChange={(e) =>
                setFormData({ ...formData, propertyName: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">
              Target Domain
            </label>
            <input
              className="w-full bg-gray-300  px-4 py-2 rounded-xl focus:ring-2 focus:ring-white outline-none transition-all"
              placeholder="christbcogbomoso.org"
              onChange={(e) =>
                setFormData({ ...formData, propertyDomain: e.target.value })
              }
              required
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-[#0070f3] hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.99]"
        >
          {loading ? 'Provisioning Environment...' : 'Deploy Node'}
        </button>
      </form>
    </div>
  )
}
