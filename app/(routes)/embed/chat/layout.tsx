// /app(routes)/embed/chat/layout.tsx

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html style={{ background: 'transparent ' }}>
      <body style={{ background: 'transparent', margin: 0, padding: 0 }} >
        {children}
      </body>
    </html>
  )
}