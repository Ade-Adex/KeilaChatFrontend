// /app(routes)/embed/chat/layout.tsx

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    // 'bg-transparent' ensures the iframe container itself doesn't show a white box
    <div style={{ background: 'transparent', height: '100dvh', width: '100%' }}>
      {children}
    </div>
  )
}
