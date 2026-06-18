'use client'

import { useTheme } from 'next-themes'
import { FiSun, FiMoon } from 'react-icons/fi'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      suppressHydrationWarning
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-[#222] text-zinc-400 hover:text-white transition-colors cursor-pointer"
    >
      {resolvedTheme === 'dark' ? <FiSun /> : <FiMoon />}
    </button>
  )
}
