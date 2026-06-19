// app/(routes)/embed/chat/layout.tsx

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        background: 'transparent',
        height: '100dvh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        body { background: transparent !important; margin: 0; padding: 0; }
        html { background: transparent !important; }
      `,
        }}
      />
      {children}
    </div>
  )
}
