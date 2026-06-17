import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full left-0 flex items-center justify-between px-8 py-4 border-b border-zinc-800">
      <div className="font-bold text-lg tracking-tighter text-white">Keila Engine</div>
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="text-sm px-4 py-2 rounded-lg bg-[#0070f3] hover:bg-blue-600 text-white transition-colors"
        >
          Create Property
        </Link>
      </div>
    </nav>
  )
}
