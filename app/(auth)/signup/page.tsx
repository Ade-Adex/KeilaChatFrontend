'use client'

import { useState } from 'react'
import {
  FiLock,
  FiGlobe,
  FiBriefcase,
  FiMail,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi'
import { notifications } from '@mantine/notifications'

interface IntegrationResponse {
  account: { id: string; name: string; ownerEmail: string }
  property: { id: string; name: string; domain: string; widgetId: string }
}

interface InputFieldProps {
  label: string
  icon: React.ReactNode
  type?: string
  placeholder: string
  onChange: (value: string) => void
}

function InputField({
  label,
  icon,
  type = 'text',
  placeholder,
  onChange,
}: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
        {label}
      </label>
      <div className="relative flex items-center">
        <div className="absolute left-3 text-foreground">{icon}</div>
        <input
          type={type}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-background border border-border text-foreground outline-none focus:border-primary rounded-lg pl-10 pr-4 py-2.5 text-sm!  transition-colors"
          required
        />
      </div>
    </div>
  )
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
   try {
     const res = await fetch('http://localhost:5000/api/v1/auth/register', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(formData),
     })

     const json = await res.json()

     // If the response is not OK, throw the error to be caught by the catch block
     if (!res.ok) throw new Error(json.message || 'Registration failed')

     setData(json.data as IntegrationResponse)
   } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'An unknown error occurred'

    notifications.show({
      title: 'Registration Failed',
      message: message,
      color: 'red', 
      icon: <FiAlertCircle />,
      autoClose: 5000,
      styles: {
        root: {
          backgroundColor: '#dc2626', 
          borderColor: '#991b1b',
          '&::before': { backgroundColor: 'white' },
        },
        title: {
          color: 'white',
          fontWeight: 700,
        },
        description: {
          color: 'white',
        },
        closeButton: {
          color: 'white',
          '&:hover': { backgroundColor: '#b91c1c' },
        },
      },
    })
   } finally {
     setLoading(false)
   }
 }

  if (data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full border border-zinc-800 bg-[#111] p-8 rounded-3xl text-center">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Node Provisioned
          </h2>
          <p className="text-zinc-400 mb-8 text-sm">
            Your infrastructure is ready. Use this script to integrate Keila.
          </p>
          <div className="bg-black p-4 rounded-xl border border-zinc-800 text-left">
            <code className="text-[10px] text-blue-400 break-all font-mono">
              {`<script src="https://keila-chat.vercel.app/embed.js" data-id="${data.property.widgetId}"></script>`}
            </code>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      <div className="hidden md:flex flex-col justify-between p-12 mt-10 bg-sidebar-background w-1/3 border-r border-border">
        <div className="my-auto">
          <div className="text-2xl font-black mb-4">Keila.</div>
          <p className="text-foreground text-sm leading-relaxed">
            Provision your multi-tenant messaging architecture in seconds.
            Secure, scalable, and ready for production.
          </p>
        </div>
        <div className="text-[10px] text-zinc-700 uppercase tracking-widest">
          v1.0.4-stable
        </div>
      </div>

      <div className="flex-1 p-8 md:p-20 overflow-y-auto mt-12 md:mt-0">
        <div className="max-w-lg">
          <h1 className="text-2xl text-center md:text-start md:text-3xl font-bold mb-8">
            Create your workspace
          </h1>
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Company"
                icon={<FiBriefcase />}
                placeholder="Acme Inc"
                onChange={(v) => setFormData({ ...formData, companyName: v })}
              />
              <InputField
                label="Email"
                icon={<FiMail />}
                type="email"
                placeholder="admin@acme.com"
                onChange={(v) => setFormData({ ...formData, ownerEmail: v })}
              />
            </div>
            <InputField
              label="Secure Password"
              icon={<FiLock />}
              type="password"
              placeholder="••••••••"
              onChange={(v) => setFormData({ ...formData, password: v })}
            />
            <div className="pt-6 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Property Name"
                  icon={<FiBriefcase />}
                  placeholder="Main Site"
                  onChange={(v) =>
                    setFormData({ ...formData, propertyName: v })
                  }
                />
                <InputField
                  label="Domain"
                  icon={<FiGlobe />}
                  placeholder="https://acme.com"
                  onChange={(v) =>
                    setFormData({ ...formData, propertyDomain: v })
                  }
                />
              </div>
            </div>
            <button
              disabled={loading}
              className="w-full  bg-primary hover:bg-button-hover text-white py-3 rounded-xl font-semibold transition-all active:scale-[0.98]"
            >
              {loading ? 'Provisioning...' : 'Sign Up for free'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
