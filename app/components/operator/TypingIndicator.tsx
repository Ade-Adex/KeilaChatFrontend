// /components/operator/TypingIndicator.tsx

'use client'

import { FaUser, FaUserTie } from 'react-icons/fa'

export interface TypingIndicatorProps {
  visible: boolean
  actor?: 'visitor' | 'operator'
  name?: string
}

export default function TypingIndicator({
  visible,
  actor = 'visitor',
  name,
}: TypingIndicatorProps) {
  if (!visible) return null

  const label = name ?? (actor === 'visitor' ? 'Visitor' : 'Operator')

  return (
    <div className="px-4 py-2 animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2 max-w-max rounded-xl border bg-card/80 px-3 py-1.5 shadow-sm backdrop-blur-md">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {actor === 'visitor' ? <FaUser size={9} /> : <FaUserTie size={9} />}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground tracking-wide">
            {label} is typing...
          </span>
        </div>
      </div>
    </div>
  )
}