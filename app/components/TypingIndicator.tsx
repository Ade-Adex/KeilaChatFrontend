// /app/components/chat/TypingIndicator.tsx

'use client'

export interface TypingIndicatorProps {
  visible: boolean
  actor?: 'visitor' | 'operator'
  name?: string | undefined
}

export default function TypingIndicator(/* {
  visible,
  actor = 'visitor',
  name,
}: TypingIndicatorProps */) {
  // if (!visible) return null

  // const label = name ?? (actor === 'visitor' ? 'Visitor' : 'Operator')
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
              bg-gray-600
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
