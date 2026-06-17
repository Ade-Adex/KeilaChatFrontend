// /app/page.tsx

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-[#ededed] px-4 font-sans">
      <div className="max-w-md w-full text-center space-y-6 border border-[#222] bg-[#111] p-8 rounded-xl shadow-2xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Keila Control Node
          </h1>
          <p className="text-sm text-zinc-400">
            Multi-tenant real-time messaging architecture
          </p>
        </div>

        <div className="h-px bg-zinc-800 my-4" />

        <Link
          href="/chat-test/embed/chat?propertyId=6a3143b6d4767cbc5b60ac7c"
          className="inline-block w-full py-3 px-4 rounded-lg bg-[#0070f3] hover:bg-blue-600 text-white font-medium transition-colors text-center shadow-lg shadow-blue-500/20"
        >
          Open Live Chat →
        </Link>
      </div>
    </div>
  )
}