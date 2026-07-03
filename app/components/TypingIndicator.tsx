// /app/components/chat/TypingIndicator.tsx
'use client'

export interface TypingIndicatorProps {
  visible?: boolean
  actor?: 'visitor' | 'operator' | 'ai'
  name?: string
}

export default function TypingIndicator({
  visible = true, // 🎯 Defaults to true if nothing is passed, but can be controlled explicitly
}: TypingIndicatorProps) {
  // 🛑 IF FALSE, RENDER ABSOLUTELY NOTHING
  if (!visible) return null

  return (
    <div className="flex items-start animate-in fade-in duration-200">
      <div
        className="
          flex
          gap-1
          rounded-2xl
          rounded-bl-sm
          bg-card
          px-4
          py-3
          shadow-xs
          border
          border-border
        "
      >
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="
              h-2
              w-2
              animate-bounce
              rounded-full
              bg-muted-foreground
            "
            style={{
              animationDelay: `${dot * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
