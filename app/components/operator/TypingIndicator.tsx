// /components/operator/TypingIndicator.tsx

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
  if (!visible) {
    return null
  }

  const label =
    name ??
    (actor === 'visitor'
      ? 'Visitor'
      : 'Operator')

  return (
    <div className="border-t border-border bg-background px-6 py-3">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card">
          {actor === 'visitor' ? (
            <FaUser size={12} />
          ) : (
            <FaUserTie size={12} />
          )}
        </div>

        {/* Typing bubble */}
        <div className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-3">
          <div className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />

            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />

            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
          </div>

          <span className="text-xs text-muted-foreground">
            {label} is typing...
          </span>
        </div>
      </div>
    </div>
  )
}