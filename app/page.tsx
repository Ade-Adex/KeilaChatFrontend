// /app/page.tsx

import Link from 'next/link'
import {
  FiMessageSquare,
  FiActivity,
  FiShield,
  FiExternalLink,
} from 'react-icons/fi'

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col items-center justify-center p-6">
      {/* Brand Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2">
          Keila <span className="text-[#0070f3]">Control</span>
        </h1>
        <p className="text-zinc-500 text-sm tracking-wide uppercase">
          Infrastructure for real-time engagement
        </p>
      </div>

      {/* Hero Card */}
      <div className="max-w-2xl w-full border border-zinc-800 bg-[#111] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            SYSTEM OPERATIONAL
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Ready to launch?</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Initiate a secure handshake with the Keila messaging node to begin
              your real-time customer support session.
            </p>
            <div className="flex flex-col gap-2 pt-4">
              <Link
                href="/chat-test/embed/chat?propertyId=6a3143b6d4767cbc5b60ac7c"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-[#0070f3] hover:bg-blue-600 transition-all text-white font-medium shadow-lg shadow-blue-900/20"
              >
                Start Conversation <FiMessageSquare size={16} />
              </Link>
            </div>
          </div>

          <div className="border-l border-zinc-800 pl-8 space-y-4">
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <FiActivity className="text-[#0070f3]" />
              <span>
                Latency: <strong className="text-white">12ms</strong>
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <FiShield className="text-[#0070f3]" />
              <span>
                Encryption: <strong className="text-white">AES-256</strong>
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <FiExternalLink className="text-[#0070f3]" />
              <Link
                href="/admin/dashboard"
                className="hover:text-blue-400 transition-colors"
              >
                Go to Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="mt-12 text-[10px] text-zinc-600 uppercase tracking-widest">
        © {new Date().getFullYear()} Christ Baptist Church Ogbomoso
      </footer>
    </div>
  )
}