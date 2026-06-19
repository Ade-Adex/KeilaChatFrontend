// app/(routes)/embed/chat/layout.tsx

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
      {children}
    </div>
  )
}