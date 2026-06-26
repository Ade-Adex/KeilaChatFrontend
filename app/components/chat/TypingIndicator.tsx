// /app/components/chat/TypingIndicator.tsx

'use client'

export default function TypingIndicator() {
  return (
    <div
      className="
        flex
        w-fit
        gap-1
        rounded-xl
        rounded-bl-none
        bg-card
        px-4
        py-3
      "
    >
      {[0, 1, 2].map((dot) => (
        <div
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
  )
}