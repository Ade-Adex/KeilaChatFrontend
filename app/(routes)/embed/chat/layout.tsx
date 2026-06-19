// /app(routes)/embed/chat/layout.tsx

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ background: 'transparent', height: '100vh', width: '100%' }}>
      {children}
    </div>
  )
}