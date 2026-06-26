// /app/components/chat/TypingIndicator.tsx

'use client'

export default function TypingIndicator() {
  return (
    <div className="flex items-start">
      <div
        className="
          flex
          gap-1
          rounded-2xl
          rounded-bl-sm
          bg-card
          px-4
          py-3
          shadow-sm
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
