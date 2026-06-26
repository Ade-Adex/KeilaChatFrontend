// /app/components/chat/SystemMessage.tsx

'use client'

interface Props {
  text: string
}

export default function SystemMessage({ text }: Props) {
  return (
    <div className="flex justify-center">
      <div
        className="
          max-w-[90%]
          rounded-full
          border
          border-green-500/30
          bg-green-500/10
          px-4
          py-2
          text-center
          text-xs
          text-green-500
        "
      >
        {text}
      </div>
    </div>
  )
}